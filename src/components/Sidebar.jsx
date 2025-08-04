import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { getAuth, signOut } from 'firebase/auth';
import { auditLogger } from '../utils/AuditLogger';

import lightLogo from '/src/assets/logo/logo-for-light.png';
import darkLogo from '/src/assets/logo/logo-for-dark.png';
import PropTypes from 'prop-types';

const ProfileSection = React.memo(({ isOpen, currentUser, userRole }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Clear local storage and redirect to login
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (!currentUser) return null;

  // Role-specific placeholder avatars
  const getPlaceholderAvatar = (role) => {
    // Using UI Avatars as a more reliable service with role-specific styling
    const avatarConfigs = {
      buyer: {
        name: 'Buyer',
        background: '3b82f6',
        color: 'ffffff',
        size: '400'
      },
      agent: {
        name: 'Agent',
        background: '10b981',
        color: 'ffffff',
        size: '400'
      },
      developer: {
        name: 'Developer',
        background: 'f59e0b',
        color: 'ffffff',
        size: '400'
      }
    };

    const config = avatarConfigs[role] || avatarConfigs.buyer;
    
    // Using UI Avatars - more reliable and professional looking
    return `https://ui-avatars.com/api/?name=${config.name}&background=${config.background}&color=${config.color}&size=${config.size}&font-size=0.6&rounded=true&bold=true`;
  };

  const handleLogout = async () => {
    try {
      // Log the logout event before signing out
      await auditLogger.logEvent({
        type: 'AUTH',
        action: 'LOGOUT',
        status: 'SUCCESS',
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userRole: userRole,
        details: {
          userNumber: currentUser.userNumber,
          logoutMethod: 'USER_INITIATED'
        }
      });

      await signOut(auth);
      // Clear localStorage
      localStorage.removeItem('userData');
      localStorage.removeItem('currentSession');
      sessionStorage.clear();
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Log the failed logout attempt
      await auditLogger.logEvent({
        type: 'AUTH',
        action: 'LOGOUT',
        status: 'FAILED',
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        userRole: userRole,
        error: error.code,
        details: {
          errorMessage: error.message
        }
      });
    }
  };

  const avatarSrc = currentUser.profilePicture || getPlaceholderAvatar(userRole);
  const displayName = currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`;
  const isOnline = true; // You can implement real online status later

  return (
    <div className="dropdown dropdown-top w-full">
      <label
        tabIndex={0}
        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer ${
          !isOpen ? 'tooltip tooltip-right font-semibold' : ''
        }`}
        data-tip={!isOpen ? `${displayName} (${userRole})` : ''}
      >
        <div className="avatar flex-shrink-0">
          <div className="w-6 h-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
            <img 
              src={avatarSrc} 
              alt={displayName}
              onError={(e) => {
                // Fallback to role-specific placeholder if image fails to load
                e.target.src = getPlaceholderAvatar(userRole);
              }}
            />
          </div>
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0 mr-2 ml-1">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-xs capitalize">{userRole}</span>
              {isOnline && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  <span className="text-xs text-base-content/70">Online</span>
                </div>
              )}
            </div>
          </div>
        )}
      </label>
      
      <ul tabIndex={0} className="dropdown-content menu p-0 w-72 shadow-2xl bg-base-100 rounded-xl border border-base-300 overflow-hidden">
        {/* User Info Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-base-50 to-base-100 border-b border-base-300">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-14 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                <img 
                  src={avatarSrc} 
                  alt={displayName}
                  onError={(e) => {
                    e.target.src = getPlaceholderAvatar(userRole);
                  }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-base-content truncate">{displayName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-primary badge-sm capitalize font-medium">{userRole}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-success font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-3 space-y-1">
            <p className="text-sm text-base-content/80 truncate flex items-center gap-2">
              <svg className="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {currentUser.email}
            </p>
            {currentUser.phone && (
              <p className="text-sm text-base-content/80 truncate flex items-center gap-2">
                <svg className="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {currentUser.phone}
              </p>
            )}
          </div>
        </div>

        {/* Profile Actions */}
        <div className="p-3">
          <div className="space-y-1">
            <Link 
              to="/dashboard/profile" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content group"
            >
              <RiUserLine className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">Profile Settings</span>
              <svg className="w-4 h-4 ml-auto text-base-content/40 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              to="/dashboard/settings" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content group"
            >
              <RiSettings4Line className="w-5 h-5 text-base-content/70 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">Account Settings</span>
              <svg className="w-4 h-4 ml-auto text-base-content/40 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="divider my-1 mx-4"></div>

        {/* Logout */}
        <div className="p-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-error/10 text-error hover:text-error w-full text-left group"
          >
            <RiLogoutBoxLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Sign Out</span>
            <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
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
    <ul tabIndex={0} className={`dropdown-content menu p-0 ${isOpen ? 'w-50 translate-x-3' : 'w-13 translate-x-10'} shadow-xl bg-base-100 rounded-box border border-base-200 overflow-hidden`}>
      <div className="p-2">
        <li className="list-none">
          <Link 
            to="/dashboard/notifications" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content"
          >
            <RiNotification3Line className="w-4 h-4 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="text-sm font-medium">Notifications</span>
                <span className="badge badge-primary badge-sm ml-auto">2</span>
              </>
            )}
          </Link>
        </li>
        <li className="list-none">
          <Link 
            to="/dashboard/messages" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content"
          >
            <RiMessage2Line className="w-4 h-4 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="text-sm font-medium">Messages</span>
                <span className="badge badge-primary badge-sm ml-auto">3</span>
              </>
            )}
          </Link>
        </li>
        <li className="list-none">
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content"
          >
            <RiSettings4Line className="w-4 h-4 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </li>
        <li className="list-none">
          <Link 
            to="/dashboard/audit-log" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content"
          >
            <RiHistoryLine className="w-4 h-4 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Activity Log</span>}
          </Link>
        </li>
      </div>
    </ul>
  </div>
));

