import { motion } from 'framer-motion';
import { 
  RiErrorWarningLine,
  RiLoader4Line,
  RiRobot2Line,
  RiHome3Line,
  RiRefreshLine,
  RiSearchLine
} from 'react-icons/ri';

/**
 * Professional Empty State Component for Property Listings
 * Handles multiple states: loading, error, no results, no listings
 */
function PropertyEmptyState({ 
  type = 'no-results', 
  onRefresh = null,
  onRetry = null,
  isRefreshing = false,
  error = null,
  customMessage = null
}) {
  // Configuration for different empty states
  const stateConfig = {
    'no-results': {
      icon: '🔍',
      title: 'No Properties Found',
      subtitle: 'No properties match your current criteria. Try adjusting your filters.',
      alertType: 'alert-warning',
      alertIcon: RiErrorWarningLine,
      actionLabel: 'Refresh Listings',
      actionIcon: RiRefreshLine
    },
    'no-listings': {
      icon: '🏠',
      title: 'No listings available',
      subtitle: 'Check back later or adjust your search criteria.',
      alertType: 'alert-warning',
      alertIcon: RiErrorWarningLine,
      actionLabel: 'Refresh Listings',
      actionIcon: RiRefreshLine
    },
    'error': {
      icon: '⚠️',
      title: 'Error Loading Properties',
      subtitle: error || 'Something went wrong while loading properties.',
      alertType: 'alert-error',
      alertIcon: RiErrorWarningLine,
      actionLabel: 'Try Again',
      actionIcon: RiRefreshLine
    },
    'ai-ready': {
      icon: '🤖',
      title: 'AI Smart Recommendations Ready!',
      subtitle: 'Your personalized property recommendations are ready.',
      alertType: 'alert-success',
      alertIcon: RiRobot2Line,
      actionLabel: 'Browse Properties',
      actionIcon: RiSearchLine
    },
    'available': {
      icon: '🏘️',
      title: 'Available Properties',
      subtitle: 'Browse all available properties in your area.',
      alertType: 'alert-info',
      alertIcon: RiHome3Line,
      actionLabel: 'Refresh Listings',
      actionIcon: RiRefreshLine
    }
  };

  const config = stateConfig[type] || stateConfig['no-results'];
  const ActionIcon = config.actionIcon;
  const AlertIcon = config.alertIcon;

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleAction = () => {
    if (type === 'error' && onRetry) {
      onRetry();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Alert Banner */}
      <motion.div 
        className={`alert ${config.alertType} shadow-lg border-0 backdrop-blur-sm`}
        variants={itemVariants}
      >
        <AlertIcon className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base">
            {customMessage?.title || config.title}
          </h3>
          <div className="text-sm opacity-90 mt-1">
            {customMessage?.subtitle || config.subtitle}
          </div>
        </div>
      </motion.div>
      
      {/* Main Empty State Content */}
      <motion.div 
        className="text-center py-16 px-4"
        variants={itemVariants}
      >
        <motion.div 
          className="text-8xl mb-6 select-none"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {config.icon}
        </motion.div>
        
        <motion.h3 
          className="text-3xl font-bold mb-3 text-base-content"
          variants={itemVariants}
        >
          {customMessage?.title || config.title}
        </motion.h3>
        
        <motion.p 
          className="text-lg text-base-content/70 mb-8 max-w-md mx-auto leading-relaxed"
          variants={itemVariants}
        >
          {customMessage?.subtitle || config.subtitle}
        </motion.p>
        
        {/* Action Button */}
        {(onRefresh || onRetry) && (
          <motion.button 
            className={`btn btn-primary btn-lg gap-3 min-w-48 ${isRefreshing ? 'loading' : ''}`}
            onClick={handleAction}
            disabled={isRefreshing}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRefreshing ? (
              <>
                <RiLoader4Line className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ActionIcon className="w-5 h-5" />
                {config.actionLabel}
              </>
            )}
          </motion.button>
        )}
        
        {/* Additional Help Text */}
        {type === 'no-results' && (
          <motion.div 
            className="mt-8 text-sm text-base-content/60"
            variants={itemVariants}
          >
            <p>Try these suggestions:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 max-w-md mx-auto">
              <li>Expand your location search</li>
              <li>Adjust your price range</li>
              <li>Change property type preferences</li>
              <li>Remove some filters</li>
            </ul>
          </motion.div>
        )}
        
        {type === 'error' && (
          <motion.div 
            className="mt-6 text-sm text-base-content/60"
            variants={itemVariants}
          >
            If the problem persists, please contact support.
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default PropertyEmptyState;
