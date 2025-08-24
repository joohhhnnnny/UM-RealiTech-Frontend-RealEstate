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
import { doc, getDoc } from 'firebase/firestore';

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
      // Try different collections based on userType or try all
      const collections = userType === 'agent' ? ['agents'] : 
                         userType === 'developer' ? ['developers'] : 
                         ['buyers', 'agents', 'developers'];
      
      for (const collectionName of collections) {
        try {
          const userDocRef = doc(db, collectionName, userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(`Found user data in ${collectionName}:`, userData);
            
            // Helper function to check if a name looks like a real name (not username/email)
            const isRealName = (name) => {
              if (!name || !name.trim()) return false;
              const trimmedName = name.trim();
              
              // Filter out obvious usernames and email-like names
              return !trimmedName.includes('@') && 
                     !trimmedName.includes('.') && 
                     !trimmedName.match(/^[a-zA-Z0-9_]+\d+$/) && // username with numbers at end
                     trimmedName.includes(' ') && // real names usually have spaces
                     trimmedName.length > 3; // reasonable length
            };
            
            // Extract full name with improved filtering
            let fullName = '';
            
            if (userData.fullName && isRealName(userData.fullName)) {
              fullName = userData.fullName;
            } else if (userData.firstName && userData.lastName) {
              fullName = `${userData.firstName} ${userData.lastName}`;
            } else if (userData.name && isRealName(userData.name)) {
              fullName = userData.name;
            } else if (userData.displayName && isRealName(userData.displayName)) {
              fullName = userData.displayName;
            }
            // If no good name found, leave empty so user can enter their real name
            
            return {
              fullName: fullName.trim(),
              email: userData.email || currentUser?.email || '',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              phone: userData.phone || userData.contactNumber || '',
              role: userData.role || userType
            };
          }
        } catch (collectionError) {
          console.warn(`Error checking ${collectionName} collection:`, collectionError);
          continue; // Try next collection
        }
      }
      
      console.log('User document not found in any collection for userId:', userId);
      return null;
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      return null;
    }
  };
  
  // Auto-fill user data when modal opens or currentUser changes
  useEffect(() => {
    const populateUserData = async () => {
      // Try multiple sources for user data
      const user = currentUser || auth.currentUser;
      
      console.log('VerificationModal - Available user sources:');
      console.log('- currentUser from context:', currentUser);
      console.log('- auth.currentUser:', auth.currentUser);
      console.log('- Selected user:', user);
      
      if (user) {
        // First try to get data from Firestore
        const firestoreData = await fetchUserDataFromFirestore(user.uid);
        
        if (firestoreData && firestoreData.fullName) {
          console.log('Using Firestore data:', firestoreData);
          setFormData(prev => ({
            ...prev,
            fullName: firestoreData.fullName,
            email: firestoreData.email,
            contactNumber: firestoreData.phone || prev.contactNumber
          }));
        } else {
          // Improved fallback logic - provide placeholder that encourages user to enter real name
          console.log('Firestore data not found or incomplete, using fallback');
          
          // Create a better placeholder that doesn't use username
          const userEmail = user.email || '';
          const fallbackName = user.displayName && user.displayName !== user.email?.split('@')[0] 
            ? user.displayName 
            : ''; // Empty string if displayName is just the email username
          
          console.log('Using fallback data - Name:', fallbackName, 'Email:', userEmail);
          
          setFormData(prev => ({
            ...prev,
            fullName: fallbackName, // This will be empty if no real name is available
            email: userEmail
          }));
        }
      } else {
        console.log('No user data available');
      }
    };
    
    populateUserData();
  }, [currentUser, isOpen, userType]);
  
  // Additional effect to handle cases where currentUser loads after component mount
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure auth has loaded
      const timer = setTimeout(async () => {
        const user = currentUser || auth.currentUser;
        if (user) {
          const firestoreData = await fetchUserDataFromFirestore(user.uid);
          
          if (firestoreData) {
            console.log('Modal opened (delayed) - Using Firestore data:', firestoreData);
            setFormData(prev => ({
              ...prev,
              fullName: firestoreData.fullName,
              email: firestoreData.email
            }));
          } else {
            const userName = user.displayName || user.email?.split('@')[0] || 'User';
            const userEmail = user.email || '';
            
            console.log('Modal opened (delayed) - Using Auth data:', { userName, userEmail });
            
            setFormData(prev => ({
              ...prev,
              fullName: userName,
              email: userEmail
            }));
          }
        }
      }, 100);
      
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
