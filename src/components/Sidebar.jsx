import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RiUserLine, RiLogoutBoxLine, RiNotification3Line,
  RiMessage2Line, RiDashboardLine, RiVerifiedBadgeFill,
  RiMenuFoldLine, RiMenuUnfoldLine, RiMoreLine,
  RiHistoryLine, RiSettings4Line, RiMenuLine, RiCloseLine
} from 'react-icons/ri';
import {
  BuildingOffice2Icon, UserGroupIcon,
  SparklesIcon, ShieldCheckIcon, MoonIcon, SunIcon
} from '@heroicons/react/24/outline';
import { getAuth, signOut } from 'firebase/auth';
import ActivityLoggerService from '../services/ActivityLoggerService';

import lightLogo from '/src/assets/logo/logo-for-light.png';
import darkLogo from '/src/assets/logo/logo-for-dark.png';
import PropTypes from 'prop-types';

const ProfileSection = React.memo(({ isOpen, currentUser, userRole, handleLogout, isLoggingOut, isMobile }) => {
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

  const avatarSrc = currentUser.profilePicture || getPlaceholderAvatar(userRole);
  const displayName = currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`;
  const isOnline = true; // You can implement real online status later

  return (
    <div className={`dropdown ${isMobile ? 'dropdown-top' : 'dropdown-top'} w-full`}>
      <label
        tabIndex={0}
        className={`w-full flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer ${
          !isOpen && !isMobile ? 'tooltip tooltip-right font-semibold' : ''
        }`}
        data-tip={!isOpen && !isMobile ? `${displayName} (${userRole})` : ''}
      >
        <div className="avatar flex-shrink-0">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-6 h-6'} rounded-full ring ring-primary ring-offset-base-100 ring-offset-1`}>
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
        {(isOpen || isMobile) && (
          <div className="flex-1 min-w-0 mr-2 ml-1">
            <p className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium truncate`}>{displayName}</p>
            <div className="flex items-center gap-2">
              <span className={`badge badge-primary ${isMobile ? 'badge-xs' : 'badge-xs'} capitalize`}>{userRole}</span>
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
      
      <ul tabIndex={0} className={`dropdown-content menu p-0 ${isMobile ? 'w-80' : 'w-72'} shadow-2xl bg-base-100 rounded-xl border border-base-300 overflow-hidden z-[60]`}>
        {/* User Info Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-base-50 to-base-100 border-b border-base-300">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="avatar">
              <div className={`${isMobile ? 'w-12' : 'w-14'} rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100`}>
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
              <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-base'} text-base-content truncate`}>{displayName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge badge-primary ${isMobile ? 'badge-sm' : 'badge-sm'} capitalize font-medium`}>{userRole}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-xs text-success font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Information - Condensed for mobile */}
          <div className="mt-2 space-y-1">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/80 truncate flex items-center gap-2`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {currentUser.email}
            </p>
            {currentUser.phone && (
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-base-content/80 truncate flex items-center gap-2`}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {currentUser.phone}
              </p>
            )}
          </div>
        </div>

        {/* Profile Actions */}
        <div className="p-2 sm:p-3">
          <div className="space-y-1">
            <Link 
              to="/dashboard/profile" 
              className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content group`}
            >
              <RiUserLine className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} text-base-content/70 group-hover:text-primary transition-colors`} />
              <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>Profile Settings</span>
              <svg className="w-4 h-4 ml-auto text-base-content/40 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              to="/dashboard/settings" 
              className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content group`}
            >
              <RiSettings4Line className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} text-base-content/70 group-hover:text-primary transition-colors`} />
              <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>Account Settings</span>
              <svg className="w-4 h-4 ml-auto text-base-content/40 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="divider my-1 mx-4"></div>

        {/* Logout */}
        <div className="p-2 sm:p-3">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 hover:bg-error/10 text-error hover:text-error w-full text-left group`}
          >
            <RiLogoutBoxLine className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} group-hover:scale-110 transition-transform`} />
            <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>Sign Out</span>
            <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </ul>
    </div>
  );
});

const NavigationLinks = React.memo(({ filteredSolutions, isOpen, userRole, isMobile }) => {
  const location = useLocation();

  // Function to get data-tour attribute based on title
  const getTourAttribute = (title) => {
    switch (title) {
      case 'BuySmart PH':
        return 'buysmartph';
      case 'RealtyConnect':
        return 'realtyconnect';
      case 'PropGuard':
        return 'propguard';
      case 'BuildSafe':
        return 'buildsafe';
      default:
        return null;
    }
  };

  return (
    <div className="px-2 sm:px-4 space-y-1 sm:space-y-2">
      {filteredSolutions.map(({ title, path, icon: Icon, tooltip, color }) => {
        const isActive = location.pathname === path;
        const classes = `group flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
            : 'hover:bg-base-200'
        } ${!isOpen && !isMobile ? 'tooltip tooltip-right font-semibold' : ''}`;

        const tourAttribute = getTourAttribute(title);

        return (
          <Link
            key={title}
            to={path}
            state={{ userRole }}
            className={classes}
            data-tip={!isOpen && !isMobile ? tooltip : ''}
            data-tour={tourAttribute}
          >
            <Icon className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'} ${isActive ? 'text-primary' : color}`} />
            {(isOpen || isMobile) && <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>{title}</span>}
          </Link>
        );
      })}
    </div>
  );
});

