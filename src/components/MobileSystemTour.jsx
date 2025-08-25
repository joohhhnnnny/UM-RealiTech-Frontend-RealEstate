import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiCloseLine, 
  RiArrowRightLine, 
  RiArrowLeftLine,
  RiCheckLine,
  RiSearchLine,
  RiHome2Line,
  RiHeartLine,
  RiQuestionLine,
  RiMenuLine
} from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';

const MobileSystemTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [highlightElement, setHighlightElement] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const { currentUser } = useAuth();
  const overlayRef = useRef(null);

  // Mobile-optimized tour steps - focusing on essential mobile interactions
  const tourSteps = useMemo(() => [
    {
      title: "Welcome to RealEstate Platform! 📱",
      content: "Welcome to the mobile experience! Let's take a quick tour to show you the key features optimized for your mobile device. This mobile tour focuses on the most important actions you can take on-the-go.",
      target: null,
      icon: <RiHome2Line className="w-6 h-6" />,
      position: "center"
    },
    {
      title: "Mobile Navigation Menu",
      content: "Tap this hamburger menu icon to access all platform features including BuySmartPH, RealtyConnect, and PropGuard. The menu is designed for easy thumb navigation.",
      target: ".fixed.top-0 button:last-child, header button:last-child, .navbar button, [data-mobile-menu-toggle]",
      icon: <RiMenuLine className="w-6 h-6" />,
      position: "bottom"
    },
    {
      title: "Browse Properties",
      content: "Discover properties that match your criteria. Use touch-friendly filters and swipe through property photos. Perfect for browsing on-the-go!",
      target: "[data-tour='properties']",
      icon: <RiSearchLine className="w-6 h-6" />,
      position: "top"
    },
    {
      title: "Your Saved Properties",
      content: "Access your favorite properties anytime by using the navigation menu. Look for the heart icon or 'Saved Properties' section. You can save properties by tapping the heart icon on any property listing.",
      target: "[data-tour='saved-properties'], .saved-properties, [href*='saved'], [href*='favorites'], .favorites, .heart-icon, [aria-label*='saved'], [aria-label*='favorite']",
      icon: <RiHeartLine className="w-6 h-6" />,
      position: "center"
    }
  ], []);

  // Check if user has completed mobile tour
  useEffect(() => {
    // Only proceed if we have a current user and tour is not already visible
    if (!currentUser?.uid || isVisible) return;

    const tourKey = `mobile_tour_completed_${currentUser.uid}`;
    const hasCompletedTour = localStorage.getItem(tourKey);

    if (!hasCompletedTour) {
      // Show mobile tour after a reasonable delay to let the page load
      console.log('MobileSystemTour: Starting mobile tour for buyer');
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [currentUser?.uid, isVisible]);

  // Mark tour as completed
  const completeTour = () => {
    if (currentUser) {
      const tourKey = `mobile_tour_completed_${currentUser.uid}`;
      localStorage.setItem(tourKey, 'true');
    }
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  // Skip tour
  const skipTour = () => {
    completeTour();
  };

  // Mobile-optimized tooltip positioning
  const calculateTooltipPosition = useCallback((element, step) => {
    if (!element || !step) return null;

    const rect = element.getBoundingClientRect();
    const margin = 16;
    const maxTooltipHeight = Math.min(350, window.innerHeight - 120);
    
    let position = {
      position: 'fixed',
      maxWidth: `${window.innerWidth - 32}px`,
      opacity: 1,
      transition: 'all 0.3s ease',
      zIndex: 10001,
      left: margin,
      right: margin
    };

    // Calculate available space
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;

    // Special handling for Browse Properties to prevent blocking
    if (step.target && step.target.includes("data-tour='properties'")) {
      // Calculate a smaller modal height to ensure it fits above the button
      const availableSpaceAbove = rect.top - margin * 3; // Extra margin for safety
      const adjustedTooltipHeight = Math.min(maxTooltipHeight, availableSpaceAbove - 20); // 20px extra buffer
      
      console.log('MobileSystemTour: Browse Properties positioning calculation', {
        elementRect: rect,
        availableSpaceAbove,
        adjustedTooltipHeight,
        maxTooltipHeight
      });
      
      if (availableSpaceAbove > 200) { // Minimum height needed for readable content
        // Position above with adjusted height
        position.top = rect.top - adjustedTooltipHeight - margin * 2;
        position.maxHeight = `${adjustedTooltipHeight}px`;
        position.minHeight = '180px'; // Ensure minimum readable height
      } else {
        // If not enough space above, position at very top of screen
        const topSpaceHeight = Math.min(maxTooltipHeight, rect.top - margin * 4);
        position.top = margin;
        position.maxHeight = `${topSpaceHeight}px`;
        position.minHeight = '160px';
      }
      
      console.log('MobileSystemTour: Final Browse Properties position', position);
      return position;
    }

    // Mobile-first positioning strategy for other elements
    if (step.position === 'bottom' || (step.position !== 'top' && spaceBottom > maxTooltipHeight + margin)) {
      // Position below the element with extra margin to avoid blocking
      const minDistanceFromElement = 24; // Extra space to ensure button visibility
      position.top = Math.min(
        rect.bottom + margin + minDistanceFromElement, 
        window.innerHeight - maxTooltipHeight - margin
      );
      position.maxHeight = `${maxTooltipHeight}px`;
    } else if (step.position === 'top' || spaceTop > maxTooltipHeight + margin) {
      // Position above the element with extra margin
      const minDistanceFromElement = 24;
      const availableHeight = rect.top - margin - minDistanceFromElement;
      const adjustedHeight = Math.min(maxTooltipHeight, availableHeight);
      
      position.top = Math.max(
        margin, 
        rect.top - adjustedHeight - margin - minDistanceFromElement
      );
      position.maxHeight = `${adjustedHeight}px`;
    } else {
      // Fallback: center the tooltip but ensure it doesn't overlap with highlighted element
      const elementCenterY = rect.top + rect.height / 2;
      const screenCenterY = window.innerHeight / 2;
      
      // If element is in upper half, position modal in lower half and vice versa
      if (elementCenterY < screenCenterY) {
        // Element in upper half, position modal in lower half
        const availableHeight = window.innerHeight - (rect.bottom + margin * 3);
        position.top = Math.max(
          rect.bottom + margin * 2,
          screenCenterY + margin
        );
        position.maxHeight = `${Math.min(maxTooltipHeight, availableHeight)}px`;
        position.transform = 'none';
      } else {
        // Element in lower half, position modal in upper half
        const availableHeight = rect.top - margin * 3;
        position.top = Math.min(
          rect.top - Math.min(maxTooltipHeight, availableHeight) - margin * 2,
          screenCenterY - maxTooltipHeight - margin
        );
        position.maxHeight = `${Math.min(maxTooltipHeight, availableHeight)}px`;
        position.transform = 'none';
      }
      
      position.left = margin;
      position.right = margin;
    }

    return position;
  }, []);

  // Enhanced element finder for mobile with improved saved properties detection
  const findMobileElement = useCallback((target) => {
    if (!target) return null;

    // Split multiple selectors by comma
    const selectors = target.split(',').map(s => s.trim());
    
    console.log(`MobileSystemTour: Searching for element with selectors:`, selectors);
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`MobileSystemTour: Found ${elements.length} elements for selector: ${selector}`);
        
        for (const element of elements) {
          // Check if element is visible and has reasonable dimensions
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          
          console.log(`MobileSystemTour: Checking element:`, {
            selector,
            element,
            rect,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity
          });
          
          if (computedStyle.display === 'none' || 
              computedStyle.visibility === 'hidden' ||
              computedStyle.opacity === '0' ||
              rect.width === 0 || 
              rect.height === 0) {
            console.log(`MobileSystemTour: Element not visible, skipping...`);
            continue;
          }
          
          // For saved properties, be more lenient with viewport bounds since we're scrolling
          const isForSavedProperties = target.includes('saved-properties') || target.includes('favorites');
          const viewportBuffer = isForSavedProperties ? 200 : 100; // Larger buffer for saved properties
          
          // Check if element is within reasonable viewport bounds
          if (rect.top >= -viewportBuffer && rect.left >= -viewportBuffer && 
              rect.bottom <= window.innerHeight + viewportBuffer && 
              rect.right <= window.innerWidth + viewportBuffer) {
            console.log(`MobileSystemTour: Found valid element with selector: ${selector}`, element);
            return element;
          } else {
            console.log(`MobileSystemTour: Element outside viewport bounds:`, {
              rect,
              viewport: { width: window.innerWidth, height: window.innerHeight },
              buffer: viewportBuffer
            });
          }
        }
      } catch (error) {
        console.warn(`MobileSystemTour: Error with selector "${selector}":`, error);
        continue;
      }
    }
    
    console.warn(`MobileSystemTour: Could not find visible element for: ${target}`);
    
    // Enhanced fallback for saved properties with text-based search
    if (target.includes('saved-properties') || target.includes('favorites')) {
      console.log('MobileSystemTour: Attempting enhanced fallback search for saved properties...');
      
      // Try to find elements by text content
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';
        const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
        const title = element.getAttribute('title')?.toLowerCase() || '';
        
        if ((text.includes('saved properties') || 
             text.includes('my saved') || 
             text.includes('favorites') ||
             text.includes('favourite') ||
             ariaLabel.includes('saved') ||
             ariaLabel.includes('favorite') ||
             title.includes('saved') ||
             title.includes('favorite')) &&
            element.offsetWidth > 0 && 
            element.offsetHeight > 0) {
          
          const rect = element.getBoundingClientRect();
          if (rect.width > 10 && rect.height > 10) { // Minimum size check
            console.log('MobileSystemTour: Found element by text content:', element);
            return element;
          }
        }
      }
      
      // Final fallback - look for any heart-related elements
      const heartSelectors = [
        'button[class*="heart"]',
        '.heart',
        '[class*="ri-heart"]',
        '[class*="fa-heart"]',
        'svg[class*="heart"]',
        'path[d*="heart"]' // SVG heart paths
      ];
      
      for (const heartSelector of heartSelectors) {
        try {
          const heartElements = document.querySelectorAll(heartSelector);
          if (heartElements.length > 0) {
            const element = heartElements[0];
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              console.log(`MobileSystemTour: Found fallback heart element: ${heartSelector}`, element);
              return element;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return null;
  }, []);

  // Start the mobile tour
  const startTour = () => {
    setTourStarted(true);
    // Go directly to first step (hamburger menu)
    setTimeout(() => {
      goToStep(1);
    }, 300);
  };

  // Update the goToStep function to handle scrolling for saved properties
  const goToStep = (stepIndex) => {
    const stepData = tourSteps[stepIndex];
    
    // Special handling for "Your Saved Properties" step - scroll down first
    if (stepData && stepData.target && stepData.target.includes('saved-properties')) {
      console.log('MobileSystemTour: Preparing for saved properties step - scrolling down');
      
      // Scroll down to ensure saved properties section is visible
      window.scrollTo({
        top: document.body.scrollHeight * 0.7, // Scroll to 70% of page height
        behavior: 'smooth'
      });
      
      // Wait for scroll to complete before searching for element
      setTimeout(() => {
        proceedWithSavedPropertiesStep(stepIndex, stepData);
      }, 1000); // Longer delay for scroll animation
      return;
    }
    
    // Regular handling for other steps
    let element = null;
    if (stepData && stepData.target) {
      element = findMobileElement(stepData.target);
      
      if (element) {
        // Scroll element into view if needed
        const rect = element.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.left >= 0 && 
                        rect.bottom <= window.innerHeight && 
                        rect.right <= window.innerWidth;
        
        if (!isInView) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center', 
            inline: 'center' 
          });
          
          // Wait for scroll animation
          setTimeout(() => {
            proceedWithStep(stepIndex, stepData, element);
          }, 500);
          return;
        }
      }
    }
    
    proceedWithStep(stepIndex, stepData, element);
  };

  // Add new function to handle saved properties step with enhanced searching
  const proceedWithSavedPropertiesStep = useCallback((stepIndex, stepData) => {
    console.log('MobileSystemTour: Starting saved properties element search after scroll');
    
    // First try the regular element finder
    let element = findMobileElement(stepData.target);
    
    if (!element) {
      console.log('MobileSystemTour: Regular search failed, trying enhanced search for saved properties');
      
      // Enhanced search specifically for saved properties
      const enhancedSelectors = [
        '[data-tour="saved-properties"]',
        '.saved-properties',
        '[href*="saved"]',
        '[href*="favorites"]',
        '.favorites',
        '.heart-icon',
        '[aria-label*="saved"]',
        '[aria-label*="favorite"]',
        '.sidebar [href*="saved"]',
        '.menu [href*="saved"]',
        '.navigation [href*="saved"]',
        '.nav [href*="saved"]',
        'nav a[href*="saved"]',
        'aside [href*="saved"]',
        '.heart',
        '.fa-heart',
        '.ri-heart',
        '[class*="heart"]',
        'button[title*="save"]',
        'button[title*="favorite"]'
      ];
      
      // Try multiple scroll positions to find the element
      const scrollPositions = [
        document.body.scrollHeight * 0.5,  // 50% down
        document.body.scrollHeight * 0.8,  // 80% down
        document.body.scrollHeight * 0.9,  // 90% down
        document.body.scrollHeight         // Bottom of page
      ];
      
      let currentScrollIndex = 0;
      
      const tryNextScrollPosition = () => {
        if (currentScrollIndex >= scrollPositions.length) {
          // All scroll positions tried, proceed without element
          console.log('MobileSystemTour: Could not find saved properties element after trying all positions');
          proceedWithStep(stepIndex, stepData, null);
          return;
        }
        
        const scrollPosition = scrollPositions[currentScrollIndex];
        console.log(`MobileSystemTour: Trying scroll position ${currentScrollIndex + 1}/${scrollPositions.length}: ${scrollPosition}px`);
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        
        // Wait for scroll and then search
        setTimeout(() => {
          for (const selector of enhancedSelectors) {
            try {
              const elements = document.querySelectorAll(selector);
              for (const el of elements) {
                const rect = el.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(el);
                
                if (computedStyle.display !== 'none' && 
                    computedStyle.visibility !== 'hidden' &&
                    computedStyle.opacity !== '0' &&
                    rect.width > 0 && rect.height > 0) {
                  
                  console.log(`MobileSystemTour: Found saved properties element with selector: ${selector}`, el);
                  
                  // Scroll the found element into view
                  el.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center', 
                    inline: 'center' 
                  });
                  
                  // Wait for final positioning and proceed
                  setTimeout(() => {
                    proceedWithStep(stepIndex, stepData, el);
                  }, 300);
                  return;
                }
              }
            } catch (error) {
              // Skip invalid selectors
              continue;
            }
          }
          
          // Element not found at this scroll position, try next
          currentScrollIndex++;
          tryNextScrollPosition();
        }, 800); // Wait for scroll animation
      };
      
      // Start trying scroll positions
      tryNextScrollPosition();
    } else {
      // Element found on first try
      console.log('MobileSystemTour: Found saved properties element on first try');
      proceedWithStep(stepIndex, stepData, element);
    }
  }, [findMobileElement]);

  // Execute step with element positioning
  const proceedWithStep = (stepIndex, stepData, element) => {
    console.log(`MobileSystemTour: Proceeding with step ${stepIndex}`, { stepData, element });
    
    if (element) {
      const position = calculateTooltipPosition(element, stepData);
      setHighlightElement(element);
      setCurrentPosition(position);
    } else {
      // No element found - show modal in center without highlighting
      console.log(`MobileSystemTour: No element found for step ${stepIndex}, showing centered modal`);
      setHighlightElement(null);
      setCurrentPosition(null);
    }
    
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

  // Get tooltip position
  const getTooltipPosition = () => {
    // For welcome screen (step 0), return empty object as CSS handles centering
    if (!tourStarted || currentStep === 0) {
      return {};
    }

    // Use stored position if available
    if (currentPosition) {
      return currentPosition;
    }

    // If no element was found (like for saved properties), center the modal
    if (!highlightElement) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: `${window.innerWidth - 32}px`,
        zIndex: 10001
      };
    }

    // Final fallback: center
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: `${window.innerWidth - 32}px`
    };
  };

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      if (highlightElement && tourStarted) {
        setTimeout(() => {
          const step = tourSteps[currentStep];
          if (step && step.target) {
            const element = findMobileElement(step.target);
            if (element) {
              const newPosition = calculateTooltipPosition(element, step);
              setCurrentPosition(newPosition);
              setHighlightElement(element);
            }
          }
        }, 500); // Wait for orientation change to complete
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [highlightElement, tourStarted, currentStep, tourSteps, calculateTooltipPosition, findMobileElement]);

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
        {/* Mobile-optimized overlay */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: 0 }}
        />
        
        {/* Mobile highlight spotlight */}
        {highlightElement && tourStarted ? (() => {
          const rect = highlightElement.getBoundingClientRect();
          const padding = 12;
          
          const top = Math.max(rect.top - padding, 0);
          const left = Math.max(rect.left - padding, 0);
          const width = Math.min(rect.width + padding * 2, window.innerWidth - left);
          const height = Math.min(rect.height + padding * 2, window.innerHeight - top);

          return (
            <>
              {/* Overlay sections */}
              <div style={{
                position: 'fixed', left: 0, top: 0, width: '100vw', height: top,
                background: 'rgba(0,0,0,0.85)', zIndex: 9998, pointerEvents: 'none'
              }} />
              <div style={{
                position: 'fixed', left: 0, top: top, width: left, height: height,
                background: 'rgba(0,0,0,0.85)', zIndex: 9998, pointerEvents: 'none'
              }} />
              <div style={{
                position: 'fixed', left: left + width, top: top, 
                width: Math.max(0, window.innerWidth - (left + width)), height: height,
                background: 'rgba(0,0,0,0.85)', zIndex: 9998, pointerEvents: 'none'
              }} />
              <div style={{
                position: 'fixed', left: 0, top: top + height, width: '100vw',
                height: Math.max(0, window.innerHeight - (top + height)),
                background: 'rgba(0,0,0,0.85)', zIndex: 9998, pointerEvents: 'none'
              }} />
              
              {/* Mobile-optimized highlight border */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'fixed', top, left, width, height,
                  border: '3px solid #3B82F6',
                  borderRadius: '12px',
                  zIndex: 9999,
                  pointerEvents: 'none',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
              />
              
              {/* Pulsing effect for mobile */}
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'fixed',
                  top: top - 3,
                  left: left - 3,
                  width: width + 6,
                  height: height + 6,
                  border: '2px solid #60A5FA',
                  borderRadius: '15px',
                  zIndex: 9998,
                  pointerEvents: 'none'
                }}
              />
            </>
          );
        })() : tourStarted ? (
          // When no element is found but tour is active, show semi-transparent overlay
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: 0.5, zIndex: 9998, pointerEvents: 'none' }}
          />
        ) : (
          // Welcome screen overlay
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: 0.4, zIndex: 9998, pointerEvents: 'none' }}
          />
        )}

        {/* Mobile tour tooltip */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`bg-white rounded-2xl shadow-2xl border border-gray-100 ${
            !tourStarted || currentStep === 0 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm' 
              : 'fixed'
          } ${
            // Add flexible height classes for Browse Properties step
            tourStarted && currentStep === 2 && tourSteps[currentStep]?.target?.includes("data-tour='properties'")
              ? 'overflow-y-auto'
              : 'max-h-[85vh] overflow-y-auto'
          } p-5`}
          style={
            !tourStarted || currentStep === 0 
              ? {
                  zIndex: 10001,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                }
              : {
                  ...getTooltipPosition(),
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                  // Apply dynamic height from positioning calculation
                  ...(currentPosition?.maxHeight && {
                    maxHeight: currentPosition.maxHeight,
                    minHeight: currentPosition.minHeight || '160px'
                  })
                }
          }
        >
          {/* Mobile header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600 flex-shrink-0">
                {React.cloneElement(tourSteps[currentStep]?.icon || <RiQuestionLine />, {
                  className: "w-5 h-5"
                })}
              </div>
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {tourSteps[currentStep]?.title}
              </h3>
            </div>
            <button
              onClick={skipTour}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 ml-2"
              aria-label="Close tour"
            >
              <RiCloseLine className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Mobile content */}
          <p className={`text-gray-600 mb-4 leading-relaxed ${
            // Make text slightly smaller for Browse Properties to fit in smaller modal
            tourStarted && currentStep === 2 && tourSteps[currentStep]?.target?.includes("data-tour='properties'")
              ? 'text-sm'
              : 'text-base'
          } ${
            // Reduce bottom margin if modal is constrained
            currentPosition?.maxHeight && parseInt(currentPosition.maxHeight) < 300
              ? 'mb-3'
              : 'mb-5'
          }`}>
            {tourSteps[currentStep]?.content}
          </p>

          {/* Mobile progress bar */}
          <div className={`${
            currentPosition?.maxHeight && parseInt(currentPosition.maxHeight) < 300
              ? 'mb-3'
              : 'mb-5'
          }`}>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round((currentStep + 1) / tourSteps.length * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Mobile actions */}
          {!tourStarted ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={startTour}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-lg"
              >
                Start Mobile Tour
                <RiArrowRightLine className="w-5 h-5" />
              </button>
              <button
                onClick={skipTour}
                className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Skip Tour
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                {currentStep === tourSteps.length - 1 ? (
                  <button
                    onClick={completeTour}
                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    Complete Tour
                    <RiCheckLine className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    Next
                    <RiArrowRightLine className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={skipTour}
                  className="px-4 py-4 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Skip
                </button>
              </div>
              
              {currentStep > 1 && (
                <button
                  onClick={previousStep}
                  className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RiArrowLeftLine className="w-4 h-4" />
                  Previous
                </button>
              )}
            </div>
          )}

          {/* Mobile help text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
            <RiQuestionLine className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Optimized for mobile - restart anytime from settings.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileSystemTour;