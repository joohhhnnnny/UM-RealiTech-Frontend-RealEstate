import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiCloseLine, 
  RiArrowRightLine, 
  RiArrowLeftLine,
  RiCheckLine,
  RiLightbulbLine,
  RiNavigationLine,
  RiSettings3Line,
  RiHeartLine,
  RiSearchLine,
  RiHome2Line,
  RiUserLine,
  RiQuestionLine
} from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';

const SystemTour = ({ userRole = 'buyer', onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [highlightElement, setHighlightElement] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const { currentUser } = useAuth();
  const overlayRef = useRef(null);

  // Tour steps configuration based on user role
  const getTourSteps = (role) => {
    const commonSteps = [
      {
        title: "Welcome to RealEstate Platform! 🏠",
        content: "Let's take a quick guided tour to help you navigate our platform effectively. We'll show you the key features and tools available to make your real estate journey smooth and successful. This will only take a few minutes!",
        target: null,
        icon: <RiHome2Line className="w-6 h-6" />,
        position: "center"
      }
    ];

    const buyerSteps = [
      ...commonSteps,
      {
        title: "Navigation Menu",
        content: "Use this sidebar to navigate between different sections of your dashboard. You can access properties, tools, and settings from here.",
        target: "[data-tour='sidebar']",
        icon: <RiNavigationLine className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Browse Properties",
        content: "Click here to browse and search for properties that match your criteria. Use filters to narrow down your search.",
        target: "[data-tour='properties']",
        icon: <RiSearchLine className="w-6 h-6" />,
        position: "bottom"
      },
      {
        title: "BuySmartPH Tool",
        content: "Get property insights, market analysis, and smart recommendations to make informed buying decisions.",
        target: "[data-tour='buysmartph']",
        icon: <RiLightbulbLine className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "RealtyConnect",
        content: "Connect with verified agents and developers. Chat, schedule viewings, and get professional assistance.",
        target: "[data-tour='realtyconnect']",
        icon: <RiUserLine className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "PropGuard",
        content: "Verify property documents and get legal assistance. Ensure your investment is safe and legitimate.",
        target: "[data-tour='propguard']",
        icon: <RiSettings3Line className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Saved Properties",
        content: "View your saved properties and track your favorites. You can save properties by clicking the heart icon.",
        target: "[data-tour='saved-properties']",
        icon: <RiHeartLine className="w-6 h-6" />,
        position: "left"
      }
    ];

    const agentSteps = [
      ...commonSteps,
      {
        title: "Navigation Menu",
        content: "Access your agent dashboard, client management tools, and property listings from this sidebar.",
        target: "[data-tour='sidebar']",
        icon: <RiNavigationLine className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Property Listings",
        content: "Manage your property listings, add new properties, and track performance metrics.",
        target: "[data-tour='properties']",
        icon: <RiHome2Line className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Client Management",
        content: "Connect with buyers through RealtyConnect. Manage leads, schedule viewings, and close deals.",
        target: "[data-tour='realtyconnect']",
        icon: <RiUserLine className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Analytics & Insights",
        content: "Track your performance, view market trends, and get insights to improve your sales.",
        target: "[data-tour='analytics']",
        icon: <RiLightbulbLine className="w-6 h-6" />,
        position: "right"
      }
    ];

    const developerSteps = [
      ...commonSteps,
      {
        title: "Navigation Menu",
        content: "Access your developer dashboard, project management, and BuildSafe tools from this sidebar.",
        target: "[data-tour='sidebar']",
        icon: <RiNavigationLine className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Project Management",
        content: "Manage your development projects, track progress, and monitor construction phases.",
        target: "[data-tour='projects']",
        icon: <RiSettings3Line className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "BuildSafe",
        content: "Ensure compliance with building codes, safety standards, and regulatory requirements.",
        target: "[data-tour='buildsafe']",
        icon: <RiSettings3Line className="w-6 h-6" />,
        position: "right"
      },
      {
        title: "Sales & Marketing",
        content: "List your properties, connect with agents, and track sales performance.",
        target: "[data-tour='sales']",
        icon: <RiUserLine className="w-6 h-6" />,
        position: "right"
      }
    ];

    switch (role) {
      case 'agent':
        return agentSteps;
      case 'developer':
        return developerSteps;
      default:
        return buyerSteps;
    }
  };

  const tourSteps = getTourSteps(userRole);

  // Check if user has completed tour
  useEffect(() => {
    if (!currentUser) return;
    // Only show tour for buyers
    if (userRole !== 'buyer') return;

    const tourKey = `tour_completed_${currentUser.uid}`;
    const hasCompletedTour = localStorage.getItem(tourKey);

    if (!hasCompletedTour) {
      // Wait for DOM to be fully loaded and components to render
      const checkDOMReady = (attempts = 0) => {
        const sidebarExists = document.querySelector("[data-tour='sidebar']");
        const propertiesExists = document.querySelector("[data-tour='properties']");
        
        console.log(`SystemTour: DOM check attempt ${attempts + 1}:`, {
          sidebarExists: !!sidebarExists,
          propertiesExists: !!propertiesExists,
          sidebarRect: sidebarExists ? sidebarExists.getBoundingClientRect() : null,
          propertiesRect: propertiesExists ? propertiesExists.getBoundingClientRect() : null
        });
        
        if (sidebarExists && propertiesExists) {
          console.log('SystemTour: All required elements found, showing tour');
          setIsVisible(true);
        } else if (attempts < 20) {
          // If elements don't exist yet, wait a bit longer (increased max attempts)
          setTimeout(() => checkDOMReady(attempts + 1), 500);
        } else {
          console.warn('SystemTour: Required elements not found after maximum attempts, showing tour anyway');
          setIsVisible(true);
        }
      };
      
      // Start checking after initial delay
      setTimeout(() => checkDOMReady(), 1500);
    }
  }, [currentUser, userRole]);

  // Handle window resize to reposition tooltip
  useEffect(() => {
    const handleResize = () => {
      if (highlightElement && tourStarted) {
        // Force re-render of tooltip position
        setHighlightElement(null);
        setTimeout(() => {
          const step = tourSteps[currentStep];
          if (step && step.target) {
            const element = document.querySelector(step.target);
            if (element) {
              setHighlightElement(element);
            }
          }
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [highlightElement, tourStarted, currentStep, tourSteps]);

  // Mark tour as completed
  const completeTour = () => {
    if (currentUser) {
      const tourKey = `tour_completed_${currentUser.uid}`;
      localStorage.setItem(tourKey, 'true');
    }
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  // Skip tour
  const skipTour = () => {
    completeTour();
  };

  // Calculate tooltip position with smart positioning
  const calculateTooltipPosition = (element, step) => {
    if (!element || !step) return null;

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320; // Max width of tooltip
    const tooltipHeight = 450; // Estimated height of tooltip
    const margin = 20; // Margin from screen edges
    
    let position = {
      position: 'fixed',
      maxWidth: `${tooltipWidth}px`,
      opacity: 1,
      transition: 'all 0.3s ease'
    };

    // Calculate available space in each direction
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;

    // For sidebar elements (like Navigation Menu), force specific positioning
    if (step.target === "[data-tour='sidebar']") {
      const leftPosition = rect.right + margin;
      const topPosition = Math.max(margin, Math.min(
        rect.top + rect.height / 2 - 225,
        window.innerHeight - tooltipHeight - margin
      ));
      
      if (leftPosition + tooltipWidth > window.innerWidth - margin) {
        position.top = topPosition;
        position.left = window.innerWidth - tooltipWidth - margin;
      } else {
        position.top = topPosition;
        position.left = leftPosition;
      }
      
      return position;
    }

    // Special case: Saved Properties modal should be above the highlight
    if (step.target === "[data-tour='saved-properties']") {
      return {
        position: 'fixed',
        left: margin,
        bottom: 0,
        maxWidth: `${tooltipWidth}px`,
        opacity: 1,
        transition: 'all 0.3s ease'
      };
    }

    // Determine best position based on available space for other elements
    let bestPosition = step?.position || 'right';
    
    if (bestPosition === 'right' && spaceRight < tooltipWidth + margin) {
      if (spaceLeft > tooltipWidth + margin) bestPosition = 'left';
      else if (spaceBottom > tooltipHeight + margin) bestPosition = 'bottom';
      else if (spaceTop > tooltipHeight + margin) bestPosition = 'top';
      else bestPosition = 'center';
    } else if (bestPosition === 'left' && spaceLeft < tooltipWidth + margin) {
      if (spaceRight > tooltipWidth + margin) bestPosition = 'right';
      else if (spaceBottom > tooltipHeight + margin) bestPosition = 'bottom';
      else if (spaceTop > tooltipHeight + margin) bestPosition = 'top';
      else bestPosition = 'center';
    } else if (bestPosition === 'bottom' && spaceBottom < tooltipHeight + margin) {
      if (spaceTop > tooltipHeight + margin) bestPosition = 'top';
      else if (spaceRight > tooltipWidth + margin) bestPosition = 'right';
      else if (spaceLeft > tooltipWidth + margin) bestPosition = 'left';
      else bestPosition = 'center';
    } else if (bestPosition === 'top' && spaceTop < tooltipHeight + margin) {
      if (spaceBottom > tooltipHeight + margin) bestPosition = 'bottom';
      else if (spaceRight > tooltipWidth + margin) bestPosition = 'right';
      else if (spaceLeft > tooltipWidth + margin) bestPosition = 'left';
      else bestPosition = 'center';
    }
    
    switch (bestPosition) {
      case 'right':
        position.top = Math.max(margin, Math.min(
          rect.top + rect.height / 2 - 225,
          window.innerHeight - tooltipHeight - margin
        ));
        position.left = Math.min(rect.right + margin, window.innerWidth - tooltipWidth - margin);
        break;
        
      case 'left':
        position.top = Math.max(margin, Math.min(
          rect.top + rect.height / 2 - 225,
          window.innerHeight - tooltipHeight - margin
        ));
        position.left = Math.max(margin, rect.left - tooltipWidth - margin);
        break;
        
      case 'bottom':
        position.top = Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin);
        position.left = Math.max(margin, Math.min(
          rect.left + rect.width / 2 - tooltipWidth / 2,
          window.innerWidth - tooltipWidth - margin
        ));
        break;
        
      case 'top':
        position.top = Math.max(margin, rect.top - tooltipHeight - margin);
        position.left = Math.max(margin, Math.min(
          rect.left + rect.width / 2 - tooltipWidth / 2,
          window.innerWidth - tooltipWidth - margin
        ));
        break;
        
      default: // 'center' case
        position.top = '50%';
        position.left = '50%';
        position.transform = 'translate(-50%, -50%)';
        break;
    }

    // Final bounds check to ensure modal stays within viewport
    if (position.left && typeof position.left === 'number') {
      position.left = Math.max(margin, Math.min(position.left, window.innerWidth - tooltipWidth - margin));
    }
    if (position.top && typeof position.top === 'number') {
      position.top = Math.max(margin, Math.min(position.top, window.innerHeight - tooltipHeight - margin));
    }

    return position;
  };
  const startTour = () => {
    setTourStarted(true);
    // Go directly to Navigation Menu (step 1)
    goToStep(1);
  };

  const goToStep = (stepIndex) => {
    const stepData = tourSteps[stepIndex];
    let element = null;
    if (stepData && stepData.target) {
      element = document.querySelector(stepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
        if (!isInView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          // Wait for scroll to finish before calculating position
          setTimeout(() => {
            const newRect = element.getBoundingClientRect();
            const position = calculateTooltipPosition(element, stepData);
            setHighlightElement(element);
            setCurrentPosition(position);
            setCurrentStep(stepIndex);
          }, 300); // 300ms is usually enough for smooth scroll
          return;
        }
      }
    }
    // If already in view or no element, update immediately
    const position = element ? calculateTooltipPosition(element, stepData) : null;
    setHighlightElement(element);
    setCurrentPosition(position);
    setCurrentStep(stepIndex);
  };

  // Navigate steps
  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  // Highlight current step element
  const highlightCurrentStep = useCallback(() => {
    const step = tourSteps[currentStep];
    console.log(`SystemTour: highlightCurrentStep called for step ${currentStep}`);
    console.log('Current step data:', step);
    
    setTimeout(() => {
      if (step && step.target) {
        console.log(`SystemTour: Processing step ${currentStep}: "${step.title}" with target "${step.target}"`);
        
        // Try multiple times to find the element if it's not immediately available
        const tryFindElement = (attempts = 0) => {
          const element = document.querySelector(step.target);
          
          if (element) {
            console.log(`SystemTour: ✅ Found element for step ${currentStep}:`, {
              stepTitle: step.title,
              target: step.target,
              elementRect: element.getBoundingClientRect(),
              element: element,
              elementDataTour: element.getAttribute('data-tour')
            });
            
            setHighlightElement(element);
            
            // Calculate and store position
            const newPosition = calculateTooltipPosition(element, step);
            if (newPosition) {
              setCurrentPosition(newPosition);
            }
            
            // Scroll element into view with better positioning
            const rect = element.getBoundingClientRect();
            const isInView = rect.top >= 0 && 
                            rect.left >= 0 && 
                            rect.bottom <= window.innerHeight && 
                            rect.right <= window.innerWidth;
            
            if (!isInView) {
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'center'
              });
            }
          } else if (attempts < 10) {
            console.log(`SystemTour: ❌ Element not found for "${step.target}", attempt ${attempts + 1}/10`);
            // Retry finding the element up to 10 times
            setTimeout(() => tryFindElement(attempts + 1), 100);
          } else {
            // If element not found after retries, set to null to center the tooltip
            console.warn(`SystemTour: ❌ Element not found for selector: ${step.target} after ${attempts} attempts`);
            console.log('Available elements:', Array.from(document.querySelectorAll("[data-tour]")).map(el => el.getAttribute('data-tour')));
            setHighlightElement(null);
          }
        };
        
        tryFindElement();
      } else {
        console.log(`SystemTour: Step ${currentStep} has no target, centering tooltip`);
        setHighlightElement(null);
      }
    }, 100);
  }, [currentStep, tourSteps]);

  // Get tooltip position with smart positioning
  const getTooltipPosition = () => {
    // For welcome screen (step 0) only, return empty object as CSS handles centering
    if (!tourStarted || currentStep === 0) {
      return {};
    }

    // Use stored position if available
    if (currentPosition) {
      return currentPosition;
    }

    // Fallback: calculate position if no stored position
    if (highlightElement) {
      const step = tourSteps[currentStep];
      const calculatedPosition = calculateTooltipPosition(highlightElement, step);
      if (calculatedPosition) {
        setCurrentPosition(calculatedPosition);
        return calculatedPosition;
      }
    }

    // Final fallback: center
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Overlay - Transparent background */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: 0.2 }}
        />
        
        {/* Highlight spotlight */}
        {highlightElement && tourStarted ? (() => {
          const rect = highlightElement.getBoundingClientRect();
          const padding = 12;
          const top = Math.max(rect.top - padding, 0);
          const left = Math.max(rect.left - padding, 0);
          const width = Math.min(rect.width + padding * 2, window.innerWidth - left);
          const height = Math.min(rect.height + padding * 2, window.innerHeight - top);

          return (
            <>
              {/* Top overlay */}
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  width: '100vw',
                  height: top,
                  background: 'rgba(0,0,0,0.8)',
                  zIndex: 9998,
                  pointerEvents: 'none'
                }}
              />
              {/* Left overlay */}
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  top: top,
                  width: left,
                  height: height,
                  background: 'rgba(0,0,0,0.8)',
                  zIndex: 9998,
                  pointerEvents: 'none'
                }}
              />
              {/* Right overlay */}
              <div
                style={{
                  position: 'fixed',
                  left: left + width,
                  top: top,
                  width: Math.max(0, window.innerWidth - (left + width)),
                  height: height,
                  background: 'rgba(0,0,0,0.8)',
                  zIndex: 9998,
                  pointerEvents: 'none'
                }}
              />
              {/* Bottom overlay */}
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  top: top + height,
                  width: '100vw',
                  height: Math.max(0, window.innerHeight - (top + height)),
                  background: 'rgba(0,0,0,0.8)',
                  zIndex: 9998,
                  pointerEvents: 'none'
                }}
              />
              {/* Highlight border */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ scale: { duration: 0.3 } }}
                style={{
                  position: 'fixed',
                  top,
                  left,
                  width,
                  height,
                  border: '3px solid #3B82F6',
                  borderRadius: '12px',
                  zIndex: 9999,
                  pointerEvents: 'none'
                }}
              />
            </>
          );
        })() : (
          // Fallback: full overlay for welcome modal
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: 0.3, zIndex: 9998, pointerEvents: 'none' }}
          />
        )}

        {/* Tour tooltip */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bg-white rounded-xl shadow-2xl p-6 w-80 max-w-[90vw] max-h-[90vh] overflow-y-auto border border-gray-200 ${
            !tourStarted || currentStep === 0 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : 'fixed'
          }`}
          style={
            !tourStarted || currentStep === 0 
              ? {
                  zIndex: 10001,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }
              : {
                  ...getTooltipPosition(),
                  zIndex: 10001,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                {tourSteps[currentStep]?.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                {tourSteps[currentStep]?.title}
              </h3>
            </div>
            <button
              onClick={skipTour}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <RiCloseLine className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {tourSteps[currentStep]?.content}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round((currentStep + 1) / tourSteps.length * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Actions */}
          {!tourStarted ? (
            <div className="flex gap-3">
              <button
                onClick={skipTour}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={startTour}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Start Tour
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                onClick={previousStep}
                disabled={currentStep <= 1}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RiArrowLeftLine className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={skipTour}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      Finish
                      <RiCheckLine className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <RiArrowRightLine className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <RiQuestionLine className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              You can restart this tour anytime from your account settings.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SystemTour;
