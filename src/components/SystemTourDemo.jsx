import React, { useState } from 'react';
import SystemTour from '../components/SystemTour';
import { 
  RiHomeLine, 
  RiUserLine, 
  RiSearchLine,
  RiHeartLine,
  RiSettingsLine
} from 'react-icons/ri';

const SystemTourDemo = () => {
  const [userRole, setUserRole] = useState('buyer');
  const [showTour, setShowTour] = useState(false);

  // Function to clear tour completion and restart
  const startDemoTour = () => {
    // Clear any existing tour completion
    const tourKey = `tour_completed_demo_user`;
    localStorage.removeItem(tourKey);
    setShowTour(true);
  };

  return (
    <div className="min-h-screen bg-base-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">System Tour Demo</h1>
          <p className="text-lg text-base-content/70 mb-6">
            Experience the guided tour that helps first-time users navigate the platform
          </p>
          
          {/* Role Selector */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Select User Role:</span>
              </label>
              <select 
                className="select select-bordered w-full max-w-xs"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="buyer">Buyer</option>
                <option value="agent">Agent</option>
                <option value="developer">Developer</option>
              </select>
            </div>
          </div>

          {/* Start Tour Button */}
          <button
            className="btn btn-primary btn-lg gap-2"
            onClick={startDemoTour}
          >
            <RiUserLine className="w-5 h-5" />
            Start {userRole} Tour Demo
          </button>
        </div>

        {/* Mock Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mock Sidebar */}
          <div className="col-span-1">
            <div 
              className="bg-base-200 rounded-lg p-6 h-96"
              data-tour="sidebar"
            >
              <h3 className="font-bold text-lg mb-4">Navigation</h3>
              <ul className="space-y-3">
                <li 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors"
                  data-tour="properties"
                >
                  <RiSearchLine className="w-5 h-5" />
                  <span>Browse Properties</span>
                </li>
                <li 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors"
                  data-tour="buysmartph"
                >
                  <RiHomeLine className="w-5 h-5" />
                  <span>BuySmartPH</span>
                </li>
                <li 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors"
                  data-tour="realtyconnect"
                >
                  <RiUserLine className="w-5 h-5" />
                  <span>RealtyConnect</span>
                </li>
                <li 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors"
                  data-tour="propguard"
                >
                  <RiSettingsLine className="w-5 h-5" />
                  <span>PropGuard</span>
                </li>
                {userRole === 'developer' && (
                  <li 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors"
                    data-tour="buildsafe"
                  >
                    <RiSettingsLine className="w-5 h-5" />
                    <span>BuildSafe</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Mock Main Content */}
          <div className="col-span-3">
            <div className="space-y-6">
              {/* Mock Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total Properties</div>
                  <div className="stat-value text-primary">25</div>
                  <div className="stat-desc">↗︎ 12 this month</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Active Projects</div>
                  <div className="stat-value text-secondary">3</div>
                  <div className="stat-desc">2 completed</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Saved Properties</div>
                  <div className="stat-value">8</div>
                  <div className="stat-desc">↗︎ 3 new</div>
                </div>
              </div>

              {/* Mock Saved Properties Section */}
              <div 
                className="bg-base-200 rounded-lg p-6"
                data-tour="saved-properties"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">My Saved Properties</h3>
                  <RiHeartLine className="w-6 h-6 text-error" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h4 className="card-title text-sm">Modern Condo in BGC</h4>
                      <p className="text-xs text-base-content/70">Taguig City</p>
                      <div className="text-primary font-bold">₱5.2M</div>
                    </div>
                  </div>
                  <div className="card bg-base-100 shadow">
                    <div className="card-body">
                      <h4 className="card-title text-sm">House and Lot in Alabang</h4>
                      <p className="text-xs text-base-content/70">Muntinlupa City</p>
                      <div className="text-primary font-bold">₱8.5M</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Additional Sections for Developer/Agent */}
              {(userRole === 'developer' || userRole === 'agent') && (
                <div 
                  className="bg-base-200 rounded-lg p-6"
                  data-tour={userRole === 'developer' ? 'projects' : 'analytics'}
                >
                  <h3 className="text-xl font-bold mb-4">
                    {userRole === 'developer' ? 'Development Projects' : 'Sales Analytics'}
                  </h3>
                  <div className="text-base-content/70">
                    {userRole === 'developer' 
                      ? 'Manage your construction projects and track progress'
                      : 'View your sales performance and client analytics'
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-info/10 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">Demo Instructions</h3>
          <ul className="space-y-2 text-sm">
            <li>• Select a user role (Buyer, Agent, or Developer)</li>
            <li>• Click "Start Tour Demo" to begin the guided tour</li>
            <li>• Each role has different tour content and steps</li>
            <li>• The tour will highlight different UI elements</li>
            <li>• You can navigate using Next/Previous or skip the tour</li>
            <li>• Try different roles to see the customized experience</li>
          </ul>
        </div>
      </div>

      {/* System Tour Component */}
      {showTour && (
        <SystemTour
          userRole={userRole}
          onComplete={() => {
            setShowTour(false);
            console.log(`${userRole} tour completed!`);
          }}
        />
      )}
    </div>
  );
};

export default SystemTourDemo;
