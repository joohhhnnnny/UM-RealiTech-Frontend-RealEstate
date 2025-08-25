import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar.jsx';
import SystemTour from '../components/SystemTour.jsx';

function DashboardLayout({ children, userRole }) {
  // Responsive sidebar state management
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and update state accordingly
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // md breakpoint
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setIsOpen(false);
      } else if (width >= 1024) { // lg breakpoint
        setIsOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = (newState) => {
    setIsOpen(newState);
  };

  return (
    <div className="min-h-screen bg-base-200 relative text-base-content overflow-hidden">
      {/* Sidebar - Always render, it handles its own mobile/desktop logic */}
      <Sidebar 
        userRole={userRole} 
        isOpen={isOpen} 
        setIsOpen={handleSidebarToggle}
      />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`
          min-h-screen transition-all duration-300 ease-in-out
          ${isMobile 
            ? 'ml-0 pt-16' // Full width on mobile with top padding for mobile header
            : isOpen 
              ? 'ml-64 lg:ml-64' // Sidebar width on tablet/desktop when open
              : 'ml-16 lg:ml-20'  // Collapsed sidebar width
          }
        `}
      >
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </motion.main>
      
      {/* System Tour for first-time users */}
      <SystemTour 
        userRole={userRole}
        onComplete={() => {
          console.log('Tour completed for', userRole);
        }}
      />
    </div>
  );
}

export default DashboardLayout;