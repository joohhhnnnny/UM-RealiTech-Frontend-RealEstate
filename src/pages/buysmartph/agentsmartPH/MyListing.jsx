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

function MyListing() {
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showEditListingModal, setShowEditListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in through Firebase Auth
        console.log('Firebase user authenticated:', firebaseUser.uid);
        setCurrentUser(firebaseUser);
      } else {
        // No user is signed in, fallback to localStorage
        console.log('No Firebase user, checking localStorage');
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

  const [newListing, setNewListing] = useState({
    title: "",
    price: "",
    location: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    floorArea: "",
    lotArea: "",
    image: "",
    imageFile: null,
    description: "",
    maps_embed_url: ""
  });

  const handleAddListing = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.uid) {
      alert('You must be logged in to add a listing');
      return;
    }
    
    try {
      setSubmitting(true);
      
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
        agentName: currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`,
        agentEmail: currentUser.email,
        image: newListing.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
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
        images: [newListing.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"],
        agent_id: currentUser.uid,
        agent_name: currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`,
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
      setNewListing({
        title: "",
        price: "",
        location: "",
        type: "",
        bedrooms: "",
        bathrooms: "",
        floorArea: "",
        lotArea: "",
        image: "",
        imageFile: null,
        description: "",
        maps_embed_url: ""
      });
      
      alert('Listing added successfully!');
    } catch (error) {
      console.error('Error adding listing:', error);
      alert('Error adding listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateListing = async (updatedListing) => {
    if (!updatedListing.firestoreId) {
      alert('Error updating listing');
      return;
    }

    try {
      setSubmitting(true);
      
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
        updatedAt: serverTimestamp()
      };

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
      alert('Listing updated successfully!');
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Error updating listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (listing) => {
    if (!listing.firestoreId) {
      alert('Error deleting listing');
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
      
      alert('Listing deleted successfully!');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error deleting listing. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-base-content">My Listings</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddListingModal(true)}
          disabled={!currentUser}
        >
          Add New Listing
        </button>
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
                  src={listing.image} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";
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
                  <span>{listing.floorArea}</span>
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
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleUpdateListing(selectedListing);
              setShowEditListingModal(false);
              setSelectedListing(null);
            }} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-100 text-base-content"
                  value={selectedListing.title}
                  onChange={e => setSelectedListing({...selectedListing, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Price</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-100 text-base-content"
                  value={selectedListing.price}
                  onChange={e => setSelectedListing({...selectedListing, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-base-100 text-base-content"
                  value={selectedListing.location}
                  onChange={e => setSelectedListing({...selectedListing, location: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Type</span>
                </label>
                <select
                  className="select select-bordered bg-base-100 text-base-content"
                  value={selectedListing.type}
                  onChange={e => setSelectedListing({...selectedListing, type: e.target.value})}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="House">House</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Condo">Condo</option>
                  <option value="Lot">Lot</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Bedrooms</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered bg-base-100 text-base-content"
                    value={selectedListing.bedrooms}
                    onChange={e => setSelectedListing({...selectedListing, bedrooms: e.target.value})}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Bathrooms</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered bg-base-100 text-base-content"
                    value={selectedListing.bathrooms}
                    onChange={e => setSelectedListing({...selectedListing, bathrooms: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Floor Area</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-100 text-base-content"
                    placeholder="e.g. 120 sqm"
                    value={selectedListing.floorArea}
                    onChange={e => setSelectedListing({...selectedListing, floorArea: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Lot Area</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-100 text-base-content"
                    placeholder="e.g. 100 sqm"
                    value={selectedListing.lotArea}
                    onChange={e => setSelectedListing({...selectedListing, lotArea: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Maps Embed URL for Edit Modal */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Google Maps Embed URL (Optional)</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered bg-base-100 text-base-content"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  value={selectedListing.maps_embed_url || ""}
                  onChange={e => setSelectedListing({...selectedListing, maps_embed_url: e.target.value})}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">Google Maps embed URL for property location</span>
                </label>
              </div>
              
              <div className="modal-action">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RiLoader4Line className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowEditListingModal(false);
                    setSelectedListing(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {showAddListingModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-100">
            <h3 className="font-bold text-xl mb-6 text-base-content">Add New Listing</h3>
            <form onSubmit={handleAddListing} className="space-y-6">
              {/* Title Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                  value={newListing.title}
                  onChange={e => setNewListing({...newListing, title: e.target.value})}
                  placeholder="Enter property title"
                  required
                />
              </div>

              {/* Price Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Price</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70">₱</span>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-7 mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                    value={newListing.price}
                    onChange={e => setNewListing({...newListing, price: e.target.value})}
                    placeholder="Enter property price"
                    required
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                  value={newListing.location}
                  onChange={e => setNewListing({...newListing, location: e.target.value})}
                  placeholder="Enter property location"
                  required
                />
              </div>

              {/* Type Select */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Property Type</span>
                </label>
                <select
                  className="select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                  value={newListing.type}
                  onChange={e => setNewListing({...newListing, type: e.target.value})}
                  required
                >
                  <option value="">Select property type</option>
                  <option value="House">House</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Condo">Condo</option>
                  <option value="Lot">Lot</option>
                </select>
              </div>

              {/* Bedrooms and Bathrooms */}
              <div className="grid grid-cols-2 gap-6">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Bedrooms</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                    value={newListing.bedrooms}
                    onChange={e => setNewListing({...newListing, bedrooms: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Bathrooms</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                    value={newListing.bathrooms}
                    onChange={e => setNewListing({...newListing, bathrooms: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Floor Area and Lot Area */}
              <div className="grid grid-cols-2 gap-6">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Floor Area</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                    placeholder="e.g. 120 sqm"
                    value={newListing.floorArea}
                    onChange={e => setNewListing({...newListing, floorArea: e.target.value})}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Lot Area</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                    placeholder="e.g. 100 sqm"
                    value={newListing.lotArea}
                    onChange={e => setNewListing({...newListing, lotArea: e.target.value})}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Description (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                  placeholder="Describe the property features, amenities, etc."
                  value={newListing.description}
                  onChange={e => setNewListing({...newListing, description: e.target.value})}
                  rows="3"
                />
              </div>

              {/* Image URL */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Property Image URL (Optional)</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                  placeholder="https://example.com/image.jpg"
                  value={newListing.image}
                  onChange={e => setNewListing({...newListing, image: e.target.value})}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">Provide a direct URL to the property image</span>
                </label>
              </div>

              {/* Maps Embed URL */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Google Maps Embed URL (Optional)</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  value={newListing.maps_embed_url}
                  onChange={e => setNewListing({...newListing, maps_embed_url: e.target.value})}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">Google Maps embed URL for property location (from Google Maps &gt; Share &gt; Embed)</span>
                </label>
              </div>

              <div className="modal-action pt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RiLoader4Line className="w-4 h-4 animate-spin mr-2" />
                      Adding Listing...
                    </>
                  ) : (
                    'Add Listing'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowAddListingModal(false);
                    // Reset form when canceling
                    setNewListing({
                      title: "",
                      price: "",
                      location: "",
                      type: "",
                      bedrooms: "",
                      bathrooms: "",
                      floorArea: "",
                      lotArea: "",
                      image: "",
                      imageFile: null,
                      description: "",
                      maps_embed_url: ""
                    });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
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
    </div>
  );
}

export default MyListing;