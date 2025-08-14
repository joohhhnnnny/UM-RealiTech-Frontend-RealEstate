import { useState, useEffect } from "react";
import { RiUserStarLine, RiImageLine, RiLoader4Line } from 'react-icons/ri';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/Firebase';
import ListingForm from '../../../components/ListingForm';
import Toast from '../../../components/Toast';
import { DEFAULT_PROPERTY_IMAGE, INITIAL_LISTING_STATE, debugLog } from '../../../constants/propertyConstants';

// Utility function to fix agent names
const fixAgentName = (agentName, agentEmail) => {
  if (!agentName || agentName === 'undefined undefined' || agentName.trim() === '' || agentName.includes('undefined')) {
    if (agentEmail) {
      const emailPart = agentEmail.split('@')[0];
      return emailPart.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim() || 'Professional Agent';
    }
    return 'Professional Agent';
  }
  return agentName;
};

function MyListing() {
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showEditListingModal, setShowEditListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newListing, setNewListing] = useState(INITIAL_LISTING_STATE);

  // Toast state management
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Toast helper functions
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Function to fix existing agent names for current user
const fixMyAgentNames = async (agent) => {
    if (!currentUser?.uid) return;
    
    try {
      debugLog('Fixing agent names for current user...');
      
      // Fix listings collection
      const listingsQuery = query(collection(db, 'listings'), where('agentId', '==', currentUser.uid));
      const listingsSnapshot = await getDocs(listingsQuery);
      
      for (const docSnapshot of listingsSnapshot.docs) {
        const data = docSnapshot.data();
        if (data.agentName === 'undefined undefined' || data.agentName?.includes('undefined')) {
          const cleanedName = fixAgentName(data.agentName, data.agentEmail || currentUser.email);
          await updateDoc(doc(db, 'listings', docSnapshot.id), {
            agentName: cleanedName
          });
          console.log(`Fixed listing ${docSnapshot.id}: "${data.agentName}" -> "${cleanedName}"`);
        }
      }
      
      // Fix properties collection
      const propertiesQuery = query(collection(db, 'properties'), where('agent_id', '==', currentUser.uid));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      
      for (const docSnapshot of propertiesSnapshot.docs) {
        const data = docSnapshot.data();
        if (data.agent_name === 'undefined undefined' || data.agent_name?.includes('undefined')) {
          const cleanedName = fixAgentName(data.agent_name, data.agent_email || currentUser.email);
          await updateDoc(doc(db, 'properties', docSnapshot.id), {
            agent_name: cleanedName
          });
          console.log(`Fixed property ${docSnapshot.id}: "${data.agent_name}" -> "${cleanedName}"`);
        }
      }
      
      // Refresh the listings by re-running the fetch effect
      if (currentUser?.uid) {
        // Trigger a re-fetch by updating a state that the useEffect depends on
        setLoading(true);
      }
      
      showToast('Agent names have been fixed!', 'success');
    } catch (error) {
      console.error('Error fixing agent names:', error);
      showToast('Error fixing agent names. Check console for details.', 'error');
    }
  };

  // Get current user from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in through Firebase Auth
        debugLog('Firebase user authenticated:', firebaseUser.uid);
        setCurrentUser(firebaseUser);
      } else {
        // No user is signed in, fallback to localStorage
        debugLog('No Firebase user, checking localStorage');
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            console.log('User data from localStorage:', parsedData);
            // Create a user object that mimics Firebase user structure
            console.log('Parsed localStorage data:', parsedData);
            console.log('Available uid fields:', {
              uid: parsedData.uid,
              userNumber: parsedData.userNumber,
              id: parsedData.id
            });
            
            const userObj = {
              uid: parsedData.uid || parsedData.userNumber || parsedData.id,
              email: parsedData.email,
              fullName: parsedData.fullName || `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim(),
              firstName: parsedData.firstName,
              lastName: parsedData.lastName,
              phone: parsedData.phone,
              role: parsedData.role
            };
            
            console.log('Created user object with uid:', userObj.uid);
            setCurrentUser(userObj);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setCurrentUser(null);
          }
        } else {
          console.log('No user data found');
          setCurrentUser(null);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch listings from Firebase
  useEffect(() => {
    const fetchListings = async () => {
      if (!currentUser?.uid) {
        console.log('No current user or uid:', currentUser);
        return;
      }
      
      console.log('Fetching listings for user:', currentUser.uid);
      
      try {
        setLoading(true);
        const listingsRef = collection(db, 'listings');
        
        // For debugging: let's also try fetching all listings to see what's available
        console.log('DEBUG: Fetching all listings to check what exists...');
        const allListingsQuery = query(listingsRef);
        const allSnapshot = await getDocs(allListingsQuery);
        
        console.log('DEBUG: Total listings in database:', allSnapshot.size);
        allSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('DEBUG: Listing agentId:', data.agentId, 'vs current user uid:', currentUser.uid);
        });
        
        // Now run the actual filtered query (without orderBy to avoid composite index issues)
        const q = query(
          listingsRef, 
          where('agentId', '==', currentUser.uid)
        );
        
        console.log('Executing Firestore query...');
        const querySnapshot = await getDocs(q);
        const listings = [];
        
        console.log('Query returned', querySnapshot.size, 'documents');
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Document found:', { 
            id: doc.id, 
            agentId: data.agentId, 
            title: data.title,
            createdAt: data.createdAt 
          });
          listings.push({
            id: doc.id,
            firestoreId: doc.id,
            ...data
          });
        });
        
        console.log('Fetched listings:', listings.length, 'total listings:', listings);
        setMyListings(listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Fallback to empty array
        setMyListings([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchListings();
    }
  }, [currentUser]);

  const handleAddListing = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.uid) {
      showToast('You must be logged in to add a listing', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Debug: Log current user data to understand the structure
      console.log('MyListing: Current user data:', {
        uid: currentUser?.uid,
        fullName: currentUser?.fullName,
        displayName: currentUser?.displayName,
        firstName: currentUser?.firstName,
        lastName: currentUser?.lastName,
        email: currentUser?.email,
        phone: currentUser?.phone
      });
      
      // Create the listing data
      const listingData = {
        title: newListing.title,
        price: newListing.price,
        location: newListing.location,
        type: newListing.type,
        bedrooms: parseInt(newListing.bedrooms) || 0,
        bathrooms: parseInt(newListing.bathrooms) || 0,
        floorArea: newListing.floorArea,
        lotArea: newListing.lotArea || "N/A",
        description: newListing.description || "",
        maps_embed_url: newListing.maps_embed_url || "",
        status: "Available",
        agentId: currentUser.uid,
        agentName: fixAgentName(
          currentUser.fullName || currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
          currentUser.email
        ),
        agentEmail: currentUser.email,
        image: newListing.images?.[0] || newListing.image || DEFAULT_PROPERTY_IMAGE,
        // Professional image handling - filter out empty URLs and ensure array format
        images: newListing.images ? 
          newListing.images.filter(img => img && img.trim() !== '') : 
          (newListing.image ? [newListing.image] : [DEFAULT_PROPERTY_IMAGE]),
        buyers: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create property data for the public properties collection
      const propertyData = {
        title: newListing.title,
        price: newListing.price,
        location: newListing.location,
        type: newListing.type === 'House' || newListing.type === 'Townhouse' || newListing.type === 'Condo' ? 'residential' : 'commercial',
        beds: parseInt(newListing.bedrooms) || 0,
        baths: parseInt(newListing.bathrooms) || 0,
        floor_area_sqm: newListing.floorArea,
        lot_area_sqm: newListing.lotArea || "N/A",
        description: newListing.description || "",
        maps_embed_url: newListing.maps_embed_url || "",
        furnishing: "Bare", // Default value, can be enhanced later
        days_on_market: "New",
        amenities: [], // Can be enhanced later with amenities input
        // Professional image handling for properties collection - filter out empty URLs
        images: newListing.images ? 
          newListing.images.filter(img => img && img.trim() !== '') : 
          (newListing.image ? [newListing.image] : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"]),
        agent_id: currentUser.uid,
        agent_name: fixAgentName(
          currentUser.fullName || currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
          currentUser.email
        ),
        agent_email: currentUser.email,
        agent_contact: currentUser.phone || "",
        developer_id: null, // For agent listings, developer_id is null
        url: "", // Can be generated later if needed
        status: "Available",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to both collections
      const [listingDocRef, propertyDocRef] = await Promise.all([
        addDoc(collection(db, 'listings'), listingData),
        addDoc(collection(db, 'properties'), propertyData)
      ]);
      
      // Add to local state for immediate UI update
      const newListingWithId = {
        id: listingDocRef.id,
        firestoreId: listingDocRef.id,
        propertyId: propertyDocRef.id, // Reference to the property document
        ...listingData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setMyListings(prev => [newListingWithId, ...prev]);
      setShowAddListingModal(false);
      
      // Reset form
      setNewListing(INITIAL_LISTING_STATE);
      
      showToast('Listing added successfully!', 'success');
    } catch (error) {
      console.error('Error adding listing:', error);
      showToast('Error adding listing. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateListing = async (updatedListing) => {
    if (!updatedListing.firestoreId) {
      showToast('Error updating listing', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('MyListing: Updating listing with data:', updatedListing);
      console.log('MyListing: Images to save:', updatedListing.images);
      
      const updateData = {
        title: updatedListing.title,
        price: updatedListing.price,
        location: updatedListing.location,
        type: updatedListing.type,
        bedrooms: parseInt(updatedListing.bedrooms) || 0,
        bathrooms: parseInt(updatedListing.bathrooms) || 0,
        floorArea: updatedListing.floorArea,
        lotArea: updatedListing.lotArea || "N/A",
        maps_embed_url: updatedListing.maps_embed_url || "",
        // Professional image handling - filter out empty URLs
        images: updatedListing.images ? 
          updatedListing.images.filter(img => img && img.trim() !== '') : 
          (updatedListing.image ? [updatedListing.image] : []),
        updatedAt: serverTimestamp()
      };

      // Prepare property update data
      const propertyUpdateData = {
        title: updatedListing.title,
        price: updatedListing.price,
        location: updatedListing.location,
        type: updatedListing.type === 'House' || updatedListing.type === 'Townhouse' || updatedListing.type === 'Condo' ? 'residential' : 'commercial',
        beds: parseInt(updatedListing.bedrooms) || 0,
        baths: parseInt(updatedListing.bathrooms) || 0,
        floor_area_sqm: updatedListing.floorArea,
        lot_area_sqm: updatedListing.lotArea || "N/A",
        maps_embed_url: updatedListing.maps_embed_url || "",
        // Professional image handling for properties collection
        images: updatedListing.images ? 
          updatedListing.images.filter(img => img && img.trim() !== '') : 
          (updatedListing.image ? [updatedListing.image] : []),
        updatedAt: serverTimestamp()
      };

      console.log('MyListing: Final updateData for listings collection:', updateData);
      console.log('MyListing: Final propertyUpdateData for properties collection:', propertyUpdateData);

      // Update listings collection
      await updateDoc(doc(db, 'listings', updatedListing.firestoreId), updateData);
      
      // Find and update corresponding property document
      if (updatedListing.propertyId) {
        await updateDoc(doc(db, 'properties', updatedListing.propertyId), propertyUpdateData);
      } else {
        // Fallback: find property by agent_id and title match
        const propertiesRef = collection(db, 'properties');
        const q = query(
          propertiesRef,
          where('agent_id', '==', currentUser.uid),
          where('title', '==', updatedListing.title)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const propertyDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'properties', propertyDoc.id), propertyUpdateData);
        }
      }
      
      // Update local state
      setMyListings(prev => prev.map(l => 
        l.id === updatedListing.id ? { ...updatedListing, ...updateData } : l
      ));
      
      setShowEditListingModal(false);
      setSelectedListing(null);
      showToast('Listing updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating listing:', error);
      showToast('Error updating listing. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (listing) => {
    if (!listing.firestoreId) {
      showToast('Error deleting listing', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this listing?')) {
      return;
    }

    try {
      // Delete from listings collection
      await deleteDoc(doc(db, 'listings', listing.firestoreId));
      
      // Find and delete corresponding property document
      if (listing.propertyId) {
        await deleteDoc(doc(db, 'properties', listing.propertyId));
      } else {
        // Fallback: find property by agent_id and title match
        const propertiesRef = collection(db, 'properties');
        const q = query(
          propertiesRef,
          where('agent_id', '==', currentUser.uid),
          where('title', '==', listing.title)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const propertyDoc = querySnapshot.docs[0];
          await deleteDoc(doc(db, 'properties', propertyDoc.id));
        }
      }
      
      // Remove from local state
      setMyListings(prev => prev.filter(l => l.id !== listing.id));
      
      showToast('Listing deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting listing:', error);
      showToast('Error deleting listing. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-base-content">My Listings</h2>
        <div className="flex gap-3">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddListingModal(true)}
            disabled={!currentUser}
          >
            Add New Listing
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
            <p className="text-base-content/70">Loading your listings...</p>
          </div>
        </div>
      ) : !currentUser ? (
        <div className="text-center py-12">
          <div className="bg-base-200/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <RiUserStarLine className="w-8 h-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">Please log in</h3>
          <p className="text-base-content/60 text-sm">You need to be logged in to view your listings</p>
        </div>
      ) : myListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-base-200/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <RiImageLine className="w-8 h-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">No listings yet</h3>
          <p className="text-base-content/60 text-sm">Start by adding your first property listing</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => setShowAddListingModal(true)}
          >
            Add Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map(listing => (
            <div key={listing.id} className="card bg-base-100 shadow-xl border border-base-200/60 hover:shadow-2xl transition-all duration-200">
              <figure className="h-48">
                <img 
                  src={listing.images?.[0] || listing.image || DEFAULT_PROPERTY_IMAGE} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_PROPERTY_IMAGE;
                  }}
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-base-content">{listing.title}</h3>
                <p className="text-primary font-bold">{listing.price}</p>
                <p className="text-sm text-base-content/70">{listing.location}</p>
                <div className="flex gap-2 text-sm text-base-content/60">
                  <span>{listing.bedrooms} beds</span>
                  <span>{listing.bathrooms} baths</span>
                  <span>{listing.floorArea} sqm</span>
                </div>
                <div className={`badge ${
                  listing.status === 'Available' ? 'badge-success' :
                  listing.status === 'Under Negotiation' ? 'badge-warning' :
                  'badge-outline'
                }`}>
                  {listing.status}
                </div>
                
                {listing.buyers && listing.buyers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-base-content">Interested Buyers</h4>
                    {listing.buyers.map(buyer => (
                      <div 
                        key={buyer.id}
                        className="bg-base-200 p-3 rounded-lg cursor-pointer hover:bg-base-300 transition-colors"
                        onClick={() => {
                          setSelectedClient(buyer);
                          setSelectedListing(listing);
                        }}
                      >
                        <p className="font-medium text-base-content">{buyer.name}</p>
                        <p className="text-sm text-base-content/70">{buyer.status}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="card-actions justify-end mt-4">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowEditListingModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-error btn-outline btn-sm"
                    onClick={() => handleDeleteListing(listing)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      {showEditListingModal && selectedListing && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-100">
            <h3 className="font-bold text-xl mb-6 text-base-content">Edit Listing</h3>
            <ListingForm
              listing={selectedListing}
              onListingChange={setSelectedListing}
              onSubmit={async (e) => {
                e.preventDefault();
                await handleUpdateListing(selectedListing);
                setShowEditListingModal(false);
                setSelectedListing(null);
              }}
              onCancel={() => {
                setShowEditListingModal(false);
                setSelectedListing(null);
              }}
              submitting={submitting}
              mode="edit"
              showExternalToast={showToast}
            />
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {showAddListingModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-100">
            <h3 className="font-bold text-xl mb-6 text-base-content">Add New Listing</h3>
            <ListingForm
              listing={newListing}
              onListingChange={setNewListing}
              onSubmit={handleAddListing}
              onCancel={() => {
                setShowAddListingModal(false);
                setNewListing(INITIAL_LISTING_STATE);
              }}
              submitting={submitting}
              mode="add"
              showExternalToast={showToast}
            />
          </div>
        </div>
      )}

      {/* Client Documents Modal */}
      {selectedClient && selectedListing && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100">
            <h3 className="font-bold text-lg mb-4 text-base-content">
              {selectedClient.name} - Documents
            </h3>
            <div className="space-y-4">
              {selectedClient.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                  <span className="text-base-content">{doc.name}</span>
                  <span className={`badge ${
                    doc.status === 'verified' ? 'badge-success' :
                    doc.status === 'pending' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedClient(null);
                  setSelectedListing(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        position="top-right"
        duration={4000}
      />
    </div>
  );
}

export default MyListing;