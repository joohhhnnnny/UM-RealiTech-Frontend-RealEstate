import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/Firebase.js';

const FirebasePopulateListings = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [listingsCount, setListingsCount] = useState(0);

  const checkExistingListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'listings'));
      setListingsCount(querySnapshot.size);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error checking listings:', error);
      return 0;
    }
  };

  const clearListings = async () => {
    if (!confirm('Are you sure you want to delete all listings? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'listings'));
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      setResult(`Deleted ${querySnapshot.size} listings successfully!`);
      setListingsCount(0);
    } catch (error) {
      setResult(`Error deleting listings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const populateFromJSON = async () => {
    setLoading(true);
    setResult('');

    try {
      // Check if listings already exist
      const existingCount = await checkExistingListings();
      if (existingCount > 0) {
        setResult(`Found ${existingCount} existing listings. Use Clear Listings first if you want to repopulate.`);
        setLoading(false);
        return;
      }

      // Dynamic import of the JSON data
      const { default: listingsData } = await import('../json/listings.json');
      
      console.log(`Starting to populate ${listingsData.length} listings...`);
      
      let successCount = 0;
      let errorCount = 0;

      // Add documents to Firestore in batches
      for (const listing of listingsData) {
        try {
          // Clean and normalize the data for Firebase
          const cleanListing = {
            ...listing,
            // Add required fields for compatibility
            status: 'Available',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            
            // Ensure numeric fields are properly converted
            beds: parseInt(listing.beds) || 0,
            baths: parseInt(listing.baths) || 0,
            lot_area_sqm: parseInt(listing.lot_area_sqm) || 0,
            floor_area_sqm: parseInt(listing.floor_area_sqm) || 0,
            
            // Ensure arrays exist
            amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
            images: Array.isArray(listing.images) ? listing.images : [],
            
            // Add property type based on title for better filtering
            type: listing.title?.toLowerCase().includes('condo') ? 'condo' :
                  listing.title?.toLowerCase().includes('apartment') ? 'apartment' :
                  listing.title?.toLowerCase().includes('lot') ? 'lot' : 'house',
                  
            // Ensure required fields exist
            title: listing.title || 'Untitled Property',
            location: listing.location || 'Location not specified',
            price: listing.price || '₱ 0'
          };
          
          await addDoc(collection(db, 'listings'), cleanListing);
          successCount++;
          
          if (successCount % 10 === 0) {
            setResult(`Populating... ${successCount}/${listingsData.length} complete`);
          }
        } catch (error) {
          console.error('Error adding listing:', error);
          errorCount++;
        }
      }
      
      setResult(`✅ Successfully populated ${successCount} listings! ${errorCount > 0 ? `(${errorCount} errors)` : ''}`);
      setListingsCount(successCount);
      
    } catch (error) {
      console.error('Error populating listings:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkExistingListings();
  }, []);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Populate Listings from JSON</h2>
        
        <div className="stats stats-vertical lg:stats-horizontal shadow mb-4">
          <div className="stat">
            <div className="stat-title">Current Listings</div>
            <div className="stat-value text-primary">{listingsCount}</div>
            <div className="stat-desc">In Firebase database</div>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={populateFromJSON}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Populating...
              </>
            ) : (
              'Populate from JSON'
            )}
          </button>
          
          <button
            onClick={checkExistingListings}
            disabled={loading}
            className="btn btn-secondary"
          >
            Refresh Count
          </button>
          
          <button
            onClick={clearListings}
            disabled={loading || listingsCount === 0}
            className="btn btn-error"
          >
            Clear All Listings
          </button>
        </div>

        {result && (
          <div className={`alert ${result.includes('Error') || result.includes('❌') ? 'alert-error' : 'alert-success'}`}>
            <span>{result}</span>
          </div>
        )}

        <div className="text-sm text-gray-600 mt-4">
          <p><strong>Note:</strong> This will populate the Firebase 'listings' collection with data from the JSON file.</p>
          <p>Each listing will have proper fields like status, createdAt, type, etc. for compatibility with the chatbot.</p>
        </div>
      </div>
    </div>
  );
};

export default FirebasePopulateListings;
