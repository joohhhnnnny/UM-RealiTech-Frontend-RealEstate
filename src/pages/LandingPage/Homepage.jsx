import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon, HomeIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import listingsData from '../../listings.json';

const formatPrice = (price) => {
  if (!price) return '';
  return price.replace('/mo', '').trim();
};

const SearchResultItem = React.memo(({ listing, onClick }) => (
  <div
    onClick={() => onClick(listing)}
    className="p-4 hover:bg-base-200 cursor-pointer transition-colors 
              duration-200 border-b border-base-200 last:border-none"
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
          {listing.beds && (
            <div className="flex items-center gap-1 text-sm text-base-content/70">
              <HomeIcon className="w-4 h-4" />
              <span>{listing.beds} {listing.beds === '1' ? 'Bed' : 'Beds'}</span>
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
    <div className="absolute inset-0 w-full h-full opacity-5">
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
            <path d="M0,20 Q10,10 20,20 T40,20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M0,30 Q10,20 20,30 T40,30" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M0,10 Q10,0 20,10 T40,10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave)" className="text-base-content"/>
      </svg>
    </div>
    
    {/* Floating orbs with adjusted positioning */}
    <div className="fixed top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="fixed top-3/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
    <div className="fixed top-1/2 left-3/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
  </div>
);

function Homepage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const phrases = useMemo(() => [
    'Search for your dream home...',
    'Find properties in Cebu City...',
    'Discover condos in Manila...',
    'Explore houses in Davao...'
  ], []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    const searchValue = debouncedSearchTerm.toLowerCase();
    return listingsData.filter(listing =>
      (listing.title && listing.title.toLowerCase().includes(searchValue)) ||
      (listing.location && listing.location.toLowerCase().includes(searchValue)) ||
      (listing.price && listing.price.toLowerCase().includes(searchValue))
    ).slice(0, 5);
  }, [debouncedSearchTerm]);

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
    navigate(`/properties#${listing.id}`);
    setIsSearchFocused(false);
  }, [navigate]);

  const scrollToSolutions = useCallback(() => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <section id="hero" className="relative min-h-screen flex flex-col bg-base-100 overflow-hidden">
        <BackgroundPattern />
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 lg:px-24 py-4">
          {/* Hero Content */}
          <div className="text-center max-w-6xl mx-auto mb-8">
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6 text-base-content leading-tight"
            >
              Rebuilding Trust in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700">
                Real Estate
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-md md:text-xl lg:text-2xl text-base-content/80 mb-3 max-w-4xl mx-auto leading-relaxed"
            >
              Protecting buyers. Empowering agents. Regulating developers.
          Together, we make every real estate journey transparent, fair, and safe.
            </motion.p>
            
            {/* Description */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-base md:text-lg text-base-content/60 mb-8 max-w-2xl mx-auto"
            >
            </motion.div>

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
              />
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              className="flex justify-center mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/properties')}
                className="btn btn-lg rounded-2xl font-semibold px-10 py-4 text-lg shadow-xl hover:shadow-2xl 
                           transition-all duration-300 flex items-center gap-3 
                           bg-gradient-to-r from-blue-500 to-blue-700 border-none text-white"
              >
                <span>View All Properties</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 mb-8">
          <ScrollIndicator scrollToSolutions={scrollToSolutions} />
        </div>
      </section>
    </>
  );
}

const SearchInput = React.memo(({ searchTerm, handleSearch, isSearchFocused, setIsSearchFocused, searchPlaceholder, searchResults, handleResultClick }) => (
  <div className="relative">
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
        placeholder={isSearchFocused ? 'Type to search properties...' : searchPlaceholder}
        className="input input-lg w-full px-6 py-5 text-lg rounded-2xl transition-all duration-300 pl-16 bg-base-100/80 backdrop-blur-sm border-2 border-base-300 focus:border-primary focus:outline-none shadow-xl hover:shadow-2xl placeholder-base-content/50 text-base-content"
      />
      <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 pointer-events-none text-base-content/70" />
    </div>

    <AnimatePresence>
      {isSearchFocused && searchResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-3 bg-base-100/95 backdrop-blur-md rounded-2xl shadow-2xl border border-base-200 overflow-hidden max-h-[60vh] overflow-y-auto"
        >
          {searchResults.map((listing) => (
            <SearchResultItem key={listing.id} listing={listing} onClick={handleResultClick} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

const ViewAllPropertiesButton = React.memo(({ navigate }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => navigate('/properties')}
    className="btn btn-lg rounded-2xl font-semibold px-10 py-4 text-lg shadow-xl hover:shadow-2xl 
               transition-all duration-300 flex items-center gap-3 
               bg-gradient-to-r from-blue-500 to-blue-700 border-none text-white"
  >
    <span>View All Properties</span>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  </motion.button>
));

const ScrollIndicator = React.memo(({ scrollToSolutions }) => (
  <motion.div
    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity pb-4"
    onClick={scrollToSolutions}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <span className="text-sm text-base-content/70 font-medium">Scroll to explore</span>
    <div className="p-2 rounded-full bg-primary/10 backdrop-blur-sm">
      <ChevronDownIcon className="w-6 h-6 text-primary" aria-label="Scroll to solutions" />
    </div>
  </motion.div>
));

export default React.memo(Homepage);