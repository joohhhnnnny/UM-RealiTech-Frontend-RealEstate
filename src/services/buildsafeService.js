import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/Firebase';

// Collections
const PROJECTS_COLLECTION = 'buildsafe_projects';
const MILESTONES_COLLECTION = 'buildsafe_milestones';
const CONTRACTS_COLLECTION = 'buildsafe_contracts';
const DISCREPANCIES_COLLECTION = 'buildsafe_discrepancies';
const NOTIFICATIONS_COLLECTION = 'buildsafe_notifications';
const SUBSCRIPTIONS_COLLECTION = 'buildsafe_subscriptions';

// Static/Guidelines Data
export const STATIC_GUIDELINES = {
  project: {
    id: "static-guideline-1",
    name: "Guidelines Example - Horizon Residences",
    progress: 76,
    status: "On Track",
    unitsSold: 42,
    totalUnits: 60,
    subscription: "premium",
    projectLimit: "unlimited",
    developerId: "developer-guidelines",
    location: "Cebu City, Philippines",
    description: "This is a guidelines example showing how projects should be structured",
    startDate: "Jan 2024",
    expectedCompletion: "Dec 2025",
    totalInvestment: "₱21,000,000",
    milestones: [
      { 
        id: "m1", 
        name: "Land Development", 
        completed: true, 
        date: "Jan 2024", 
        verified: true,
        progressPercentage: 15,
        paymentAmount: "₱500,000"
      },
      { 
        id: "m2", 
        name: "Foundation Complete", 
        completed: true, 
        date: "Mar 2024", 
        verified: true,
        progressPercentage: 25,
        paymentAmount: "₱750,000"
      },
      { 
        id: "m3", 
        name: "Structure Complete", 
        completed: true, 
        date: "Sep 2024", 
        verified: true,
        progressPercentage: 50,
        paymentAmount: "₱1,200,000"
      },
      { 
        id: "m4", 
        name: "Ready for Interior Designing", 
        completed: false, 
        date: "Oct 2025", 
        verified: false,
        progressPercentage: 75,
        paymentAmount: "₱900,000"
      },
      { 
        id: "m5", 
        name: "Ready for Occupation", 
        completed: false, 
        date: "Dec 2025", 
        verified: false,
        progressPercentage: 100,
        paymentAmount: "₱650,000"
      }
    ],
    pendingDocuments: 2,
    escrowStatus: {
      released: "₱12,450,000",
      held: "₱8,550,000",
      nextRelease: "₱3,200,000"
    },
    isStatic: true // Flag to identify static data
  },
  notification: {
    id: "static-notif-1",
    type: 'milestone',
    message: 'Guidelines: Foundation milestone requires verification',
    project: 'Guidelines Example Project',
    date: new Date().toISOString().split('T')[0],
    read: false,
    isStatic: true
  },
  discrepancy: {
    id: "static-disc-1",
    issue: 'Guidelines: Foundation concrete strength documentation',
    description: 'This is a guidelines example of how discrepancies should be documented with proper details and evidence',
    source: 'Quality Control Guidelines',
    category: 'Structural',
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
    reportedBy: 'Guidelines Site Engineer',
    assignedTo: 'Guidelines Contractor',
    status: 'resolved',
    explanation: 'This shows how resolved issues should be documented',
    relatedProject: 'Guidelines Example Project',
    location: 'Guidelines Location',
    estimatedCost: '₱0',
    requiresEscrowHold: false,
    documents: [
      { name: 'guidelines_example.pdf', type: 'pdf', size: '1.2 MB' },
      { name: 'guidelines_photo.jpg', type: 'image', size: '800 KB' }
    ],
    isStatic: true
  }
};

