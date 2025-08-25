import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Login from './Login';
import Signup from './Signup';

const AuthContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  // Update state when route changes
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9
    })
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const handleToggle = (toLogin) => {
    if (toLogin !== isLogin) {
      setIsLogin(toLogin);
      navigate(toLogin ? '/login' : '/signup', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Background Pattern - Responsive */}
      <div className="fixed inset-0 opacity-5">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <defs>
            <pattern 
              id="authPattern" 
              x="0" 
              y="0" 
              width="40" 
              height="40" 
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.5"/>
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3"/>
              <circle cx="30" cy="30" r="1.5" fill="currentColor" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#authPattern)" className="text-primary"/>
        </svg>
      </div>

      {/* Back Button - Responsive positioning */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 btn btn-circle btn-sm sm:btn-md btn-ghost bg-base-200/80 backdrop-blur-sm hover:bg-base-300 transition-all duration-300 z-10"
      >
        <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-base-content" />
      </motion.button>

      {/* Main Container - Fully Responsive */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-lg mx-auto 
                   h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[80vh] 
                   max-h-[600px] sm:max-h-[700px] md:max-h-[750px] lg:max-h-[800px] xl:max-h-[850px]"
      >
        <div className="bg-base-100/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-base-200/50 overflow-hidden h-full flex flex-col">
          {/* Header - Responsive with reduced bottom padding on mobile */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-400 p-3 sm:p-6 md:p-8 pb-2 sm:pb-6 md:pb-8 text-center flex-shrink-0">
            <motion.h1 
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white"
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </motion.h1>
            <motion.p 
              key={isLogin ? 'login-sub' : 'signup-sub'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-white/80 mt-1 sm:mt-2 text-sm sm:text-base md:text-lg mb-0 sm:mb-0"
            >
              {isLogin ? 'Sign in to continue to RealiTech' : 'Join RealiTech today'}
            </motion.p>
          </div>

          {/* Form Container - Sliding Animation */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={isLogin ? 1 : -1}>
              {isLogin ? (
                <motion.div
                  key="login"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.4, 0, 0.2, 1],
                    layout: { duration: 0.3 }
                  }}
                  className="absolute inset-0 flex flex-col"
                >
                  <Login onToggle={handleToggle} />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  custom={-1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.4, 0, 0.2, 1],
                    layout: { duration: 0.3 }
                  }}
                  className="absolute inset-0 flex flex-col"
                >
                  <Signup onToggle={handleToggle} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements - Responsive */}
      <div className="hidden sm:block fixed top-1/4 left-1/6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="hidden sm:block fixed bottom-1/4 right-1/6 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-secondary/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
    </div>
  );
};

export default AuthContainer;