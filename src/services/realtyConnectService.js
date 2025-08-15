import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/Firebase';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection from realtyConnectService...');
    console.log('Firebase db object:', db);
    const testQuery = query(collection(db, 'agents'));
    const snapshot = await getDocs(testQuery);
    console.log('Firebase connection successful! Agents collection size:', snapshot.size);
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};

// Collections
const AGENTS_COLLECTION = 'agents';
const COMMISSIONS_COLLECTION = 'commissions';
const CONTRACTS_COLLECTION = 'contracts';
const STATS_COLLECTION = 'stats';

// Mock data for fallback when Firebase fails
const mockAgents = [
  {
    id: '1',
    name: 'Sarah Garcia',
    email: 'sarah@realitech.com',
    specialization: 'Residential',
    rating: 4.8,
    deals: 32,
    agency: 'RealiTech Realty',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
    bio: 'Professional real estate agent with proven expertise in residential properties.',
    verificationStatus: 'verified',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Michael Johnson',
    email: 'michael@realitech.com',
    specialization: 'Commercial',
    rating: 4.6,
    deals: 28,
    agency: 'RealiTech Realty',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    bio: 'Commercial real estate specialist with extensive experience.',
    verificationStatus: 'verified',
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@realitech.com',
    specialization: 'Industrial',
    rating: 4.9,
    deals: 45,
    agency: 'RealiTech Realty',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=c084fc',
    bio: 'Industrial property specialist with comprehensive market knowledge.',
    verificationStatus: 'verified',
    createdAt: new Date()
  }
];

const mockCommissions = [
  {
    id: '1',
    client: 'Juan Santos',
    project: 'Lumina Homes Siging',
    saleAmount: '2800000',
    commissionAmount: '84000',
    status: 'completed',
    releaseDate: '2024-11-15',
    agentId: 'demo-agent-user',
    createdAt: { toDate: () => new Date() } // Mock Firebase Timestamp
  },
  {
    id: '2',
    client: 'Maria Cruz',
    project: 'Camella Cebu',
    saleAmount: '1500000',
    commissionAmount: '45000',
    status: 'pending',
    releaseDate: '2024-12-30',
    agentId: 'demo-agent-user',
    createdAt: { toDate: () => new Date() } // Mock Firebase Timestamp
  }
];

const mockContracts = [
  {
    id: '1',
    project: 'Greenfield Heights',
    buyer: 'Anna Rodriguez',
    totalAmount: '3500000',
    paidAmount: '875000',
    progress: 25,
    status: 'active',
    developerId: 'demo-developer-user',
    createdAt: { toDate: () => new Date() } // Mock Firebase Timestamp
  },
  {
    id: '2',
    project: 'Sunset Villas',
    buyer: 'Carlos Mendoza',
    totalAmount: '2800000',
    paidAmount: '1400000',
    progress: 50,
    status: 'active',
    developerId: 'demo-developer-user',
    createdAt: { toDate: () => new Date() } // Mock Firebase Timestamp
  }
];

