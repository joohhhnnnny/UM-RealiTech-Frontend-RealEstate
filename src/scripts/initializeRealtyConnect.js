import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';

// Sample data initialization for RealtyConnect
export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...');

    // Sample agents data
    const sampleAgents = [
      {
        name: 'Sarah Garcia',
        email: 'sarah@realitech.com',
        specialization: 'Residential',
        rating: 4.8,
        deals: 32,
        agency: 'RealiTech Realty',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
        bio: 'Professional real estate agent with proven expertise in residential properties. Successfully closed 32 deals, maintaining a 4.8/5 client satisfaction rating.',
        verificationStatus: 'verified'
      },
      {
        name: 'Michael Johnson',
        email: 'michael@realitech.com',
        specialization: 'Commercial',
        rating: 4.6,
        deals: 28,
        agency: 'RealiTech Realty',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
        bio: 'Commercial real estate specialist with extensive experience in office buildings and retail spaces.',
        verificationStatus: 'verified'
      },
      {
        name: 'Emily Chen',
        email: 'emily@realitech.com',
        specialization: 'Industrial',
        rating: 4.9,
        deals: 15,
        agency: 'RealiTech Realty',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        bio: 'Industrial property expert specializing in warehouses and manufacturing facilities.',
        verificationStatus: 'verified'
      },
      {
        name: 'John Smith',
        email: 'john@realitech.com',
        specialization: 'Residential',
        rating: 4.2,
        deals: 8,
        agency: 'RealiTech Realty',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=c0aede',
        bio: 'New agent specializing in residential properties. Currently pending verification.',
        verificationStatus: 'pending'
      }
    ];

    // Add sample agents
    const agentPromises = sampleAgents.map(agent => 
      addDoc(collection(db, 'agents'), {
        ...agent,
        createdAt: new Date(),
        updatedAt: new Date()
      }).catch(error => {
        console.warn('Could not add agent to Firebase, skipping:', error.message);
      })
    );

    await Promise.allSettled(agentPromises);

    // Initialize sample commission data
    await initializeCommissionData('demo-agent-user');
    
    // Initialize sample contract data
    await initializeContractData('demo-developer-user');

    console.log('Sample data initialized successfully!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};

// Initialize commission data for a specific agent
export const initializeCommissionData = async (agentId) => {
  try {
    const sampleCommissions = [
      {
        client: 'Juan Santos',
        project: 'Lumina Homes Siging',
        saleAmount: '2800000',
        commissionAmount: '84000',
        status: 'completed',
        releaseDate: '2024-11-15',
        agentId: agentId
      },
      {
        client: 'Maria Cruz',
        project: 'Camella Cebu',
        saleAmount: '1500000',
        commissionAmount: '45000',
        status: 'pending',
        releaseDate: '2024-12-30',
        agentId: agentId
      },
      {
        client: 'Pedro Reyes',
        project: 'Vista Land QC',
        saleAmount: '1800000',
        commissionAmount: '54000',
        status: 'in-process',
        releaseDate: '2024-11-30',
        agentId: agentId
      }
    ];

    const commissionPromises = sampleCommissions.map(commission =>
      addDoc(collection(db, 'commissions'), {
        ...commission,
        createdAt: new Date(),
        updatedAt: new Date()
      }).catch(error => {
        console.warn('Could not add commission to Firebase, skipping:', error.message);
      })
    );

    await Promise.allSettled(commissionPromises);
    console.log('Commission data initialized for agent:', agentId);
  } catch (error) {
    console.error('Error initializing commission data:', error);
  }
};

// Initialize contract data for a specific developer
export const initializeContractData = async (developerId) => {
  try {
    const sampleContracts = [
      {
        project: 'Greenfield Heights',
        buyer: 'Anna Rodriguez',
        totalAmount: '3500000',
        paidAmount: '875000',
        progress: 25,
        status: 'active',
        developerId: developerId
      },
      {
        project: 'Sunset Villas',
        buyer: 'Carlos Mendoza',
        totalAmount: '2800000',
        paidAmount: '1400000',
        progress: 50,
        status: 'active',
        developerId: developerId
      },
      {
        project: 'Ocean View Condos',
        buyer: 'Lisa Wong',
        totalAmount: '4200000',
        paidAmount: '3150000',
        progress: 75,
        status: 'active',
        developerId: developerId
      }
    ];

    const contractPromises = sampleContracts.map(contract =>
      addDoc(collection(db, 'contracts'), {
        ...contract,
        createdAt: new Date(),
        updatedAt: new Date()
      }).catch(error => {
        console.warn('Could not add contract to Firebase, skipping:', error.message);
      })
    );

    await Promise.allSettled(contractPromises);
    console.log('Contract data initialized for developer:', developerId);
  } catch (error) {
    console.error('Error initializing contract data:', error);
  }
};
