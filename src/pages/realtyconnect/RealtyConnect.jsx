// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiTeamLine,
  RiUserStarLine,
  RiBarChartBoxLine,
  RiCalendarCheckLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

function RealtyConnect() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  const [activeFeature, setActiveFeature] = useState(1); // Moved before conditional return

  // Redirect buyers to dashboard if they try to access RealtyConnect
  if (userRole === "buyer") {
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }

  const features = [
    {
      id: 1,
      title: "Agent Network",
      description: "Connect with top-performing agents nationwide",
      icon: RiTeamLine,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      id: 2,
      title: "Performance Tracking",
      description: "Monitor sales and client satisfaction metrics",
      icon: RiBarChartBoxLine,
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    },
    {
      id: 3,
      title: "Client Management",
      description: "Streamline client communications and follow-ups",
      icon: RiUserStarLine,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      id: 4,
      title: "Scheduling",
      description: "Efficient property viewing and meeting planner",
      icon: RiCalendarCheckLine,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    }
  ];

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4 ml-20"
      >
        <div className="container mx-auto max-w-[1400px] px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-gradient-to-r from-purple-500/90 to-purple-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-4 mb-4">
                <RiTeamLine className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">RealtyConnect</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl">
                Your comprehensive platform for real estate networking and client management
              </p>
              <div className="mt-6">
                <button className="btn btn-ghost btn-lg text-primary-content border-primary-content/20">
                  Connect Now
                </button>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`card bg-gradient-to-br ${feature.bgGradient} backdrop-blur-xl shadow-lg cursor-pointer`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                      <h3 className={`text-lg font-bold ${feature.color}`}>
                        {feature.title}
                      </h3>
                      <p className="text-base-content/70 text-sm mt-2">
                        {feature.description}
                      </p>
                    </div>
                    {activeFeature === feature.id && (
                      <div className="rounded-full bg-success/10 p-1">
                        <RiCheckboxCircleLine className="w-5 h-5 text-success" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Network Stats */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-lg border border-base-200"
          >
            <div className="card-body p-6">
              <h2 className="text-2xl font-bold mb-6">Network Overview</h2>
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-title">Active Agents</div>
                  <div className="stat-value text-purple-500">1.2K</div>
                  <div className="stat-desc">↗︎ 400 (22%)</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Properties Listed</div>
                  <div className="stat-value text-blue-500">4.6K</div>
                  <div className="stat-desc">↗︎ 900 (14%)</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Successful Deals</div>
                  <div className="stat-value text-emerald-500">892</div>
                  <div className="stat-desc">↗︎ 90 (18%)</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default RealtyConnect;