// Agent Services
export const agentService = {
  // Get all agents
  getAllAgents: async () => {
    try {
      const q = query(collection(db, AGENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching agents, using mock data:', error);
      return mockAgents;
    }
  },

  // Add new agent
  addAgent: async (agentData) => {
    try {
      const docRef = await addDoc(collection(db, AGENTS_COLLECTION), {
        ...agentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  },

  // Update agent
  updateAgent: async (agentId, agentData) => {
    try {
      const agentRef = doc(db, AGENTS_COLLECTION, agentId);
      await updateDoc(agentRef, {
        ...agentData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  // Get agent by user ID (for current user's profile)
  getAgentByUserId: async (userId) => {
    try {
      const q = query(collection(db, AGENTS_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching agent by user ID:', error);
      return null;
    }
  },

  // Get only verified agents (for buyers to see)
  getVerifiedAgents: async () => {
    try {
      const q = query(
        collection(db, AGENTS_COLLECTION), 
        where('verificationStatus', '==', 'verified'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching verified agents, using mock data:', error);
      // Return only verified mock agents
      return mockAgents.filter(agent => agent.verificationStatus === 'verified' || !agent.verificationStatus);
    }
  },

  // Create or update agent profile
  createOrUpdateAgentProfile: async (userId, profileData) => {
    try {
      // Check if agent profile already exists
      const existingAgent = await agentService.getAgentByUserId(userId);
      
      if (existingAgent) {
        // Update existing profile
        await agentService.updateAgent(existingAgent.id, {
          ...profileData,
          updatedAt: serverTimestamp()
        });
        return existingAgent.id;
      } else {
        // Create new profile
        const docRef = await addDoc(collection(db, AGENTS_COLLECTION), {
          ...profileData,
          userId,
          verificationStatus: 'not_submitted',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error creating/updating agent profile:', error);
      throw error;
    }
  },

  // Subscribe to agents changes
  subscribeToAgents: (callback) => {
    try {
      const q = query(collection(db, AGENTS_COLLECTION), orderBy('createdAt', 'desc'));
      return onSnapshot(q, 
        (snapshot) => {
          const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(agents);
        },
        (error) => {
          console.error('Error in agents subscription, using mock data:', error);
          callback(mockAgents);
        }
      );
    } catch (error) {
      console.error('Error setting up agents subscription, using mock data:', error);
      callback(mockAgents);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Subscribe to verified agents only (for buyers)
  subscribeToVerifiedAgents: (callback) => {
    try {
      const q = query(
        collection(db, AGENTS_COLLECTION), 
        where('verificationStatus', '==', 'verified'),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, 
        (snapshot) => {
          const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(agents);
        },
        (error) => {
          console.error('Error in verified agents subscription, using mock data:', error);
          // Return only verified mock agents for buyers
          callback(mockAgents.filter(agent => agent.verificationStatus === 'verified' || !agent.verificationStatus));
        }
      );
    } catch (error) {
      console.error('Error setting up verified agents subscription, using mock data:', error);
      callback(mockAgents.filter(agent => agent.verificationStatus === 'verified' || !agent.verificationStatus));
      return () => {}; // Return empty unsubscribe function
    }
  }
};

// Commission Services
export const commissionService = {
  // Get commissions by agent ID
  getCommissionsByAgent: async (agentId) => {
    try {
      const q = query(
        collection(db, COMMISSIONS_COLLECTION), 
        where('agentId', '==', agentId)
        // Removed orderBy to avoid index requirement
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching commissions, using mock data:', error);
      return mockCommissions.filter(c => c.agentId === agentId);
    }
  },

  // Add new commission
  addCommission: async (commissionData) => {
    try {
      const docRef = await addDoc(collection(db, COMMISSIONS_COLLECTION), {
        ...commissionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding commission:', error);
      throw error;
    }
  },

  // Update commission status
  updateCommissionStatus: async (commissionId, status) => {
    try {
      const commissionRef = doc(db, COMMISSIONS_COLLECTION, commissionId);
      await updateDoc(commissionRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating commission status:', error);
      throw error;
    }
  },

  // Subscribe to commissions
  subscribeToCommissions: (agentId, callback) => {
    try {
      const q = query(
        collection(db, COMMISSIONS_COLLECTION), 
        where('agentId', '==', agentId)
        // Removed orderBy to avoid index requirement
      );
      return onSnapshot(q, 
        (snapshot) => {
          const commissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(commissions);
        },
        (error) => {
          console.error('Error in commissions subscription, using mock data:', error);
          callback(mockCommissions.filter(c => c.agentId === agentId));
        }
      );
    } catch (error) {
      console.error('Error setting up commissions subscription, using mock data:', error);
      callback(mockCommissions.filter(c => c.agentId === agentId));
      return () => {}; // Return empty unsubscribe function
    }
  }
};

// Contract Services (for developers)
export const contractService = {
  // Get contracts by developer ID
  getContractsByDeveloper: async (developerId) => {
    try {
      const q = query(
        collection(db, CONTRACTS_COLLECTION), 
        where('developerId', '==', developerId)
        // Removed orderBy to avoid index requirement
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching contracts, using mock data:', error);
      return mockContracts.filter(c => c.developerId === developerId);
    }
  },

  // Add new contract
  addContract: async (contractData) => {
    try {
      const docRef = await addDoc(collection(db, CONTRACTS_COLLECTION), {
        ...contractData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding contract:', error);
      throw error;
    }
  },

  // Update contract progress
  updateContractProgress: async (contractId, progress, paidAmount) => {
    try {
      const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
      await updateDoc(contractRef, {
        progress,
        paidAmount,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  // Subscribe to contracts
  subscribeToContracts: (developerId, callback) => {
    try {
      const q = query(
        collection(db, CONTRACTS_COLLECTION), 
        where('developerId', '==', developerId)
        // Removed orderBy to avoid index requirement
      );
      return onSnapshot(q, 
        (snapshot) => {
          const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(contracts);
        },
        (error) => {
          console.error('Error in contracts subscription, using mock data:', error);
          callback(mockContracts.filter(c => c.developerId === developerId));
        }
      );
    } catch (error) {
      console.error('Error setting up contracts subscription, using mock data:', error);
      callback(mockContracts.filter(c => c.developerId === developerId));
      return () => {}; // Return empty unsubscribe function
    }
  }
};
