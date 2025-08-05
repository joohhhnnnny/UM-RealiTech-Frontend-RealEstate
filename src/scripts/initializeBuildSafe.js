// BuildSafe Firebase Initialization Script
// Run this once to populate Firebase with sample data

import { addSampleData, testFirebaseConnection } from '../utils/firebaseTestUtils.js';

export const initializeBuildSafe = async () => {
  console.log('🚀 Initializing BuildSafe with Firebase...');
  
  try {
    // Step 1: Test Firebase connection
    console.log('Step 1: Testing Firebase connection...');
    const isConnected = await testFirebaseConnection();
    
    if (!isConnected) {
      throw new Error('Firebase connection failed. Please check your configuration and rules.');
    }
    
    console.log('✅ Firebase connection successful!');
    
    // Step 2: Add sample data
    console.log('Step 2: Adding sample data...');
    const result = await addSampleData();
    
    console.log('✅ Sample data added successfully!');
    console.log('Created:', result);
    
    // Step 3: Verification
    console.log('Step 3: Verifying data...');
    const finalTest = await testFirebaseConnection();
    
    if (finalTest) {
      console.log('🎉 BuildSafe initialization complete!');
      console.log('You can now:');
      console.log('1. View projects in Developer dashboard');
      console.log('2. See notifications');
      console.log('3. Track discrepancies');
      console.log('4. Manage subscriptions');
      return true;
    } else {
      throw new Error('Verification failed');
    }
    
  } catch (error) {
    console.error('❌ BuildSafe initialization failed:', error);
    console.log('📋 Troubleshooting steps:');
    console.log('1. Check Firebase configuration in src/config/Firebase.js');
    console.log('2. Ensure Firestore rules are deployed: firebase deploy --only firestore:rules');
    console.log('3. Check browser console for detailed error messages');
    return false;
  }
};

// Auto-run initialization when this module is imported
// Comment this out if you don't want automatic initialization
// initializeBuildSafe();
