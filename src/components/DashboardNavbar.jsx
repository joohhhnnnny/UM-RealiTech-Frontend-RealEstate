import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  RiUserLine, RiLogoutBoxLine, RiNotification3Line,
  RiMessage2Line, RiDashboardLine, RiVerifiedBadgeFill,
  RiMenuFoldLine, RiMenuUnfoldLine, RiMoreLine,
  RiHistoryLine, RiSettings4Line
} from 'react-icons/ri';
import {
  BuildingOffice2Icon, UserGroupIcon,
  SparklesIcon, ShieldCheckIcon, MoonIcon, SunIcon
} from '@heroicons/react/24/outline';

import lightLogo from '/src/assets/logo/logo-for-light.png';
import darkLogo from '/src/assets/logo/logo-for-dark.png';
import PropTypes from 'prop-types';

const ProfileSection = React.memo(({ isOpen, currentUser, userRole }) => {
  if (!currentUser) return null;

  return (
    <div className="dropdown dropdown-top w-full">
      <label
        tabIndex={0}
        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer ${
          !isOpen ? 'tooltip tooltip-right font-semibold' : ''
        }`}
        data-tip={!isOpen ? `${currentUser.name} (${userRole})` : ''}
      >
        <div className="avatar">
          <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={currentUser.avatar} alt={currentUser.name} />
          </div>
        </div>
        {isOpen && (
          <div>
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
  );
});

const NavigationLinks = React.memo(({ filteredSolutions, isOpen, userRole }) => {
  const location = useLocation();

  return (
    <div className="px-4 space-y-2">
      {filteredSolutions.map(({ title, path, icon: Icon, tooltip, color }) => {
        const isActive = location.pathname === path;
        const classes = `group flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
            : 'hover:bg-base-200'
        } ${!isOpen ? 'tooltip tooltip-right font-semibold' : ''}`;

        return (
          <Link
            key={title}
            to={path}
            state={{ userRole }}
            className={classes}
            data-tip={!isOpen ? tooltip : ''}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : color}`} />
            {isOpen && <span className="text-sm font-medium">{title}</span>}
          </Link>
        );
      })}
    </div>
  );
});

