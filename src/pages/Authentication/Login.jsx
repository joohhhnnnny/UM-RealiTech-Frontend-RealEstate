import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
// Firebase imports
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// Import the success notification component
import SuccessNotification from '../../components/SuccessNotification';

// Initialize Firebase (using your config)
const firebaseConfig = {
  apiKey: "AIzaSyCPBHSIrx8o7guk5t4ZrlPyXMo95ugpJMk",
  authDomain: "um-realitech-hackestate.firebaseapp.com",
  projectId: "um-realitech-hackestate",
  storageBucket: "um-realitech-hackestate.firebasestorage.app",
  messagingSenderId: "789818018946",
  appId: "1:789818018946:web:ff3b65362d33febab8f89b",
  measurementId: "G-EQ79GK6QML"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const Login = ({ onToggle }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ userNumber: '', userName: '', role: '' });
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: ''
  });

  const roles = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'agent', label: 'Agent' },
    { value: 'developer', label: 'Developer' }
  ];

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
      role: userData.role,
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
        const userDoc = await getDoc(doc(db, collectionName, uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === role) {
            return { ...userData, collection: collectionName };
          }
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
              return { ...userData, collection: collectionName };
            }
          } catch (collectionError) {
            console.warn(`Error checking collection ${collectionName}:`, collectionError);
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
    // Navigate based on role after closing the notification
    switch (successData.role) {
      case 'buyer':
        navigate('/dashboard/buyer');
        break;
      case 'agent':
        navigate('/dashboard/agent');
        break;
      case 'developer':
        navigate('/dashboard/developer');
        break;
      default:
        navigate('/');
    }
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

    if (!loginData.role) {
      setError('Please select your role.');
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

      // Find user data in the appropriate collection
      const userData = await findUserData(user.uid, loginData.role);
      
      if (userData) {
        // Verify the role matches what was selected
        if (userData.role === loginData.role) {
          console.log('Login successful:', { ...userData, uid: user.uid });
          
          // Check if account is active
          if (userData.isActive === false) {
            setError('Your account has been deactivated. Please contact support.');
            setIsLoading(false);
            return;
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

          // Show success notification
          setSuccessData({
            userNumber: userData.userNumber,
            userName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
            role: userData.role
          });
          setShowSuccess(true);

        } else {
          setError(`Invalid role selected. This account is registered as a ${userData.role}.`);
          // Sign out the user since role doesn't match
          await auth.signOut();
        }
      } else {
        setError(`No ${loginData.role} account found with this email. Please check your role selection or sign up.`);
        // Sign out the user since no data found
        await auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
      
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

          {/* Role Dropdown - Moved before password for better UX */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-base-content">Role</span>
            </label>
            <div className="relative">
              <select
                name="role"
                value={loginData.role}
                onChange={handleLoginChange}
                className="select select-bordered w-full pl-12 focus:select-primary transition-colors duration-300 bg-base-200 text-base-content"
                required
                disabled={isLoading}
              >
                <option value="" disabled>Select your role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60 pointer-events-none" />
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

          {/* Role Info */}
          {loginData.role && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center pt-2"
            >
              <div className="text-xs text-base-content/60 bg-base-200/50 px-3 py-2 rounded-lg">
                Signing in as: <span className="font-medium text-primary">{roles.find(r => r.value === loginData.role)?.label}</span>
              </div>
            </motion.div>
          )}
        </motion.form>
      </div>
    </>
  );
};

export default Login;