function Sidebar({ userRole: propUserRole = 'buyer', isOpen, setIsOpen }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(propUserRole);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const storedRole = localStorage.getItem('userRole');
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setCurrentUser(parsedData);
        if (parsedData.role) {
          setCurrentUserRole(parsedData.role);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    if (storedRole) {
      setCurrentUserRole(storedRole);
    }
  }, []);

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

  const filteredSolutions = useMemo(() => {
    const solutionsList = [
      {
        title: 'BuySmart PH',
        path: '/dashboard/buysmartph',
        icon: SparklesIcon,
        color: 'text-teal-500 hover:text-teal-600',
        tooltip: 'BuySmart PH',
        allowedRoles: ['buyer', 'agent', 'developer']
      },
      {
        title: 'BuildSafe',
        path: '/dashboard/devtrackr',
        icon: BuildingOffice2Icon,
        color: 'text-blue-500 hover:text-blue-600',
        tooltip: 'BuildSafe',
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
    return solutionsList.filter(s => s.allowedRoles.includes(currentUserRole));
  }, [currentUserRole]);

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
              className={`text-base-content btn btn-ghost btn-sm btn-circle ${!isOpen ? 'mx-auto tooltip tooltip-right' : ''}`}
              data-tip={!isOpen ? 'Expand Sidebar' : ''}
            >
              {isOpen ? <RiMenuFoldLine className="w-5 h-5" /> : <RiMenuUnfoldLine className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex justify-center text-base-content">
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
        <div className="text-base-content flex-1 py-4 overflow-visible z-[60]">
          <NavigationLinks 
            filteredSolutions={filteredSolutions} 
            isOpen={isOpen} 
            userRole={currentUserRole} 
          />
        </div>

        {/* Bottom */}
        <div className="text-base-content p-4 border-t border-base-200 space-y-2">
          <Link
            to={`/dashboard/${currentUserRole}`}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location.pathname === `/dashboard/${currentUserRole}`
                ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                : 'hover:bg-base-200'
            } ${!isOpen ? 'tooltip tooltip-right font-semibold' : ''}`}
            data-tip={!isOpen ? 'Dashboard' : ''}
          >
            <RiDashboardLine className="w-6 h-6 text-primary" />
            {isOpen && <span className="text-sm font-medium capitalize">{currentUserRole} Dashboard</span>}
          </Link>

          <QuickActions isOpen={isOpen} />
          <ProfileSection 
            isOpen={isOpen} 
            currentUser={currentUser} 
            userRole={currentUserRole} 
          />
        </div>
      </div>
    </motion.div>
  );
}

Sidebar.propTypes = {
  userRole: PropTypes.oneOf(['buyer', 'agent', 'developer']),
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired
};

export default React.memo(Sidebar);