const QuickActions = React.memo(({ isOpen }) => (
  <div className="dropdown dropdown-top w-full">
    <label
      tabIndex={0}
      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer ${
        !isOpen ? 'tooltip tooltip-right font-semibold' : ''
      }`}
      data-tip={!isOpen ? 'Quick Actions' : ''}
    >
      <RiMoreLine className="w-6 h-6" />
      {isOpen && <span className="text-sm font-medium">Quick Actions</span>}
    </label>
    <ul tabIndex={0} className={`dropdown-content menu menu-sm ${isOpen ? 'w-50 translate-x-3' : 'w-13 translate-x-10'} p-2 shadow-xl bg-base-100 rounded-box border border-base-200`}>
      <li>
        <Link to="/dashboard/notifications" className="flex items-center gap-2 py-3">
          <RiNotification3Line className="w-4 h-4" />
          {isOpen && <>
            <span>Notifications</span>
            <span className="badge badge-primary badge-sm ml-auto">2</span>
          </>}
        </Link>
      </li>
      <li>
        <Link to="/dashboard/messages" className="flex items-center gap-2 py-3">
          <RiMessage2Line className="w-4 h-4" />
          {isOpen && <>
            <span>Messages</span>
            <span className="badge badge-primary badge-sm ml-auto">3</span>
          </>}
        </Link>
      </li>
      <li>
        <Link to="/settings" className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg">
          <RiSettings4Line className="w-5 h-5" />
          {isOpen && <span>Settings</span>}
        </Link>
      </li>
      <li>
        <Link to="/dashboard/audit-log" className="flex items-center gap-2 py-3">
          <RiHistoryLine className="w-4 h-4" />
          {isOpen && <span>Activity Log</span>}
        </Link>
      </li>
    </ul>
  </div>
));

function DashboardNavbar({ userRole = 'buyer', isOpen, setIsOpen }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useLayoutEffect(() => {
    const stored = localStorage.getItem('sidebarState');
    if (stored !== null) setIsOpen(JSON.parse(stored));
  }, [setIsOpen]);

  const handleSidebarToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem('sidebarState', JSON.stringify(next));
  };

  const userData = {
    buyer: {
      name: 'Michael Anderson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4',
      email: 'michael@realitech.com'
    },
    agent: {
      name: 'Sarah Garcia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4',
      email: 'sarah@realitech.com'
    },
    developer: {
      name: 'Alex Martinez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c8f7d4',
      email: 'alex@realitech.com'
    }
  };

  const currentUser = userData[userRole] || userData.buyer;

  const solutions = [
    {
      title: 'BuySmart PH',
      path: '/dashboard/buysmartph',
      icon: SparklesIcon,
      color: 'text-teal-500 hover:text-teal-600',
      tooltip: 'BuySmart PH',
      allowedRoles: ['buyer', 'agent', 'developer']
    },
    {
      title: 'DevTrackr',
      path: '/dashboard/devtrackr',
      icon: BuildingOffice2Icon,
      color: 'text-blue-500 hover:text-blue-600',
      tooltip: 'DevTrackr',
      allowedRoles: ['buyer', 'agent', 'developer']
    },
    {
      title: 'RealtyConnect',
      path: '/dashboard/realtyconnect',
      icon: UserGroupIcon,
      color: 'text-purple-500 hover:text-purple-600',
      tooltip: 'RealtyConnect',
      allowedRoles: ['buyer', 'agent', 'developer']
    },
    {
      title: 'PropGuard',
      path: '/dashboard/propguard',
      icon: ShieldCheckIcon,
      color: 'text-rose-500 hover:text-rose-600',
      tooltip: 'PropGuard',
      allowedRoles: ['buyer', 'agent', 'developer']
    }
  ];

  const filteredSolutions = useMemo(() =>
    solutions.filter(s => s.allowedRoles.includes(userRole)), [userRole]);

  return (
    <motion.div className={`fixed left-0 top-0 h-screen bg-base-100 border-r border-base-200 shadow-lg z-50 ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
      <div className="flex flex-col h-full">
        {/* Top */}
        <div className="p-4 border-b border-base-200 space-y-4">
          <div className="flex items-center">
            {isOpen && (
              <Link to="/" className="flex-1 mr-2">
                <motion.img
                  src={isDark ? darkLogo : lightLogo}
                  alt="RealiTech Logo"
                  className="w-[150px] h-[48px] object-contain"
                  whileHover={{ scale: 1.05 }}
                />
              </Link>
            )}
            <button
              onClick={handleSidebarToggle}
              className={`btn btn-ghost btn-sm btn-circle ${!isOpen ? 'mx-auto tooltip tooltip-right' : ''}`}
              data-tip={!isOpen ? 'Expand Sidebar' : ''}
            >
              {isOpen ? <RiMenuFoldLine className="w-5 h-5" /> : <RiMenuUnfoldLine className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm w-full tooltip tooltip-right"
              data-tip={!isOpen ? (isDark ? 'Light Mode' : 'Dark Mode') : ''}
            >
              {isDark ? <SunIcon className="w-5 h-5 text-amber-500" /> : <MoonIcon className="w-5 h-5" />}
              {isOpen && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 py-4 overflow-visible z-[60]">
          <NavigationLinks filteredSolutions={filteredSolutions} isOpen={isOpen} userRole={userRole} />
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-base-200 space-y-2">
          <Link
            to={`/dashboard/${userRole}`}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === `/dashboard/${userRole}`
                ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                : 'hover:bg-base-200'
            } ${!isOpen ? 'tooltip tooltip-right font-semibold' : ''}`}
            data-tip={!isOpen ? 'Dashboard' : ''}
          >
            <RiDashboardLine className="w-6 h-6 text-primary" />
            {isOpen && <span className="text-sm font-medium capitalize">{userRole} Dashboard</span>}
          </Link>

          <QuickActions isOpen={isOpen} />
          <ProfileSection isOpen={isOpen} currentUser={currentUser} userRole={userRole} />
        </div>
      </div>
    </motion.div>
  );
}

DashboardNavbar.propTypes = {
  userRole: PropTypes.oneOf(['buyer', 'agent', 'developer']),
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired
};

export default React.memo(DashboardNavbar);