const QuickActions = React.memo(({ isOpen, isMobile }) => (
  <div className={`dropdown ${isMobile ? 'dropdown-top' : 'dropdown-top'} w-full`}>
    <label
      tabIndex={0}
      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer ${
        !isOpen && !isMobile ? 'tooltip tooltip-right font-semibold' : ''
      }`}
      data-tip={!isOpen && !isMobile ? 'Quick Actions' : ''}
    >
      <RiMoreLine className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
      {(isOpen || isMobile) && <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>Quick Actions</span>}
    </label>
    <ul tabIndex={0} className={`dropdown-content menu p-0 ${(isOpen || isMobile) ? 'w-50 translate-x-3' : 'w-13 translate-x-10'} shadow-xl bg-base-100 rounded-box border border-base-200 overflow-hidden z-[60]`}>
      <div className="p-2">
        <li className="list-none">
          <Link 
            to="/dashboard/notifications" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content`}
          >
            <RiNotification3Line className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {(isOpen || isMobile) && (
              <>
                <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>Notifications</span>
                <span className="badge badge-primary badge-sm ml-auto">2</span>
              </>
            )}
          </Link>
        </li>
        <li className="list-none">
          <Link 
            to="/dashboard/messages" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content`}
          >
            <RiMessage2Line className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {(isOpen || isMobile) && (
              <>
                <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>Messages</span>
                <span className="badge badge-primary badge-sm ml-auto">3</span>
              </>
            )}
          </Link>
        </li>
        <li className="list-none">
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content`}
          >
            <RiSettings4Line className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {(isOpen || isMobile) && <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>Settings</span>}
          </Link>
        </li>
        <li className="list-none">
          <Link 
            to="/dashboard/audit-log" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-base-200 text-base-content hover:text-base-content`}
          >
            <RiHistoryLine className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {(isOpen || isMobile) && <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>Activity Log</span>}
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const auth = getAuth();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

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
    if (!isMobile) {
      const stored = localStorage.getItem('sidebarState');
      if (stored !== null) setIsOpen(JSON.parse(stored));
    }
  }, [setIsOpen, isMobile]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setShowMobileMenu(!showMobileMenu);
    } else {
      const next = !isOpen;
      setIsOpen(next);
      localStorage.setItem('sidebarState', JSON.stringify(next));
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Try to log the logout event (won't block logout if it fails)
      try {
        if (currentUser?.uid && ActivityLoggerService?.logAuthActivity) {
          await ActivityLoggerService.logAuthActivity(
            currentUser.uid,
            'logout',
            {
              email: currentUser.email,
              userRole: currentUserRole,
              userNumber: currentUser.userNumber,
              logoutMethod: 'user_initiated',
              timestamp: new Date().toISOString(),
              sessionDuration: currentUser.metadata?.lastSignInTime ? 
                Date.now() - new Date(currentUser.metadata.lastSignInTime).getTime() : 0
            }
          );
        }
      } catch (logError) {
        console.warn('Activity logging failed (non-critical):', logError.message);
      }

      // Perform the actual logout
      await signOut(auth);
      
      // Clear localStorage
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentSession');
      sessionStorage.clear();
      
      console.log('User logged out successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if signOut fails
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentSession');
      sessionStorage.clear();
      
      // Navigate manually if auth state listener doesn't trigger
      window.location.href = '/login';
    }
    setIsLoggingOut(false);
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
        path: '/dashboard/buildsafe',
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

  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-base-100 z-[99999]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-primary font-semibold">Signing out...</span>
      </div>
    );
  }
  
  if (!currentUser) return null;

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Header with Menu Button */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-base-100 border-b border-base-200 shadow-sm z-[50] flex items-center justify-between px-4">
          <Link to="/" className="flex-shrink-0">
            <motion.img
              src={isDark ? darkLogo : lightLogo}
              alt="RealiTech Logo"
              className="h-8 object-contain"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {isDark ? <SunIcon className="w-5 h-5 text-amber-500" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleSidebarToggle}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {showMobileMenu ? <RiCloseLine className="w-6 h-6" /> : <RiMenuLine className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setShowMobileMenu(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 bg-base-100 shadow-2xl z-[70] overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex-shrink-0 p-4 border-b border-base-200 flex items-center justify-between bg-base-100">
                  <Link to="/" className="flex-shrink-0">
                    <motion.img
                      src={isDark ? darkLogo : lightLogo}
                      alt="RealiTech Logo"
                      className="h-8 object-contain"
                      whileHover={{ scale: 1.05 }}
                    />
                  </Link>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>

                {/* Theme Toggle - Above Navigation */}
                <div className="flex-shrink-0 p-4 border-b border-base-200 bg-base-100">
                  <button
                    onClick={toggleTheme}
                    className="btn btn-ghost btn-sm w-full gap-2 justify-start"
                  >
                    {isDark ? <SunIcon className="w-5 h-5 text-amber-500" /> : <MoonIcon className="w-5 h-5" />}
                    <span className="text-base font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>

                {/* Navigation Links - Scrollable middle section */}
                <div className="flex-1 overflow-y-auto py-4">
                  <NavigationLinks 
                    filteredSolutions={filteredSolutions} 
                    isOpen={true}
                    userRole={currentUserRole}
                    isMobile={true}
                  />
                </div>

                {/* Bottom Actions - Fixed at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-base-200 bg-base-100 space-y-2">
                  <Link
                    to={`/dashboard/${currentUserRole}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      location.pathname === `/dashboard/${currentUserRole}`
                        ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary'
                        : 'hover:bg-base-200'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <RiDashboardLine className="w-6 h-6 text-primary" />
                    <span className="text-base font-medium">Dashboard</span>
                  </Link>

                  <QuickActions isOpen={true} isMobile={true} />
                  
                  {/* Profile Section - Below Quick Actions */}
                  <div className="pt-2 border-t border-base-200">
                    <ProfileSection 
                      isOpen={true}
                      currentUser={currentUser} 
                      userRole={currentUserRole}
                      handleLogout={handleLogout}
                      isLoggingOut={isLoggingOut}
                      isMobile={true}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.div 
      className={`fixed left-0 top-0 h-screen bg-base-100 border-r border-base-200 shadow-lg z-50 ${
        isOpen ? 'w-64' : 'w-20'
      } transition-all duration-300`}
      data-tour="sidebar"
    >
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
              className={`btn btn-ghost btn-sm w-full ${!isOpen ? 'tooltip tooltip-right' : ''}`}
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
            {isOpen && <span className="text-sm font-medium">Dashboard</span>}
          </Link>

          <QuickActions isOpen={isOpen} />
          <ProfileSection 
            isOpen={isOpen} 
            currentUser={currentUser} 
            userRole={currentUserRole}
            handleLogout={handleLogout}
            isLoggingOut={isLoggingOut}
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