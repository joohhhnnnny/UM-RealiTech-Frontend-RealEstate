import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/Firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Professional User Profile Management Service
 * Handles buyer profile persistence, retrieval, and updates
 */
class UserProfileService {
  constructor() {
    this.collectionName = 'userProfiles';
  }

  /**
   * Get the current authenticated user with proper state handling
   * @returns {Promise<Object|null>} Current user object or null
   */
  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Get the current authenticated user synchronously (use with caution)
   * @returns {Object|null} Current user object or null
   */
  getCurrentUserSync() {
    return auth.currentUser;
  }

  /**
   * Generate user profile document reference
   * @param {string} userId - User ID
   * @returns {Object} Firestore document reference
   */
  getUserProfileRef(userId) {
    return doc(db, this.collectionName, userId);
  }

  /**
   * Save or update user profile to Firestore
   * @param {Object} profileData - Profile data to save
   * @param {string} profileData.buyerType - Type of buyer
   * @param {string} profileData.monthlyIncome - Monthly income
   * @param {string} profileData.monthlyDebts - Monthly debts
   * @param {boolean} profileData.hasSpouseIncome - Has spouse income
   * @param {string} profileData.preferredLocation - Preferred location
   * @param {string} profileData.budgetRange - Budget range
   * @returns {Promise<Object>} Success/error response
   */
  async saveProfile(profileData) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const profileDoc = {
        ...profileData,
        userId: user.uid,
        userEmail: user.email,
        profileCompletedAt: new Date(),
        lastUpdatedAt: new Date(),
        isProfileComplete: true,
        version: 1 // For future profile schema updates
      };

      const userProfileRef = this.getUserProfileRef(user.uid);
      await setDoc(userProfileRef, profileDoc, { merge: true });

      console.log('UserProfileService: Profile saved successfully', {
        userId: user.uid,
        profileData: profileDoc
      });

      return {
        success: true,
        message: 'Profile saved successfully',
        profileData: profileDoc
      };
    } catch (error) {
      console.error('UserProfileService: Error saving profile:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save profile'
      };
    }
  }

  /**
   * Retrieve user profile from Firestore
   * @param {string} userId - Optional user ID, defaults to current user
   * @returns {Promise<Object>} Profile data or null
   */
  async getProfile(userId = null) {
    try {
      const user = await this.getCurrentUser();
      const targetUserId = userId || user?.uid;
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const userProfileRef = this.getUserProfileRef(targetUserId);
      const profileDoc = await getDoc(userProfileRef);

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        console.log('UserProfileService: Profile retrieved successfully', {
          userId: targetUserId,
          hasProfile: true,
          isComplete: profileData.isProfileComplete
        });

        return {
          success: true,
          profileData,
          exists: true
        };
      } else {
        console.log('UserProfileService: No profile found for user', targetUserId);
        return {
          success: true,
          profileData: null,
          exists: false
        };
      }
    } catch (error) {
      console.error('UserProfileService: Error retrieving profile:', error);
      return {
        success: false,
        error: error.message,
        profileData: null,
        exists: false
      };
    }
  }

  /**
   * Update existing user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Success/error response
   */
  async updateProfile(updates) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        ...updates,
        lastUpdatedAt: new Date(),
        isProfileComplete: true
      };

      const userProfileRef = this.getUserProfileRef(user.uid);
      await updateDoc(userProfileRef, updateData);

      console.log('UserProfileService: Profile updated successfully', {
        userId: user.uid,
        updates: updateData
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        updates: updateData
      };
    } catch (error) {
      console.error('UserProfileService: Error updating profile:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update profile'
      };
    }
  }

  /**
   * Check if user has a complete profile
   * @param {string} userId - Optional user ID
   * @returns {Promise<boolean>} True if profile is complete
   */
  async hasCompleteProfile(userId = null) {
    try {
      const response = await this.getProfile(userId);
      return response.exists && response.profileData?.isProfileComplete === true;
    } catch (error) {
      console.error('UserProfileService: Error checking profile completion:', error);
      return false;
    }
  }

  /**
   * Delete user profile (for cleanup/reset purposes)
   * @param {string} userId - Optional user ID
   * @returns {Promise<Object>} Success/error response
   */
  async deleteProfile(userId = null) {
    try {
      const user = await this.getCurrentUser();
      const targetUserId = userId || user?.uid;
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const userProfileRef = this.getUserProfileRef(targetUserId);
      await deleteDoc(userProfileRef);

      console.log('UserProfileService: Profile deleted successfully', targetUserId);
      return {
        success: true,
        message: 'Profile deleted successfully'
      };
    } catch (error) {
      console.error('UserProfileService: Error deleting profile:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete profile'
      };
    }
  }

  /**
   * Validate profile data completeness
   * @param {Object} profileData - Profile data to validate
   * @returns {Object} Validation result
   */
  validateProfile(profileData) {
    const requiredFields = [
      'buyerType',
      'monthlyIncome',
      'preferredLocation',
      'budgetRange'
    ];

    const missingFields = requiredFields.filter(field => !profileData[field]);
    const isValid = missingFields.length === 0;

    return {
      isValid,
      missingFields,
      completionPercentage: Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
    };
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
export default UserProfileService;
