import { motion } from "framer-motion";
import { useState } from "react";
import { 
  RiUserStarLine, 
  RiTeamLine, 
  RiBarChartBoxLine,
  RiNotificationLine,
  RiMessageLine,
  RiCalendarLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCheckboxCircleLine,
  RiCalculatorLine,
  RiFileTextLine
} from 'react-icons/ri';

// Import the separate components
import Dashboard from './agentsmartPH/Dashboard';
import MyListing from './agentsmartPH/MyListing';
import Clients from './agentsmartPH/Clients';
import Analytics from './agentsmartPH/Analytics';
import Tools from './agentsmartPH/Tools';


function AgentBSPH() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // No duplicate state - each component manages its own data
  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'listings':
        return <MyListing />;
      case 'clients':
        return <Clients />;
      case 'analytics':
        return <Analytics />;
      case 'tools':
        return <Tools />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1 gap-1"> {/* Added gap-1 */}
            <a 
                className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
            >
                <RiBarChartBoxLine className="w-4 h-4 mr-2" />
                Dashboard
            </a>
            <a 
                className={`tab ${activeTab === 'listings' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('listings')}
            >
                <RiUserStarLine className="w-4 h-4 mr-2" />
                My Listings
            </a>
            <a 
                className={`tab ${activeTab === 'clients' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('clients')}
            >
                <RiTeamLine className="w-4 h-4 mr-2" />
                Clients
            </a>
            <a 
                className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('analytics')}
            >
                <RiBarChartBoxLine className="w-4 h-4 mr-2" />
                Analytics
            </a>
            <a 
                className={`tab ${activeTab === 'tools' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('tools')}
            >
                <RiUserStarLine className="w-4 h-4 mr-2" />
                Tools
            </a>
        </div>

      {/* Dynamic Content */}
      <motion.div 
        key={activeTab}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
}

export default AgentBSPH;