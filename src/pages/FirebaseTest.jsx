import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, onAuthStateChanged } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../config/Firebase';
import FirebaseListingsTest from '../components/FirebaseListingsTest';
import FirebasePopulateListings from '../components/FirebasePopulateListings';

const FirebaseTest = () => {
  const [user, setUser] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log('Auth state changed:', user ? user.uid : 'No user');
    });

    return () => unsubscribe();
  }, []);

  const testFirestoreWrite = async () => {
    if (!user) {
      setTestResult('No authenticated user');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'test_listings'), {
        title: 'Test Property',
        agentId: user.uid,
        isActive: true,
        createdAt: new Date(),
        price: '1000000'
      });
      setTestResult(`Success! Document written with ID: ${docRef.id}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
      console.error('Error writing document:', error);
    }
    setLoading(false);
  };

  const testFirestoreRead = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'test_listings'));
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setTestResult(`Found ${docs.length} test documents: ${JSON.stringify(docs)}`);
    } catch (error) {
      setTestResult(`Read Error: ${error.message}`);
      console.error('Error reading documents:', error);
    }
    setLoading(false);
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      // Replace with actual test credentials or create test account
      await signInWithEmailAndPassword(auth, 'test@example.com', 'testpassword');
      setTestResult('Auth test successful');
    } catch (error) {
      setTestResult(`Auth Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Test Page</h1>
      
      {/* Authentication Test Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Authentication Test</h2>
          
          <div className="mb-4">
            <p><strong>Auth Status:</strong> {user ? `Logged in as ${user.uid}` : 'Not logged in'}</p>
          </div>

          <div className="flex gap-4 mb-4">
            <button 
              onClick={testAuth} 
              disabled={loading}
              className="btn btn-primary"
            >
              Test Auth
            </button>
            <button 
              onClick={testFirestoreWrite} 
              disabled={loading || !user}
              className="btn btn-secondary"
            >
              Test Write
            </button>
            <button 
              onClick={testFirestoreRead} 
              disabled={loading}
              className="btn btn-accent"
            >
              Test Read
            </button>
          </div>

          {loading && <div className="loading loading-spinner loading-md"></div>}
          
          {testResult && (
            <div className="alert alert-info">
              <span><strong>Result:</strong> {testResult}</span>
            </div>
          )}
        </div>
      </div>

      {/* Populate Listings Section */}
      <FirebasePopulateListings />

      {/* Listings Test Section */}
      <FirebaseListingsTest />
    </div>
  );
};

export default FirebaseTest;
