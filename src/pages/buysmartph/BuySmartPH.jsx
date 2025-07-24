import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiRobot2Line, 
  RiHomeSmileLine, 
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiBarChartBoxLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

function BuySmartPH() {
  // Get role from parent route
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";

  const [activeStep, setActiveStep] = useState(1);

  const buyingSteps = [
    {
      id: 1,
      title: "Property Assessment",
      description: "AI-powered analysis of your preferences and requirements",
      icon: RiRobot2Line,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      id: 2,
      title: "Market Analysis",
      description: "Real-time market data and price predictions",
      icon: RiBarChartBoxLine,
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    },
    {
      id: 3,
      title: "Financial Planning",
      description: "Customized financial advice and loan options",
      icon: RiMoneyDollarCircleLine,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      id: 4,
      title: "Documentation",
      description: "Automated document preparation and verification",
      icon: RiFileList3Line,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    }
  ];

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4" // Added ml-20 for sidebar spacing
      >
        <div className="container mx-auto max-w-[1400px] px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-4 mb-4">
                <RiRobot2Line className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">BuySmart PH</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl">
                Your intelligent guide through every step of the property buying process
              </p>
              <div className="mt-6">
                <button className="btn btn-ghost btn-lg text-primary-content border-primary-content/20">
                  Start Your Journey
                </button>
              </div>
            </div>
          </motion.div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {buyingSteps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`card bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl shadow-lg cursor-pointer`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <step.icon className={`w-8 h-8 ${step.color} mb-4`} />
                      <h3 className={`text-lg font-bold ${step.color}`}>
                        {step.title}
                      </h3>
                      <p className="text-base-content/70 text-sm mt-2">
                        {step.description}
                      </p>
                    </div>
                    {activeStep === step.id && (
                      <div className="rounded-full bg-success/10 p-1">
                        <RiCheckboxCircleLine className="w-5 h-5 text-success" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Assistant Chat Interface */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-lg border border-base-200"
          >
            <div className="card-body p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <RiRobot2Line className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Property Assistant</h2>
                  <p className="text-base-content/60">
                    Ask me anything about property buying
                  </p>
                </div>
              </div>
              <div className="bg-base-200/50 rounded-lg p-4 min-h-[200px] mb-4">
                {/* Chat messages would go here */}
                <p className="text-base-content/60 text-center py-8">
                  Start a conversation with your AI assistant
                </p>
              </div>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Type your question here..." 
                  className="input input-bordered flex-1" 
                />
                <button className="btn btn-primary px-6">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default BuySmartPH;