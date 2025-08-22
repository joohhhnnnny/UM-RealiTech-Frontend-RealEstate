import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/Firebase';

/**
 * Professional Activity Logger Service
 * Tracks all user activities across the application
 */
class ActivityLoggerService {
  
  // Collection names - Simplified for core business activities only
  static COLLECTIONS = {
    LOGIN_LOGOUT: 'user_auth_activities',
    BUSINESS_ACTIVITIES: 'business_activities'  // Combined for create/update/delete
  };

  // Activity types - Simplified to core business actions only
  static ACTIVITY_TYPES = {
    // Authentication activities
    LOGIN: 'login',
    LOGOUT: 'logout',
    SIGNUP: 'signup',
    
    // Core business operations only
    CREATE: 'create',
    UPDATE: 'update', 
    DELETE: 'delete'
  };

  // Activity categories - Simplified
  static CATEGORIES = {
    AUTHENTICATION: 'authentication',
    PROPERTY_MANAGEMENT: 'property_management',
    APPLICATION_MANAGEMENT: 'application_management'
  };

  /**
   * Log authentication activities (login/logout)
   */
  static async logAuthActivity(userId, activityType, details = {}) {
    try {
      const activityData = {
        userId: userId,
        activityType: activityType,
        details: {
          ...details,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          sessionId: sessionStorage.getItem('sessionId') || 'unknown'
        },
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp()
      };

      // Use addDoc to let Firestore generate the document ID
      const docRef = await addDoc(collection(db, 'authActivityLogs'), activityData);
      
      console.log('Auth activity logged successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error logging auth activity:', error);
      throw error;
    }
  }

  /**
   * Log create operations (Add Listing, Apply for Property, etc.)
   */
  static async logCreateActivity(userId, resourceType, resourceId, details = {}) {
    try {
      const activityData = {
        userId,
        activityType: this.ACTIVITY_TYPES.CREATE,
        category: this.getCategoryForResource(resourceType),
        resourceType,
        resourceId,
        timestamp: serverTimestamp(),
        details: {
          ...details,
          action: `Created ${resourceType}`,
          description: this.getActionDescription('create', resourceType, details)
        }
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTIONS.BUSINESS_ACTIVITIES), 
        activityData
      );

      console.log(`Create activity logged: ${resourceType}`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error logging create activity:', error);
      throw error;
    }
  }

  /**
   * Log update operations (Update Listing, Update Application, etc.)
   */
  static async logUpdateActivity(userId, resourceType, resourceId, changes, details = {}) {
    try {
      const activityData = {
        userId,
        activityType: this.ACTIVITY_TYPES.UPDATE,
        category: this.getCategoryForResource(resourceType),
        resourceType,
        resourceId,
        timestamp: serverTimestamp(),
        changes,
        details: {
          ...details,
          action: `Updated ${resourceType}`,
          description: this.getActionDescription('update', resourceType, details),
          fieldsModified: Object.keys(changes || {})
        }
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTIONS.BUSINESS_ACTIVITIES), 
        activityData
      );

      console.log(`Update activity logged: ${resourceType}`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error logging update activity:', error);
      throw error;
    }
  }

  /**
   * Log delete operations (Remove Listing, Cancel Application, etc.)
   */
  static async logDeleteActivity(userId, resourceType, resourceId, details = {}) {
    try {
      const activityData = {
        userId,
        activityType: this.ACTIVITY_TYPES.DELETE,
        category: this.getCategoryForResource(resourceType),
        resourceType,
        resourceId,
        timestamp: serverTimestamp(),
        details: {
          ...details,
          action: `Deleted ${resourceType}`,
          description: this.getActionDescription('delete', resourceType, details),
          isRecoverable: details.softDelete || false
        }
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTIONS.BUSINESS_ACTIVITIES), 
        activityData
      );

      console.log(`Delete activity logged: ${resourceType}`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error logging delete activity:', error);
      throw error;
    }
  }

