import { useState } from "react";
import { RiUserStarLine } from 'react-icons/ri';

function MyListing() {
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showEditListingModal, setShowEditListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [myListings, setMyListings] = useState([
    {
      id: 1,
      title: "Modern Townhouse",
      price: "₱5,500,000",
      location: "Quezon City",
      type: "Townhouse",
      bedrooms: 3,
      bathrooms: 2,
      floorArea: "120 sqm",
      lotArea: "100 sqm",
      status: "Available",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
      buyers: [
        {
          id: 1,
          name: "Michael Anderson",
          status: "Document Review",
          documents: [
            { name: "Valid ID", status: "verified" },
            { name: "Proof of Income", status: "pending" },
            { name: "Bank Statement", status: "submitted" }
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Luxury Condo Unit",
      price: "₱8,500,000",
      location: "Makati City",
      type: "Condo",
      bedrooms: 2,
      bathrooms: 2,
      floorArea: "85 sqm",
      lotArea: "N/A",
      status: "Available",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
      buyers: []
    },
    {
      id: 3,
      title: "Family House",
      price: "₱7,200,000",
      location: "Pasig City",
      type: "House",
      bedrooms: 4,
      bathrooms: 3,
      floorArea: "180 sqm",
      lotArea: "150 sqm",
      status: "Under Negotiation",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
      buyers: [
        {
          id: 2,
          name: "Sarah Martinez",
          status: "Negotiating Price",
          documents: [
            { name: "Valid ID", status: "verified" },
            { name: "Proof of Income", status: "verified" },
            { name: "Bank Statement", status: "verified" },
            { name: "Pre-approval Letter", status: "pending" }
          ]
        }
      ]
    }
  ]);

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
    imageFile: null
  });

  const handleAddListing = (e) => {
    e.preventDefault();
    
    let imageUrl = newListing.image;
    if (newListing.imageFile) {
      imageUrl = URL.createObjectURL(newListing.imageFile);
    }
    
    setMyListings(prev => [...prev, { 
      ...newListing, 
      id: prev.length + 1, 
      status: "Available", 
      buyers: [],
      image: imageUrl || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
    }]);
    setShowAddListingModal(false);
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
      imageFile: null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddListingModal(true)}
        >
          Add New Listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myListings.map(listing => (
          <div key={listing.id} className="card bg-base-100 shadow-xl">
            <figure className="h-48">
              <img 
                src={listing.image} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title">{listing.title}</h3>
              <p className="text-primary font-bold">{listing.price}</p>
              <p className="text-sm">{listing.location}</p>
              <div className="flex gap-2 text-sm">
                <span>{listing.bedrooms} beds</span>
                <span>{listing.bathrooms} baths</span>
                <span>{listing.floorArea}</span>
              </div>
              <div className="badge badge-outline">{listing.status}</div>
              
              {listing.buyers.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Interested Buyers</h4>
                  {listing.buyers.map(buyer => (
                    <div 
                      key={buyer.id}
                      className="bg-base-200 p-3 rounded-lg cursor-pointer hover:bg-base-300"
                      onClick={() => {
                        setSelectedClient(buyer);
                        setSelectedListing(listing);
                      }}
                    >
                      <p className="font-medium">{buyer.name}</p>
                      <p className="text-sm">{buyer.status}</p>
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
                  onClick={() => {
                    if (window.confirm('Are you sure you want to remove this listing?')) {
                      setMyListings(prev => prev.filter(l => l.id !== listing.id));
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Listing Modal */}
      {showEditListingModal && selectedListing && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit Listing</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setMyListings(prev => prev.map(l => 
                l.id === selectedListing.id ? selectedListing : l
              ));
              setShowEditListingModal(false);
              setSelectedListing(null);
            }} className="space-y-4">
              <div className="form-control">
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={selectedListing.title}
                  onChange={e => setSelectedListing({...selectedListing, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Price</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={selectedListing.price}
                  onChange={e => setSelectedListing({...selectedListing, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={selectedListing.location}
                  onChange={e => setSelectedListing({...selectedListing, location: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Type</label>
                <select
                  className="select select-bordered"
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
                  <label className="label">Bedrooms</label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={selectedListing.bedrooms}
                    onChange={e => setSelectedListing({...selectedListing, bedrooms: e.target.value})}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">Bathrooms</label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={selectedListing.bathrooms}
                    onChange={e => setSelectedListing({...selectedListing, bathrooms: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">Floor Area</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="e.g. 120 sqm"
                    value={selectedListing.floorArea}
                    onChange={e => setSelectedListing({...selectedListing, floorArea: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label">Lot Area</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="e.g. 100 sqm"
                    value={selectedListing.lotArea}
                    onChange={e => setSelectedListing({...selectedListing, lotArea: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setShowEditListingModal(false);
                    setSelectedListing(null);
                  }}
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Listing</h3>
            <form onSubmit={handleAddListing} className="space-y-4">
              <div className="form-control">
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newListing.title}
                  onChange={e => setNewListing({...newListing, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Price</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newListing.price}
                  onChange={e => setNewListing({...newListing, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newListing.location}
                  onChange={e => setNewListing({...newListing, location: e.target.value})}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Type</label>
                <select
                  className="select select-bordered"
                  value={newListing.type}
                  onChange={e => setNewListing({...newListing, type: e.target.value})}
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
                  <label className="label">Bedrooms</label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={newListing.bedrooms}
                    onChange={e => setNewListing({...newListing, bedrooms: e.target.value})}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">Bathrooms</label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={newListing.bathrooms}
                    onChange={e => setNewListing({...newListing, bathrooms: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">Floor Area</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="e.g. 120 sqm"
                    value={newListing.floorArea}
                    onChange={e => setNewListing({...newListing, floorArea: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label">Lot Area</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="e.g. 100 sqm"
                    value={newListing.lotArea}
                    onChange={e => setNewListing({...newListing, lotArea: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">Property Image</label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  accept="image/*"
                  onChange={e => setNewListing({...newListing, imageFile: e.target.files[0]})}
                />
                <label className="label">
                  <span className="label-text-alt">Upload property image (JPG, PNG, etc.)</span>
                </label>
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Add Listing</button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setShowAddListingModal(false)}
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {selectedClient.name} - Documents
            </h3>
            <div className="space-y-4">
              {selectedClient.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <span>{doc.name}</span>
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
                className="btn"
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