import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/Firebase';
import { auditLogger } from '../services/AuditLoggerService';

/**
 * Custom hook for authentication with comprehensive logging
 */
export const useAuthWithLogging = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let sessionStartTime = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User logged in
        setCurrentUser(user);
        setIsLoggedIn(true);
        sessionStartTime = new Date();

        // Log login activity
        await auditLogger.logAuth(user.uid, 'login', {
          method: 'firebase_auth',
          userEmail: user.email,
          displayName: user.displayName,
          loginTime: sessionStartTime.toISOString(),
          providerData: user.providerData?.map(p => ({
            providerId: p.providerId,
            uid: p.uid
          }))
        });

        // Log navigation to main app
        await auditLogger.logNavigation(user.uid, 'auth_page', 'dashboard');
      } else {
        // User logged out or session ended
        if (currentUser && sessionStartTime) {
          const sessionDuration = new Date() - sessionStartTime;
          
          // Log logout activity
          await auditLogger.logAuth(currentUser.uid, 'logout', {
            sessionDuration: Math.round(sessionDuration / 1000), // in seconds
            logoutTime: new Date().toISOString(),
            sessionStartTime: sessionStartTime.toISOString()
          });
        }

        setCurrentUser(null);
        setIsLoggedIn(false);
        sessionStartTime = null;
      }
      setLoading(false);
    });

    // Cleanup function
    return () => {
      if (currentUser && sessionStartTime) {
        // Log session end on component unmount
        auditLogger.logAuth(currentUser.uid, 'session_end', {
          reason: 'component_unmount',
          sessionDuration: Math.round((new Date() - sessionStartTime) / 1000)
        });
      }
      unsubscribe();
    };
  }, [currentUser]);

  // Enhanced logout function with logging
  const logoutWithLogging = async () => {
    if (currentUser) {
      try {
        // Log logout attempt
        await auditLogger.logAuth(currentUser.uid, 'logout_initiated', {
          method: 'user_action',
          timestamp: new Date().toISOString()
        });

        await signOut(auth);
        
        // Log successful logout (will be caught by auth state change)
        return { success: true };
      } catch (error) {
        // Log logout error
        await auditLogger.logError(currentUser?.uid, error, {
          action: 'logout_attempt',
          errorType: 'auth_error'
        });
        
        return { success: false, error };
      }
    }
  };

  return {
    currentUser,
    loading,
    isLoggedIn,
    logoutWithLogging
  };
};

export default useAuthWithLogging;
