import { motion } from "framer-motion";
import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiBuildingLine,
  RiTimeLine,
  RiBarChartBoxLine,
  RiMapPinTimeLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiImageLine,
  RiFileTextLine
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

  const projectUpdates = [
  {
    id: 1,
    projectName: "Horizon Residences",
    date: "July 25, 2025",
    type: "Construction Update",
    description: "Foundation work completed ahead of schedule. Starting structural framework next week.",
    progress: 76,
    image: "https://pueblodeoro.com/wp-content/uploads/2017/12/Sakura-1.jpg", // use one of the carousel URLs
    tags: ["Construction", "On Schedule"]
  },
  {
    id: 2,
    projectName: "Sky Gardens Tower",
    date: "July 24, 2025",
    type: "Milestone Achieved",
    description: "Completed installation of eco-friendly solar panels across all residential units.",
    progress: 92,
    image: "https://abu-dhabi.realestate/wp-content/uploads/2021/08/Sky-Gardens-013.jpg", // placeholder until actual image sourced
    tags: ["Green Energy", "Milestone"]
  },
  {
    id: 3,
    projectName: "Marina Bay Complex",
    date: "July 23, 2025",
    type: "Infrastructure Update",
    description: "Underground parking facility construction is 65% complete. Beginning electrical installations.",
    progress: 65,
    image: "https://jamiechancetravels.com/wp-content/uploads/2022/09/DSCF0435.jpg", // placeholder
    tags: ["Infrastructure", "In Progress"]
  },
  {
    id: 4,
    projectName: "Urban Square Mall",
    date: "July 22, 2025",
    type: "Design Update",
    description: "Final interior design plans approved. Starting material procurement for retail spaces.",
    progress: 71,
    image: "https://lh3.googleusercontent.com/p/AF1QipPsD3jAihaCXdtvsUnWNbQaiA_j-_bu2SVIYW2e=s680-w680-h510-rw", // placeholder
    tags: ["Design", "Procurement"]
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

          {/* Project Updates Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Project Updates</h2>
            {/* Project Updates Feed */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
            >
              {projectUpdates.map((update) => (
                <motion.div
                  key={update.id}
                  initial={{ scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  className="card bg-base-100 shadow-lg border border-base-200 overflow-hidden"
                >
                  <figure className="relative h-48">
                    <img 
                      src={update.image} 
                      alt={update.projectName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-1">{update.projectName}</h3>
                      <div className="flex items-center gap-2 text-white/90">
                        <RiCalendarLine className="w-4 h-4" />
                        <span className="text-sm">{update.date}</span>
                      </div>
                    </div>
                  </figure>
                  <div className="card-body p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge badge-primary">{update.type}</span>
                      {update.tags.map((tag, index) => (
                        <span key={index} className="badge badge-ghost">{tag}</span>
                      ))}
                    </div>
                    <p className="text-base-content/80 mb-4">{update.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-base-content/70">Progress</span>
                        <span className="font-medium">{update.progress}%</span>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${update.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-ghost btn-sm gap-2">
                        View Details
                        <RiArrowRightLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default DevTrackr;