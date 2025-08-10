import { motion } from 'framer-motion';
import { RiRobot2Line, RiHome3Line, RiCheckboxCircleLine } from 'react-icons/ri';

/**
 * Professional Success Banner Component for Property Listings
 * Shows AI recommendations status and available properties count
 */
function PropertySuccessBanner({ 
  profileData = null,
  listingsCount = 0,
  isAIRecommendationsReady = false
}) {
  // Animation variants
  const bannerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.2
      }
    }
  };

  // Determine banner content based on AI status
  const getBannerContent = () => {
    if (profileData && profileData.buyerType && isAIRecommendationsReady) {
      const locationInfo = profileData.preferredLocation || 'No location';
      const budgetInfo = profileData.budgetRange || 'No budget';
      const incomeInfo = profileData.monthlyIncome ? `₱${parseInt(profileData.monthlyIncome).toLocaleString()}/month income` : 'No income data';
      
      return {
        icon: RiRobot2Line,
        title: 'AI Smart Recommendations Ready!',
        subtitle: `Based on your ${profileData.buyerType} profile (${locationInfo}, ${budgetInfo}, ${incomeInfo}), showing ${listingsCount} ${listingsCount === 1 ? 'property' : 'properties'} ranked by compatibility and affordability.`,
        alertType: 'alert-success'
      };
    } else if (listingsCount > 0) {
      return {
        icon: RiHome3Line,
        title: `${listingsCount} Available ${listingsCount === 1 ? 'Property' : 'Properties'}`,
        subtitle: `Showing ${listingsCount} available properties. Complete your AI profile for personalized recommendations.`,
        alertType: 'alert-info'
      };
    } else {
      return {
        icon: RiHome3Line,
        title: 'Available Properties',
        subtitle: 'Complete your AI profile for personalized recommendations.',
        alertType: 'alert-info'
      };
    }
  };

  const bannerContent = getBannerContent();
  const IconComponent = bannerContent.icon;

  return (
    <motion.div
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
      className={`alert ${bannerContent.alertType} shadow-lg border-0 backdrop-blur-sm`}
    >
      <motion.div variants={iconVariants}>
        <IconComponent className="w-6 h-6 flex-shrink-0" />
      </motion.div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">
              {bannerContent.title}
            </h3>
            <div className="text-sm opacity-90 mt-1">
              {bannerContent.subtitle}
            </div>
          </div>
          
          {/* AI Algorithm Status Indicator */}
          {profileData && profileData.buyerType && (
            <motion.div 
              className="badge badge-success text-white gap-1 ml-4 flex-shrink-0"
              variants={iconVariants}
            >
              <RiCheckboxCircleLine className="w-3 h-3" />
              MCDA Algorithm Active
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default PropertySuccessBanner;
