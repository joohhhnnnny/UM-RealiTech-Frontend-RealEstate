import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActivityLoggerService from '../services/ActivityLoggerService';
import { RiRefreshLine, RiCheckLine, RiErrorWarningLine, RiTimeLine } from 'react-icons/ri';

/**
 * Firebase Index Status Component
 * Helps debug and monitor Firebase index building status
 */
const FirebaseIndexStatus = () => {
  const { currentUser } = useAuth();
  const [indexStatus, setIndexStatus] = useState({
    checking: false,
    collections: {},
    lastChecked: null,
    hasData: false
  });

  const checkIndexStatus = useCallback(async () => {
    if (!currentUser) return;

    setIndexStatus(prev => ({ ...prev, checking: true }));

    const collections = Object.values(ActivityLoggerService.COLLECTIONS);
    const status = {};

    for (const collectionName of collections) {
      try {
        // Try a simple query to each collection
        const activities = await ActivityLoggerService.getUserActivities(currentUser.uid, {
          limit: 1,
          days: 1
        });

        status[collectionName] = {
          status: 'ready',
          error: null,
          hasData: activities.length > 0
        };
      } catch (error) {
        status[collectionName] = {
          status: error.message.includes('index') ? 'building' : 'error',
          error: error.message,
          hasData: false
        };
      }
    }

    setIndexStatus({
      checking: false,
      collections: status,
      lastChecked: new Date(),
      hasData: Object.values(status).some(s => s.hasData)
    });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      checkIndexStatus();
    }
  }, [currentUser, checkIndexStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <RiCheckLine className="text-success text-lg" />;
      case 'building':
        return <RiTimeLine className="text-warning text-lg animate-spin" />;
      case 'error':
        return <RiErrorWarningLine className="text-error text-lg" />;
      default:
        return <RiTimeLine className="text-base-content/50 text-lg" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'building':
        return 'Building...';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-base-content">Firebase Index Status</h3>
          <p className="text-sm text-base-content/70">
            {indexStatus.lastChecked ? 
              `Last checked: ${indexStatus.lastChecked.toLocaleTimeString()}` : 
              'Not checked yet'
            }
          </p>
        </div>
        <button
          onClick={checkIndexStatus}
          disabled={indexStatus.checking}
          className="btn btn-sm btn-outline btn-primary gap-2"
        >
          <RiRefreshLine className={indexStatus.checking ? 'animate-spin' : ''} />
          {indexStatus.checking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(indexStatus.collections).map(([collection, info]) => (
          <div
            key={collection}
            className="flex items-center gap-3 p-3 rounded-lg bg-base-50 border border-base-200"
          >
            {getStatusIcon(info.status)}
            <div className="flex-1">
              <div className="font-medium text-sm text-base-content">
                {collection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-xs text-base-content/70">
                {getStatusText(info.status)}
                {info.hasData && <span className="ml-2 text-success">• Has data</span>}
              </div>
              {info.error && info.status === 'building' && (
                <div className="text-xs text-warning mt-1">
                  Indexes are building. This may take a few minutes.
                </div>
              )}
              {info.error && info.status === 'error' && (
                <div className="text-xs text-error mt-1 truncate" title={info.error}>
                  {info.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {indexStatus.hasData ? (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center gap-2 text-success">
            <RiCheckLine />
            <span className="font-medium">Activity data is available!</span>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Your activity log should now display user activities.
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 text-warning">
            <RiTimeLine />
            <span className="font-medium">No activity data yet</span>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Try logging out and back in, or performing some actions to generate activity data.
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-base-content/50">
        <p>💡 <strong>Tip:</strong> If indexes are still building, wait 2-5 minutes and refresh this status.</p>
        <p>🔄 Firebase indexes are automatically deployed and should be ready shortly.</p>
      </div>
    </div>
  );
};

export default FirebaseIndexStatus;
