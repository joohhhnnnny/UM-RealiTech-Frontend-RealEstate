import { useAuth } from '../contexts/AuthContext';
import { useEffect, useCallback } from 'react';
import ActivityLoggerService from '../services/ActivityLoggerService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/Firebase';

/**
 * Enhanced Authentication Hook with Activity Logging
 * Automatically logs all authentication activities
 */
export const useAuthWithActivityLogging = () => {
  const authContext = useAuth();
  const { currentUser } = authContext;

  // Log user session on component mount (if user is already logged in)
  useEffect(() => {
    if (currentUser) {
      ActivityLoggerService.logAuthActivity(
        currentUser.uid, 
        ActivityLoggerService.ACTIVITY_TYPES.LOGIN,
        {
          loginMethod: 'session_restore',
          email: currentUser.email,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        }
      ).catch(error => {
        console.error('Failed to log session restore:', error);
      });
    }
  }, [currentUser]);

  // Enhanced login with activity logging
  const loginWithLogging = useCallback(async (email, password, additionalDetails = {}) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Log successful login
      await ActivityLoggerService.logAuthActivity(
        user.uid,
        ActivityLoggerService.ACTIVITY_TYPES.LOGIN,
        {
          email: user.email,
          loginMethod: 'email_password',
          timestamp: new Date().toISOString(),
          lastLoginAt: user.metadata.lastSignInTime,
          createdAt: user.metadata.creationTime,
          isEmailVerified: user.emailVerified,
          ...additionalDetails
        }
      );

      console.log('User logged in and activity logged successfully');
      return userCredential;
    } catch (error) {
      // Log failed login attempt (without sensitive data)
      if (email) {
        try {
          await ActivityLoggerService.logGeneralActivity(
            'anonymous',
            'login_failed',
            ActivityLoggerService.CATEGORIES.AUTHENTICATION,
            {
              email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partially hide email
              errorCode: error.code,
              errorMessage: error.message,
              timestamp: new Date().toISOString(),
              attemptedLoginMethod: 'email_password'
            }
          );
        } catch (loggingError) {
          console.error('Failed to log failed login attempt:', loggingError);
        }
      }
      
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  // Enhanced signup with activity logging
  const signupWithLogging = useCallback(async (email, password, additionalDetails = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Log successful signup
      await ActivityLoggerService.logAuthActivity(
        user.uid,
        ActivityLoggerService.ACTIVITY_TYPES.SIGNUP,
        {
          email: user.email,
          signupMethod: 'email_password',
          timestamp: new Date().toISOString(),
          createdAt: user.metadata.creationTime,
          isEmailVerified: user.emailVerified,
          ...additionalDetails
        }
      );

      console.log('User signed up and activity logged successfully');
      return userCredential;
    } catch (error) {
      // Log failed signup attempt
      if (email) {
        try {
          await ActivityLoggerService.logGeneralActivity(
            'anonymous',
            'signup_failed',
            ActivityLoggerService.CATEGORIES.AUTHENTICATION,
            {
              email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partially hide email
              errorCode: error.code,
              errorMessage: error.message,
              timestamp: new Date().toISOString(),
              attemptedSignupMethod: 'email_password'
            }
          );
        } catch (loggingError) {
          console.error('Failed to log failed signup attempt:', loggingError);
        }
      }
      
      console.error('Signup failed:', error);
      throw error;
    }
  }, []);

  // Enhanced logout with activity logging
  const logoutWithLogging = useCallback(async (additionalDetails = {}) => {
    const user = currentUser;
    
    try {
      // Log logout before actually signing out
      if (user) {
        await ActivityLoggerService.logAuthActivity(
          user.uid,
          ActivityLoggerService.ACTIVITY_TYPES.LOGOUT,
          {
            email: user.email,
            logoutMethod: 'manual',
            timestamp: new Date().toISOString(),
            sessionDuration: user.metadata.lastSignInTime ? 
              Date.now() - new Date(user.metadata.lastSignInTime).getTime() : 0,
            ...additionalDetails
          }
        );
      }

      await signOut(auth);
      console.log('User logged out and activity logged successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [currentUser]);

  // Enhanced password reset with activity logging
  const resetPasswordWithLogging = useCallback(async (email, additionalDetails = {}) => {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Log password reset request
      await ActivityLoggerService.logGeneralActivity(
        'anonymous',
        ActivityLoggerService.ACTIVITY_TYPES.PASSWORD_RESET,
        ActivityLoggerService.CATEGORIES.AUTHENTICATION,
        {
          email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Partially hide email
          timestamp: new Date().toISOString(),
          resetMethod: 'email',
          ...additionalDetails
        }
      );

      console.log('Password reset email sent and activity logged');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }, []);

  // Log navigation activities
  const logNavigation = useCallback(async (fromPath, toPath, additionalDetails = {}) => {
    if (currentUser) {
      try {
        await ActivityLoggerService.logGeneralActivity(
          currentUser.uid,
          ActivityLoggerService.ACTIVITY_TYPES.NAVIGATION,
          ActivityLoggerService.CATEGORIES.NAVIGATION,
          {
            fromPath,
            toPath,
            timestamp: new Date().toISOString(),
            ...additionalDetails
          }
        );
      } catch (error) {
        console.error('Failed to log navigation:', error);
      }
    }
  }, [currentUser]);

  // Log search activities
  const logSearch = useCallback(async (searchTerm, searchType, results = [], additionalDetails = {}) => {
    if (currentUser) {
      try {
        await ActivityLoggerService.logGeneralActivity(
          currentUser.uid,
          ActivityLoggerService.ACTIVITY_TYPES.SEARCH,
          ActivityLoggerService.CATEGORIES.SEARCH_ACTIVITY,
          {
            searchTerm,
            searchType,
            resultCount: results.length,
            timestamp: new Date().toISOString(),
            ...additionalDetails
          }
        );
      } catch (error) {
        console.error('Failed to log search activity:', error);
      }
    }
  }, [currentUser]);

  // Log property view activities
  const logPropertyView = useCallback(async (propertyId, propertyDetails = {}, additionalDetails = {}) => {
    if (currentUser) {
      try {
        await ActivityLoggerService.logGeneralActivity(
          currentUser.uid,
          ActivityLoggerService.ACTIVITY_TYPES.PROPERTY_VIEW,
          ActivityLoggerService.CATEGORIES.PROPERTY_MANAGEMENT,
          {
            propertyId,
            propertyType: propertyDetails.type,
            propertyPrice: propertyDetails.price,
            propertyLocation: propertyDetails.location,
            timestamp: new Date().toISOString(),
            ...additionalDetails
          }
        );
      } catch (error) {
        console.error('Failed to log property view:', error);
      }
    }
  }, [currentUser]);

  return {
    ...authContext,
    // Enhanced authentication methods
    loginWithLogging,
    signupWithLogging,
    logoutWithLogging,
    resetPasswordWithLogging,
    
    // Activity logging methods
    logNavigation,
    logSearch,
    logPropertyView,
    
    // Direct access to the logging service
    ActivityLogger: ActivityLoggerService
  };
};
