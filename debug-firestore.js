// Debug script to check Firestore data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPBHSIrx8o7guk5t4ZrlPyXMo95ugpJMk",
  authDomain: "um-realitech-hackestate.firebaseapp.com",
  projectId: "um-realitech-hackestate",
  storageBucket: "um-realitech-hackestate.firebasestorage.app",
  messagingSenderId: "789818018946",
  appId: "1:789818018946:web:ff3b65362d33febab8f89b",
  measurementId: "G-EQ79GK6QML"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirestoreData() {
  try {
    console.log('Checking listings collection...');
    const listingsSnapshot = await getDocs(collection(db, 'listings'));
    console.log('Listings count:', listingsSnapshot.size);
    
    listingsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Listing:', {
        id: doc.id,
        title: data.title,
        agentId: data.agentId,
        createdAt: data.createdAt,
        isActive: data.isActive
      });
    });
    
    console.log('\nChecking properties collection...');
    const propertiesSnapshot = await getDocs(collection(db, 'properties'));
    console.log('Properties count:', propertiesSnapshot.size);
    
    propertiesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Property:', {
        id: doc.id,
        title: data.title,
        agentId: data.agentId,
        createdAt: data.createdAt,
        isActive: data.isActive
      });
    });
    
  } catch (error) {
    console.error('Error checking Firestore:', error);
  }
}

checkFirestoreData();
