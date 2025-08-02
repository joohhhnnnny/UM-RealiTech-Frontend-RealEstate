import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPBHSIrx8o7guk5t4ZrlPyXMo95ugpJMk",
  authDomain: "um-realitech-hackestate.firebaseapp.com",
  projectId: "um-realitech-hackestate",
  storageBucket: "um-realitech-hackestate.firebasestorage.app",
  messagingSenderId: "789818018946",
  appId: "1:789818018946:web:ff3b65362d33febab8f89b",
  measurementId: "G-EQ79GK6QML"
};

class AuditLogger {
  constructor() {
    // Initialize Firebase if it hasn't been initialized yet
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    this.db = getFirestore();
  }

  async logEvent(data) {
    try {
      const logEntry = {
        ...data,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      };

      await addDoc(collection(this.db, 'audit_logs'), logEntry);
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }
}

// Create a singleton instance
let auditLoggerInstance = null;

export const auditLogger = (() => {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger();
  }
  return auditLoggerInstance;
})();