  /**
   * Log general activities (navigation, searches, etc.)
   */
  static async logGeneralActivity(userId, activityType, category, details = {}) {
    try {
      const activityData = {
        userId,
        activityType,
        category,
        timestamp: serverTimestamp(),
        details: {
          ...details,
          userAgent: navigator.userAgent,
          sessionId: sessionStorage.getItem('sessionId') || 'unknown'
        }
      };

      const docRef = await addDoc(
        collection(db, this.COLLECTIONS.BUSINESS_ACTIVITIES), 
        activityData
      );

      console.log(`General activity logged: ${activityType}`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error logging general activity:', error);
      throw error;
    }
  }

  /**
   * Retrieve user activities - Only core business activities for the specific user
   */
  static async getUserActivities(userId, options = {}) {
    const { 
      category = 'all', 
      limit = 50, 
      days = 7 
    } = options;

    if (!userId) {
      console.warn('No userId provided for getUserActivities');
      return [];
    }

    try {
      const allActivities = [];
      const collections = Object.values(this.COLLECTIONS);
      
      // Calculate date filter
      const dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);

      for (const collectionName of collections) {
        try {
          // Query with strict user filtering
          const q = query(
            collection(db, collectionName),
            where('userId', '==', userId), // Ensure user-specific data
            orderBy('timestamp', 'desc'),
            firestoreLimit(limit)
          );

          const querySnapshot = await getDocs(q);
          
          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            
            // Double-check user ID to ensure data belongs to current user
            if (data.userId === userId) {
              const timestamp = data.timestamp?.toDate() || new Date();
              
              // Filter by date range
              if (timestamp >= dateFilter) {
                allActivities.push({
                  id: doc.id,
                  ...data,
                  timestamp,
                  collection: collectionName
                });
              }
            }
          });
        } catch (indexError) {
          console.warn(`Index not ready for ${collectionName}, using fallback query:`, indexError.message);
          
          // Fallback: Query without ordering but still user-specific
          try {
            const fallbackQuery = query(
              collection(db, collectionName),
              where('userId', '==', userId), // Keep user filtering in fallback
              firestoreLimit(limit * 2)
            );

            const fallbackSnapshot = await getDocs(fallbackQuery);
            
            fallbackSnapshot.docs.forEach(doc => {
              const data = doc.data();
              
              // Triple-check user ID for security
              if (data.userId === userId) {
                const timestamp = data.timestamp?.toDate() || new Date();
                
                if (timestamp >= dateFilter) {
                  allActivities.push({
                    id: doc.id,
                    ...data,
                    timestamp,
                    collection: collectionName
                  });
                }
              }
            });
          } catch (fallbackError) {
            console.error(`Fallback query also failed for ${collectionName}:`, fallbackError);
          }
        }
      }

      // Sort all activities by timestamp (newest first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);

      // Filter by category if specified
      let filteredActivities = allActivities;
      if (category !== 'all') {
        filteredActivities = allActivities.filter(activity => activity.category === category);
      }

      console.log(`Retrieved ${filteredActivities.length} activities for user ${userId}`);
      return filteredActivities.slice(0, limit);
    } catch (error) {
      console.error('Error retrieving user activities:', error);
      return [];
    }
  }

  /**
   * Get activity statistics for a user
   */
  static async getActivityStatistics(userId, days = 7) {
    try {
      const activities = await this.getUserActivities(userId, { days, limit: 1000 });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        total: activities.length,
        today: activities.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === today.getTime();
        }).length,
        byCategory: {},
        byType: {},
        recentActivity: activities.slice(0, 5)
      };

      // Group by category
      activities.forEach(activity => {
        const category = activity.category || 'other';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        const type = activity.activityType || 'other';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      throw error;
    }
  }

  // Helper methods
  static getCategoryForResource(resourceType) {
    const categoryMap = {
      'property': this.CATEGORIES.PROPERTY_MANAGEMENT,
      'listing': this.CATEGORIES.PROPERTY_MANAGEMENT,
      'application': this.CATEGORIES.APPLICATION_MANAGEMENT,
      'buyer_application': this.CATEGORIES.APPLICATION_MANAGEMENT
    };

    return categoryMap[resourceType.toLowerCase()] || this.CATEGORIES.PROPERTY_MANAGEMENT;
  }

  static getActionDescription(action, resourceType, details = {}) {
    const descriptions = {
      create: {
        property: `New property listing "${details.title || 'Untitled'}" created`,
        listing: `New listing "${details.title || 'Untitled'}" added`,
        application: `Applied for property "${details.propertyTitle || 'Unknown Property'}"`,
        buyer_application: `New buyer application submitted for ${details.propertyTitle || 'property'}`
      },
      update: {
        property: `Property "${details.title || details.propertyTitle || 'listing'}" updated`,
        listing: `Listing "${details.title || details.propertyTitle || 'details'}" modified`,
        application: `Application for "${details.propertyTitle || 'property'}" updated`
      },
      delete: {
        property: `Property listing "${details.title || details.propertyTitle || 'Unknown'}" removed`,
        listing: `Listing "${details.title || details.propertyTitle || 'Unknown'}" deleted`,
        application: `Application for "${details.propertyTitle || 'property'}" cancelled`
      }
    };

    return descriptions[action]?.[resourceType.toLowerCase()] || 
           `${action.charAt(0).toUpperCase() + action.slice(1)} ${resourceType}`;
  }

  static generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Batch log multiple activities (useful for bulk operations)
   */
  static async logBatchActivities(activities) {
    try {
      const promises = activities.map(activity => {
        const { type, ...data } = activity;
        
        switch (type) {
          case 'auth':
            return this.logAuthActivity(data.userId, data.activityType, data.details);
          case 'create':
            return this.logCreateActivity(data.userId, data.resourceType, data.resourceId, data.details);
          case 'update':
            return this.logUpdateActivity(data.userId, data.resourceType, data.resourceId, data.changes, data.details);
          case 'delete':
            return this.logDeleteActivity(data.userId, data.resourceType, data.resourceId, data.details);
          default:
            return this.logGeneralActivity(data.userId, data.activityType, data.category, data.details);
        }
      });

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      console.log(`Batch logging completed: ${successful} successful, ${failed} failed`);
      return { successful, failed, results };
    } catch (error) {
      console.error('Error in batch logging:', error);
      throw error;
    }
  }
}

export default ActivityLoggerService;
