// Simple test component to verify Firebase listings
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../config/Firebase.js';

const FirebaseListingsTest = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testFirebaseListings = async () => {
    try {
      console.log('Testing Firebase listings connection...');
      setLoading(true);
      setError(null);

      const listingsRef = collection(db, 'listings');
      
      // Try simple query first
      let querySnapshot;
      try {
        const simpleQuery = query(listingsRef, limit(10));
        querySnapshot = await getDocs(simpleQuery);
        console.log(`Firebase returned ${querySnapshot.size} documents`);
      } catch (queryError) {
        console.error('Query failed:', queryError);
        setError(queryError.message);
        return;
      }

      const fetchedListings = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Document data:', doc.id, data);
        fetchedListings.push({
          id: doc.id,
          ...data
        });
      });

      setListings(fetchedListings);
      console.log('Successfully fetched listings:', fetchedListings);
      
    } catch (err) {
      console.error('Error testing Firebase:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testFirebaseListings();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Listings Test</h2>
      
      <button
        onClick={testFirebaseListings}
        className="btn btn-primary mb-4"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>

      {error && (
        <div className="alert alert-error mb-4">
          <span>Error: {error}</span>
        </div>
      )}

      <div className="stats stats-vertical lg:stats-horizontal shadow mb-4">
        <div className="stat">
          <div className="stat-title">Total Listings Found</div>
          <div className="stat-value">{listings.length}</div>
          <div className="stat-desc">In Firebase collection</div>
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sample Listings:</h3>
          {listings.slice(0, 3).map((listing) => (
            <div key={listing.id} className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h4 className="card-title text-sm">{listing.title || 'No Title'}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Price:</strong> {listing.price || 'N/A'}</div>
                  <div><strong>Location:</strong> {listing.location || 'N/A'}</div>
                  <div><strong>Beds:</strong> {listing.beds || 'N/A'}</div>
                  <div><strong>Baths:</strong> {listing.baths || 'N/A'}</div>
                  <div><strong>Status:</strong> {listing.status || 'N/A'}</div>
                  <div><strong>Type:</strong> {listing.type || 'N/A'}</div>
                </div>
                {listing.images && listing.images.length > 0 && (
                  <div className="mt-2">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {listings.length > 3 && (
            <div className="text-center text-sm text-gray-500">
              ... and {listings.length - 3} more listings
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="alert alert-warning">
            <span>No listings found in Firebase. The 'listings' collection might be empty.</span>
          </div>
        )
      )}

      {/* Raw data for debugging */}
      {listings.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold">Raw Data (Debug)</summary>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-xs overflow-auto max-h-60">
            {JSON.stringify(listings.slice(0, 2), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default FirebaseListingsTest;
