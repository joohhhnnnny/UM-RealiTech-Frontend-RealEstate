import { RiBuildingLine } from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import BuyerDevTrackr from './BuyerDevTrackr';
import AgentDevTrackr from './AgentDevTrackr';
import DeveloperDevTrackr from './DeveloperDevTrackr';
import DashboardLayout from '../../layouts/DashboardLayout';

// Main DevTrackr Component
function DevTrackr() {
  const location = useLocation();
  const userRole = location.state?.userRole || 'buyer';

  const renderContent = () => {
    switch(userRole) {
      case 'agent':
        return <AgentDevTrackr />;
      case 'developer':
        return <DeveloperDevTrackr />;
      default:
        return <BuyerDevTrackr />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="min-h-screen bg-base-100 text-base-content">
        <div className="container mx-auto max-w-[1400px] px-4 py-8">
          {/* Hero Section */}
          <div className="card bg-gradient-to-r from-blue-500/90 to-blue-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8">
            <div className="card-body p-8">
              <div className="flex items-center gap-4">
                <RiBuildingLine className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">DevTrackr</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl mt-4">
                Transparent development progress tracking for real estate projects.
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

export default DevTrackr;