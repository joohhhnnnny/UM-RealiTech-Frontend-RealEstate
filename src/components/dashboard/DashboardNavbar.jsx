import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RiUserLine, RiLogoutBoxLine, RiNotification3Line,
  RiMessage2Line, RiDashboardLine, RiVerifiedBadgeFill,
  RiMenuFoldLine, RiMenuUnfoldLine
} from 'react-icons/ri';
import { BuildingOffice2Icon, UserGroupIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import lightLogo from '/src/assets/logo/logo-for-light.png';
import darkLogo from '/src/assets/logo/logo-for-dark.png';
import lightIcon from '/src/assets/logo/icon-light.png';
import darkIcon from '/src/assets/logo/icon-dark.png';

function DashboardNavbar({ userRole, isOpen, setIsOpen }) {
  
  const [isDark, setIsDark] = useState(false);

  // Theme dark and light toggle function I put it below of the Logo/Icon
  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

 
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
      allowedRoles: ["agent", "developer"]
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

  
  const filteredSolutions = solutions.filter(solution => 
    solution.allowedRoles.includes(userRole)
  );

  return (
    <motion.div className={`fixed left-0 top-0 h-screen bg-base-100 border-r border-base-200 shadow-lg z-50
      ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
      <div className="flex flex-col h-full">

        {/* TOP - Logo & Toggle */}
        <div className="p-4 border-b border-base-200">
          <div className="flex flex-col space-y-4">
            {/* Logo */}
            <div className="flex justify-between items-center">
              {isOpen ? (
                <Link to="/" className="flex-1">
                  <motion.img 
                    src={isDark ? darkLogo : lightLogo}
                    alt="RealiTech Logo" 
                    className="w-[150px] h-[48px] object-contain"
                    whileHover={{ scale: 1.05 }}
                  />
                </Link>
              ) : (
                <Link to="/" className="flex-1">
                  <motion.img 
                    src={isDark ? darkIcon : lightIcon}
                    alt="RealiTech Icon" 
                    className="w-10 h-10 object-contain"
                    whileHover={{ scale: 1.1 }}
                  />
                </Link>
              )}


              {/* Menu Toggle Button */}
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
            

            {/* Theme Toggle Button */}
            <div className="flex justify-center">
              <button
                onClick={toggleTheme}
                className="btn btn-ghost btn-sm gap-2 w-full"
                data-tip={!isOpen ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
                data-tip-position="right"
              >
                {isDark ? (
                  <>
                    <SunIcon className="w-5 h-5 text-amber-500" />
                    {isOpen && <span>Light Mode</span>}
                  </>
                ) : (
                  <>
                    <MoonIcon className="w-5 h-5" />
                    {isOpen && <span>Dark Mode</span>}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>



        {/* CENTER - Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {filteredSolutions.map((solution) => (
              <Link
                key={solution.title}
                to={solution.path}
                state={{ userRole }}
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