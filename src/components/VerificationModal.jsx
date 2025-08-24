import React, { useState, useEffect } from 'react';
import { FaUpload, FaFileAlt, FaIdCard, FaBuilding, FaTimes } from 'react-icons/fa';
import VerificationService from '../services/verificationService';

// Try to import useAuth, but provide fallback if not available
let useAuth;
try {
  useAuth = require('../contexts/AuthContext').useAuth;
} catch (error) {
  useAuth = () => ({ currentUser: null });
}

// Additional fallback - try to get user from Firebase directly
import { auth, db } from '../config/Firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const VerificationModal = ({ isOpen, onClose, userType, userId, onVerificationSubmitted }) => {
  const { currentUser } = useAuth(); // Get current user from auth context
  
  // Initialize with empty values first
  const [formData, setFormData] = useState({
    prcLicense: '',
    expirationDate: '',
    businessPermit: '',
    fullName: '',
    contactNumber: '',
    email: '',
    yearsExperience: ''
  });
  
// Function to get user data from Firestore
const fetchUserDataFromFirestore = async (userId) => {
  try {
    console.log(`🔍 Fetching user data for userId: ${userId}, userType: ${userType}`);
    
    // Try different collections based on userType or try all
    const collections = userType === 'agent' ? ['agents'] : 
                       userType === 'developer' ? ['developers'] : 
                       ['buyers', 'agents', 'developers'];
    
    console.log(`📋 Checking collections: ${collections.join(', ')}`);
    
    for (const collectionName of collections) {
      try {
        console.log(`🔍 Checking ${collectionName} collection...`);
        const userDocRef = doc(db, collectionName, userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`✅ Found user data in ${collectionName}:`, userData);
          
          // Extract firstName and lastName from Firebase data
          const firstName = userData.firstName || '';
          const lastName = userData.lastName || '';
          
          // Create fullName from firstName + lastName (exactly what you want!)
          let fullName = '';
          if (firstName && lastName) {
            fullName = `${firstName} ${lastName}`;
            console.log(`📝 Created fullName: "${fullName}" from firstName: "${firstName}" + lastName: "${lastName}"`);
          } else if (userData.fullName) {
            // Fallback to existing fullName if firstName/lastName not available
            fullName = userData.fullName;
            console.log(`📝 Using existing fullName: "${fullName}"`);
          } else {
            // Last resort - try to extract from other fields
            const displayName = userData.name || userData.displayName || '';
            if (displayName) {
              fullName = displayName;
              console.log(`📝 Using display name as fullName: "${fullName}"`);
            }
          }
          
          return {
            fullName: fullName.trim(),
            email: userData.email || currentUser?.email || '',
            firstName: firstName,
            lastName: lastName,
            phone: userData.phone || userData.contactNumber || '',
            role: userData.role || userType
          };
        } else {
          console.log(`❌ No document found in ${collectionName} for userId: ${userId}`);
        }
      } catch (collectionError) {
        console.warn(`❌ Error checking ${collectionName} collection:`, collectionError);
        continue; // Try next collection
      }
    }
    
    console.log(`⚠️ No user data found in any collection for userId: ${userId}`);
    return null;
  } catch (error) {
    console.error('❌ Error fetching user data from Firestore:', error);
    return null;
  }
};
  
