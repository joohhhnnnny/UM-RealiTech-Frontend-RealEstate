import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar.jsx';
import SystemTour from '../components/SystemTour.jsx';

function DashboardLayout({ children, userRole }) {
  // Single source of truth for sidebar state
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-base-200 relative text-base-content">
      <Sidebar 
        userRole={userRole} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
      />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {children}
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