// Project Services
export const projectService = {
  // Get all projects for a developer
  async getProjects(developerId) {
    try {
      const q = query(
        collection(db, PROJECTS_COLLECTION),
        where('developerId', '==', developerId)
      );
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort projects by creation date client-side
      projects.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Always include static guidelines example
      return [STATIC_GUIDELINES.project, ...projects];
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firebase permissions not set up yet. Using static data only.');
      }
      return [STATIC_GUIDELINES.project]; // Return at least guidelines on error
    }
  },

  // Get projects for a buyer
  async getBuyerProjects(buyerId) {
    try {
      const q = query(
        collection(db, PROJECTS_COLLECTION),
        where('buyers', 'array-contains', buyerId)
      );
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort projects by creation date client-side
      projects.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return projects;
    } catch (error) {
      console.error('Error fetching buyer projects:', error);
      return [];
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId, updates) {
    try {
      if (projectId.startsWith('static-')) {
        console.log('Cannot update static guidelines data');
        return;
      }
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      if (projectId.startsWith('static-')) {
        console.log('Cannot delete static guidelines data');
        return;
      }
      await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

// Milestone Services
export const milestoneService = {
  // Update milestone status
  async updateMilestone(projectId, milestoneId, updates) {
    try {
      if (projectId.startsWith('static-')) {
        console.log('Cannot update static guidelines data');
        return;
      }
      // For simplicity, we'll update the milestone within the project document
      // In a real app, you might want separate milestone documents
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      
      // You would implement logic to update specific milestone in the array
      // This is a simplified version
      await updateDoc(projectRef, {
        [`milestones.${milestoneId}`]: updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }
};

// Notification Services
export const notificationService = {
  // Get notifications for a user
  async getNotifications(userId) {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort notifications by creation date client-side
      notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Always include static guidelines example
      return [STATIC_GUIDELINES.notification, ...notifications];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firebase permissions not set up yet. Using static data only.');
      }
      return [STATIC_GUIDELINES.notification];
    }
  },

  // Create notification
  async createNotification(notificationData) {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      if (notificationId.startsWith('static-')) {
        console.log('Cannot update static guidelines data');
        return;
      }
      const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};

// Discrepancy Services
export const discrepancyService = {
  // Get discrepancies for projects
  async getDiscrepancies(projectIds) {
    try {
      // Handle empty or invalid projectIds
      if (!projectIds || projectIds.length === 0) {
        return [STATIC_GUIDELINES.discrepancy];
      }

      const q = query(
        collection(db, DISCREPANCIES_COLLECTION),
        where('relatedProject', 'in', projectIds)
      );
      const querySnapshot = await getDocs(q);
      const discrepancies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        documents: doc.data().documents || [] // Ensure documents array exists
      }));
      
      // Sort discrepancies by creation date client-side
      discrepancies.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Always include static guidelines example
      return [STATIC_GUIDELINES.discrepancy, ...discrepancies];
    } catch (error) {
      console.error('Error fetching discrepancies:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firebase permissions not set up yet. Using static data only.');
      }
      return [STATIC_GUIDELINES.discrepancy];
    }
  },

  // Create discrepancy
  async createDiscrepancy(discrepancyData) {
    try {
      const docRef = await addDoc(collection(db, DISCREPANCIES_COLLECTION), {
        ...discrepancyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating discrepancy:', error);
      throw error;
    }
  },

  // Update discrepancy status
  async updateDiscrepancyStatus(discrepancyId, status, explanation = '') {
    try {
      if (discrepancyId.startsWith('static-')) {
        console.log('Cannot update static guidelines data');
        return;
      }
      const discrepancyRef = doc(db, DISCREPANCIES_COLLECTION, discrepancyId);
      await updateDoc(discrepancyRef, {
        status,
        explanation,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating discrepancy:', error);
      throw error;
    }
  }
};

// Subscription Services
export const subscriptionService = {
  // Get user subscription
  async getSubscription(userId) {
    try {
      const q = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Return default basic subscription
        return {
          userId,
          plan: 'basic',
          projectLimit: 2,
          features: ['Basic verification badge', 'Standard milestone tracking'],
          status: 'active',
          isStatic: false
        };
      }
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      if (error.code === 'permission-denied') {
        console.warn('Firebase permissions not set up yet. Using default subscription.');
      }
      return {
        userId,
        plan: 'basic',
        projectLimit: 2,
        status: 'active'
      };
    }
  },

  // Update subscription
  async updateSubscription(userId, subscriptionData) {
    try {
      const q = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new subscription
        await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), {
          userId,
          ...subscriptionData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing subscription
        const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, querySnapshot.docs[0].id);
        await updateDoc(subscriptionRef, {
          ...subscriptionData,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};

// Real-time listeners
export const realtimeService = {
  // Listen to project changes
  subscribeToProjects(developerId, callback) {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('developerId', '==', developerId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort projects by creation date client-side
      projects.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Always include static guidelines
      callback([STATIC_GUIDELINES.project, ...projects]);
    });
  },

  // Listen to notifications
  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort notifications by creation date client-side
      notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      // Always include static guidelines
      callback([STATIC_GUIDELINES.notification, ...notifications]);
    });
  }
};

// Contract Management Service
export const contractService = {
  // Get all contracts for a user
  async getContracts(userId) {
    try {
      const q = query(
        collection(db, CONTRACTS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const contracts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort contracts by creation date client-side
      contracts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      return contracts;
    } catch (error) {
      console.error('Error getting contracts:', error);
      return [];
    }
  },

  // Create a new contract
  async createContract(userId, contractData) {
    try {
      const docRef = await addDoc(collection(db, CONTRACTS_COLLECTION), {
        ...contractData,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  // Update a contract
  async updateContract(contractId, updates) {
    try {
      const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
      await updateDoc(contractRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  // Delete a contract
  async deleteContract(contractId) {
    try {
      await deleteDoc(doc(db, CONTRACTS_COLLECTION, contractId));
      return true;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }
};

// Main BuildSafe Service
export const buildsafeService = {
  ...projectService,
  ...milestoneService,
  ...notificationService,
  ...discrepancyService,
  ...subscriptionService,
  ...realtimeService,
  ...contractService
};
