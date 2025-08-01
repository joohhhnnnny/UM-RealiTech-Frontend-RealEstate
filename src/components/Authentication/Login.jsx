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
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// Import the success notification component
import SuccessNotification from '../SuccessNotification';

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

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      const user = userCredential.user;

      // Get user data from Firestore using UID
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if the role matches
        if (userData.role === loginData.role) {
          console.log('Login successful:', { ...userData, uid: user.uid });
          
          // Store user data in localStorage with all unique identifiers
          localStorage.setItem('userData', JSON.stringify({
            uid: user.uid,
            userNumber: userData.userNumber,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            phone: userData.phone,
            validId: userData.validId,
            isActive: userData.isActive,
            createdAt: userData.createdAt
          }));

          // Show success notification instead of immediate navigation
          setSuccessData({
            userNumber: userData.userNumber,
            userName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
            role: userData.role
          });
          setShowSuccess(true);

        } else {
          setError('Invalid role selected for this account.');
        }
      } else {
        setError('User data not found. Please contact support.');
      }
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please try again.');
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
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 mx-6 mt-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Container */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <form onSubmit={handleLoginSubmit} className="space-y-4 w-full max-w-sm">
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

          {/* Role Dropdown */}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="label cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" disabled={isLoading} />
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

          {/* Signup Link - Moved higher */}
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
        </form>
      </div>
    </>
  );
};

export default Login;