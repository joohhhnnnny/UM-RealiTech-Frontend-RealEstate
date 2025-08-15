import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Professional Audit Logger Service
 * Handles all user activity logging with proper categorization
 */
class AuditLoggerService {
  constructor() {
    this.COLLECTION_NAME = 'audit_logs';
  }

  /**
   * Log authentication activities (login, logout, signup)
   */
  async logAuth(userId, action, details = {}) {
    const logData = {
      userId,
      category: 'authentication',
      action: action.toLowerCase(),
      details: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        ...details
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'info'
    };

    return this.writeLog(logData);
  }

  /**
   * Log property-related activities (create, update, delete, view)
   */
  async logProperty(userId, action, propertyData = {}) {
    const logData = {
      userId,
      category: 'property_management',
      action: action.toLowerCase(),
      details: {
        propertyId: propertyData.id || propertyData.firestoreId,
        propertyTitle: propertyData.title,
        propertyType: propertyData.type,
        propertyLocation: propertyData.location,
        propertyPrice: propertyData.price,
        timestamp: new Date().toISOString(),
        ...propertyData
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: this.getSeverityByAction(action)
    };

    return this.writeLog(logData);
  }

  /**
   * Log user profile activities
   */
  async logProfile(userId, action, details = {}) {
    const logData = {
      userId,
      category: 'profile_management',
      action: action.toLowerCase(),
      details: {
        timestamp: new Date().toISOString(),
        ...details
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'info'
    };

    return this.writeLog(logData);
  }

  /**
   * Log document upload/management activities
   */
  async logDocument(userId, action, documentData = {}) {
    const logData = {
      userId,
      category: 'document_management',
      action: action.toLowerCase(),
      details: {
        documentType: documentData.type,
        documentName: documentData.name,
        documentSize: documentData.size,
        timestamp: new Date().toISOString(),
        ...documentData
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'info'
    };

    return this.writeLog(logData);
  }

  /**
   * Log search and filter activities
   */
  async logSearch(userId, searchData = {}) {
    const logData = {
      userId,
      category: 'search_activity',
      action: 'search_performed',
      details: {
        searchQuery: searchData.query,
        filters: searchData.filters,
        resultsCount: searchData.resultsCount,
        timestamp: new Date().toISOString(),
        ...searchData
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'info'
    };

    return this.writeLog(logData);
  }

  /**
   * Log system errors and issues
   */
  async logError(userId, error, context = {}) {
    const logData = {
      userId: userId || 'anonymous',
      category: 'system_error',
      action: 'error_occurred',
      details: {
        errorMessage: error.message || error,
        errorStack: error.stack,
        errorCode: error.code,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'error'
    };

    return this.writeLog(logData);
  }

  /**
   * Log navigation activities
   */
  async logNavigation(userId, fromPage, toPage) {
    const logData = {
      userId,
      category: 'navigation',
      action: 'page_navigation',
      details: {
        fromPage,
        toPage,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'info'
    };

    return this.writeLog(logData);
  }

  /**
   * Log form submission activities
   */
  async logFormSubmission(userId, formType, formData = {}) {
    const logData = {
      userId,
      category: 'form_submission',
      action: 'form_submitted',
      details: {
        formType,
        formFields: Object.keys(formData),
        timestamp: new Date().toISOString(),
        // Don't log sensitive data, just field names
        ...formData
      },
      timestamp: serverTimestamp(),
      source: 'web_app',
      severity: 'info'
    };

    return this.writeLog(logData);
  }

  /**
   * Write log to Firestore
   */
  async writeLog(logData) {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...logData,
        createdAt: serverTimestamp()
      });
      
      // Optional: Log to console in development
      if (import.meta.env?.MODE === 'development') {
        console.log(`[AUDIT LOG] ${logData.category}.${logData.action}:`, logData.details);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Don't throw error to prevent breaking app functionality
      return null;
    }
  }

  /**
   * Get severity level based on action
   */
  getSeverityByAction(action) {
    const severityMap = {
      'delete': 'warning',
      'error': 'error',
      'create': 'info',
      'update': 'info',
      'view': 'debug',
      'search': 'debug',
      'login': 'info',
      'logout': 'info',
      'signup': 'info'
    };

    return severityMap[action.toLowerCase()] || 'info';
  }

  /**
   * Generate session ID for tracking user sessions
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user info for logging context
   */
  async getUserContext(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          userName: userData.displayName || userData.name || userData.email,
          userRole: userData.role || 'user',
          userEmail: userData.email
        };
      }
    } catch (error) {
      console.warn('Could not fetch user context for logging:', error);
    }
    return {};
  }
}

// Export singleton instance
export const auditLogger = new AuditLoggerService();
export default AuditLoggerService;
