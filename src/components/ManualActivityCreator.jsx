import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActivityLoggerService from '../services/ActivityLoggerService';
import { RiAddLine, RiPlayFill, RiCheckLine } from 'react-icons/ri';

/**
 * Manual Activity Creator - Development/Testing Component
 * Allows manual creation of test activities for debugging
 */
const ManualActivityCreator = () => {
  const { currentUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState([]);

  const createTestActivities = async () => {
    if (!currentUser) return;

    setIsCreating(true);
    const created = [];

    try {
      // Create sample login activity
      await ActivityLoggerService.logAuthActivity(
        currentUser.uid,
        ActivityLoggerService.ACTIVITY_TYPES.LOGIN,
        {
          email: currentUser.email,
          loginMethod: 'email_password',
          testData: true,
          timestamp: new Date().toISOString()
        }
      );
      created.push('Login Activity');

      // Create sample property creation
      await ActivityLoggerService.logCreateActivity(
        currentUser.uid,
        'property',
        `test-property-${Date.now()}`,
        {
          title: 'Sample Test Property',
          type: 'apartment',
          price: 150000,
          location: 'Test City',
          testData: true
        }
      );
      created.push('Property Creation');

      // Create sample application creation
      await ActivityLoggerService.logCreateActivity(
        currentUser.uid,
        'application',
        `test-application-${Date.now()}`,
        {
          propertyId: `test-property-${Date.now()}`,
          applicationType: 'purchase',
          budget: 150000,
          testData: true
        }
      );
      created.push('Application Creation');

      // Create sample property update
      await ActivityLoggerService.logUpdateActivity(
        currentUser.uid,
        'property',
        `test-property-update-${Date.now()}`,
        { price: 160000, status: 'updated' },
        {
          updateReason: 'price_change',
          testData: true
        }
      );
      created.push('Property Update');

      // Create sample logout activity
      await ActivityLoggerService.logAuthActivity(
        currentUser.uid,
        ActivityLoggerService.ACTIVITY_TYPES.LOGOUT,
        {
          email: currentUser.email,
          sessionDuration: '45 minutes',
          testData: true,
          timestamp: new Date().toISOString()
        }
      );
      created.push('Logout Activity');

      setLastCreated(created);
    } catch (error) {
      console.error('Error creating test activities:', error);
      setLastCreated([`Error: ${error.message}`]);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
            <RiPlayFill className="text-primary" />
            Activity Tester
          </h3>
          <p className="text-sm text-base-content/70">
            Create core business activities: login/logout, property & application CRUD operations
          </p>
        </div>
        <button
          onClick={createTestActivities}
          disabled={isCreating}
          className="btn btn-primary btn-sm gap-2"
        >
          <RiAddLine className={isCreating ? 'animate-spin' : ''} />
          {isCreating ? 'Creating...' : 'Create Test Data'}
        </button>
      </div>

      {lastCreated.length > 0 && (
        <div className="bg-base-100/50 rounded-lg p-3 border border-base-200">
          <h4 className="font-medium text-sm text-base-content mb-2 flex items-center gap-2">
            <RiCheckLine className="text-success" />
            Recently Created:
          </h4>
          <ul className="text-sm text-base-content/70 space-y-1">
            {lastCreated.map((activity, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full flex-shrink-0"></div>
                {activity}
              </li>
            ))}
          </ul>
          <p className="text-xs text-base-content/50 mt-2">
            💡 Refresh the page or wait a moment to see these activities appear in the log below.
          </p>
        </div>
      )}

      <div className="text-xs text-base-content/50 mt-3">
        <p>⚡ This component helps test activity logging while Firebase indexes are building.</p>
        <p>🗑️ Remove this component from production builds.</p>
      </div>
    </div>
  );
};

export default ManualActivityCreator;
