import { RiRobot2Line } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import BuyerBSPH from './BuyerBSPH';
import AgentBSPH from './AgentBSPH';
import DeveloperBSPH from './DeveloperBSPH';
import DashboardLayout from '../../layouts/DashboardLayout';

// Main BuySmartPH Component
function BuySmartPH() {
  const location = useLocation();
  const userRole = location.state?.userRole || 'buyer';

  const renderContent = () => {
    switch(userRole) {
      case 'agent':
        return <AgentBSPH />;
      case 'developer':
        return <DeveloperBSPH />;
      default:
        return <BuyerBSPH />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="min-h-screen bg-base-100 text-base-content">
        <div className="container mx-auto max-w-[1400px] px-4 py-8">

          {/* Hero Section */}
          <div className="card bg-gradient-to-r from-teal-500/90 to-teal-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8">
            <div className="card-body p-8">
              <div className="flex items-center gap-4">
                <RiRobot2Line className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">BuySmart PH</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl mt-4">
                Your intelligent guide through every step of the property buying process.
              </p>
            </div>
          </div>

          {/* Dynamic Component */}
          {renderContent()}
          
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BuySmartPH;