import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  RiRobot2Line, 
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiBarChartBoxLine,
  RiCheckboxCircleLine,
  RiLayoutGridLine
} from 'react-icons/ri';
import listingsData from '../../listings.json';
import AIGuide from './buyersmartPH/AIGuide.jsx';
import LoanCalculator from './buyersmartPH/LoanCalculator';
import CostCalculator from './buyersmartPH/CostCalculator';
import DocumentSubmission from './buyersmartPH/DocumentSubmission';
import SmartListing from './buyersmartPH/SmartListing';

function BuyerBSPH() {
  const [activeStep, setActiveStep] = useState(1);
  const [listings, setListings] = useState([]);
  const [displayCount, setDisplayCount] = useState(9);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [profileData, setProfileData] = useState({
    buyerType: '',
    monthlyIncome: '',
    monthlyDebts: '',
    hasSpouseIncome: false,
    preferredLocation: '',
    budgetRange: ''
  });

  useEffect(() => {
    // Filter out listings with missing essential data
    const validListings = listingsData.filter(listing => 
      listing.title && listing.location && (listing.price || listing.price === 0)
    );
    setListings(validListings);
  }, []);

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
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
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
      title: "Document Submission",
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
      color: "text-teal-500",
      bgGradient: "from-teal-500/20 to-teal-500/5"
    }
  ];

  // Content components for each step
  const stepContent = {
    1: <AIGuide profileData={profileData} setProfileData={setProfileData} onComplete={() => setActiveStep(5)} />,
    2: <LoanCalculator />,
    3: <CostCalculator />,
    4: <DocumentSubmission />,
    5: (
      <SmartListing 
        listings={listings} 
        displayCount={displayCount} 
        setDisplayCount={setDisplayCount}
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        sortBy={sortBy}
        setSortBy={setSortBy}
        profileData={profileData}
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
            className={`card bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl cursor-pointer ${
              activeStep === step.id ? 'ring-2 ring-primary' : ''
            }`}
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