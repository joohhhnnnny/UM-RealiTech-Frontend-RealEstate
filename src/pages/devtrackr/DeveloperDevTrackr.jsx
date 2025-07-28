import React, { useState } from 'react';
import { 
  RiBuildingLine, 
  RiErrorWarningLine,
  RiMoneyDollarCircleLine,
} from 'react-icons/ri';

// Import the components
import ProjectDashboard from './dev_devtrackr/ProjectDashboard';
import SmartContracts from './dev_devtrackr/SmartContracts';
import DiscrepancyLog from './dev_devtrackr/DiscrepancyLog';

function DeveloperDevTrackr() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flaggedIssues] = useState([]);  // This would normally be populated from your backend

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard />;
      case 'smart-contracts':
        return <SmartContracts />;
      case 'issues':
        return <DiscrepancyLog />;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="card bg-base-100 shadow-xl p-6 mb-8 border border-base-200">
          <h1 className="text-3xl font-bold text-base-content mb-2">Developer Portal</h1>
          <p className="text-base-content/70">Manage your real estate projects, contracts, and quality control</p>
        </div>

        {/* Tabs */}
        <div className="card bg-base-100 shadow-xl p-1 mb-8 border border-base-200">
          <div className="flex space-x-1">
            <button 
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'dashboard' 
                ? 'bg-primary text-primary-content shadow-lg' 
                : 'text-base-content hover:bg-base-200'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <RiBuildingLine className="w-5 h-5 mr-2" />
              Project Dashboard
            </button>
            <button 
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'smart-contracts' 
                ? 'bg-primary text-primary-content shadow-lg' 
                : 'text-base-content hover:bg-base-200'
              }`}
              onClick={() => setActiveTab('smart-contracts')}
            >
              <RiMoneyDollarCircleLine className="w-5 h-5 mr-2" />
              Smart Contracts
            </button>
            <button 
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'issues' 
                ? 'bg-primary text-primary-content shadow-lg' 
                : 'text-base-content hover:bg-base-200'
              }`}
              onClick={() => setActiveTab('issues')}
            >
              <RiErrorWarningLine className="w-5 h-5 mr-2" />
              Discrepancy Log
              {flaggedIssues.length > 0 && (
                <span className="ml-2 bg-error text-error-content text-xs px-2 py-1 rounded-full">
                  {flaggedIssues.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}

export default DeveloperDevTrackr;
