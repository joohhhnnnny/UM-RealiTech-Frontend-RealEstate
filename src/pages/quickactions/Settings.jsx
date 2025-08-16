import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  RiUserLine, 
  RiBellLine, 
  RiLockPasswordLine, 
  RiGlobalLine, 
  RiPaletteLine,
  RiShieldLine,
  RiNotificationLine,
  RiCheckLine,
  RiBookOpenLine,
  RiSearchLine,
  RiCloseLine
} from 'react-icons/ri';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import DashboardLayout from '../../layouts/DashboardLayout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('buyer');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    licenseNo: '' // Will be set based on user role
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    marketing: false
  });

  // Get current user data (matching Sidebar.jsx approach)
  useEffect(() => {
    const auth = getAuth();
    
    // First, get stored role and user data from localStorage
    const userData = localStorage.getItem('userData');
    const storedRole = localStorage.getItem('userRole');
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log('Parsed user data:', parsedData);
        console.log('Stored role:', storedRole);
        
        // Set the user role first - prioritize the role from userData, then storedRole
        const userRole = parsedData.role || storedRole || 'buyer';
        console.log('Setting user role to:', userRole);
        setCurrentUserRole(userRole);
        
        // Set current user
        setCurrentUser(parsedData);
        
        // Set profile data from localStorage
        const displayName = parsedData.fullName || `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim();
        setProfileData(prev => ({
          ...prev,
          fullName: displayName,
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          location: parsedData.location || parsedData.address || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentUser(null);
      }
    }
    
    // Monitor auth state for Firebase users
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user authenticated:', firebaseUser.uid);
        
        // For Firebase users, still check localStorage for role and additional data
        const userData = localStorage.getItem('userData');
        const storedRole = localStorage.getItem('userRole');
        
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            const userRole = parsedData.role || storedRole || 'buyer';
            setCurrentUserRole(userRole);
            
            // Merge Firebase user with localStorage data
            const mergedUser = {
              ...parsedData,
              ...firebaseUser,
              uid: firebaseUser.uid,
              email: firebaseUser.email || parsedData.email,
              displayName: firebaseUser.displayName || parsedData.fullName
            };
            setCurrentUser(mergedUser);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            setCurrentUser(firebaseUser);
          }
        } else {
          setCurrentUser(firebaseUser);
        }
        
        // Update profile data with Firebase user info
        setProfileData(prev => ({
          ...prev,
          fullName: firebaseUser.displayName || prev.fullName,
          email: firebaseUser.email || prev.email,
          phone: firebaseUser.phoneNumber || prev.phone
        }));
      } else {
        console.log('No Firebase user authenticated');
        // If no Firebase user and no localStorage data, set to null
        if (!userData) {
          setCurrentUser(null);
          setCurrentUserRole('buyer');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Role-specific placeholder avatars (matching Sidebar.jsx)
  const getPlaceholderAvatar = (role) => {
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
    return `https://ui-avatars.com/api/?name=${config.name}&background=${config.background}&color=${config.color}&size=${config.size}&font-size=0.6&rounded=true&bold=true`;
  };

  // Generate role-specific license numbers
  const generateLicenseNumber = (role, userId) => {
    const rolePrefix = {
      agent: 'REL',
      developer: 'DEV',
      buyer: 'BUY'
    };
    
    const prefix = rolePrefix[role] || 'USR';
    const year = new Date().getFullYear();
    const userIdSuffix = userId ? userId.slice(-6).toUpperCase() : '001234';
    
    return `${prefix}-${year}-${userIdSuffix}`;
  };

  // Update profile data when user role changes
  useEffect(() => {
    if (currentUser && currentUserRole) {
      const licenseNo = generateLicenseNumber(currentUserRole, currentUser.uid || currentUser.userNumber);
      setProfileData(prev => ({
        ...prev,
        licenseNo: licenseNo
      }));
      console.log('Updated license number for role:', currentUserRole, 'License:', licenseNo);
    }
  }, [currentUser, currentUserRole]);

  // Handle profile data changes
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    try {
      // Update localStorage with new profile data
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        const updatedData = {
          ...parsedData,
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location
        };
        localStorage.setItem('userData', JSON.stringify(updatedData));
      }
      
      // Here you could also update Firebase user profile if needed
      // await updateFirebaseProfile(profileData);
      
      console.log('Profile updated successfully:', profileData);
      // You could show a toast notification here
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profile Settings', icon: RiUserLine },
    { id: 'notifications', label: 'Notifications', icon: RiBellLine },
    { id: 'security', label: 'Security', icon: RiLockPasswordLine },
    { id: 'appearance', label: 'Appearance', icon: RiPaletteLine },
    { id: 'language', label: 'Language', icon: RiGlobalLine },
  ];

  const systemTabs = [
    { id: 'manual', label: 'Manual', icon: RiBookOpenLine },
  ];

  // System Manual Content
  const manualContent = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `Welcome to RealiTech Real Estate Platform! This comprehensive guide will help you navigate through all the features and functionalities of our system. Whether you're a buyer, agent, or developer, this manual will provide you with step-by-step instructions to make the most out of your experience.

      First-time users should begin by completing their profile verification to unlock all platform features. Navigate to Settings > Profile Settings to update your personal information and complete the verification process.`
    },
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      content: `The dashboard is your central hub for all activities. Here you'll find:

      • Quick stats showing your performance metrics
      • Recent activities and notifications
      • Trending properties in your area
      • Quick action buttons for common tasks
      • Activity feed showing recent platform updates

      For agents: Monitor your commission earnings, track client interactions, and manage your property listings.
      For buyers: View saved properties, track your buying journey, and connect with verified agents.
      For developers: Manage your projects, track sales performance, and monitor market analytics.`
    },
    {
      id: 'property-management',
      title: 'Property Management',
      content: `Managing properties is streamlined through our intuitive interface:

      Adding a New Property:
      1. Navigate to Properties > Add New Listing
      2. Fill in all required property details including location, price, and specifications
      3. Upload high-quality images (maximum 10 photos)
      4. Set property features and amenities
      5. Review and publish your listing

      Editing Existing Properties:
      • Go to Properties > My Listings
      • Click on the property you want to edit
      • Make necessary changes and save
      • Changes will be reflected immediately on the platform

      Property Analytics:
      View detailed insights about your property performance including views, inquiries, and market comparisons.`
    },
    {
      id: 'user-verification',
      title: 'User Verification Process',
      content: `Account verification is crucial for platform security and trust:

      Email Verification:
      • Check your inbox for verification email
      • Click the verification link
      • Your email will be marked as verified

      Phone Verification:
      • Enter your phone number in Settings
      • Receive SMS with verification code
      • Enter the code to complete verification

      Identity Verification:
      • Upload a clear photo of your government-issued ID
      • Ensure all details are visible and readable
      • Verification typically takes 24-48 hours

      Professional License (Agents/Developers):
      • Upload your professional license documents
      • Provide license number and expiration date
      • Verification may take 3-5 business days`
    },
    {
      id: 'communication-tools',
      title: 'Communication Tools',
      content: `Stay connected with clients and partners through our built-in communication features:

      Real-time Chat:
      • Access chat through the message icon in the navigation bar
      • Start conversations with property owners, agents, or potential buyers
      • Share property links and documents directly in chat
      • Set your availability status

      Notifications:
      • Customize notification preferences in Settings
      • Receive alerts for new messages, property inquiries, and system updates
      • Choose between email, push, or in-app notifications

      Video Calls:
      • Schedule virtual property tours
      • Conduct client meetings remotely
      • Share screen for document reviews
      • Record sessions for future reference`
    },
    {
      id: 'financial-tools',
      title: 'Financial Tools & Calculators',
      content: `Make informed financial decisions with our comprehensive tools:

      Mortgage Calculator:
      • Calculate monthly payments based on loan amount, interest rate, and term
      • Compare different loan scenarios
      • Factor in property taxes and insurance
      • Generate amortization schedules

      ROI Calculator:
      • Analyze investment property returns
      • Calculate cash flow projections
      • Compare multiple investment opportunities
      • Export reports for financial planning

      Commission Tracker (Agents):
      • Monitor commission earnings in real-time
      • Track pending and completed transactions
      • Generate tax reports
      • Set commission goals and track progress`
    },
    {
      id: 'mobile-app',
      title: 'Mobile Application',
      content: `Access RealiTech on-the-go with our mobile application:

      Key Mobile Features:
      • Full dashboard access from your smartphone
      • Push notifications for urgent updates
      • Camera integration for instant property photos
      • GPS-based property search
      • Offline mode for viewing saved properties

      Mobile-Specific Tools:
      • Augmented reality property visualization
      • Location-based property recommendations
      • Quick photo uploads with automatic tagging
      • Voice-to-text for property descriptions
      • Mobile-optimized contract signing

      Download our app from the App Store or Google Play to get started.`
    },
    {
      id: 'security-privacy',
      title: 'Security & Privacy',
      content: `Your security and privacy are our top priorities:

      Data Protection:
      • All personal information is encrypted using industry-standard protocols
      • We never share your data with third parties without consent
      • Regular security audits ensure platform integrity
      • Secure cloud storage for all documents and images

      Account Security:
      • Enable two-factor authentication for enhanced protection
      • Use strong, unique passwords
      • Regular password updates are recommended
      • Monitor account activity through security logs

      Privacy Settings:
      • Control who can see your contact information
      • Manage property listing visibility
      • Set communication preferences
      • Request data export or deletion at any time`
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting & Support',
      content: `Common issues and their solutions:

      Login Problems:
      • Clear browser cache and cookies
      • Ensure you're using the correct email address
      • Reset password if needed
      • Contact support if issues persist

      Upload Issues:
      • Check file size limits (max 5MB per image)
      • Supported formats: JPG, PNG, PDF
      • Ensure stable internet connection
      • Try uploading files one at a time

      Performance Issues:
      • Update your browser to the latest version
      • Disable browser extensions that might interfere
      • Check your internet connection speed
      • Clear browser cache regularly

      Getting Help:
      • Use the live chat feature for immediate assistance
      • Submit support tickets through the Help Center
      • Check our FAQ section for common questions
      • Schedule a training session with our support team`
    }
  ];

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    manualContent.forEach((section) => {
      const titleMatch = section.title.toLowerCase().includes(query.toLowerCase());
      const contentMatches = [];
      
      // Find all content matches
      const contentLower = section.content.toLowerCase();
      const queryLower = query.toLowerCase();
      let index = contentLower.indexOf(queryLower);
      
      while (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(section.content.length, index + query.length + 50);
        const snippet = section.content.substring(start, end);
        
        contentMatches.push({
          snippet,
          index,
          matchStart: index - start,
          matchEnd: index - start + query.length
        });
        
        index = contentLower.indexOf(queryLower, index + 1);
      }

      if (titleMatch || contentMatches.length > 0) {
        results.push({
          section,
          titleMatch,
          contentMatches
        });
      }
    });

    setSearchResults(results);
  };

  // Highlight text function
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400 text-black font-semibold px-1 py-0.5 rounded-sm shadow-sm border border-yellow-500">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="w-full md:w-64">
              {/* Main Settings Container */}
              <div className="card bg-base-100 shadow-lg border border-base-200 mb-4">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Settings</h2>
                  <div className="flex flex-col gap-2">
                    {settingsTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-ghost justify-start gap-3 ${
                          activeTab === tab.id ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Container */}
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">System</h2>
                  <div className="flex flex-col gap-2">
                    {systemTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-ghost justify-start gap-3 ${
                          activeTab === tab.id ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="p-6">
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                        <div className="avatar">
                          <div className="w-24 h-24 rounded-full">
                            <img 
                              src={currentUser?.profilePicture || getPlaceholderAvatar(currentUserRole)} 
                              alt="Profile" 
                              onError={(e) => {
                                e.target.src = getPlaceholderAvatar(currentUserRole);
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="btn btn-outline">Change Avatar</button>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-base-content/60">
                              Role: <span className="badge badge-primary badge-sm capitalize font-medium">{currentUserRole}</span>
                            </p>
                            {/* Debug info - remove in production */}
                            <p className="text-xs text-base-content/40">
                              User ID: {currentUser?.uid || currentUser?.userNumber || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Progress Section */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-warning-content flex items-center gap-2">
                              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Account Verification
                            </h4>
                            <p className="text-sm text-base-content/70 mt-1">
                              Complete now the Verification to unlock all features
                            </p>
                          </div>
                          <div className="badge badge-warning badge-outline">
                            {currentUserRole === 'agent' ? '60%' : currentUserRole === 'developer' ? '45%' : '75%'} Complete
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-base-300 rounded-full h-3 mb-4 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-warning to-warning-focus h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: currentUserRole === 'agent' ? '60%' : currentUserRole === 'developer' ? '45%' : '75%'
                            }}
                          />
                        </div>

                        {/* Verification Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                              <svg className="w-4 h-4 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-base-content">Email Verified</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                              <svg className="w-4 h-4 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-base-content">Phone Verified</span>
                          </div>

                          {currentUserRole === 'buyer' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center">
                                <svg className="w-4 h-4 text-warning-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-sm text-base-content/70">ID Verification Pending</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center">
                                <svg className="w-4 h-4 text-warning-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-sm text-base-content/70">
                                {currentUserRole === 'agent' ? 'License Verification Pending' : 'Business License Pending'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <button className="btn btn-warning btn-sm gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Complete Verification
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">Full Name</span>
                          </label>
                          <input 
                            type="text" 
                            className="input input-bordered w-full" 
                            value={profileData.fullName}
                            onChange={(e) => handleProfileChange('fullName', e.target.value)}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">Email</span>
                          </label>
                          <input 
                            type="email" 
                            className="input input-bordered w-full" 
                            value={profileData.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            placeholder="Enter your email address"
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">Phone Number</span>
                          </label>
                          <input 
                            type="tel" 
                            className="input input-bordered w-full" 
                            value={profileData.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">Location</span>
                          </label>
                          <input 
                            type="text" 
                            className="input input-bordered w-full" 
                            value={profileData.location}
                            onChange={(e) => handleProfileChange('location', e.target.value)}
                            placeholder="Enter your location"
                          />
                        </div>
                        {/* License Number - Static field for agents and developers */}
                        {(currentUserRole === 'agent' || currentUserRole === 'developer') && (
                          <div className="form-control w-full lg:col-span-2">
                            <label className="label">
                              <span className="label-text font-medium">
                                {currentUserRole === 'agent' ? 'Real Estate License No.' : 'Developer License No.'}
                              </span>
                            </label>
                            <input 
                              type="text" 
                              className="input input-bordered w-full bg-base-200" 
                              value={profileData.licenseNo}
                              disabled
                              placeholder="License number will be assigned"
                            />
                            <label className="label">
                              <span className="label-text-alt text-base-content/60">
                                {currentUserRole === 'agent' 
                                  ? 'Real Estate license numbers are managed by the Professional Regulation Commission (PRC)'
                                  : 'Developer license numbers are managed by the Housing and Land Use Regulatory Board (HLURB)'
                                }
                              </span>
                            </label>
                          </div>
                        )}
                        
                        {/* Show buyer-specific information */}
                        {currentUserRole === 'buyer' && (
                          <div className="form-control w-full lg:col-span-2">
                            <div className="alert alert-info">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              <span className="text-sm">
                                As a buyer, you have access to property listings, market insights, and can connect with verified agents and developers.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Profile Information */}
                      {currentUser && (
                        <div className="mt-8 p-4 bg-base-200/50 rounded-lg">
                          <h4 className="font-semibold mb-3 text-base-content">Account Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-base-content/70">User ID:</span>
                              <span className="ml-2 font-mono text-xs bg-base-300 px-2 py-1 rounded">
                                {currentUser.uid || currentUser.userNumber || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-base-content/70">Account Type:</span>
                              <span className="ml-2 capitalize">{currentUserRole}</span>
                            </div>
                            {currentUser.metadata?.lastSignInTime && (
                              <div>
                                <span className="font-medium text-base-content/70">Last Login:</span>
                                <span className="ml-2">
                                  {new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {currentUser.metadata?.creationTime && (
                              <div>
                                <span className="font-medium text-base-content/70">Member Since:</span>
                                <span className="ml-2">
                                  {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Notification Preferences</h3>
                      
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                            <div>
                              <h4 className="font-semibold capitalize">{key} Notifications</h4>
                              <p className="text-sm text-base-content/70">Receive notifications via {key}</p>
                            </div>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-primary" 
                              checked={value}
                              onChange={() => setNotifications(prev => ({...prev, [key]: !prev[key]}))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Security Settings</h3>
                      
                      <div className="space-y-5">
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">Current Password</span>
                          </label>
                          <input 
                            type="password" 
                            className="input input-bordered w-full"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">New Password</span>
                          </label>
                          <input 
                            type="password" 
                            className="input input-bordered w-full"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">Confirm New Password</span>
                          </label>
                          <input 
                            type="password" 
                            className="input input-bordered w-full"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <div className="mt-6">
                          <button className="btn btn-primary">Update Password</button>
                        </div>
                      </div>

                      <div className="divider"></div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-base-content/70">Add an extra layer of security</p>
                          </div>
                          <input type="checkbox" className="toggle toggle-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Appearance Settings</h3>
                      
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Dark Mode</h4>
                          <p className="text-sm text-base-content/70">Toggle dark mode theme</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="toggle toggle-primary" 
                          checked={isDarkMode}
                          onChange={() => setIsDarkMode(!isDarkMode)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'language' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Language Settings</h3>
                      
                      <div className="form-control w-full max-w-xs">
                        <label className="label">
                          <span className="label-text font-medium">Select Language</span>
                        </label>
                        <select className="select select-bordered w-full">
                          <option>English</option>
                          <option>Bisaya</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Japanese</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'manual' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h3 className="text-2xl font-bold">System Manual</h3>
                        
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RiSearchLine className="h-5 w-5 text-base-content/50" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search manual (Ctrl+F functionality)..."
                            className="input input-bordered w-full pl-10 pr-10"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                          />
                          {searchQuery && (
                            <button
                              onClick={() => handleSearch('')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              <RiCloseLine className="h-5 w-5 text-base-content/50 hover:text-base-content" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Search Results */}
                      {searchQuery && searchResults.length > 0 && (
                        <div className="mb-6">
                          <div className="alert alert-info mb-4">
                            <RiSearchLine className="w-5 h-5" />
                            <span>Found {searchResults.length} result(s) for "{searchQuery}"</span>
                          </div>
                          
                          <div className="space-y-4">
                            {searchResults.map((result, index) => (
                              <div key={index} className="card bg-base-200 border border-primary/20">
                                <div className="card-body p-4">
                                  <h4 className="font-semibold text-primary mb-2">
                                    {highlightText(result.section.title, searchQuery)}
                                  </h4>
                                  {result.contentMatches.slice(0, 2).map((match, matchIndex) => (
                                    <p key={matchIndex} className="text-sm text-base-content/80 mb-2">
                                      ...{highlightText(match.snippet, searchQuery)}...
                                    </p>
                                  ))}
                                  <button 
                                    className="btn btn-sm btn-outline btn-primary mt-2"
                                    onClick={() => {
                                      setSearchQuery('');
                                      setSearchResults([]);
                                      // Scroll to section
                                      const element = document.getElementById(result.section.id);
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                  >
                                    Go to Section
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Search Results */}
                      {searchQuery && searchResults.length === 0 && (
                        <div className="alert alert-warning mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span>No results found for "{searchQuery}". Try different keywords.</span>
                        </div>
                      )}

                      {/* Manual Content - Show when no search or after clearing search */}
                      {!searchQuery && (
                        <div className="space-y-6">
                          <div className="alert alert-info">
                            <RiBookOpenLine className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Welcome to the RealiTech System Manual</p>
                              <p className="text-sm">Use the search bar above to quickly find specific topics, or browse through all sections below.</p>
                            </div>
                          </div>

                          {manualContent.map((section) => (
                            <div key={section.id} id={section.id} className="card bg-base-100 border border-base-200 shadow-sm">
                              <div className="card-body">
                                <h4 className="card-title text-lg text-primary flex items-center gap-2">
                                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                                  {section.title}
                                </h4>
                                <div className="prose prose-sm max-w-none text-base-content/90 leading-relaxed">
                                  {section.content.split('\n\n').map((paragraph, pIndex) => {
                                    if (paragraph.trim().startsWith('•')) {
                                      // Handle bullet points
                                      const items = paragraph.split('\n').filter(item => item.trim());
                                      return (
                                        <ul key={pIndex} className="list-disc list-inside space-y-1 my-3">
                                          {items.map((item, iIndex) => (
                                            <li key={iIndex} className="text-sm">
                                              {item.replace('•', '').trim()}
                                            </li>
                                          ))}
                                        </ul>
                                      );
                                    } else if (paragraph.includes(':') && !paragraph.includes('.')) {
                                      // Handle headers/subheadings
                                      return (
                                        <h5 key={pIndex} className="font-semibold text-base mt-4 mb-2 text-secondary">
                                          {paragraph.trim()}
                                        </h5>
                                      );
                                    } else {
                                      // Handle regular paragraphs
                                      return (
                                        <p key={pIndex} className="mb-3 text-sm leading-relaxed">
                                          {paragraph.trim()}
                                        </p>
                                      );
                                    }
                                  })}
                                </div>
                                
                                {/* Section navigation */}
                                <div className="card-actions justify-end mt-4">
                                  <button 
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                  >
                                    Back to Top
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Quick Navigation */}
                          <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                            <div className="card-body">
                              <h4 className="card-title text-primary">Quick Navigation</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                {manualContent.map((section) => (
                                  <button 
                                    key={section.id}
                                    className="btn btn-sm btn-outline btn-primary"
                                    onClick={() => {
                                      const element = document.getElementById(section.id);
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                  >
                                    {section.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="mt-8 flex justify-end">
                    <button 
                      className="btn btn-primary gap-2"
                      onClick={handleSaveProfile}
                    >
                      <RiCheckLine className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;