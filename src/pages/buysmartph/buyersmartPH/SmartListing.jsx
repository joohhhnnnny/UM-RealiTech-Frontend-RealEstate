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
  RiBarChartBoxLine,
  RiHome3Line,
  RiHotelBedLine,
  RiDropLine
} from 'react-icons/ri';
import listingsData from '../../../listings.json';

function SmartListing({ profileData }) {
  const [listings, setListings] = useState([]);
  const [sortBy, setSortBy] = useState('match'); // Set default sort to match score
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Calculate match score based on profile data and listing
  const calculateMatchScore = (listing, profile) => {
    let score = 0;
    let factors = 0;

    // Budget match (highest weight)
    if (profile.budgetRange && listing.price) {
      factors += 3;
      const price = parseInt(listing.price.replace(/[₱,\s]/g, '')) || 0;
      const budgetRanges = {
        '1M-3M': { min: 1000000, max: 3000000 },
        '3M-5M': { min: 3000000, max: 5000000 },
        '5M-10M': { min: 5000000, max: 10000000 },
        '10M+': { min: 10000000, max: Infinity }
      };
      const range = budgetRanges[profile.budgetRange];
      if (range) {
        if (price >= range.min && price <= range.max) score += 300;
        else if (price < range.min * 1.1 || price > range.max * 0.9) score += 150;
      }
    }

    // Location match (high weight)
    if (profile.preferredLocation && listing.location) {
      factors += 2;
      if (listing.location.toLowerCase().includes(profile.preferredLocation.toLowerCase())) {
        score += 200;
      }
    }

    // Buyer type specific matches
    if (profile.buyerType) {
      factors += 1;
      switch(profile.buyerType) {
        case 'First Time Buyer':
          if (parseInt(listing.price?.replace(/[₱,\s]/g, '')) <= 5000000) score += 100;
          break;
        case 'Investor':
          if (listing.title?.toLowerCase().includes('investment') ||
              listing.description?.toLowerCase().includes('investment') ||
              listing.amenities?.some(a => a.toLowerCase().includes('rental'))) {
            score += 100;
          }
          break;
        case 'OFW':
          if (listing.description?.toLowerCase().includes('ofw friendly') ||
              listing.furnishing === 'Fully Furnished') {
            score += 100;
          }
          break;
        case 'Upgrader':
          if (parseInt(listing.price?.replace(/[₱,\s]/g, '')) >= 5000000 &&
              listing.amenities?.length >= 3) {
            score += 100;
          }
          break;
      }
    }

    return factors > 0 ? Math.round((score / (factors * 100)) * 100) : 50;
  };

  // Calculate total pages
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  // Get current listings
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);

  // Load listings data
  useEffect(() => {
    if (!profileData) return;

    // Filter out listings with missing essential data
    const validListings = listingsData.filter(listing => 
      listing.title && listing.location && (listing.price || listing.price === 0)
    );
    
    // Calculate match scores based on profile
    const listingsWithScores = validListings.map(listing => ({
      ...listing,
      matchScore: calculateMatchScore(listing, profileData)
    }));

    // Sort by match score by default
    const sortedListings = [...listingsWithScores].sort((a, b) => 
      (b.matchScore || 0) - (a.matchScore || 0)
    );
    
    setListings(sortedListings);
  }, [profileData]);

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
    if (listings.length === 0 || !profileData) return;
    
    const validListings = listingsData.filter(listing => 
      listing.title && listing.location && (listing.price || listing.price === 0)
    );
    
    const filtered = validListings.filter(listing => {
      // Location filter
      if (profileData.preferredLocation && 
          !listing.location?.toLowerCase().includes(profileData.preferredLocation.toLowerCase())) {
        return false;
      }

      // Budget range filter
      if (profileData.budgetRange) {
        const price = parseInt(listing.price?.replace(/[₱,\s]/g, '')) || 0;
        const budgetRanges = {
          '1M-3M': { min: 1000000, max: 3000000 },
          '3M-5M': { min: 3000000, max: 5000000 },
          '5M-10M': { min: 5000000, max: 10000000 },
          '10M+': { min: 10000000, max: Infinity }
        };
        
        const range = budgetRanges[profileData.budgetRange];
        if (range && (price < range.min || price > range.max)) {
          return false;
        }
      }

      // Buyer type specific filters
      if (profileData.buyerType) {
        switch(profileData.buyerType) {
          case 'First Time Buyer':
            // Filter for more affordable properties and beginner-friendly options
            return parseInt(listing.price?.replace(/[₱,\s]/g, '')) <= 5000000;
          case 'Investor':
            // Look for properties with good investment potential
            return listing.title?.toLowerCase().includes('investment') || 
                   listing.description?.toLowerCase().includes('investment') ||
                   listing.amenities?.some(a => a.toLowerCase().includes('rental'));
          case 'OFW':
            // Properties suitable for OFWs
            return listing.description?.toLowerCase().includes('ofw friendly') ||
                   listing.furnishing === 'Fully Furnished';
          case 'Upgrader':
            // Higher-end properties with more amenities
            return parseInt(listing.price?.replace(/[₱,\s]/g, '')) >= 5000000 &&
                   listing.amenities?.length >= 3;
          default:
            return true;
        }
      }

      return true;
    });

    // Calculate match scores based on profile
    const listingsWithScores = filtered.map(listing => ({
      ...listing,
      matchScore: calculateMatchScore(listing, profileData)
    }));

    setListings(listingsWithScores);
    setCurrentPage(1); // Reset to first page when filters change
  }, [profileData]);

  // Function to render property cards (improved with icons and responsiveness)
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
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
            <div className="badge badge-success bg-teal-600/90 text-white border-0 backdrop-blur-md shadow-lg text-xs">
              AI Match: {listing.matchScore}%
            </div>
            {listing.furnishing === "Semi Furnished" && (
              <div className="badge badge-info bg-blue-700/90 text-white border-0 backdrop-blur-md shadow-lg text-xs">Semi Furnished</div>
            )}
            {listing.furnishing === "Fully Furnished" && (
              <div className="badge badge-info bg-blue-600/90 text-white border-0 backdrop-blur-md shadow-lg text-xs">Fully Furnished</div>
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
          
          <div className="flex flex-col lg:flex-row items-start justify-between mt-3 gap-3">
            {/* Property stats with icons - responsive grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-sm w-full lg:flex-1">
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal-700/5 to-teal-800/10 backdrop-blur-sm border border-teal-700/10 hover:border-teal-700/20 transition-colors">
                <RiHome3Line className="h-3 w-3 sm:h-4 sm:w-4 text-teal-700 mb-1" />
                <span className="text-base-content/70 text-xs">Area</span>
                <span className="font-semibold mt-0.5 text-teal-700 text-xs sm:text-sm">
                  {listing.floor_area_sqm || '0'} sqm
                </span>
              </div>
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal-600/5 to-teal-700/10 backdrop-blur-sm border border-teal-600/10 hover:border-teal-600/20 transition-colors">
                <RiHotelBedLine className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 mb-1" />
                <span className="text-base-content/70 text-xs">Beds</span>
                <span className="font-semibold mt-0.5 text-teal-600 text-xs sm:text-sm">
                  {listing.beds || '0'}
                </span>
              </div>
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal-500/5 to-teal-600/10 backdrop-blur-sm border border-teal-500/10 hover:border-teal-500/20 transition-colors">
                <RiDropLine className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500 mb-1" />
                <span className="text-base-content/70 text-xs">Baths</span>
                <span className="font-semibold mt-0.5 text-teal-500 text-xs sm:text-sm">
                  {listing.baths || '0'}
                </span>
              </div>
            </div>
            
            {/* Price section */}
            <div className="text-center lg:text-right lg:ml-4 flex-none w-full lg:w-auto">
              <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-900 to-teal-700 text-white px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                {listing.price}
              </p>
              {listing.lot_area_sqm > 0 && (
                <p className="text-xs text-base-content/50 mt-1 whitespace-nowrap">
                  ₱{Math.round(parseInt(listing.price.replace(/[^0-9]/g, '')) / listing.lot_area_sqm).toLocaleString()}/sqm
                </p>
              )}
            </div>
          </div>

          {/* Amenities badges */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 my-3">
              {listing.amenities.slice(0, 3).map((amenity) => (
                <div key={amenity} className="badge badge-outline bg-gradient-to-r from-teal-800/10 to-teal-700/10 text-base-content border-teal-700/20 hover:border-teal-600/30 transition-colors backdrop-blur-sm text-xs">
                  {amenity}
                </div>
              ))}
              {listing.amenities.length > 3 && (
                <div className="badge badge-outline bg-gradient-to-r from-teal-700/10 to-teal-600/10 text-base-content border-teal-600/20 hover:border-teal-500/30 transition-colors backdrop-blur-sm text-xs">
                  +{listing.amenities.length - 3} more
                </div>
              )}
            </div>
          )}

          {/* Footer section */}
          <div className="flex-none pt-2 border-t border-gradient-to-r from-teal-800/20 to-teal-600/20">
            <div className="flex items-center gap-2 mb-3 text-xs text-base-content/60">
              <RiPriceTag3Line className="h-3.5 w-3.5 text-teal-600" />
              Listed {listing.days_on_market === "Unknown" ? "Recently" : listing.days_on_market + " ago"}
            </div>
            
            <button 
              className="btn btn-primary w-full mb-2 normal-case bg-gradient-to-r from-teal-900 to-teal-700 text-white hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setSelectedProperty(listing)}
            >
              View Details
            </button>
            
            <div className="grid grid-cols-3 gap-1">
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiCalculatorLine className="w-3 h-3" />
                <span className="hidden sm:inline">Loan</span>
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiFileTextLine className="w-3 h-3" />
                <span className="hidden sm:inline">Apply</span>
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiPhoneLine className="w-3 h-3" />
                <span className="hidden sm:inline">Call</span>
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
              className={`join-item btn ${currentPage === number ? 'btn-active btn-primary' : ''}`}
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
      <div className="alert alert-success shadow-lg">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 id="listings-heading" className="text-xl sm:text-2xl font-bold">Smart Property Recommendations</h2>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button className="btn btn-outline btn-sm gap-2 flex-1 sm:flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <select 
            className="select select-bordered select-sm flex-1 sm:flex-none" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="match">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="latest">Latest First</option>
          </select>
        </div>
      </div>

      {/* Property Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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