import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon, HomeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
// Remove the JSON import and add Firebase imports
import { db } from '../../config/Firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const formatPrice = (price) => {
  if (!price) return '';
  // Handle both string and number prices
  if (typeof price === 'number') {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
  return price.toString().replace('/mo', '').trim();
};

const SearchResultItem = React.memo(({ listing, onClick }) => (
  <div
    onClick={() => onClick(listing)}
    className="p-4 hover:bg-base-200 cursor-pointer transition-colors 
              duration-200 border-b border-base-300 last:border-none"
  >
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <h3 className="font-semibold text-base-content line-clamp-1">
          {listing.title}
        </h3>
        <div className="mt-1 flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-base-content/70">
            <MapPinIcon className="w-4 h-4" />
            <span className="line-clamp-1">
              {listing.location || 'Location not specified'}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-primary font-semibold">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>{formatPrice(listing.price)}</span>
          </div>
          {(listing.bedrooms || listing.beds) && (
            <div className="flex items-center gap-1 text-sm text-base-content/70">
              <HomeIcon className="w-4 h-4" />
              <span>{listing.bedrooms || listing.beds} {(listing.bedrooms || listing.beds) === '1' ? 'Bed' : 'Beds'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
));

// Background pattern component
const BackgroundPattern = () => (
  <div className="fixed inset-0 w-screen h-screen">
    {/* Wavy lines pattern */}
    <div className="absolute inset-0 w-full h-full opacity-20">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        className="w-full h-full"
      >
        <defs>
          <pattern 
            id="wave" 
            x="0" 
            y="0" 
            width="40" 
            height="40" 
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <path d="M0,20 Q10,10 20,20 T40,20" fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.6"/>
            <path d="M0,30 Q10,20 20,30 T40,30" fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.4"/>
            <path d="M0,10 Q10,0 20,10 T40,10" fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave)"/>
      </svg>
    </div>
    
    {/* Floating orbs with adjusted positioning */}
    <div className="fixed top-1/4 left-1/4 w-32 h-32 bg-blue-700/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="fixed top-3/4 right-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
    <div className="fixed top-1/2 left-3/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
  </div>
);

function Homepage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);

  const phrases = useMemo(() => [
    'Search for your dream home...',
    'Find properties in Cebu City...',
    'Discover condos in Manila...',
    'Explore houses in Davao...'
  ], []);

  // Fetch listings from Firestore
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create a query to get all listings, ordered by creation date (newest first)
        const listingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(listingsQuery);
        const fetchedListings = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedListings.push({
            id: doc.id,
            ...data,
            // Ensure consistent field naming for search
            title: data.title || data.propertyName || 'Untitled Property',
            location: data.location || data.address || data.city || '',
            price: data.price || data.listingPrice || 0,
            bedrooms: data.bedrooms || data.beds || 0,
            bathrooms: data.bathrooms || data.baths || 0,
          });
        });
        
        setListingsData(fetchedListings);
        console.log(`Fetched ${fetchedListings.length} listings from Firestore`);
        
      } catch (error) {
        console.error('Error fetching listings from Firestore:', error);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim() || loading) return [];
    
    const searchValue = debouncedSearchTerm.toLowerCase();
    return listingsData.filter(listing => {
      // Search through multiple fields
      const titleMatch = listing.title && listing.title.toLowerCase().includes(searchValue);
      const locationMatch = listing.location && listing.location.toLowerCase().includes(searchValue);
      const priceMatch = listing.price && listing.price.toString().toLowerCase().includes(searchValue);
      const propertyTypeMatch = listing.propertyType && listing.propertyType.toLowerCase().includes(searchValue);
      const descriptionMatch = listing.description && listing.description.toLowerCase().includes(searchValue);
      
      return titleMatch || locationMatch || priceMatch || propertyTypeMatch || descriptionMatch;
    }).slice(0, 5); // Limit to 5 results for performance
  }, [debouncedSearchTerm, listingsData, loading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchFocused) {
      setSearchPlaceholder('');
      return;
    }

    let timeoutId;
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let pauseTimeout;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];

      if (isDeleting) {
        setSearchPlaceholder(prev => prev.slice(0, -1));
        currentCharIndex--;
      } else {
        setSearchPlaceholder(currentPhrase.slice(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      if (!isDeleting && currentCharIndex >= currentPhrase.length) {
        pauseTimeout = setTimeout(() => {
          isDeleting = true;
          timeoutId = setTimeout(type, 50);
        }, 2000);
        return;
      }

      if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        timeoutId = setTimeout(type, 150);
        return;
      }

      timeoutId = setTimeout(type, isDeleting ? 50 : 150);
    };

    timeoutId = setTimeout(type, 150);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(pauseTimeout);
      setSearchPlaceholder('');
    };
  }, [isSearchFocused, phrases]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleResultClick = useCallback((listing) => {
    // Clear search state
    setIsSearchFocused(false);
    setSearchTerm('');
    
    // Navigate directly to the ViewProperties page with the property ID
    // Using the correct route that matches App.jsx: /properties/:id
    navigate(`/properties/${listing.id}`);
    
    // Optional: Add smooth scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [navigate]);

  const scrollToSolutions = useCallback(() => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden bg-base-100">        
        <BackgroundPattern />
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 lg:px-24 py-4">
          <div className="text-center max-w-6xl mx-auto">
            {/* Hero Content */}
            <div className="mb-8">
              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-base-content leading-tight"
              >
                Rebuilding Trust in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400">
                  Real Estate
                </span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-md md:text-xl lg:text-1xl text-base-content/80 mb-3 max-w-4xl mx-auto leading-relaxed"
              >
                Protecting buyers. Empowering agents. Regulating developers.
            Together, we make every real estate journey transparent, fair, and safe.
              </motion.p>
            </div>

            {/* Search Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="w-full max-w-4xl mx-auto mb-6" 
              ref={searchRef}
            >
              <SearchInput
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                isSearchFocused={isSearchFocused}
                setIsSearchFocused={setIsSearchFocused}
                searchPlaceholder={searchPlaceholder}
                searchResults={filteredResults}
                handleResultClick={handleResultClick}
                loading={loading}
                error={error}
                listingsCount={listingsData.length}
              />
            </motion.div>

            {/* Group the View Properties button and scroll indicator together */}
            <div className="flex flex-col items-center gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-2"
              >
                {/* View Properties Button */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <button
                    onClick={() => navigate('/properties')}
                    className="btn btn-primary btn-lg rounded-2xl font-semibold px-10 py-4 text-lg shadow-xl 
                               transition-all duration-300 flex items-center gap-3 relative
                               border-2 border-transparent group-hover:shadow-2xl"
                  >
                    <span>View All Properties</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  
                  {/* Animated border overlay */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                    {/* Complete border frame that starts from corners and expands */}
                    <div className="absolute inset-0 rounded-2xl transition-all duration-500 ease-out
                                    border-3 border-transparent
                                    group-hover:border-blue-500/80
                                    before:absolute before:inset-0 before:rounded-2xl
                                    before:border-4 before:border-transparent
                                    before:bg-gradient-to-r before:from-transparent before:via-blue-100/30 before:to-transparent
                                    before:opacity-0 before:transition-opacity before:duration-500
                                    group-hover:before:opacity-100"></div>
                    
                    {/* Corner accent elements for the expanding effect */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500/80 rounded-tr-2xl
                                    transition-all duration-500 ease-out
                                    group-hover:w-full group-hover:h-full group-hover:border-blue-500/80"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500/80 rounded-bl-2xl
                                    transition-all duration-500 ease-out
                                    group-hover:w-full group_hover:h-full group-hover:border-blue-500/80"></div>
                  </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="mt-8"
                >
                  <ScrollIndicator scrollToSolutions={scrollToSolutions} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const SearchInput = React.memo(({ 
  searchTerm, 
  handleSearch, 
  isSearchFocused, 
  setIsSearchFocused, 
  searchPlaceholder, 
  searchResults, 
  handleResultClick,
  loading,
  error,
  listingsCount
}) => (
  <div className="relative">
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
        placeholder={isSearchFocused ? `Search ${listingsCount} properties...` : searchPlaceholder}
        className="input input-lg w-full px-6 py-5 text-lg rounded-2xl transition-all duration-300 pl-16 bg-base-200/90 backdrop-blur-sm border-2 border-base-300 focus:border-primary focus:outline-none shadow-xl hover:shadow-2xl placeholder-base-content/50 text-base-content"
        disabled={loading}
      />
      <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 pointer-events-none text-base-content/60" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
          <div className="loading loading-spinner loading-sm text-primary"></div>
        </div>
      )}
    </div>

    {/* Error message */}
    {error && (
      <div className="absolute z-50 w-full mt-3 p-4 bg-error/10 border border-error/20 rounded-2xl">
        <p className="text-error text-sm">{error}</p>
      </div>
    )}

    <AnimatePresence>
      {isSearchFocused && searchResults.length > 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-3 bg-base-100/95 backdrop-blur-md rounded-2xl shadow-2xl border border-base-300 overflow-hidden max-h-[60vh] overflow-y-auto"
        >
          {searchResults.map((listing) => (
            <SearchResultItem key={listing.id} listing={listing} onClick={handleResultClick} />
          ))}
        </motion.div>
      )}
      
      {/* No results message */}
      {isSearchFocused && searchTerm && searchResults.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-3 p-4 bg-base-100/95 backdrop-blur-md rounded-2xl shadow-2xl border border-base-300"
        >
          <p className="text-base-content/70 text-center">
            No properties found for "{searchTerm}". Try searching with different keywords.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

const ScrollIndicator = React.memo(({ scrollToSolutions }) => (
  <motion.div
    className="flex flex-col items-center gap-3 cursor-pointer group"
    onClick={scrollToSolutions}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <span className="text-sm text-base-content/70 font-medium group-hover:text-base-content transition-colors duration-300">
      Scroll to explore
    </span>
    <motion.div 
      className="p-2 rounded-full bg-primary/10 backdrop-blur-sm group-hover:bg-primary/20 transition-all duration-300"
      whileHover={{ scale: 1.1 }}
    >
      <ChevronDownIcon className="w-5 h-5 text-primary" aria-label="Scroll to solutions" />
    </motion.div>
  </motion.div>
));

export default React.memo(Homepage);