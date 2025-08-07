import React from 'react';
import { RiBuildingLine } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import BuyerRC from './BuyerRC';
import AgentRC from './AgentRC';
import DeveloperRC from './DeveloperRC';
import DashboardLayout from '../../layouts/DashboardLayout';
import { initializeSampleData } from '../../scripts/initializeRealtyConnect';

// Main RealtyConnect Component
function RealtyConnect() {
  const location = useLocation();
  const userRole = location.state?.userRole || 'buyer';

  const handleInitializeSampleData = async () => {
    try {
      await initializeSampleData();
      alert('Sample data initialized successfully!');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      alert('Error initializing sample data');
    }
  };

  const renderContent = () => {
    switch(userRole) {
      case 'agent':
        return <AgentRC />;
      case 'developer':
        return <DeveloperRC />;
      default:
        return <BuyerRC />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="min-h-screen bg-base-100 text-base-content">
        <div className="container mx-auto max-w-[1400px] px-4 py-8">
          {/* Hero Section */}
          <div className="card bg-gradient-to-r from-purple-500/90 to-purple-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8">
            <div className="card-body p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <RiBuildingLine className="w-8 h-8 text-primary-content" />
                  <div>
                    <h1 className="text-3xl font-bold text-primary-content">RealtyConnect</h1>
                    <p className="text-xl text-primary-content/90 max-w-2xl mt-2">
                      Connect and collaborate with real estate professionals efficiently.
                    </p>
                  </div>
                </div>
                <button 
                  className="btn btn-outline btn-primary-content gap-2"
                  onClick={handleInitializeSampleData}
                >
                  <RiBuildingLine className="w-4 h-4" />
                  Initialize Sample Data
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Component */}
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RealtyConnect;