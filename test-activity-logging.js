/**
 * Activity Logging Test Script
 * 
 * This script helps test the ActivityLoggerService functionality
 * Run this in your browser console after logging in to test the logging system
 */

// Test Activity Logger
const testActivityLogging = async () => {
  try {
    console.log('🧪 Testing Activity Logger Service...');
    
    // Import the service (you may need to adjust this based on your app structure)
    const { currentUser } = firebase.auth();
    
    if (!currentUser) {
      console.error('❌ No user logged in. Please log in first.');
      return;
    }
    
    console.log('👤 Current User:', currentUser.uid);
    
    // Test 1: Log a test property creation
    console.log('📝 Test 1: Logging property creation...');
    await ActivityLoggerService.logCreateActivity(
      currentUser.uid,
      'property',
      'test-property-' + Date.now(),
      {
        title: 'Test Property for Activity Log',
        type: 'apartment',
        price: 150000,
        location: 'Test City',
        bedrooms: 3,
        bathrooms: 2,
        testData: true
      }
    );
    console.log('✅ Property creation logged');
    
    // Test 2: Log a search activity
    console.log('📝 Test 2: Logging search activity...');
    await ActivityLoggerService.logGeneralActivity(
      currentUser.uid,
      ActivityLoggerService.ACTIVITY_TYPES.SEARCH,
      ActivityLoggerService.CATEGORIES.SEARCH_ACTIVITY,
      {
        searchQuery: 'test apartments',
        searchFilters: { type: 'apartment', priceMax: 200000 },
        resultCount: 5,
        testData: true
      }
    );
    console.log('✅ Search activity logged');
    
    // Test 3: Log a navigation activity
    console.log('📝 Test 3: Logging navigation activity...');
    await ActivityLoggerService.logGeneralActivity(
      currentUser.uid,
      ActivityLoggerService.ACTIVITY_TYPES.NAVIGATION,
      ActivityLoggerService.CATEGORIES.NAVIGATION,
      {
        fromPath: '/dashboard',
        toPath: '/properties',
        testData: true
      }
    );
    console.log('✅ Navigation activity logged');
    
    // Test 4: Log a property update
    console.log('📝 Test 4: Logging property update...');
    await ActivityLoggerService.logUpdateActivity(
      currentUser.uid,
      'property',
      'test-property-update-' + Date.now(),
      { price: 160000, description: 'Updated description' },
      {
        updateReason: 'price_change',
        testData: true
      }
    );
    console.log('✅ Property update logged');
    
    // Test 5: Get user activity statistics
    console.log('📝 Test 5: Getting activity statistics...');
    const stats = await ActivityLoggerService.getActivityStatistics(currentUser.uid, 7);
    console.log('📊 Activity Statistics:', stats);
    
    // Test 6: Get recent user activities
    console.log('📝 Test 6: Getting recent activities...');
    const activities = await ActivityLoggerService.getUserActivities(currentUser.uid, {
      limit: 10,
      days: 7
    });
    console.log('📋 Recent Activities:', activities);
    
    console.log('🎉 All tests completed successfully!');
    console.log('💡 Now check your ActivityLog page to see the logged activities.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Instructions for running the test
console.log(`
🚀 Activity Logging Test Suite Ready!

To run the test:
1. Make sure you're logged in to your application
2. Open browser console (F12)
3. Copy and paste this entire script
4. Run: testActivityLogging()

This will create test activities in your Firestore collections:
- login_logout_activities
- create_activities  
- update_activities
- delete_activities

After running, check your ActivityLog page to see the results!
`);

// Export for module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testActivityLogging };
}
