// Test file to verify Firebase integration with BuildSafe
// This can be used to add sample data to Firebase for testing

import { projectService, notificationService, discrepancyService } from '../services/buildsafeService.js';

// Sample data to add to Firebase for testing
const sampleProject = {
  name: "Firebase Test Project - Skyline Towers",
  developerId: "dev-001",
  progress: 45,
  status: "On Track",
  unitsSold: 25,
  totalUnits: 40,
  subscription: "premium",
  projectLimit: "unlimited",
  location: "Makati City, Philippines",
  description: "A premium residential tower with modern amenities",
  startDate: "March 2024",
  expectedCompletion: "March 2026",
  totalInvestment: "₱18,000,000",
  milestones: [
    { 
      id: "m1", 
      name: "Land Development", 
      completed: true, 
      date: "March 2024", 
      verified: true,
      progressPercentage: 10,
      paymentAmount: "₱400,000"
    },
    { 
      id: "m2", 
      name: "Foundation Complete", 
      completed: true, 
      date: "June 2024", 
      verified: true,
      progressPercentage: 25,
      paymentAmount: "₱600,000"
    },
    { 
      id: "m3", 
      name: "Structure Complete", 
      completed: false, 
      date: "December 2024", 
      verified: false,
      progressPercentage: 50,
      paymentAmount: "₱1,000,000"
    },
    { 
      id: "m4", 
      name: "Ready for Interior Designing", 
      completed: false, 
      date: "September 2025", 
      verified: false,
      progressPercentage: 75,
      paymentAmount: "₱800,000"
    },
    { 
      id: "m5", 
      name: "Ready for Occupation", 
      completed: false, 
      date: "March 2026", 
      verified: false,
      progressPercentage: 100,
      paymentAmount: "₱500,000"
    }
  ],
  pendingDocuments: 1,
  escrowStatus: {
    released: "₱1,000,000",
    held: "₱2,300,000",
    nextRelease: "₱1,000,000"
  },
  buyers: ["buyer-001", "buyer-002"] // Array of buyer IDs who purchased units
};

const sampleNotification = {
  userId: "dev-001",
  type: "milestone",
  message: "Structure milestone completed and awaiting verification",
  project: "Firebase Test Project - Skyline Towers",
  priority: "medium"
};

const sampleDiscrepancy = {
  issue: "Window frame installation deviation",
  description: "Window frames in units 5A-5D are 1cm smaller than specification requirements",
  source: "Quality Assurance",
  category: "Installation",
  priority: "medium",
  reportedBy: "QA Inspector",
  assignedTo: "Window Contractor",
  status: "pending",
  relatedProject: "Firebase Test Project - Skyline Towers",
  location: "5th Floor, Units A-D",
  estimatedCost: "₱150,000",
  requiresEscrowHold: false
};

// Functions to add sample data
export const addSampleData = async () => {
  try {
    console.log('Adding sample project...');
    const projectId = await projectService.createProject(sampleProject);
    console.log('Sample project created with ID:', projectId);

    console.log('Adding sample notification...');
    const notificationId = await notificationService.createNotification(sampleNotification);
    console.log('Sample notification created with ID:', notificationId);

    console.log('Adding sample discrepancy...');
    const discrepancyId = await discrepancyService.createDiscrepancy(sampleDiscrepancy);
    console.log('Sample discrepancy created with ID:', discrepancyId);

    console.log('✅ All sample data added successfully!');
    return { projectId, notificationId, discrepancyId };
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  }
};

// Function to test Firebase connectivity
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test reading projects
    console.log('Testing project service...');
    const projects = await projectService.getProjects('dev-001');
    console.log('Projects loaded:', projects.length);

    // Test reading notifications
    console.log('Testing notification service...');
    const notifications = await notificationService.getNotifications('dev-001');
    console.log('Notifications loaded:', notifications.length);

    console.log('✅ Firebase connection test successful!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Usage example:
// To run these tests, you can call them from the browser console:
// import { addSampleData, testFirebaseConnection } from './path/to/this/file';
// await testFirebaseConnection();
// await addSampleData();
