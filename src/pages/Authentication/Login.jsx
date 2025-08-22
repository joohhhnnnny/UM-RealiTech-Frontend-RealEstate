import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/Firebase';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import SuccessNotification from '../../components/SuccessNotification';
import ActivityLoggerService from '../../services/ActivityLoggerService';

const Login = ({ onToggle }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Monitor auth state
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (userData && userData.role) {
            const role = userData.role;
            const path = role === 'buyer' ? '/dashboard/buyer' 
                      : role === 'agent' ? '/dashboard/agent'
                      : role === 'developer' ? '/dashboard/developer'
                      : '/dashboard';
            
            // Use replace: true to prevent going to error page
            navigate(path, { replace: true });
          }
        } catch (error) {
          console.error('Error checking auth state:', error);
          // Don't redirect if there's an error, let the login form handle it
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ userNumber: '', userName: '', role: '' });
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Helper function to get collection name based on role
  const getCollectionName = (role) => {
    switch (role) {
      case 'buyer':
        return 'buyers';
      case 'agent':
        return 'agents';
      case 'developer':
        return 'developers';
      default:
        throw new Error('Invalid role specified');
    }
  };

  // Session management functions
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const createSession = (userData, rememberMe = false) => {
  const sessionId = generateSessionId();
  const expirationHours = rememberMe ? 24 * 30 : 24; // 30 days if remember me, otherwise 24 hours
  const expiresAt = new Date(Date.now() + (expirationHours * 60 * 60 * 1000)).toISOString();
  
  const sessionData = {
      sessionId,
      uid: userData.uid,
      userNumber: userData.userNumber,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: userData.fullName,
      role: userData.role, // Changed from user.role to userData.role
      phone: userData.phone,
      validId: userData.validId,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      collection: userData.collection,
      loginTime: new Date().toISOString(),
      expiresAt,
      lastActivity: new Date().toISOString(),
      rememberMe
    };

    // Store in localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(sessionData));
    localStorage.setItem('userRole', userData.role); // Changed from user.role to userData.role
    // Also store in sessionStorage for validation
    sessionStorage.setItem('currentSession', sessionId);
    
    return sessionData;
  };

  // Enhanced function to find user across all collections or specific collection
  const findUserData = async (uid, role = null) => {
    try {
      if (role) {
        // If role is specified, check only that collection
        const collectionName = getCollectionName(role);
        try {
          const userDoc = await getDoc(doc(db, collectionName, uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === role) {
              return { ...userData, collection: collectionName };
            }
          }
        } catch (collectionError) {
          console.error(`Error checking collection ${collectionName}:`, collectionError);
          if (collectionError.code === 'permission-denied') {
            throw new Error('Database access denied. Please ensure you have proper permissions.');
          }
          throw collectionError;
        }
        return null;
      } else {
        // If no role specified, search all collections
        const collections = ['buyers', 'agents', 'developers'];
        
        for (const collectionName of collections) {
          try {
            const userDoc = await getDoc(doc(db, collectionName, uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log(`Found user data in ${collectionName}:`, userData);
              return { ...userData, collection: collectionName };
            }
          } catch (collectionError) {
            console.warn(`Error checking collection ${collectionName}:`, collectionError);
            if (collectionError.code === 'permission-denied') {
              console.error(`Permission denied for collection ${collectionName}. Check Firestore rules.`);
              // Continue to next collection instead of throwing
              continue;
            }
            // For other errors, continue to next collection
            continue;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Error finding user data:', error);
      throw error;
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    
    // Navigate based on role when user clicks continue
    const role = successData.role;
    let path = '/dashboard'; // Default fallback
    
    if (role === 'buyer') {
      path = '/dashboard/buyer';
    } else if (role === 'agent') {
      path = '/dashboard/agent';
    } else if (role === 'developer') {
      path = '/dashboard/developer';
    }
    
    // Use replace: true to prevent going back to login
    navigate(path, { replace: true });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!loginData.email.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    if (!loginData.password) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginData.email.trim(), 
        loginData.password
      );
      const user = userCredential.user;

      console.log('Firebase Auth successful for user:', user.uid);

      // Find user data across all collections (no role specified)
      const userData = await findUserData(user.uid);
      
      if (userData) {
        console.log('Login successful:', { ...userData, uid: user.uid });
        
        // Check if account is active
        if (userData.isActive === false) {
          setError('Your account has been deactivated. Please contact support.');
          setIsLoading(false);
          return;
        }

        // Log the successful login
        try {
          await ActivityLoggerService.logAuthActivity(
            user.uid,
            ActivityLoggerService.ACTIVITY_TYPES.LOGIN,
            {
              email: userData.email,
              loginMethod: 'email_password',
              userRole: userData.role,
              userNumber: userData.userNumber,
              timestamp: new Date().toISOString(),
              isAccountActive: userData.isActive !== false,
              platform: navigator.platform
            }
          );
        } catch (logError) {
          console.error('Error logging login:', logError);
          // Continue with login even if logging fails
        }

        // Create session with remember me option
        const sessionData = createSession({
          uid: user.uid,
          userNumber: userData.userNumber,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          phone: userData.phone,
          validId: userData.validId,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          collection: userData.collection
        }, rememberMe);

        console.log('Session created:', sessionData);

        // Show success notification and let user click to continue
        setSuccessData({
          userNumber: userData.userNumber,
          userName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
          role: userData.role
        });
        setShowSuccess(true);
        
        // Reset loading state so user can interact with the success notification
        setIsLoading(false);

        // Note: Navigation will be handled by the success notification when user clicks "Continue"

      } else {
        setError('No account found with this email address. Please check your email or sign up.');
        // Sign out the user since no data found
        await auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);

      // Log the failed login attempt
      try {
        await ActivityLoggerService.logGeneralActivity(
          'anonymous',
          'login_failed',
          ActivityLoggerService.CATEGORIES.AUTHENTICATION,
          {
            email: loginData.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partially hide email
            errorCode: error.code,
            errorMessage: error.message,
            loginMethod: 'email_password',
            timestamp: new Date().toISOString(),
            platform: navigator.platform
          }
        );
      } catch (logError) {
        console.error('Error logging failed login:', logError);
      }
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Incorrect email or password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        case 'permission-denied':
          setError('Database access denied. Please try again or contact support.');
          break;
        default:
          setError(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Theme toggle state
  const [isDark, setIsDark] = useState(() => {
    // Check initial theme from localStorage
    const theme = localStorage.getItem('theme');
    return theme === 'dark';
  });

  // Toggle theme between dark and light
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? 'dark' : 'light';
    localStorage.setItem('theme', theme); // Fixed: use 'theme' instead of 'isDark ? dark : light'
    document.documentElement.setAttribute('data-theme', theme);
  };

  useEffect(() => {
    // Apply theme from localStorage on mount
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <>
      {/* Success Notification */}
      <SuccessNotification
        isVisible={showSuccess}
        onClose={handleSuccessClose}
        userNumber={successData.userNumber}
        userName={successData.userName}
        isLogin={true}
      />

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/10 border border-error/20 text-error px-4 py-3 mx-6 mt-4 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Form Container */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleLoginSubmit} 
          className="space-y-4 w-full max-w-sm"
        >
          {/* Email Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-base-content">Email</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                className="input input-bordered w-full pl-12 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                required
                disabled={isLoading}
              />
              <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-base-content">Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                className="input input-bordered w-full pl-12 pr-12 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                required
                disabled={isLoading}
              />
              <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="label cursor-pointer">
              <input 
                type="checkbox" 
                className="checkbox checkbox-primary checkbox-sm" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading} 
              />
              <span className="label-text ml-2 text-base-content">Remember me</span>
            </label>
            <a href="#" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className={`btn btn-primary w-full rounded-xl font-semibold text-lg mt-4 ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>

          {/* Signup Link */}
          <div className="text-center pt-2">
            <span className="text-base-content/70">Don't have an account? </span>
            <button
              type="button"
              onClick={() => onToggle(false)}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </motion.form>
      </div>
    </>
  );
};

export default Login;