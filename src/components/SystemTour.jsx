import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
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
import MobileSystemTour from './MobileSystemTour';

const SystemTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [highlightElement, setHighlightElement] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser } = useAuth();
  const overlayRef = useRef(null);

  // Tour steps configuration for buyers
  // Tour steps for buyers only
  const tourSteps = useMemo(() => [
    {
      title: "Welcome to RealEstate Platform! 🏠",
      content: "Let's take a quick guided tour to help you navigate our platform effectively. We'll show you the key features and tools available to make your real estate journey smooth and successful. This will only take a few minutes!",
      target: null,
      icon: <RiHome2Line className="w-6 h-6" />,
      position: "center"
    },
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
  ], []);

  // Check if user has completed tour
  useEffect(() => {
    // Only proceed if we have a current user and tour is not already visible
    if (!currentUser?.uid || isVisible) return;

    const tourKey = `tour_completed_${currentUser.uid}`;
    const hasCompletedTour = localStorage.getItem(tourKey);

    if (!hasCompletedTour) {
      // Show tour after a reasonable delay to let the page load
      console.log('SystemTour: Starting tour for buyer');
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [currentUser?.uid, isVisible]); // Use currentUser?.uid instead of currentUser to ensure stable dependency

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

  // Add this helper function to properly open mobile sidebar
  const openMobileSidebar = useCallback(() => {
    if (window.innerWidth >= 768) return false; // Only for mobile
    
    console.log('SystemTour: Attempting to open mobile sidebar...');
    
    // Check if mobile sidebar is already open by looking for the overlay
    const mobileOverlay = document.querySelector('.fixed.inset-0.bg-black\\/50') ||
                         document.querySelector('[class*="bg-black/50"]') ||
                         document.querySelector('.fixed.bg-black');
    
    if (mobileOverlay) {
      console.log('SystemTour: Mobile sidebar already open');
      return true;
    }
    
    // Look for mobile menu button in the header
    const mobileMenuButtons = [
      // Look for menu/hamburger button in the header
      '.fixed.top-0 button:last-child', // The menu button in mobile header
      '.fixed.top-0 .btn-circle:last-child',
      'header button:last-child',
      'header .btn-circle:last-child',
      
      // Look for buttons with menu icons
      'button svg[class*="RiMenuLine"]',
      'button svg[class*="menu"]',
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]',
      
      // Generic mobile menu patterns
      '.mobile-menu-toggle',
      '.hamburger',
      '.menu-toggle',
      '[data-mobile-menu-toggle]',
      
      // DaisyUI patterns
      '.drawer-toggle',
      'input[type="checkbox"].drawer-toggle',
      
      // Fallback patterns
      '.navbar button',
      'header button'
    ];
    
    let mobileMenuElement = null;
    
    // Try each selector until we find a visible, clickable element
    for (const selector of mobileMenuButtons) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Skip if element is hidden
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' ||
            computedStyle.opacity === '0') {
          continue;
        }
        
        // Skip if element is not clickable (has zero dimensions)
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          continue;
        }
        
        // Skip if element is not in the viewport
        if (rect.top < 0 || rect.left < 0 || 
            rect.bottom > window.innerHeight || 
            rect.right > window.innerWidth) {
          continue;
        }
        
        mobileMenuElement = element;
        console.log(`SystemTour: Found mobile menu element with selector: ${selector}`, element);
        break;
      }
      if (mobileMenuElement) break;
    }
    
    if (mobileMenuElement) {
      try {
        // Handle different types of mobile menu elements
        if (mobileMenuElement.type === 'checkbox') {
          mobileMenuElement.checked = true;
          mobileMenuElement.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // For buttons, simulate a proper click event
          mobileMenuElement.focus();
          mobileMenuElement.click();
          
          // Also dispatch a synthetic click event for extra reliability
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          mobileMenuElement.dispatchEvent(clickEvent);
        }
        
        console.log('SystemTour: Mobile sidebar opened successfully');
        return true;
      } catch (error) {
        console.error('SystemTour: Error clicking mobile menu button:', error);
      }
    }
    
    console.warn('SystemTour: Could not find or click mobile menu button');
    return false;
  }, []);

  // Helper function to close mobile sidebar
  const closeMobileSidebar = useCallback(() => {
    if (window.innerWidth >= 768) return false; // Only for mobile
    
    console.log('SystemTour: Attempting to close mobile sidebar...');
    
    // Check if mobile sidebar is open
    const mobileOverlay = document.querySelector('.fixed.inset-0.bg-black\\/50') ||
                         document.querySelector('[class*="bg-black/50"]') ||
                         document.querySelector('.fixed.bg-black');
    
    if (!mobileOverlay) {
      console.log('SystemTour: Mobile sidebar already closed');
      return true;
    }
    
    // Try to close by clicking the overlay or close button
    const closeElements = [
      // Close button in the sidebar
      '.fixed.inset-0.bg-base-100 button:first-child', // Close button in mobile header
      '.fixed.bg-base-100 button[class*="btn-circle"]',
      
      // Overlay click to close
      '.fixed.inset-0.bg-black\\/50',
      '[class*="bg-black/50"]',
      '.fixed.bg-black',
      
      // Close icon buttons
      'button svg[class*="RiCloseLine"]',
      'button svg[class*="close"]'
    ];
    
    for (const selector of closeElements) {
      const element = document.querySelector(selector);
      if (element) {
        try {
          element.click();
          console.log(`SystemTour: Closed mobile sidebar using: ${selector}`);
          return true;
        } catch (error) {
          console.warn(`SystemTour: Failed to click ${selector}:`, error);
        }
      }
    }
    
    console.warn('SystemTour: Could not find close element for mobile sidebar');
    return false;
  }, []);

  // Calculate tooltip position with smart positioning - RESPONSIVE VERSION
  const calculateTooltipPosition = useCallback((element, step) => {
    if (!element || !step) return null;

    const rect = element.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Special handling for Saved Properties - ensure proper visibility
    if (step.target === "[data-tour='saved-properties']") {
      // Check if the element is properly visible
      const isElementVisible = rect.height > 0 && rect.width > 0 && 
                              rect.top < window.innerHeight && rect.bottom > 0;
      
      // If not properly visible, wait and try again
      if (!isElementVisible) {
        setTimeout(() => {
          const freshElement = document.querySelector(step.target);
          if (freshElement) {
            const freshPosition = calculateTooltipPosition(freshElement, step);
            setCurrentPosition(freshPosition);
            setHighlightElement(freshElement);
          }
        }, 200);
        return null;
      }
    }
    
    // Responsive tooltip dimensions
    const tooltipWidth = isMobile ? Math.min(320, window.innerWidth - 40) : isTablet ? 350 : 400;
    const tooltipHeight = isMobile ? Math.min(400, window.innerHeight - 100) : isTablet ? 420 : 450;
    const margin = isMobile ? 10 : isTablet ? 15 : 20;
    
    let position = {
      position: 'fixed',
      maxWidth: `${tooltipWidth}px`,
      opacity: 1,
      transition: 'all 0.3s ease',
      zIndex: 10001
    };

    // Calculate available space in each direction
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;

    // Mobile-first approach: prioritize bottom or top positioning
    if (isMobile) {
      // Check if mobile sidebar overlay is open
      const mobileOverlay = document.querySelector('.fixed.inset-0.bg-black\\/50') ||
                           document.querySelector('[class*="bg-black/50"]') ||
                           document.querySelector('.fixed.bg-black');
      
      const mobileSidebar = document.querySelector('.fixed.inset-0.bg-base-100') ||
                           document.querySelector('.fixed.bg-base-100.shadow-2xl');
      
      const isMobileSidebarOpen = mobileOverlay && mobileSidebar;
      
      // Special case for Saved Properties on mobile - close sidebar and position at bottom
      if (step.target === "[data-tour='saved-properties']") {
        // Close mobile sidebar for saved properties step
        if (isMobileSidebarOpen) {
          setTimeout(() => closeMobileSidebar(), 100);
        }
        
        position.bottom = margin;
        position.left = margin;
        position.right = margin;
        position.maxWidth = 'none';
        position.top = 'auto';
        position.zIndex = 10001; // Normal z-index since sidebar will be closed
        return position;
      }
      
      // For sidebar elements on mobile when sidebar is open
      const sidebarTargets = ['[data-tour="sidebar"]', '[data-tour="buysmartph"]', '[data-tour="realtyconnect"]', '[data-tour="propguard"]'];
      if (sidebarTargets.includes(step.target)) {
        if (isMobileSidebarOpen) {
          // Position tooltip strategically to avoid blocking
          const viewportHeight = window.innerHeight;
          // For PropGuard and other sidebar elements that might be lower on screen
          if (step.target === "[data-tour='propguard']" || rect.top > viewportHeight * 0.6) {
            // Position at top of screen for lower elements
            position.top = margin;
            position.left = margin;
            position.right = margin;
            position.maxWidth = 'none';
            position.bottom = 'auto';
            position.zIndex = 10002;
          } else {
            // Position in center-right area for upper elements
            position.top = Math.max(margin, Math.min(rect.top, viewportHeight * 0.3));
            position.left = margin;
            position.right = margin;
            position.maxWidth = 'none';
            position.zIndex = 10002;
          }
          
          return position;
        } else {
          // Sidebar not open - center position as fallback
          position.top = '50%';
          position.left = '50%';
          position.transform = 'translate(-50%, -50%)';
          position.maxWidth = `${Math.min(300, window.innerWidth - 20)}px`;
          position.zIndex = 10001;
          return position;
        }
      }
      
      // On mobile, prefer bottom positioning with full width
      if (spaceBottom > tooltipHeight + margin) {
        position.top = Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin);
        position.left = margin;
        position.right = margin;
        position.maxWidth = 'none';
      } else if (spaceTop > tooltipHeight + margin) {
        position.top = Math.max(margin, rect.top - tooltipHeight - margin);
        position.left = margin;
        position.right = margin;
        position.maxWidth = 'none';
      } else {
        // Fallback to center with scroll
        position.top = margin;
        position.left = margin;
        position.right = margin;
        position.bottom = margin;
        position.maxWidth = 'none';
        position.overflowY = 'auto';
      }
      
      // Ensure tooltip is above mobile sidebar if it's open
      if (isMobileSidebarOpen) {
        position.zIndex = 10002;
      }
      
      return position;
    }

    // Tablet approach: balanced positioning
    if (isTablet) {
      // Special case for Saved Properties on tablet - lower left corner
      if (step.target === "[data-tour='saved-properties']") {
        position.bottom = margin;
        position.left = margin;
        position.top = 'auto';
        return position;
      }
      
      // For sidebar elements, try right positioning first
      if (step.target === "[data-tour='sidebar']") {
        if (spaceRight > tooltipWidth + margin) {
          position.top = Math.max(margin, Math.min(
            rect.top + rect.height / 2 - tooltipHeight / 2,
            window.innerHeight - tooltipHeight - margin
          ));
          position.left = rect.right + margin;
        } else {
          // Fallback to bottom
          position.top = Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin);
          position.left = Math.max(margin, Math.min(
            rect.left + rect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - margin
          ));
        }
        return position;
      }
    }

    // Desktop positioning with special case for Saved Properties
    if (step.target === "[data-tour='saved-properties']") {
      // Always place in lower left corner for desktop and tablet
      position.bottom = margin;
      position.left = margin;
      position.top = 'auto';
      return position;
    }

    // Desktop and fallback positioning logic
    let bestPosition = step?.position || 'right';
    
    // Smart position detection based on available space
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
          rect.top + rect.height / 2 - tooltipHeight / 2,
          window.innerHeight - tooltipHeight - margin
        ));
        position.left = Math.min(rect.right + margin, window.innerWidth - tooltipWidth - margin);
        break;
        
      case 'left':
        position.top = Math.max(margin, Math.min(
          rect.top + rect.height / 2 - tooltipHeight / 2,
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

    // Final responsive bounds check
    if (position.left && typeof position.left === 'number') {
      position.left = Math.max(margin, Math.min(position.left, window.innerWidth - tooltipWidth - margin));
    }
    if (position.top && typeof position.top === 'number') {
      position.top = Math.max(margin, Math.min(position.top, window.innerHeight - tooltipHeight - margin));
    }

    return position;
  }, [setCurrentPosition, setHighlightElement, closeMobileSidebar]);

  // Enhanced resize handler for responsive tour positioning
  useEffect(() => {
    const handleResize = () => {
      if (highlightElement && tourStarted) {
        // Debounced resize handling for better performance
        const handleDelayedResize = () => {
          const step = tourSteps[currentStep];
          if (step && step.target) {
            const element = document.querySelector(step.target);
            if (element) {
              // Recalculate position for new screen size
              const newPosition = calculateTooltipPosition(element, step);
              setCurrentPosition(newPosition);
              setHighlightElement(element); // Refresh highlight
            }
          }
        };

        // Clear any existing timeout
        if (window.resizeTimeout) {
          clearTimeout(window.resizeTimeout);
        }
        
        // Set new timeout for debounced handling
        window.resizeTimeout = setTimeout(handleDelayedResize, 100);
      }
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Add orientation change listener for mobile devices
    window.addEventListener('orientationchange', () => {
      // Wait for orientation change to complete
      setTimeout(handleResize, 500);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
    };
  }, [highlightElement, tourStarted, currentStep, tourSteps, calculateTooltipPosition]);

  const startTour = () => {
    setTourStarted(true);
    
    // Open mobile sidebar if on mobile before starting tour
    if (window.innerWidth < 768) {
      console.log('SystemTour: Opening mobile sidebar before starting tour');
      const sidebarOpened = openMobileSidebar();
      
      if (sidebarOpened) {
        // Wait for mobile sidebar animation to complete before going to first step
        setTimeout(() => {
          goToStep(1);
        }, 800); // Increased delay for mobile sidebar overlay
      } else {
        // Proceed even if sidebar couldn't be opened, but with a small delay
        setTimeout(() => {
          goToStep(1);
        }, 200);
      }
    } else {
      // Go directly to Navigation Menu (step 1) on desktop
      goToStep(1);
    }
  };

  const goToStep = (stepIndex) => {
    const stepData = tourSteps[stepIndex];
    
    // Auto-open sidebar on mobile for sidebar-related steps
    if (window.innerWidth < 768 && stepData && stepData.target) {
      const sidebarTargets = ['[data-tour="sidebar"]', '[data-tour="buysmartph"]', '[data-tour="realtyconnect"]', '[data-tour="propguard"]'];
      
      if (sidebarTargets.includes(stepData.target)) {
        console.log('SystemTour: Opening mobile sidebar for:', stepData.target);
        const sidebarOpened = openMobileSidebar();
        
        if (sidebarOpened) {
          // Wait longer for mobile sidebar animation to complete
          setTimeout(() => {
            proceedWithStep(stepIndex, stepData);
          }, 800); // Increased delay for mobile sidebar overlay animation
          return;
        } else {
          console.warn('SystemTour: Could not open sidebar, proceeding anyway');
          // Even if we can't open it, still proceed but add a longer delay
          setTimeout(() => {
            proceedWithStep(stepIndex, stepData);
          }, 300);
          return;
        }
      }
    }
    
    // Proceed normally for non-sidebar steps
    proceedWithStep(stepIndex, stepData);
  };

  // Extract the main step logic into a separate function
  const proceedWithStep = (stepIndex, stepData) => {
    let element = null;
    if (stepData && stepData.target) {
      element = document.querySelector(stepData.target);
      
      // On mobile, if this is a sidebar element, make sure the mobile sidebar is visible first
      if (window.innerWidth < 768) {
        const sidebarTargets = ['[data-tour="sidebar"]', '[data-tour="buysmartph"]', '[data-tour="realtyconnect"]', '[data-tour="propguard"]'];
        
        if (sidebarTargets.includes(stepData.target)) {
          // Check if mobile sidebar overlay is open
          const mobileOverlay = document.querySelector('.fixed.inset-0.bg-black\\/50') ||
                               document.querySelector('[class*="bg-black/50"]') ||
                               document.querySelector('.fixed.bg-black');
          
          if (!mobileOverlay) {
            console.log('SystemTour: Mobile sidebar not visible, attempting to open...');
            openMobileSidebar();
            
            // Wait and try again
            setTimeout(() => {
              proceedWithStep(stepIndex, stepData);
            }, 600);
            return;
          }
        }
      }
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
        
        // Special handling for Saved Properties step - ensure proper visibility
        if (stepData.target === "[data-tour='saved-properties']") {
          // On mobile, close the sidebar for saved properties visibility
          if (window.innerWidth < 768) {
            closeMobileSidebar();
            // Wait for sidebar to close before positioning
            setTimeout(() => {
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest' 
              });
              
              // Wait for scroll and sidebar animation to complete
              setTimeout(() => {
                const freshElement = document.querySelector(stepData.target);
                if (freshElement) {
                  const position = calculateTooltipPosition(freshElement, stepData);
                  setHighlightElement(freshElement);
                  setCurrentPosition(position);
                  setCurrentStep(stepIndex);
                }
              }, 300);
            }, 300);
          } else {
            // Desktop handling remains the same
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest' 
            });
            
            setTimeout(() => {
              const freshElement = document.querySelector(stepData.target);
              if (freshElement) {
                const position = calculateTooltipPosition(freshElement, stepData);
                setHighlightElement(freshElement);
                setCurrentPosition(position);
                setCurrentStep(stepIndex);
              }
            }, 500);
          }
          return;
        }
        
        // Standard handling for other elements
        if (!isInView) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: window.innerWidth < 768 ? 'center' : 'nearest', 
            inline: window.innerWidth < 768 ? 'center' : 'nearest' 
          });
          // Wait for scroll to finish before calculating position
          setTimeout(() => {
            const position = calculateTooltipPosition(element, stepData);
            setHighlightElement(element);
            setCurrentPosition(position);
            setCurrentStep(stepIndex);
          }, 300);
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

  // Auto-open sidebar on mobile when tour starts and we're on a step that requires sidebar visibility
  useEffect(() => {
    if (tourStarted && window.innerWidth < 768) {
      const currentStepData = tourSteps[currentStep];
      const sidebarTargets = ['[data-tour="sidebar"]', '[data-tour="buysmartph"]', '[data-tour="realtyconnect"]', '[data-tour="propguard"]'];
      
      if (currentStepData && sidebarTargets.includes(currentStepData.target)) {
        openMobileSidebar();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStarted, currentStep, tourSteps]);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If mobile, render MobileSystemTour instead
  if (isMobile) {
    return <MobileSystemTour onComplete={onComplete} />;
  }

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
          style={{ opacity: 0 }}
        />
        
        {/* Highlight spotlight - RESPONSIVE VERSION */}
        {highlightElement && tourStarted ? (() => {
          const rect = highlightElement.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          const padding = isMobile ? 8 : 12; // Smaller padding on mobile
          
          // Ensure highlight stays within viewport bounds
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
              {/* Highlight border - Responsive */}
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
                  border: isMobile ? '2px solid #3B82F6' : '3px solid #3B82F6',
                  borderRadius: isMobile ? '8px' : '12px',
                  zIndex: 9999,
                  pointerEvents: 'none'
                }}
              />
              {/* Pulsing highlight effect for better mobile visibility */}
              {isMobile && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'fixed',
                    top: top - 2,
                    left: left - 2,
                    width: width + 4,
                    height: height + 4,
                    border: '1px solid #60A5FA',
                    borderRadius: '10px',
                    zIndex: 9998,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </>
          );
        })() : (
          // Fallback: full overlay for welcome modal
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: 0.3, zIndex: 9998, pointerEvents: 'none' }}
          />
        )}

        {/* Tour tooltip - RESPONSIVE VERSION */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bg-white rounded-xl shadow-2xl border border-gray-200 ${
            // Responsive sizing and positioning
            !tourStarted || currentStep === 0 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md' 
              : 'fixed'
          } ${
            // Responsive max dimensions
            window.innerWidth < 768 
              ? 'max-w-[90vw] max-h-[80vh]' 
              : window.innerWidth < 1024 
                ? 'max-w-[85vw] max-h-[85vh] w-[400px]' 
                : 'w-80 max-w-[90vw] max-h-[90vh]'
          } overflow-y-auto p-4 sm:p-6`}
          style={
            !tourStarted || currentStep === 0 
              ? {
                  zIndex: 10001,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }
              : {
                  ...getTooltipPosition(),
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }
          }
        >
          {/* Header - Responsive */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                {React.cloneElement(tourSteps[currentStep]?.icon || <RiQuestionLine />, {
                  className: "w-4 h-4 sm:w-6 sm:h-6"
                })}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight break-words">
                {tourSteps[currentStep]?.title}
              </h3>
            </div>
            <button
              onClick={skipTour}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              aria-label="Close tour"
            >
              <RiCloseLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>

          {/* Content - Responsive */}
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
            {tourSteps[currentStep]?.content}
          </p>

          {/* Progress bar - Responsive */}
          <div className="mb-4">
            <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round((currentStep + 1) / tourSteps.length * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <motion.div
                className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Actions - Responsive */}
          {!tourStarted ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={skipTour}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Skip Tour
              </button>
              <button
                onClick={startTour}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                Start Tour
                <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0">
              <button
                onClick={previousStep}
                disabled={currentStep <= 1}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 order-2 sm:order-1"
              >
                <RiArrowLeftLine className="w-3 h-3 sm:w-4 sm:h-4" />
                Previous
              </button>
              
              <div className="flex gap-2 order-1 sm:order-2">
                <button
                  onClick={skipTour}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-1 sm:flex-none"
                >
                  Skip
                </button>
                <button
                  onClick={nextStep}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      Finish
                      <RiCheckLine className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <RiArrowRightLine className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Help text - Responsive */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <RiQuestionLine className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-blue-700">
              You can restart this tour anytime from your account settings.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SystemTour;
