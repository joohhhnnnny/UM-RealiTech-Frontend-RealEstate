// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

function DashboardLayout({ children, userRole }) {
  return (
    <div className="min-h-screen bg-base-200">
      <DashboardNavbar userRole={userRole} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}

export default DashboardLayout;