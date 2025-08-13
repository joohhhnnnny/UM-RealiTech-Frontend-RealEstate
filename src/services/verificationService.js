import { db, storage } from '../config/Firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
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
      
      // Upload documents to Firebase Storage
      for (const document of documents) {
        const storageRef = ref(storage, `verification/${userType}/${userId}/${document.name}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, document);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        documentUrls.push({
          name: document.name,
          url: downloadURL,
          type: document.type,
          size: document.size,
          uploadedAt: new Date().toISOString()
        });
      }

      // Save verification request to Firestore
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

      // Update user profile with verification status
      const userRef = doc(db, `${userType}s`, userId);
      await updateDoc(userRef, {
        verificationStatus: 'pending',
        verificationId: docRef.id,
        updatedAt: serverTimestamp()
      });

      return { success: true, verificationId: docRef.id };
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
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
      const verificationRef = doc(db, 'verifications', verificationId);
      const updateData = {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy,
        notes
      };

      if (status === 'rejected') {
        updateData.rejectionReason = notes;
      }

      await updateDoc(verificationRef, updateData);

      // Get verification details to update user profile
      const verificationDoc = await getDoc(verificationRef);
      if (verificationDoc.exists()) {
        const verificationData = verificationDoc.data();
        const userRef = doc(db, `${verificationData.userType}s`, verificationData.userId);
        
        await updateDoc(userRef, {
          verificationStatus: status,
          updatedAt: serverTimestamp()
        });
      }

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
}

export default VerificationService;
