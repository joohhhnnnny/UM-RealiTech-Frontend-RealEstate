// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiUserLine, RiLogoutBoxLine, RiNotification3Line,
  RiMessage2Line, RiDashboardLine, RiVerifiedBadgeFill,
  RiMenuFoldLine, RiMenuUnfoldLine
} from 'react-icons/ri';
import { BuildingOffice2Icon, UserGroupIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function DashboardNavbar({ userRole }) {
  const [isOpen, setIsOpen] = useState(true);

  // Add user data based on role
  const userData = {
    buyer: {
      name: "Michael Anderson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4",
      email: "michael@realitech.com"
    },
    agent: {
      name: "Sarah Garcia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4",
      email: "sarah@realitech.com"
    },
    developer: {
      name: "Alex Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c8f7d4",
      email: "alex@realitech.com"
    }
  };

  // Get current user data based on role
  const currentUser = userData[userRole];

  const solutions = [
    {
      title: "DevTrackr",
      path: "/dashboard/devtrackr",
      icon: BuildingOffice2Icon,
      color: "text-blue-500 hover:text-blue-600",
      tooltip: "Transparency Platform",
      allowedRoles: ["buyer", "agent", "developer"]
    },
    {
      title: "RealtyConnect",
      path: "/dashboard/realtyconnect",
      icon: UserGroupIcon,
      color: "text-purple-500 hover:text-purple-600",
      tooltip: "Agent System",
      allowedRoles: ["agent", "developer"] // Only agents and developers see this
    },
    {
      title: "BuySmart PH",
      path: "/dashboard/buysmartph",
      icon: SparklesIcon,
      color: "text-teal-500 hover:text-teal-600",
      tooltip: "AI Property Guide",
      allowedRoles: ["buyer", "agent", "developer"]
    },
    {
      title: "PropGuard",
      path: "/dashboard/propguard",
      icon: ShieldCheckIcon,
      color: "text-rose-500 hover:text-rose-600",
      tooltip: "Fraud Detection",
      allowedRoles: ["buyer", "agent", "developer"]
    }
  ];

  // Filter solutions based on user role
  const filteredSolutions = solutions.filter(solution => 
    solution.allowedRoles.includes(userRole)
  );

  return (
    <motion.div 
      className={`fixed left-0 top-0 h-screen bg-base-100 border-r border-base-200 shadow-lg z-50
        ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300`}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
    >
      <div className="flex flex-col h-full">
        {/* TOP - Logo & Toggle */}
        <div className="p-4 border-b border-base-200">
          <div className="flex items-center justify-between">
            {isOpen ? (
              <Link to="/" className="flex-1">
                <motion.img 
                  src="/src/assets/logo/2-Photoroom (1).png" 
                  alt="RealiTech Logo" 
                  className="h-12 w-auto"
                  whileHover={{ scale: 1.05 }}
                />
              </Link>
            ) : (
              <Link to="/" className="flex-1">
                <motion.img 
                  src="/src/assets/logo/favicon.png" 
                  alt="RealiTech Icon" 
                  className="h-10 w-10"
                  whileHover={{ scale: 1.1 }}
                />
              </Link>
            )}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {isOpen ? (
                <RiMenuFoldLine className="w-5 h-5" />
              ) : (
                <RiMenuUnfoldLine className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* CENTER - Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {filteredSolutions.map((solution) => (
              <Link
                key={solution.title}
                to={solution.path}
                state={{ userRole }} // Pass userRole through navigation
                className="group flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                data-tip={!isOpen ? solution.tooltip : ''}
                data-tip-position="right"
              >
                <solution.icon className={`w-6 h-6 ${solution.color}`} />
                {isOpen && (
                  <span className="text-sm font-medium text-base-content/70 group-hover:text-base-content">
                    {solution.title}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM - User Actions */}
        <div className="p-4 border-t border-base-200 space-y-2">
          {/* Notifications */}
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
            <div className="indicator">
              <RiNotification3Line className="w-6 h-6" />
              <span className="badge badge-xs badge-primary indicator-item">2</span>
            </div>
            {isOpen && <span className="text-sm font-medium">Notifications</span>}
          </button>

          {/* Messages */}
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
            <div className="indicator">
              <RiMessage2Line className="w-6 h-6" />
              <span className="badge badge-xs badge-primary indicator-item">3</span>
            </div>
            {isOpen && <span className="text-sm font-medium">Messages</span>}
          </button>

          {/* Profile */}
          <div className="dropdown dropdown-top w-full">
            <label tabIndex={0} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
              <div className="avatar">
                <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={currentUser.avatar} alt={currentUser.name} />
                </div>
              </div>
              {isOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary badge-sm capitalize">{userRole}</span>
                    <span className="text-xs text-base-content/70">• Online</span>
                  </div>
                </div>
              )}
            </label>
            <ul tabIndex={0} className="dropdown-content menu menu-sm w-64 p-2 shadow-xl bg-base-100 rounded-box border border-base-200">
              <div className="px-4 py-3 border-b border-base-200">
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-sm text-base-content/70">{currentUser.email}</p>
              </div>
              <li>
                <Link to="/dashboard/settings" className="flex items-center gap-2 py-3">
                  <RiUserLine className="w-4 h-4" />
                  Profile Settings
                </Link>
              </li>
              <div className="divider my-0"></div>
              <li>
                <Link to="/" className="flex items-center gap-2 py-3 text-error">
                  <RiLogoutBoxLine className="w-4 h-4" />
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardNavbar;