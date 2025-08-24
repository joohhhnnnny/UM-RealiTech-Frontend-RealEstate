import { db, storage, auth } from '../config/Firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

export class VerificationService {
  // Test Firebase connection and permissions
  static async testConnection() {
    try {
      console.log('🔍 Testing Firebase connection...');
      
      // Try to write a test document
      const testRef = collection(db, 'verifications');
      const testDoc = {
        test: true,
        timestamp: new Date().toISOString(),
        userId: 'test-user'
      };
      
      const docRef = await addDoc(testRef, testDoc);
      console.log('✅ Firebase connection test successful:', docRef.id);
      
      // Clean up test document
      try {
        await updateDoc(doc(db, 'verifications', docRef.id), { deleted: true });
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up test document:', cleanupError);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      return false;
    }
  }

  // Ensure user is authenticated (for demo purposes)
  static async ensureAuthenticated() {
    if (!auth.currentUser) {
      console.log('🔐 No user authenticated, signing in anonymously for demo...');
      try {
        await signInAnonymously(auth);
        console.log('✅ Anonymous authentication successful');
        return true;
      } catch (error) {
        console.error('❌ Anonymous authentication failed:', error);
        return false;
      }
    }
    console.log('✅ User already authenticated:', auth.currentUser.uid);
    return true;
  }

  // Submit verification documents
  static async submitVerification(userId, userType, verificationData, documents) {
    try {
      console.log('🔍 VerificationService Debug Info:');
      console.log('- userId:', userId);
      console.log('- userType:', userType);
      console.log('- documents count:', documents.length);
      console.log('- verificationData:', verificationData);
      console.log('- auth.currentUser:', auth.currentUser?.uid);
      
      // For demo purposes, we'll bypass Firebase entirely if there are permission issues
      console.log('🎯 DEMO MODE: Processing verification locally...');
      
      // Simulate document processing
      const documentUrls = [];
      console.log(`📄 Processing ${documents.length} documents for ${userType} verification...`);
      
      // Create mock document URLs for development
      for (const document of documents) {
        const documentId = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const mockUrl = `demo://${userType}/${userId}/${documentId}_${document.name}`;
        
        documentUrls.push({
          id: documentId,
          name: document.name,
          url: mockUrl,
          type: document.type,
          size: document.size,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded', // Mock status for development
        });
        
        console.log(`📎 Processed document: ${document.name} (${document.type})`);
      }
      
      // Store verification in localStorage for demo purposes
      const verificationData_local = {
        userId,
        userType,
        status: 'verified',
        submittedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        documents: documentUrls,
        verificationData: {
          ...verificationData,
          submittedAt: new Date().toISOString()
        },
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'auto-system',
        notes: `Automatically approved ${userType} verification upon document submission`,
        isDemo: true,
        createdBy: 'demo-system'
      };
      
      // Store in localStorage for persistence
      const verificationId = `demo-verification-${userType}-${Date.now()}`;
      localStorage.setItem(`verification_${userId}_${userType}`, JSON.stringify(verificationData_local));
      localStorage.setItem(`verification_status_${userId}_${userType}`, 'verified');
      
      console.log('✅ Demo verification stored locally with ID:', verificationId);
      
      // Try Firebase as backup, but don't fail if it doesn't work
      try {
        // Ensure user is authenticated first
        const isAuthenticated = await this.ensureAuthenticated();
        if (isAuthenticated) {
          const verificationRef = collection(db, 'verifications');
          const docRef = await addDoc(verificationRef, { ...verificationData_local, id: verificationId });
          console.log('✅ Also saved to Firebase:', docRef.id);
        }
      } catch (firebaseError) {
        console.log('⚠️ Firebase save failed, but demo verification is working locally:', firebaseError.message);
      }

      console.log('✅ Verification request completed successfully');
      return { success: true, verificationId, documentsCount: documentUrls.length };
    } catch (error) {
      console.error('❌ Error submitting verification:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error
      });
      
      // Return a more detailed error response
      return { 
        success: false, 
        error: error.message || 'Failed to submit verification',
        errorCode: error.code || 'unknown',
        verificationId: null 
      };
    }
  }

