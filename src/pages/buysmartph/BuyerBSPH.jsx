import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { 
  RiRobot2Line, 
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiBarChartBoxLine,
  RiCheckboxCircleLine,
  RiLayoutGridLine
} from 'react-icons/ri';
import AIGuide from './buyersmartPH/AIGuide.jsx';
import LoanCalculator from './buyersmartPH/LoanCalculator';
import CostCalculator from './buyersmartPH/CostCalculator';
import DocumentSubmission from './buyersmartPH/DocumentSubmission';
import SmartListing from './buyersmartPH/SmartListing';
import ProfileStatus from '../../components/ProfileStatus';
import { userProfileService } from '../../services/UserProfileService';

function BuyerBSPH() {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(1);
  const [profileData, setProfileData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  // Check profile completion status on component mount
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const hasProfile = await userProfileService.hasCompleteProfile();
        setProfileComplete(hasProfile);
        
        if (hasProfile) {
          // If profile exists, load it
          const response = await userProfileService.getProfile();
          if (response.success && response.profileData) {
            setProfileData(response.profileData);
            
            // Check if we're coming from dashboard with specific navigation
            if (location.state?.fromDashboard && location.state?.activeStep) {
              setActiveStep(location.state.activeStep);
            } else {
              setActiveStep(5); // Go directly to Smart Listings by default
            }
          }
        } else {
          // Check if we're trying to go to Smart Listings without profile
          if (location.state?.activeStep === 5) {
            setActiveStep(1); // Redirect to profile setup
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      }
    };

    checkProfileStatus();
  }, [location.state]);

  // Handle profile completion
  const handleProfileComplete = (completedProfile) => {
    setProfileData(completedProfile);
    setProfileComplete(true);
    setIsEditMode(false);
    setActiveStep(5); // Navigate to Smart Listings
  };

  // Handle edit profile request
  const handleEditProfile = () => {
    setIsEditMode(true);
    setActiveStep(1); // Go back to AI Guide in edit mode
  };

  // Handle start profile setup for new users
  const handleStartSetup = () => {
    setIsEditMode(false);
    setActiveStep(1); // Go to AI Guide
  };

  const buyingSteps = [
    {
      id: 1,
      title: "AI Guide-Buyer Profile",
      description: "Personalized profile setup with AI-powered recommendations",
      icon: RiRobot2Line,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      id: 2,
      title: "Loan Calculator",
      description: "Calculate mortgage payments and loan terms",
      icon: RiMoneyDollarCircleLine,
      color: "text-red-400",
      bgGradient: "from-red-400/20 to-red-400/5"
    },
    {
      id: 3,
      title: "Cost Calculator",
      description: "Estimate total costs including taxes and fees",
      icon: RiBarChartBoxLine,
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    },
    {
      id: 4,
      title: "Document Verification",
      description: "Streamlined document upload and verification process",
      icon: RiFileList3Line,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    },
    {
      id: 5,
      title: "Smart Listings",
      description: "AI-powered property recommendations based on your profile",
      icon: RiLayoutGridLine,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    }
  ];



  // Content components for each step
  const stepContent = {
    1: <AIGuide 
         profileData={profileData} 
         setProfileData={setProfileData} 
         onComplete={handleProfileComplete}
         isEditMode={isEditMode}
       />,
    2: <LoanCalculator />,
    3: <CostCalculator />,
    4: <DocumentSubmission />,
    5: profileComplete ? (
      <div className="space-y-6">
        <ProfileStatus 
          profileData={profileData}
          setProfileData={setProfileData}
          onEditProfile={handleEditProfile}
          onStartSetup={handleStartSetup}
        />
        <SmartListing profileData={profileData} />
      </div>
    ) : (
      <ProfileStatus 
        profileData={profileData}
        setProfileData={setProfileData}
        onEditProfile={handleEditProfile}
        onStartSetup={handleStartSetup}
      />
    )
  };

  return (
    <div className="space-y-8">
      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {buyingSteps.map((step) => (
          <motion.div
            key={step.id}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`card bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl cursor-pointer transition-all duration-300 h-60 ${
              activeStep === step.id ? 'ring-2 ring-primary' : ''
            } ${
              step.id === 5 && !profileComplete ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            }`}
            onClick={() => {
              // Prevent navigation to Smart Listings if profile is not complete
              if (step.id === 5 && !profileComplete) {
                alert('Please complete your profile first to access Smart Listings');
                return;
              }
              setActiveStep(step.id);
            }}
          >
            <div className="card-body p-6 flex flex-col justify-between h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <step.icon className={`w-8 h-8 ${step.color} flex-shrink-0`} />
                  {activeStep === step.id && (
                    <div className="rounded-full bg-success/10 p-1 flex-shrink-0">
                      <RiCheckboxCircleLine className="w-5 h-5 text-success" />
                    </div>
                  )}
                </div>
                <h3 className={`text-lg font-bold ${step.color} mb-2 leading-tight ${
                  step.id === 5 && !profileComplete ? 'opacity-50' : ''
                }`}>
                  {step.title}
                </h3>
                {step.id === 5 && !profileComplete && (
                  <span className="text-xs text-warning block font-normal mb-2">
                    Complete profile first
                  </span>
                )}
              </div>
              <p className={`text-base-content/70 text-sm leading-relaxed ${
                step.id === 5 && !profileComplete ? 'opacity-50' : ''
              }`}>
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Content Section */}
      <motion.div 
        key={activeStep}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {stepContent[activeStep]}
      </motion.div>
    </div>
  );
}

export default BuyerBSPH;