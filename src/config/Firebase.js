// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Initialize Firestore
import { getFirestore } from 'firebase/firestore';
// Initialize Authentication
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPBHSIrx8o7guk5t4ZrlPyXMo95ugpJMk",
  authDomain: "um-realitech-hackestate.firebaseapp.com",
  projectId: "um-realitech-hackestate",
  storageBucket: "um-realitech-hackestate.firebasestorage.app",
  messagingSenderId: "789818018946",
  appId: "1:789818018946:web:ff3b65362d33febab8f89b",
  measurementId: "G-EQ79GK6QML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export { analytics };