// Utility script to fix existing "undefined undefined" agent names in Firebase
// Run this script manually to clean up existing data

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to clean up agent names
const cleanAgentName = (agentName, agentEmail) => {
  if (!agentName || agentName === 'undefined undefined' || agentName.trim() === '' || agentName.includes('undefined')) {
    if (agentEmail) {
      const emailPart = agentEmail.split('@')[0];
      return emailPart.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim() || 'Professional Agent';
    }
    return 'Professional Agent';
  }
  return agentName;
};

// Function to fix agent names in properties collection
async function fixPropertiesCollection() {
  console.log('Fixing agent names in properties collection...');
  
  const propertiesSnapshot = await getDocs(collection(db, 'properties'));
  let fixed = 0;
  
  for (const docSnapshot of propertiesSnapshot.docs) {
    const data = docSnapshot.data();
    if (data.agent_name === 'undefined undefined' || data.agent_name?.includes('undefined')) {
      const cleanedName = cleanAgentName(data.agent_name, data.agent_email);
      await updateDoc(doc(db, 'properties', docSnapshot.id), {
        agent_name: cleanedName
      });
      console.log(`Fixed property ${docSnapshot.id}: "${data.agent_name}" -> "${cleanedName}"`);
      fixed++;
    }
  }
  
  console.log(`Fixed ${fixed} properties`);
}

// Function to fix agent names in listings collection
async function fixListingsCollection() {
  console.log('Fixing agent names in listings collection...');
  
  const listingsSnapshot = await getDocs(collection(db, 'listings'));
  let fixed = 0;
  
  for (const docSnapshot of listingsSnapshot.docs) {
    const data = docSnapshot.data();
    if (data.agentName === 'undefined undefined' || data.agentName?.includes('undefined')) {
      const cleanedName = cleanAgentName(data.agentName, data.agentEmail);
      await updateDoc(doc(db, 'listings', docSnapshot.id), {
        agentName: cleanedName
      });
      console.log(`Fixed listing ${docSnapshot.id}: "${data.agentName}" -> "${cleanedName}"`);
      fixed++;
    }
  }
  
  console.log(`Fixed ${fixed} listings`);
}

// Main function to run the fix
async function main() {
  try {
    console.log('Starting agent name cleanup...');
    await fixPropertiesCollection();
    await fixListingsCollection();
    console.log('Agent name cleanup complete!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Uncomment the line below to run the script
// main();

console.log('Agent name cleanup script ready. Uncomment main() call to run.');
