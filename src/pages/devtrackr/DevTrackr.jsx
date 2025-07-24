import { motion } from "framer-motion";
import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiBuildingLine,
  RiTimeLine,
  RiBarChartBoxLine,
  RiMapPinTimeLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';

function DevTrackr() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer"; // Default to buyer if no role
  const [activeFeature, setActiveFeature] = useState(1);

  const features = [
    {
      id: 1,
      title: "Project Timeline",
      description: "Real-time construction progress tracking",
      icon: RiTimeLine,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      id: 2,
      title: "Development Updates",
      description: "Regular photo and milestone updates",
      icon: RiBuildingLine,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      id: 3,
      title: "Analytics Dashboard",
      description: "Comprehensive project performance metrics",
      icon: RiBarChartBoxLine,
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    },
    {
      id: 4,
      title: "Location Intel",
      description: "Area development and property values",
      icon: RiMapPinTimeLine,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    }
  ];

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto max-w-[1400px] px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-gradient-to-r from-blue-500/90 to-blue-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-4 mb-4">
                <RiBuildingLine className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">DevTrackr</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl">
                Transparent development progress tracking for real estate projects
              </p>
              <div className="mt-6">
                <button className="btn btn-ghost btn-lg text-primary-content border-primary-content/20 hover:bg-transparent hover:text-primary-content hover:border-primary-content">
                  View Projects
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

          {/* Project Timeline */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-lg border border-base-200"
          >
            <div className="card-body p-6">
              <h2 className="text-2xl font-bold mb-6">Active Projects</h2>
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-title">Projects</div>
                  <div className="stat-value text-blue-500">4</div>
                  <div className="stat-desc">Active developments</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Progress</div>
                  <div className="stat-value text-emerald-500">76%</div>
                  <div className="stat-desc">Average completion</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Timeline</div>
                  <div className="stat-value text-amber-500">92%</div>
                  <div className="stat-desc">On schedule</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default DevTrackr;