import React, { useState, useEffect } from 'react';
import { 
  RiBuildingLine, 
  RiErrorWarningLine,
  RiMoneyDollarCircleLine,
  RiNotificationLine,
  RiVipCrownFill
} from 'react-icons/ri';
import ProjectDashboard from './devportal/ProjectDashboard.jsx';
import SmartContract from './devportal/SmartContracts.jsx';
import DiscrepancyLog from './devportal/DiscrepancyLog.jsx';
import SubscriptionManager from './devportal/SubscriptionManager.jsx';
import { 
  projectService, 
  notificationService, 
  subscriptionService,
  realtimeService 
} from '../../services/buildsafeService.js';

function DeveloperBuildSafe() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flaggedIssuesCount, setFlaggedIssuesCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dynamic state from Firebase
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscription, setSubscription] = useState(null);
  
  // Mock developer ID - in real app, get from authentication
  const developerId = 'dev-001';

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load projects
        const projectsData = await projectService.getProjects(developerId);
        setProjects(projectsData);
        
        // Load notifications
        const notificationsData = await notificationService.getNotifications(developerId);
        setNotifications(notificationsData);
        
        // Load subscription
        const subscriptionData = await subscriptionService.getSubscription(developerId);
        setSubscription(subscriptionData);
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        
        // Fallback to static data on error
        setProjects([{
          id: 1,
          name: "Horizon Residences (Static Fallback)",
          progress: 76,
          status: "On Track",
          unitsSold: 42,
          totalUnits: 60,
          subscription: "premium",
          projectLimit: 10,
          milestones: [
            { id: 1, name: "Land Development", completed: true, date: "Jan 2024", verified: true },
            { id: 2, name: "Foundation Complete", completed: true, date: "Mar 2024", verified: true },
            { id: 3, name: "Structure Complete", completed: true, date: "Sep 2024", verified: true },
            { id: 4, name: "Ready for Interior Designing", completed: false, date: "Oct 2025", verified: false },
            { id: 5, name: "Ready for Occupation", completed: false, date: "Dec 2025", verified: false }
          ],
          pendingDocuments: 2,
          escrowStatus: {
            released: "₱12,450,000",
            held: "₱8,550,000",
            nextRelease: "₱3,200,000"
          }
        }]);
        
        setNotifications([{
          id: 1,
          type: 'milestone',
          message: 'Foundation milestone requires verification (Static)',
          project: 'Horizon Residences',
          date: '2025-08-15',
          read: false
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [developerId]);

  // Set up real-time listeners
  useEffect(() => {
    let unsubscribeProjects;
    let unsubscribeNotifications;

    if (!loading && !error) {
      // Listen to projects changes
      unsubscribeProjects = realtimeService.subscribeToProjects(developerId, (updatedProjects) => {
        setProjects(updatedProjects);
      });

      // Listen to notifications changes
      unsubscribeNotifications = realtimeService.subscribeToNotifications(developerId, (updatedNotifications) => {
        setNotifications(updatedNotifications);
      });
    }

    return () => {
      if (unsubscribeProjects) unsubscribeProjects();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [developerId, loading, error]);

  const handleIssueCountChange = (counts) => {
    setFlaggedIssuesCount(counts.pending);
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state optimistically
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading BuildSafe data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-error max-w-md">
            <div>
              <h3 className="font-bold">Connection Error</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard projects={projects} />;
      case 'smart-contracts':
        return <SmartContract projects={projects} />;
      case 'subscription':
        return <SubscriptionManager projects={projects} />;
      case 'issues':
        return <DiscrepancyLog 
                 projects={projects} 
                 onIssueCountChange={handleIssueCountChange} 
               />;
      default:
        return <ProjectDashboard projects={projects} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <RiBuildingLine className="text-primary" />
              BuildSafe Developer Portal
            </h1>
            <p className="text-sm text-base-content/70">
              Manage project timelines, escrow releases, and documentation
            </p>
          </div>
          
          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <div className="indicator">
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="indicator-item badge badge-error badge-sm">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
              <button className="btn btn-ghost btn-circle">
                <RiNotificationLine className="text-xl" />
              </button>
            </div>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 mt-2">
              {notifications.length > 0 ? (
                <>
                  <li className="menu-title">
                    <span>Notifications</span>
                  </li>
                  {notifications.map(notification => (
                    <li key={notification.id}>
                      <a 
                        className={!notification.read ? 'active' : ''}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{notification.message}</span>
                          <span className="text-xs text-gray-500">
                            {notification.project} • {notification.date}
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </>
              ) : (
                <li>
                  <a>No new notifications</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
          <button 
            className={`tab flex-1 ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <RiBuildingLine className="w-4 h-4 mr-2" />
            Project Dashboard
          </button> 
          <button 
            className={`tab flex-1 ${activeTab === 'smart-contracts' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('smart-contracts')}
          >
            <RiMoneyDollarCircleLine className="w-4 h-4 mr-2" />
            Escrow & Contracts
          </button>
          <button 
            className={`tab flex-1 ${activeTab === 'subscription' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            <RiVipCrownFill className="w-4 h-4 mr-2" />
            Subscription
          </button> 
          <button 
            className={`tab flex-1 ${activeTab === 'issues' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <RiErrorWarningLine className="w-4 h-4 mr-2" />
            Issues
            {flaggedIssuesCount > 0 && (
              <span className="ml-2 badge badge-error badge-sm">
                {flaggedIssuesCount}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-base-100 rounded-lg shadow-lg">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

export default DeveloperBuildSafe;  