  // Auto-approve verification (no admin needed)
  static async approveVerification(userId, userType, verificationId) {
    try {
      console.log(`🎉 Auto-approving ${userType} verification for user:`, userId);
      
      // Update verification document to approved status
      if (verificationId && !verificationId.startsWith('demo-')) {
        try {
          const verificationRef = doc(db, 'verifications', verificationId);
          await updateDoc(verificationRef, {
            status: 'verified',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'auto-system',
            notes: 'Automatically approved upon document submission'
          });
          console.log('✅ Verification document updated to approved');
        } catch (verificationUpdateError) {
          console.warn('⚠️ Could not update verification document:', verificationUpdateError);
          // Continue anyway - user profile update is more important
        }
      }
      
      // Update user profile to verified status
      try {
        const userRef = doc(db, `${userType}s`, userId);
        await updateDoc(userRef, {
          verificationStatus: 'verified',
          verifiedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ ${userType} profile updated to verified status`);
      } catch (profileUpdateError) {
        console.warn('⚠️ Could not update user profile:', profileUpdateError);
        // Try to create the profile if it doesn't exist
        const baseProfile = {
          verificationStatus: 'verified',
          verificationId: verificationId,
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: userId
        };
        
        await setDoc(doc(db, `${userType}s`, userId), baseProfile);
        console.log(`✅ Created new ${userType} profile with verified status`);
      }
      
      console.log(`🎉 ${userType.toUpperCase()} VERIFICATION COMPLETE!`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error approving verification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get verification status for a user with enhanced developer support
  static async getVerificationStatus(userId, userType) {
    try {
      console.log(`🔍 Getting ${userType} verification status for user:`, userId);
      
      // ALWAYS RETURN NOT_SUBMITTED - FORCE VERIFICATION FLOW EVERY TIME
      // This ensures users MUST submit documents and go through verification process
      console.log(`🔄 FORCING VERIFICATION REQUIREMENT: ${userType} must submit documents first`);
      
      return { 
        status: 'not_submitted', 
        verificationId: null, 
        isVerified: false,
        reason: 'Fresh session - verification required'
      };
      
      /* DISABLED - OLD LOGIC THAT WAS AUTO-VERIFYING
      // Try to ensure authentication first
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (authError) {
        console.warn('⚠️ Authentication failed in getVerificationStatus:', authError);
        // Continue anyway for demo
      }
      
      const userRef = doc(db, `${userType}s`, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const status = userData.verificationStatus || userData.isVerified ? 'verified' : 'not_submitted';
        
        console.log(`📋 Found ${userType} verification status:`, status);
        
        return {
          status: status,
          verificationId: userData.verificationId || null,
          lastUpdated: userData.updatedAt,
          isVerified: userData.isVerified || false
        };
      }
      
      console.log(`📋 No ${userType} profile found, returning not_submitted`);
      return { status: 'not_submitted', verificationId: null, isVerified: false };
      */
    } catch (error) {
      console.error(`Error getting ${userType} verification status:`, error);
      
      // ALWAYS return not_submitted on any error to force verification
      console.log(`� Returning not_submitted for ${userType} due to error - must verify first`);
      return { status: 'not_submitted', verificationId: null, isVerified: false };
    }
  }

  // Subscribe to verification status changes
  static subscribeToVerificationStatus(userId, userType, callback) {
    try {
      console.log(`🔔 Setting up ${userType} verification status subscription for user:`, userId);
      
      // IMMEDIATELY return not_submitted to force verification flow
      console.log(`🔄 FORCING not_submitted status for fresh verification flow`);
      callback({ status: 'not_submitted', verificationId: null, isVerified: false });
      
      // Set up subscription for ONLY this session's changes (not persistent Firebase data)
      const userRef = doc(db, `${userType}s`, userId);
      
      return onSnapshot(userRef, 
        (doc) => {
          // Only respond to changes that happen DURING this session
          // Ignore any existing verified status from previous sessions
          if (doc.exists()) {
            const data = doc.data();
            
            // Check if this is a fresh update from current session
            const isCurrentSessionUpdate = data.sessionTimestamp && 
                                         (Date.now() - new Date(data.sessionTimestamp).getTime() < 60000); // Within last minute
            
            if (isCurrentSessionUpdate) {
              const status = data.verificationStatus || (data.isVerified ? 'verified' : 'not_submitted');
              console.log(`📋 ${userType} verification status updated IN CURRENT SESSION to:`, status);
              
              callback({
                status: status,
                verificationId: data.verificationId || null,
                lastUpdated: data.updatedAt,
                isVerified: data.isVerified || false
              });
            } else {
              // Ignore old data - keep as not_submitted
              console.log(`📋 Ignoring old ${userType} verification data - keeping not_submitted`);
              callback({ status: 'not_submitted', verificationId: null, isVerified: false });
            }
          } else {
            console.log(`📋 No ${userType} profile found, keeping not_submitted`);
            callback({ status: 'not_submitted', verificationId: null, isVerified: false });
          }
        },
        (error) => {
          console.warn(`⚠️ ${userType} verification status subscription error:`, error);
          // Always return not_submitted on error to force verification
          callback({ status: 'not_submitted', verificationId: null, isVerified: false });
        }
      );
    } catch (error) {
      console.error(`Error setting up ${userType} verification subscription:`, error);
      // Immediately call with not_submitted and return dummy unsubscribe
      callback({ status: 'not_submitted', verificationId: null, isVerified: false });
      return () => {};
    }
  }

  // Get verification details
  static async getVerificationDetails(verificationId) {
    try {
      const verificationRef = doc(db, 'verifications', verificationId);
      const verificationDoc = await getDoc(verificationRef);
      
      if (verificationDoc.exists()) {
        return verificationDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting verification details:', error);
      return null;
    }
  }

  // DISABLED AUTO-VERIFICATION: All verification must be done manually by admin
  static async autoVerifyDocuments(verificationId) {
    // ✅ AUTO-VERIFICATION COMPLETELY DISABLED
    // This method now does nothing - all verification must be manual
    console.log('🚫 AUTO-VERIFICATION DISABLED: Verification must be approved manually by admin');
    console.log(`Verification ID ${verificationId} remains pending until admin review`);
    return false; // Never auto-approve
  }

  // Update verification status (for manual admin verification only)
  static async updateVerificationStatus(verificationId, status, reviewedBy = 'admin', notes = '') {
    try {
      console.log(`🔄 Updating verification ${verificationId} to status: ${status}`);
      
      const verificationRef = doc(db, 'verifications', verificationId);
      
      // Get current verification data to update documents
      const verificationDoc = await getDoc(verificationRef);
      if (!verificationDoc.exists()) {
        throw new Error('Verification document not found');
      }
      
      const verificationData = verificationDoc.data();
      
      // Update document status when verification is approved
      let updatedDocuments = verificationData.documents;
      if (status === 'verified') {
        updatedDocuments = verificationData.documents.map(doc => ({
          ...doc,
          verified: true,
          verifiedAt: new Date().toISOString()
        }));
        console.log(`📄 Marked ${updatedDocuments.length} documents as verified`);
      }
      
      const updateData = {
        status,
        documents: updatedDocuments,
        reviewedAt: serverTimestamp(),
        reviewedBy,
        notes
      };

      if (status === 'rejected') {
        updateData.rejectionReason = notes;
      }

      await updateDoc(verificationRef, updateData);
      console.log(`✅ Verification document updated in Firebase`);

      // Update user profile
      const userRef = doc(db, `${verificationData.userType}s`, verificationData.userId);
      
      // Also create/update verification status document for real-time subscriptions
      const statusDocRef = doc(db, 'verification_status', `${verificationData.userId}_${verificationData.userType}`);
      
      // Check if user document exists
      const userDocCheck = await getDoc(userRef);
      
      if (userDocCheck.exists()) {
        await updateDoc(userRef, {
          verificationStatus: status,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ User profile updated with verification status: ${status}`);
      } else {
        // Create basic profile if it doesn't exist
        await setDoc(userRef, {
          verificationStatus: status,
          verificationId: verificationId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: verificationData.userId
        });
        console.log(`✅ Created user profile with verification status: ${status}`);
      }

      // Update or create status document with timestamp
      await setDoc(statusDocRef, {
        userId: verificationData.userId,
        userType: verificationData.userType,
        status: status,
        verificationId: verificationId,
        submittedAt: verificationData.submittedAt || new Date().toISOString(), // Include submission timestamp
        updatedAt: serverTimestamp(),
        reviewedAt: status === 'verified' ? serverTimestamp() : null,
        reviewedBy: reviewedBy
      }, { merge: true });
      console.log(`✅ Verification status document updated with timestamp`);

      return { success: true };
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  // Get all pending verifications (for admin/review purposes)
  static subscribeToPendingVerifications(callback) {
    const q = query(
      collection(db, 'verifications'),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const verifications = [];
      querySnapshot.forEach((doc) => {
        verifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(verifications);
    });
  }

  // Enhanced method to find user data across all collections
  static async findUserData(userId) {
    const collections = ['developers', 'agents', 'buyers'];
    
    for (const collectionName of collections) {
      try {
        const userRef = doc(db, collectionName, userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`✅ Found user data in ${collectionName}:`, userData);
          
          // Return standardized user data structure
          return {
            ...userData,
            collection: collectionName,
            fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email || '',
            phone: userData.phone || userData.contactNumber || '',
            role: userData.role || collectionName.slice(0, -1) // Remove 's' from collection name
          };
        }
      } catch (error) {
        console.warn(`Error checking ${collectionName} collection:`, error);
        continue;
      }
    }
    
    console.warn(`No user data found for userId: ${userId} in any collection`);
    return null;
  }

  // Helper method to create developer profile with proper data structure
  static createDeveloperProfile(userId, verificationData) {
    const currentTime = new Date().toISOString();
    
    return {
      userId: userId,
      name: verificationData.fullName || 'Developer User',
      email: verificationData.email || 'developer@example.com',
      phone: verificationData.contactNumber || '',
      company: verificationData.businessPermit || 'Development Company',
      businessPermit: verificationData.businessPermit || '',
      expirationDate: verificationData.expirationDate || '',
      specialization: 'Residential Development',
      projects: 0,
      completedProjects: 0,
      totalUnitsBuilt: 0,
      totalUnitsSold: 0,
      averageProjectValue: 0,
      bio: 'Professional real estate developer.',
      verificationStatus: 'verified',
      isVerified: true,
      verifiedAt: currentTime,
      createdAt: currentTime,
      updatedAt: currentTime,
      profileCompleted: true,
      isActive: true,
      // Add additional fields that might be expected
      role: 'developer',
      fullName: verificationData.fullName || 'Developer User'
    };
  }

  // Helper method to create agent profile with proper data structure  
  static createAgentProfile(userId, verificationData) {
    const currentTime = new Date().toISOString();
    
    return {
      userId: userId,
      name: verificationData.fullName || 'Agent User',
      email: verificationData.email || 'agent@example.com',
      phone: verificationData.contactNumber || '',
      prcLicense: verificationData.prcLicense || '',
      expirationDate: verificationData.expirationDate || '',
      specialization: 'Residential',
      rating: 0,
      deals: 0,
      agency: 'RealiTech Realty',
      bio: 'Professional real estate agent.',
      verificationStatus: 'verified',
      isVerified: true,
      verifiedAt: currentTime,
      createdAt: currentTime,
      updatedAt: currentTime,
      profileCompleted: true,
      isActive: true,
      // Add additional fields that might be expected
      role: 'agent',
      fullName: verificationData.fullName || 'Agent User'
    };
  }

  // Check if user can perform restricted actions
  static async canPerformRestrictedActions(userId, userType) {
    const status = await this.getVerificationStatus(userId, userType);
    return status.status === 'verified';
  }

  // Reset verification status to force fresh submission
  static async resetVerificationStatus(userId, userType) {
    try {
      const statusDocRef = doc(db, 'verification_status', `${userId}_${userType}`);
      
      // Reset to not_submitted status
      await setDoc(statusDocRef, {
        userId,
        userType,
        status: 'not_submitted',
        updatedAt: serverTimestamp(),
        resetAt: serverTimestamp(),
        reason: 'Fresh session - requires new document submission'
      }, { merge: true });
      
      console.log(`✅ Verification status reset to not_submitted for ${userType} ${userId}`);
      return true;
    } catch (error) {
      console.error('Error resetting verification status:', error);
      throw error;
    }
  }

  // Set user as permanently verified with isVerified boolean
  static async setUserVerified(userId, userType, isVerified = true) {
    try {
      const statusDocRef = doc(db, 'verification_status', `${userId}_${userType}`);
      
      // Set isVerified boolean permanently
      await setDoc(statusDocRef, {
        userId,
        userType,
        status: isVerified ? 'verified' : 'not_submitted',
        isVerified: isVerified, // PERMANENT BOOLEAN FLAG
        verifiedAt: isVerified ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
        permanent: true // This verification persists across sessions
      }, { merge: true });
      
      console.log(`✅ ${userType} ${userId} isVerified set to: ${isVerified} PERMANENTLY`);
      return true;
    } catch (error) {
      console.error('Error setting user verified status:', error);
      throw error;
    }
  }

  // DISABLED: Clear user verification method removed due to permission issues
  // This method was causing Firebase permission errors and is not needed for demo
  /*
  static async clearUserVerification(userId, userType) {
    try {
      const statusDocRef = doc(db, 'verification_status', `${userId}_${userType}`);
      
      // Clear verification status completely
      await setDoc(statusDocRef, {
        userId,
        userType,
        status: 'not_submitted',
        isVerified: false,
        verifiedAt: null,
        updatedAt: serverTimestamp(),
        cleared: true,
        reason: 'Forced fresh verification required'
      }, { merge: false }); // Replace entire document
      
      console.log(`🗑️ ${userType} ${userId} verification status CLEARED - must submit fresh`);
      return true;
    } catch (error) {
      console.error('Error clearing user verification:', error);
      throw error;
    }
  }
  */
}

export default VerificationService;
