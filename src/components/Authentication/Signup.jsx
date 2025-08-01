import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
// Firebase imports
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// Import the new notification component
import SuccessNotification from '../SuccessNotification';
// Import the new Terms modal
import TermsModal from '../TermsModal';

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

const Signup = ({ onToggle }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ userNumber: '', userName: '' });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    validId: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  const roles = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'agent', label: 'Agent' },
    { value: 'developer', label: 'Developer' }
  ];

  // Helper function to generate unique user number
  const generateUserNumber = (role) => {
    const timestamp = Date.now().toString();
    const rolePrefix = {
      'buyer': 'BUY',
      'agent': 'AGT',
      'developer': 'DEV'
    };
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${rolePrefix[role]}${timestamp.slice(-6)}${random}`;
  };

  // Helper function to check if email or phone already exists
  const checkUserExists = async (email, phone) => {
    try {
      // Check by email
      const emailQuery = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        return { exists: true, type: 'email' };
      }

      // Check by phone (normalized)
      const phoneQuery = query(collection(db, 'users'), where('phone', '==', phone));
      const phoneSnapshot = await getDocs(phoneQuery);
      
      if (!phoneSnapshot.empty) {
        return { exists: true, type: 'phone' };
      }

      // Check by validId
      const validIdQuery = query(collection(db, 'users'), where('validId', '==', signupData.validId));
      const validIdSnapshot = await getDocs(validIdQuery);
      
      if (!validIdSnapshot.empty) {
        return { exists: true, type: 'validId' };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
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

  const handleTermsClick = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const handleTermsModalClose = () => {
    setShowTermsModal(false);
    if (!termsAccepted) {
      setTermsAccepted(true);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if terms are accepted
    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue.');
      setIsLoading(false);
      return;
    }

    // Enhanced validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email.trim())) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    // Updated phone validation for Philippine numbers and international formats
    const phoneInput = signupData.phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
    
    // Philippine phone number patterns:
    const philippinePhoneRegex = /^(\+63|0)([0-9]{10,11})$/;
    const internationalPhoneRegex = /^[\+]?[1-9]\d{1,14}$/;
    
    // Check if it's a valid Philippine number or international number
    const isValidPhone = philippinePhoneRegex.test(phoneInput) || internationalPhoneRegex.test(phoneInput);
    
    if (!isValidPhone) {
      setError('Please enter a valid phone number. Examples: 09123456789, +639123456789, 02123456789');
      setIsLoading(false);
      return;
    }

    // Normalize phone number for storage (always store with +63 for PH numbers)
    let normalizedPhone = phoneInput;
    if (phoneInput.startsWith('09')) {
      normalizedPhone = '+63' + phoneInput.substring(1);
    } else if (phoneInput.startsWith('0') && !phoneInput.startsWith('+')) {
      normalizedPhone = '+63' + phoneInput.substring(1);
    } else if (!phoneInput.startsWith('+')) {
      if (phoneInput.length >= 10 && phoneInput.length <= 11) {
        normalizedPhone = '+63' + phoneInput;
      }
    }

    try {
      // Check if user already exists before creating Firebase Auth account
      const userExists = await checkUserExists(signupData.email.trim(), normalizedPhone);
      
      if (userExists.exists) {
        switch (userExists.type) {
          case 'email':
            setError('An account with this email already exists.');
            break;
          case 'phone':
            setError('An account with this phone number already exists.');
            break;
          case 'validId':
            setError('An account with this ID number already exists.');
            break;
        }
        setIsLoading(false);
        return;
      }

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signupData.email.trim(), 
        signupData.password
      );
      const user = userCredential.user;

      // Generate unique user number
      const userNumber = generateUserNumber(signupData.role);

      // Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        userNumber: userNumber,
        email: signupData.email.trim().toLowerCase(),
        phone: normalizedPhone,
        validId: signupData.validId.trim(),
        firstName: signupData.firstName.trim(),
        lastName: signupData.lastName.trim(),
        fullName: `${signupData.firstName.trim()} ${signupData.lastName.trim()}`,
        role: signupData.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        emailVerified: user.emailVerified,
        roleSpecific: {
          ...(signupData.role === 'buyer' && {
            buyerProfile: {
              preferences: {},
              savedProperties: [],
              inquiries: []
            }
          }),
          ...(signupData.role === 'agent' && {
            agentProfile: {
              license: '',
              agency: '',
              specializations: [],
              properties: []
            }
          }),
          ...(signupData.role === 'developer' && {
            developerProfile: {
              companyName: '',
              projects: [],
              certifications: []
            }
          })
        }
      };

      // Use setDoc with user.uid as document ID
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User document created with UID:', user.uid);
      console.log('User Number:', userNumber);

      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
        uid: user.uid,
        userNumber: userNumber,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        role: userData.role,
        phone: userData.phone,
        validId: userData.validId,
        isActive: userData.isActive,
        createdAt: userData.createdAt
      }));

      // Show modern success notification instead of alert
      setSuccessData({
        userNumber: userNumber,
        userName: userData.fullName,
        role: userData.role
      });
      setShowSuccess(true);

    } catch (error) {
      console.error('Signup error:', error);
      
      // If user was created but Firestore failed, clean up
      if (error.code === 'permission-denied' && auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteError) {
          console.error('Failed to cleanup user after error:', deleteError);
        }
      }
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        case 'permission-denied':
          setError('Database access denied. Please check your internet connection and try again.');
          break;
        default:
          setError(`Account creation failed: ${error.message}`);
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
      />

      {/* Terms Modal */}
      <TermsModal
        isVisible={showTermsModal}
        onClose={handleTermsModalClose}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 mx-6 mt-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Container */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-auto scrollbar-hide p-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `
          }} />
          
          <form onSubmit={handleSignupSubmit} className="space-y-4 pb-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-base-content">First Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    placeholder="First name"
                    className="input input-bordered w-full pl-10 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                    required
                    disabled={isLoading}
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-base-content">Last Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    placeholder="Last name"
                    className="input input-bordered w-full pl-10 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                    required
                    disabled={isLoading}
                  />
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content">Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  placeholder="Enter your email"
                  className="input input-bordered w-full pl-12 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                  required
                  disabled={isLoading}
                />
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
              </div>
            </div>

            {/* Phone Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content">Phone</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                  placeholder="09123456789"
                  className="input input-bordered w-full pl-12 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                  required
                  disabled={isLoading}
                />
                <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
              </div>
            </div>

            {/* Valid ID Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content">Valid ID Number</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="validId"
                  value={signupData.validId}
                  onChange={handleSignupChange}
                  placeholder="Enter valid ID number"
                  className="input input-bordered w-full pl-12 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                  required
                  disabled={isLoading}
                />
                <IdentificationIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
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
                  value={signupData.role}
                  onChange={handleSignupChange}
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

            {/* Password Fields */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-base-content">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="Create password"
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-base-content">Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Confirm password"
                    className="input input-bordered w-full pl-12 pr-12 focus:input-primary transition-colors duration-300 bg-base-200 text-base-content placeholder-base-content/50"
                    required
                    disabled={isLoading}
                  />
                  <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/60" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary checkbox-sm" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading} 
                />
                <span className="label-text ml-3 text-base-content">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={handleTermsClick}
                    className="text-primary hover:text-primary/80 font-medium underline transition-colors"
                    disabled={isLoading}
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>
            </div>

            {/* Signup Button */}
            <motion.button
              type="submit"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className={`btn btn-primary w-full rounded-xl font-semibold text-lg mt-6 ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <span className="text-base-content/70">Already have an account? </span>
              <button
                type="button"
                onClick={() => onToggle(true)}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
                disabled={isLoading}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;