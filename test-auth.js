// Quick test script to verify Firebase auth is working
import { auth } from './src/config/Firebase';
import { onAuthStateChanged } from 'firebase/auth';

console.log('Testing Firebase Auth...');

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ User is authenticated:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
      emailVerified: user.emailVerified
    });
  } else {
    console.log('❌ User is not authenticated');
  }
});

export default {};
