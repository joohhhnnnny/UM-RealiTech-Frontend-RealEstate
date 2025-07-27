import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RiLayoutGridLine,
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiPhoneLine,
  RiCalculatorLine,
  RiFileTextLine,
  RiBuilding4Line,
  RiBarChartBoxLine
} from 'react-icons/ri';
import listingsData from '../../../listings.json';

function SmartListing() {
  const [listings, setListings] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [profileData] = useState({
    buyerType: 'Investor',
    monthlyIncome: '',
    monthlyDebts: '',
    hasSpouseIncome: false,
    preferredLocation: '',
    budgetRange: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Calculate total pages
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  // Get current listings
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);

  // Load listings data
  useEffect(() => {
    // Filter out listings with missing essential data
    const validListings = listingsData.filter(listing => 
      listing.title && listing.location && (listing.price || listing.price === 0)
    );
    
    // Add random match scores for demo
    const listingsWithScores = validListings.map(listing => ({
      ...listing,
      matchScore: Math.floor(Math.random() * 20) + 80
    }));
    
    setListings(listingsWithScores);
  }, []);

  // Add this useEffect hook to handle scrolling
    useEffect(() => {
    // Scroll to the "Smart Property Recommendations" heading when page changes
    const heading = document.getElementById('listings-heading');
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth' });
    }
    }, [currentPage]);

  // Sort listings when sortBy changes
  useEffect(() => {
    if (listings.length === 0) return;
    
    const sorted = [...listings].sort((a, b) => {
      const priceA = parseInt(a.price?.replace(/[₱,\s]/g, '')) || 0;
      const priceB = parseInt(b.price?.replace(/[₱,\s]/g, '')) || 0;
      
      switch(sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'match': return (b.matchScore || 0) - (a.matchScore || 0);
        case 'latest':
        default: 
          return (b.days_on_market || '').localeCompare(a.days_on_market || '');
      }
    });

    setListings(sorted);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortBy]);

  // Filter listings when profile data changes
  useEffect(() => {
    if (listings.length === 0) return;
    
    const filtered = listings.filter(listing => {
      if (profileData.preferredLocation && 
          !listing.location?.toLowerCase().includes(profileData.preferredLocation.toLowerCase())) {
        return false;
      }

      if (profileData.budgetRange) {
        const price = parseInt(listing.price?.replace(/[₱,\s]/g, '')) || 0;
        switch(profileData.budgetRange) {
          case '1M-3M': return price >= 1000000 && price <= 3000000;
          case '3M-5M': return price >= 3000000 && price <= 5000000;
          case '5M-10M': return price >= 5000000 && price <= 10000000;
          case '10M+': return price >= 10000000;
          default: return true;
        }
      }

      return true;
    });

    setListings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [profileData]);

  // Function to render property cards (keeping all card content exactly the same)
  const renderPropertyCards = () => {
    return currentListings.map((listing) => (
      <motion.div 
        key={listing.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.random() * 0.2 }}
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group backdrop-blur-xl border border-base-300/10"
      >
        <figure className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent z-10"></div>
          <img 
            src={listing.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <div className="badge bg-teal-600/90 text-white border-0 backdrop-blur-md shadow-lg">
              AI Match: {listing.matchScore}%
            </div>
            {listing.furnishing === "Semi Furnished" && (
              <div className="badge bg-blue-700/90 text-white border-0 backdrop-blur-md shadow-lg">Semi Furnished</div>
            )}
            {listing.furnishing === "Fully Furnished" && (
              <div className="badge bg-blue-600/90 text-white border-0 backdrop-blur-md shadow-lg">Fully Furnished</div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <button className="btn btn-circle btn-sm bg-white/80 backdrop-blur-md hover:bg-teal-600 hover:text-white border border-teal-700/10 shadow-lg transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </figure>
        <div className="card-body p-4 flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200/20">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-1.5 line-clamp-2 leading-tight bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">
              {listing.title}
            </h3>
            <p className="text-sm text-base-content/70 flex items-center gap-1.5">
              <RiMapPinLine className="h-4 w-4 flex-shrink-0 text-teal-600" />
              <span className="truncate">{listing.location}</span>
            </p>
          </div>
          
          <div className="flex items-start justify-between mt-3">
            <div className="grid grid-cols-3 gap-2 text-sm w-full">
              <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-teal-700/5 to-teal-800/10 backdrop-blur-sm border border-teal-700/10 hover:border-teal-700/20 transition-colors">
                <span className="text-base-content/70 text-xs">Area</span>
                <span className="font-semibold mt-0.5 text-teal-700">
                  {listing.floor_area_sqm || '0'} sqm
                </span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-teal-600/5 to-teal-700/10 backdrop-blur-sm border border-teal-600/10 hover:border-teal-600/20 transition-colors">
                <span className="text-base-content/70 text-xs">Beds</span>
                <span className="font-semibold mt-0.5 text-teal-600">
                  {listing.beds || '0'}
                </span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-teal-500/5 to-teal-600/10 backdrop-blur-sm border border-teal-500/10 hover:border-teal-500/20 transition-colors">
                <span className="text-base-content/70 text-xs">Baths</span>
                <span className="font-semibold mt-0.5 text-teal-500">
                  {listing.baths || '0'}
                </span>
              </div>
            </div>
            <div className="text-right ml-4 flex-none">
              <p className="text-xl font-bold bg-gradient-to-r from-teal-900 to-teal-700 text-white px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                {listing.price}
              </p>
              {listing.lot_area_sqm > 0 && (
                <p className="text-xs text-base-content/50 mt-1 whitespace-nowrap">
                  ₱{Math.round(parseInt(listing.price.replace(/[^0-9]/g, '')) / listing.lot_area_sqm).toLocaleString()}/sqm
                </p>
              )}
            </div>
          </div>

          {listing.amenities && listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 my-3">
              {listing.amenities.slice(0, 3).map((amenity) => (
                <div key={amenity} className="badge bg-gradient-to-r from-teal-800/10 to-teal-700/10 text-base-content border-teal-700/20 hover:border-teal-600/30 transition-colors backdrop-blur-sm">
                  {amenity}
                </div>
              ))}
              {listing.amenities.length > 3 && (
                <div className="badge bg-gradient-to-r from-teal-700/10 to-teal-600/10 text-base-content border-teal-600/20 hover:border-teal-500/30 transition-colors backdrop-blur-sm">
                  +{listing.amenities.length - 3} more
                </div>
              )}
            </div>
          )}

          <div className="flex-none pt-2 border-t border-gradient-to-r from-teal-800/20 to-teal-600/20">
            <div className="flex items-center gap-2 mb-3 text-xs text-base-content/60">
              <RiPriceTag3Line className="h-3.5 w-3.5 text-teal-600" />
              Listed {listing.days_on_market === "Unknown" ? "Recently" : listing.days_on_market + " ago"}
            </div>
            
            <button 
              className="btn w-full mb-2 normal-case bg-gradient-to-r from-teal-900 to-teal-700 text-white hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setSelectedProperty(listing)}
            >
              View Details
            </button>
            
            <div className="grid grid-cols-3 gap-1">
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiCalculatorLine className="w-3 h-3" />
                Loan
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiFileTextLine className="w-3 h-3" />
                Apply
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiPhoneLine className="w-3 h-3" />
                Call
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    ));
  };

  // Function to render property detail modal (keeping exactly the same)
  const renderPropertyModal = () => {
    if (!selectedProperty) return null;
    
    return (
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-2xl text-teal-700">{selectedProperty.title}</h3>
              <p className="text-lg text-base-content/70 flex items-center gap-2 mt-2">
                <RiMapPinLine className="w-5 h-5" />
                {selectedProperty.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-teal-900">{selectedProperty.price}</p>
              <button 
                className="btn btn-sm btn-circle btn-ghost mt-2"
                onClick={() => setSelectedProperty(null)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <figure className="h-64 rounded-lg overflow-hidden">
                <img 
                  src={selectedProperty.images?.[0] || "https://via.placeholder.com/600x400?text=No+Image"}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              </figure>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700">{selectedProperty.floor_area_sqm || '0'}</div>
                  <div className="text-sm text-teal-600">sqm Floor Area</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700">{selectedProperty.beds || '0'}</div>
                  <div className="text-sm text-teal-600">Bedrooms</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700">{selectedProperty.baths || '0'}</div>
                  <div className="text-sm text-teal-600">Bathrooms</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property Type:</span>
                    <span className="font-medium">{selectedProperty.property_type || 'House'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Furnishing:</span>
                    <span className="font-medium">{selectedProperty.furnishing || 'Unfurnished'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lot Area:</span>
                    <span className="font-medium">{selectedProperty.lot_area_sqm || '0'} sqm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sqm:</span>
                    <span className="font-medium">
                      ₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) / (selectedProperty.lot_area_sqm || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity) => (
                      <div key={amenity} className="badge badge-outline">{amenity}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <button 
                  className="btn btn-primary w-full gap-2"
                  onClick={() => setSelectedProperty(null)}
                >
                  <RiCalculatorLine className="w-5 h-5" />
                  Calculate Loan for This Property
                </button>
                <button 
                  className="btn btn-outline w-full gap-2"
                  onClick={() => setSelectedProperty(null)}
                >
                  <RiBarChartBoxLine className="w-5 h-5" />
                  Calculate Total Costs
                </button>
                <button 
                  className="btn btn-outline w-full gap-2"
                  onClick={() => setSelectedProperty(null)}
                >
                  <RiFileTextLine className="w-5 h-5" />
                  Submit Documents for This Property
                </button>
                <button className="btn btn-success w-full gap-2">
                  <RiPhoneLine className="w-5 h-5" />
                  Contact Agent
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setSelectedProperty(null)}></div>
      </div>
    );
  };

  // Function to render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <div className="join">
          <button 
            className="join-item btn" 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              className={`join-item btn ${currentPage === number ? 'btn-active' : ''}`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </button>
          ))}
          <button 
            className="join-item btn" 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* AI Recommendations Banner */}
      <div className="alert alert-success">
        <RiRobot2Line className="w-6 h-6" />
        <div>
          <h3 className="font-bold">AI Recommendations Ready!</h3>
          <div className="text-sm">Based on your profile, we found {listings.length} properties that match your criteria.</div>
        </div>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="card bg-gradient-to-br from-teal-500/20 to-teal-500/5 backdrop-blur-xl shadow-lg"
      >
        <div className="card-body p-6">
          <div className="flex items-start justify-between">
            <div>
              <RiLayoutGridLine className="w-8 h-8 text-teal-500 mb-4" />
              <h3 className="text-lg font-bold text-teal-500">Smart Listings</h3>
              <p className="text-base-content/70 text-sm mt-2">AI-powered property recommendations based on your profile</p>
            </div>
            <div className="rounded-full bg-success/10 p-1">
              <RiCheckboxCircleLine className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter and Sort Controls */}
      <div className="flex items-center justify-between">
        <h2 id="listings-heading" className="text-2xl font-bold">Smart Property Recommendations</h2>
        <div className="flex items-center gap-4">
          <button className="btn btn-outline btn-sm gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <select 
            className="select select-bordered select-sm" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="match">Best Match</option>
          </select>
        </div>
      </div>

      {/* Property Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderPropertyCards()}
      </div>

      {/* Property Detail Modal */}
      {renderPropertyModal()}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}

export default SmartListing;