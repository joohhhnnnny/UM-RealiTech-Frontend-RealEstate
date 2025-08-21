import { db, storage } from '../config/Firebase';
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

export class VerificationService {
  // Submit verification documents
  static async submitVerification(userId, userType, verificationData, documents) {
    try {
      const documentUrls = [];
      
      console.log(`📄 Processing ${documents.length} documents for ${userType} verification...`);
      
      // WORKAROUND FOR CORS ISSUE: Simulate document upload without Firebase Storage
      // In production, you would upload to Firebase Storage
      for (const document of documents) {
        // Create mock document URLs for development
        const documentId = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const mockUrl = `https://firebasestorage.googleapis.com/verification/${userType}/${userId}/${documentId}_${document.name}`;
        
        documentUrls.push({
          id: documentId,
          name: document.name,
          url: mockUrl,
          type: document.type,
          size: document.size,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded', // Mock status for development
          verified: false // Will be set to true when verification is approved
        });
        
        console.log(`✅ Document processed: ${document.name} (${document.type}) - ID: ${documentId}`);
      }

      console.log(`📄 Documents processed (simulated): ${documentUrls.length} files`);

      // Save verification request to Firestore (this should work without CORS issues)
      const verificationRef = collection(db, 'verifications');
      const docRef = await addDoc(verificationRef, {
        userId,
        userType, // 'agent' or 'developer'
        status: 'pending', // pending, verified, rejected
        submittedAt: serverTimestamp(),
        documents: documentUrls,
        verificationData: {
          ...verificationData,
          submittedAt: new Date().toISOString()
        },
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        notes: ''
      });

      // Update user profile with verification status (create if doesn't exist)
      const userRef = doc(db, `${userType}s`, userId);
      
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          verificationStatus: 'pending',
          verificationId: docRef.id,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Updated existing ${userType} profile with verification status`);
      } else {
        // Create new document with basic profile
        const baseProfile = {
          verificationStatus: 'pending',
          verificationId: docRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Add basic fields based on user type
          ...(userType === 'agent' ? {
            name: verificationData.fullName || 'Agent User',
            email: verificationData.email || 'agent@example.com',
            specialization: 'Residential',
            rating: 0,
            deals: 0,
            agency: 'RealiTech Realty',
            bio: 'Professional real estate agent.',
            userId: userId
          } : {}),
          ...(userType === 'developer' ? {
            name: verificationData.fullName || 'Developer User',
            email: verificationData.email || 'developer@example.com',
            company: 'Development Company',
            projects: 0,
            userId: userId
          } : {})
        };
        
        await setDoc(userRef, baseProfile);
        console.log(`✅ Created new ${userType} profile with verification status`);
      }

      console.log('Verification request saved to Firestore with ID:', docRef.id);

      return { success: true, verificationId: docRef.id, documentsCount: documentUrls.length };
    } catch (error) {
      console.error('Error submitting verification:', error);
      
      // Return a more detailed error response
      return { 
        success: false, 
        error: error.message || 'Failed to submit verification',
        verificationId: null 
      };
    }
  }

  // Get verification status for a user
  static async getVerificationStatus(userId, userType) {
    try {
      const userRef = doc(db, `${userType}s`, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          status: userData.verificationStatus || 'not_submitted',
          verificationId: userData.verificationId || null,
          lastUpdated: userData.updatedAt
        };
      }
      
      return { status: 'not_submitted', verificationId: null };
    } catch (error) {
      console.error('Error getting verification status:', error);
      return { status: 'error', verificationId: null };
    }
  }

  // Subscribe to verification status changes
  static subscribeToVerificationStatus(userId, userType, callback) {
    const userRef = doc(db, `${userType}s`, userId);
    
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          status: data.verificationStatus || 'not_submitted',
          verificationId: data.verificationId || null,
          lastUpdated: data.updatedAt
        });
      } else {
        callback({ status: 'not_submitted', verificationId: null });
      }
    });
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

  // Auto-verify based on document analysis (simplified version)
  static async autoVerifyDocuments(verificationId) {
    try {
      const verificationDetails = await this.getVerificationDetails(verificationId);
      if (!verificationDetails) return false;

      // Simple auto-verification logic
      const hasRequiredDocs = verificationDetails.documents.length >= 2;
      const hasValidData = verificationDetails.verificationData?.prcLicense || 
                          verificationDetails.verificationData?.businessPermit;

      if (hasRequiredDocs && hasValidData) {
        // Auto-approve
        await this.updateVerificationStatus(verificationId, 'verified', 'system', 'Auto-verified based on document validation');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in auto-verification:', error);
      return false;
    }
  }

  // Update verification status (for admin or auto-verification)
  static async updateVerificationStatus(verificationId, status, reviewedBy = 'system', notes = '') {
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

  // Clear user verification to force fresh submission
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
}

export default VerificationService;
