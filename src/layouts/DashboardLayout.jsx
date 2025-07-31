import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardNavbar from '../components/DashboardNavbar.jsx';

function DashboardLayout({ children, userRole }) {
  // Single source of truth for sidebar state
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-base-200 relative">
      <DashboardNavbar 
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
    </div>
  );
}

export default DashboardLayout;