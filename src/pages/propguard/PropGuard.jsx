import React from 'react';
import { motion } from "framer-motion";
import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiShieldKeyholeLine,
  RiFileShieldLine,
  RiAlertLine,
  RiFingerprint2Line,
  RiCheckboxCircleLine,
  RiUploadCloud2Line,
  RiSearchEyeLine,
  RiShieldUserLine,
  RiFileWarningLine,
  RiPieChartLine,
  RiLockPasswordLine
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

  const securityTools = {
    "1": { // Fraud Detection
      title: "Fraud Detection Scanner",
      description: "AI-powered system to detect potential real estate fraud patterns",
      icon: RiShieldKeyholeLine,
      color: "rose",
      actions: [
        {
          icon: RiSearchEyeLine,
          label: "Scan Property Listing",
          description: "Check property listing details for suspicious patterns"
        },
        {
          icon: RiShieldUserLine,
          label: "Verify Seller Identity",
          description: "Validate seller credentials and history"
        },
        {
          icon: RiFileWarningLine,
          label: "Price Analysis",
          description: "Compare with market rates to detect anomalies"
        }
      ]
    },
    "2": { // Document Verification
      title: "Document Authentication System",
      description: "Verify the authenticity of property documents and certificates",
      icon: RiFileShieldLine,
      color: "blue",
      actions: [
        {
          icon: RiUploadCloud2Line,
          label: "Upload Documents",
          description: "Submit property documents for verification"
        },
        {
          icon: RiFileShieldLine,
          label: "Certificate Check",
          description: "Validate property certificates and permits"
        },
        {
          icon: RiLockPasswordLine,
          label: "Digital Signature",
          description: "Verify document signatures and seals"
        }
      ]
    },
    "3": { // Risk Assessment
      title: "Risk Assessment Tool",
      description: "Evaluate potential risks in property transactions",
      icon: RiAlertLine,
      color: "amber",
      actions: [
        {
          icon: RiPieChartLine,
          label: "Risk Analysis",
          description: "Generate comprehensive risk report"
        },
        {
          icon: RiSearchEyeLine,
          label: "Market Research",
          description: "Analyze market trends and patterns"
        },
        {
          icon: RiFileWarningLine,
          label: "History Check",
          description: "Review property transaction history"
        }
      ]
    },
    "4": { // Secure Authentication
      title: "Multi-Factor Authentication",
      description: "Secure verification process for property transactions",
      icon: RiFingerprint2Line,
      color: "emerald",
      actions: [
        {
          icon: RiLockPasswordLine,
          label: "2FA Setup",
          description: "Configure two-factor authentication"
        },
        {
          icon: RiShieldUserLine,
          label: "Identity Verification",
          description: "Verify user identity through multiple channels"
        },
        {
          icon: RiFileShieldLine,
          label: "Access Control",
          description: "Manage authentication permissions"
        }
      ]
    }
  };

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
                <button className="btn btn-ghost btn-lg text-primary-content border-primary-content/20 hover:bg-transparent hover:text-primary-content hover:border-primary-content">
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

          {/* Dynamic Security Tool */}
          <motion.div 
            key={activeFeature}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-lg border border-base-200"
          >
            <div className="card-body p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full bg-${securityTools[String(activeFeature)].color}-500/10`}>
                  {/* Fix: Use proper JSX syntax for dynamic component rendering */}
                  {React.createElement(securityTools[String(activeFeature)].icon, {
                    className: `w-6 h-6 text-${securityTools[String(activeFeature)].color}-500`
                  })}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{securityTools[activeFeature].title}</h2>
                  <p className="text-base-content/60">
                    {securityTools[activeFeature].description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {securityTools[activeFeature].actions.map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`btn btn-outline btn-lg flex-col h-auto gap-3 p-6 border-2 hover:bg-${securityTools[activeFeature].color}-500/10 hover:border-${securityTools[activeFeature].color}-500`}
                  >
                    <action.icon className={`w-8 h-8 text-${securityTools[activeFeature].color}-500`} />
                    <div className="text-center">
                      <div className="font-semibold mb-1">{action.label}</div>
                      <div className="text-xs text-base-content/60">{action.description}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className={`btn btn-${securityTools[activeFeature].color} gap-2`}>
                  <RiShieldKeyholeLine className="w-5 h-5" />
                  Run Security Check
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