// Auto-fill user data when modal opens or currentUser changes
useEffect(() => {
  const populateUserData = async () => {
    // Try multiple sources for user data
    const user = currentUser || auth.currentUser;
    
    if (user) {
      console.log(`🔍 Populating user data for verification modal, userId: ${user.uid}`);
      
      // First try to get data from Firestore
      const firestoreData = await fetchUserDataFromFirestore(user.uid);
      
      if (firestoreData && firestoreData.fullName) {
        console.log('✅ Using Firestore data:', firestoreData);
        setFormData(prev => ({
          ...prev,
          fullName: firestoreData.fullName,
          email: firestoreData.email,
          contactNumber: firestoreData.phone || prev.contactNumber
        }));
      } else {
        // If no Firestore data, try to get from localStorage first
        console.log('⚠️ Firestore data not found, checking localStorage...');
        
        try {
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            console.log('📦 Found userData in localStorage:', userData);
            
            // Create fullName from firstName + lastName if available
            let fullName = '';
            if (userData.firstName && userData.lastName) {
              fullName = `${userData.firstName} ${userData.lastName}`;
              console.log(`📝 Created fullName from localStorage: "${fullName}"`);
            } else if (userData.fullName) {
              fullName = userData.fullName;
              console.log(`📝 Using fullName from localStorage: "${fullName}"`);
            }
            
            if (fullName) {
              setFormData(prev => ({
                ...prev,
                fullName: fullName.trim(),
                email: userData.email || user.email || '',
                contactNumber: userData.phone || ''
              }));
              return; // Exit early if we found data in localStorage
            }
          }
        } catch (error) {
          console.warn('❌ Error parsing localStorage userData:', error);
        }
        
        // Last resort fallback - use auth data but try to make it more user-friendly
        console.log('⚠️ No stored data found, using auth fallback');
        
        // Try to get a better name from auth or use a generic placeholder
        let fallbackName = 'User';
        if (user.displayName) {
          fallbackName = user.displayName;
        } else if (user.email) {
          // Try to make the email username more user-friendly
          const emailUsername = user.email.split('@')[0];
          // Convert something like "robertdoe2" to "Robert Doe" if possible
          const cleanUsername = emailUsername.replace(/\d+$/, ''); // Remove trailing numbers
          if (cleanUsername.length > 2) {
            fallbackName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
          }
        }
        
        console.log(`📝 Using fallback name: "${fallbackName}"`);
        
        setFormData(prev => ({
          ...prev,
          fullName: fallbackName,
          email: user.email || '',
          contactNumber: '' // Empty for manual entry
        }));
      }
    } else {
      console.log('❌ No user data available');
    }
  };
  
  if (isOpen) {
    populateUserData();
  }
}, [currentUser, isOpen, userType]);
  
  // Additional effect to handle cases where currentUser loads after component mount
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure auth has loaded
      const timer = setTimeout(async () => {
        const user = currentUser || auth.currentUser;
        if (user) {
          console.log(`🔍 Delayed user data population for userId: ${user.uid}`);
          
          const firestoreData = await fetchUserDataFromFirestore(user.uid);
          
          if (firestoreData && firestoreData.fullName) {
            console.log('✅ Modal opened (delayed) - Using Firestore data:', firestoreData);
            setFormData(prev => ({
              ...prev,
              fullName: firestoreData.fullName,
              email: firestoreData.email,
              contactNumber: firestoreData.phone
            }));
          } else {
            // Check localStorage for user data
            console.log('⚠️ Modal opened (delayed) - Checking localStorage...');
            
            try {
              const storedUserData = localStorage.getItem('userData');
              if (storedUserData) {
                const userData = JSON.parse(storedUserData);
                console.log('📦 Found userData in localStorage (delayed):', userData);
                
                // Create fullName from firstName + lastName if available
                let fullName = '';
                if (userData.firstName && userData.lastName) {
                  fullName = `${userData.firstName} ${userData.lastName}`;
                  console.log(`📝 Created fullName from localStorage (delayed): "${fullName}"`);
                } else if (userData.fullName) {
                  fullName = userData.fullName;
                  console.log(`📝 Using fullName from localStorage (delayed): "${fullName}"`);
                }
                
                if (fullName) {
                  setFormData(prev => ({
                    ...prev,
                    fullName: fullName.trim(),
                    email: userData.email || user.email || '',
                    contactNumber: userData.phone || ''
                  }));
                  return; // Exit early if we found data in localStorage
                }
              }
            } catch (error) {
              console.warn('❌ Error parsing localStorage userData (delayed):', error);
            }
            
            // Fallback logic - use auth data
            console.log('⚠️ Modal opened (delayed) - Using auth fallback');
            
            let fallbackName = 'User';
            if (user.displayName) {
              fallbackName = user.displayName;
            } else if (user.email) {
              const emailUsername = user.email.split('@')[0];
              const cleanUsername = emailUsername.replace(/\d+$/, '');
              if (cleanUsername.length > 2) {
                fallbackName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
              }
            }
            
            console.log(`📝 Using delayed fallback name: "${fallbackName}"`);
            
            setFormData(prev => ({
              ...prev,
              fullName: fallbackName,
              email: user.email || '',
              contactNumber: ''
            }));
          }
        }
      }, 500); // 500ms delay
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const requiredDocuments = {
    agent: ['PRC License', 'Valid ID', 'Professional Photo'],
    developer: ['Business Permit', 'SEC Registration', 'Valid ID']
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate full name (should contain at least first and last name)
    const fullNameTrimmed = formData.fullName.trim();
    if (!fullNameTrimmed || fullNameTrimmed.split(' ').length < 2) {
      alert('Please enter your full name (both first and last name)');
      return;
    }
    
    // Check if full name looks like a real name (not username)
    if (fullNameTrimmed.includes('@') || 
        fullNameTrimmed.includes('.') || 
        fullNameTrimmed.match(/^[a-zA-Z0-9_]+\d+$/)) {
      alert('Please enter your real name, not a username or email address');
      return;
    }
    
    // Check if documents are uploaded
    if (documents.length < 1) {
      alert('Please upload at least 1 document for verification');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting verification with documents:', documents);
      console.log('Form data:', formData);
      
      // Pass the form data and documents to the parent handler
      onVerificationSubmitted(formData, documents);
      onClose();
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">
            {userType === 'agent' ? 'Agent' : 'Developer'} Verification
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="alert alert-info mb-6">
          <FaFileAlt />
          <div>
            <div className="font-semibold">Demo Mode - Quick Verification</div>
            <div className="text-sm mt-1">
              File upload simulation only. Documents won't be stored (Storage requires Firebase upgrade).
              Upload any file and complete the form for instant verification.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Full Name</span>
                    
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="input input-bordered w-full"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your real full name (e.g., John Smith)"
                    required
                    readOnly
                    minLength="3"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full bg-base-300"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="label">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className="input input-bordered w-full"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsExperience"
                    className="input input-bordered w-full"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold mb-4">
                {userType === 'agent' ? 'PRC License Information' : 'Business Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    {userType === 'agent' ? 'PRC License Number' : 'Business Permit Number'}
                  </label>
                  <input
                    type="text"
                    name={userType === 'agent' ? 'prcLicense' : 'businessPermit'}
                    className="input input-bordered w-full"
                    value={userType === 'agent' ? formData.prcLicense : formData.businessPermit}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    className="input input-bordered w-full"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold mb-4">Required Documents</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {requiredDocuments[userType].map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaFileAlt className="text-primary" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('file-input').click()}
              >
                <FaUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: JPEG, PNG, PDF (Max 10MB per file)
                </p>
              </div>

              <input
                id="file-input"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Uploaded Files */}
              {documents.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Uploaded Documents ({documents.length})</h5>
                  <div className="space-y-2">
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-base-100 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <FaFileAlt className="text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => removeDocument(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || documents.length < 1}
            >
              {isSubmitting ? 'Processing Demo...' : 'Submit Demo Verification'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
};

export default VerificationModal;