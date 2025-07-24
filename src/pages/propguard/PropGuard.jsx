// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiShieldKeyholeLine,
  RiFileShieldLine,
  RiAlertLine,
  RiFingerprint2Line,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';

function PropGuard() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer"; // Default to buyer if no role
  const [activeFeature, setActiveFeature] = useState(1);

  const securityFeatures = [
    {
      id: 1,
      title: "Fraud Detection",
      description: "AI-powered real estate fraud prevention",
      icon: RiShieldKeyholeLine,
      color: "text-rose-500",
      bgGradient: "from-rose-500/20 to-rose-500/5"
    },
    {
      id: 2,
      title: "Document Verification",
      description: "Automated authenticity checking system",
      icon: RiFileShieldLine,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      id: 3,
      title: "Risk Assessment",
      description: "Real-time property transaction monitoring",
      icon: RiAlertLine,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    },
    {
      id: 4,
      title: "Secure Authentication",
      description: "Multi-factor verification process",
      icon: RiFingerprint2Line,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
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
            className="card bg-gradient-to-r from-rose-500/90 to-rose-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-4 mb-4">
                <RiShieldKeyholeLine className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">PropGuard</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl">
                Advanced security system protecting your real estate investments
              </p>
              <div className="mt-6">
                <button className="btn btn-ghost btn-lg text-primary-content border-primary-content/20">
                  Verify Property
                </button>
              </div>
            </div>
          </motion.div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {securityFeatures.map((feature) => (
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

          {/* Security Scanner */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-lg border border-base-200"
          >
            <div className="card-body p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <RiShieldKeyholeLine className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Property Verification Scanner</h2>
                  <p className="text-base-content/60">
                    Upload documents or enter property details for verification
                  </p>
                </div>
              </div>
              <div className="bg-base-200/50 rounded-lg p-8 text-center">
                <button className="btn btn-outline btn-lg gap-2">
                  <RiFileShieldLine className="w-6 h-6" />
                  Upload Documents
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default PropGuard;