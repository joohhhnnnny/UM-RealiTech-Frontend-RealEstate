import { RiBuildingLine } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import BuyerBuildSafe from './BuyerBuildSafe';
import AgentBuildSafe from './AgentBuildSafe';
import DeveloperBuildSafe from './DeveloperBuildSafe';
import DashboardLayout from '../../layouts/DashboardLayout';
import BuildSafeErrorBoundary from './BuildSafeErrorBoundary';

// Main BuildSafe Component
function BuildSafe() {
  const location = useLocation();
  const userRole = location.state?.userRole || 'buyer';

  const renderContent = () => {
    switch(userRole) {
      case 'agent':
        return <AgentBuildSafe />;
      case 'developer':
        return <DeveloperBuildSafe />;
      default:
        return <BuyerBuildSafe />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="min-h-screen bg-base-100 text-base-content">
        <div className="container mx-auto max-w-[1400px] px-4 py-8">
          {/* Hero Section */}
          <div className="card bg-gradient-to-r from-blue-800 to-blue-600/90 shadow-lg overflow-hidden backdrop-blur-xl mb-8">
            <div className="card-body p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <RiBuildingLine className="w-8 h-8 text-primary-content" />
                  <div>
                    <h1 className="text-3xl font-bold text-primary-content">BuildSafe</h1>
                    <p className="text-xl text-primary-content/90 max-w-2xl mt-2">
                      Trust-building construction oversight with verified progress tracking and secure payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Component wrapped in Error Boundary */}
          <BuildSafeErrorBoundary>
            {renderContent()}
          </BuildSafeErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BuildSafe;