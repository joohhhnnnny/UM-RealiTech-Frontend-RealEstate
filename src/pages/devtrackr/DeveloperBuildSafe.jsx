import React, { useState } from 'react';
import { 
  RiBuildingLine, 
  RiErrorWarningLine,
  RiMoneyDollarCircleLine,
  RiNotificationLine
} from 'react-icons/ri';
import ProjectDashboard from './devportal/ProjectDashboard.jsx';
import SmartContract from './devportal/SmartContracts.jsx';
import DiscrepancyLog from './devportal/DiscrepancyLog.jsx';

function DeveloperBuildSafe() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flaggedIssuesCount, setFlaggedIssuesCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'milestone',
      message: 'Foundation milestone requires verification',
      project: 'Horizon Residences',
      date: '2025-08-15',
      read: false
    },
    {
      id: 2,
      type: 'document',
      message: '3 buyers awaiting contract signing',
      project: 'Sky Gardens Tower',
      date: '2025-08-14',
      read: false
    }
  ]);

  // Sample projects data that will be passed to child components
  const [projects] = useState([
    {
      id: 1,
      name: "Horizon Residences",
      progress: 76,
      status: "On Track",
      unitsSold: 42,
      totalUnits: 60,
      milestones: [
        { id: 1, name: "Land Development", completed: true, date: "Jan 2024", verified: true },
        { id: 2, name: "Foundation Complete", completed: true, date: "Mar 2024", verified: true },
        { id: 3, name: "Structure Complete", completed: true, date: "Sep 2024", verified: true },
        { id: 4, name: "Electrical & Plumbing", completed: false, date: "Oct 2025", verified: false },
        { id: 5, name: "Interior Finishing", completed: false, date: "Dec 2025", verified: false }
      ],
      pendingDocuments: 2,
      escrowStatus: {
        released: "₱12,450,000",
        held: "₱8,550,000",
        nextRelease: "₱3,200,000"
      }
    },
    {
      id: 2,
      name: "Sky Gardens Tower",
      progress: 92,
      status: "Ahead of Schedule",
      unitsSold: 35,
      totalUnits: 50,
      milestones: [
        { id: 1, name: "Land Development", completed: true, date: "Feb 2024", verified: true },
        { id: 2, name: "Foundation Complete", completed: true, date: "Apr 2024", verified: true },
        { id: 3, name: "Structure Complete", completed: true, date: "Aug 2024", verified: true },
        { id: 4, name: "Electrical & Plumbing", completed: true, date: "Sep 2025", verified: true },
        { id: 5, name: "Interior Finishing", completed: false, date: "Nov 2025", verified: false }
      ],
      pendingDocuments: 3,
      escrowStatus: {
        released: "₱9,750,000",
        held: "₱6,250,000",
        nextRelease: "₱2,500,000"
      }
    }
  ]);

  const handleIssueCountChange = (counts) => {
    setFlaggedIssuesCount(counts.pending);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard projects={projects} />;
      case 'smart-contracts':
        return <SmartContract projects={projects} />;
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