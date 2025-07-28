import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import listingsData from '../../listings.json';

function Homepage(){
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchPlaceholder, setSearchPlaceholder] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showLoginHint, setShowLoginHint] = useState(true);
    const searchRef = useRef(null);
    
    const phrases = useMemo(() => [
        'Search for your dream home...',
        'Find properties in Cebu City...',
        'Discover condos in Manila...',
        'Explore houses in Davao...'
    ], []);

    // Handle clicks outside of search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Typing animation effect
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
                isDeleting = false;
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

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);
        
        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        const filtered = listingsData.filter(listing => {
            const searchValue = value.toLowerCase();
            return (
                (listing.title && listing.title.toLowerCase().includes(searchValue)) ||
                (listing.location && listing.location.toLowerCase().includes(searchValue)) ||
                (listing.price && listing.price.toLowerCase().includes(searchValue))
            );
        }).slice(0, 5); // Limit to 5 results

        setSearchResults(filtered);
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return price.replace('/mo', '').trim();
    };

    const handleResultClick = (listing) => {
        // Navigate to the properties page with the property ID in the hash
        navigate(`/properties#${listing.id}`);
        setIsSearchFocused(false);
        setSearchResults([]);
    };

     const scrollToSolutions = () => {
        document.getElementById('solutions')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    // Add useEffect to hide the login hint after some time
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoginHint(false);
        }, 10000); // Hide after 10 seconds

        return () => clearTimeout(timer);
    }, []);

    // Modify the useEffect for profile clicks
    useEffect(() => {
        const handleProfileClick = (e) => {
            const profileButton = e.target.closest('[data-profile-button]');
            if (profileButton) {
                setShowLoginHint(false);
            }
        };

        // Add the event listener to the document body
        document.body.addEventListener('click', handleProfileClick, true);

        return () => {
            document.body.removeEventListener('click', handleProfileClick, true);
        };
    }, []);

    return(
        <>
            {/* Floating Login Hint */}
<AnimatePresence mode="wait">
    {showLoginHint && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5 }
            }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-17 z-[40]" // Lowered z-index to prevent dropdown overlap
        >
            <motion.div
                animate={{ 
                    y: [0, -8, 0],
                }}
                transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                className="relative backdrop-blur-sm bg-base-100/80 dark:bg-base-300/80 
                          text-base-content border border-base-content/20 dark:border-base-content/20 
                          px-4 py-3 rounded-xl shadow-lg"
            >
                <div className="absolute -top-2 right-6 w-4 h-4 
                              bg-base-100/80 dark:bg-base-300/80 border-t border-l 
                              border-base-content/20 dark:border-base-content/20 
                              transform rotate-45" />
                <div className="relative z-10 flex items-center gap-3">
                    <span className="text-sm font-medium whitespace-nowrap">Click to Login</span>
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="w-5 h-5 flex items-center justify-center text-base-content"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            className="w-5 h-5"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
        
            <section 
                id="hero" 
                className="min-h-[90vh] flex flex-col items-center justify-between 
              px-4 lg:px-24 py-12 lg:py-20 transition-colors duration-300 bg-base-100"
            >
                <div className="flex flex-col items-center justify-center w-full max-w-7xl flex-grow">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
                            Revolutionizing Real Estate
                        </h2>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto text-base-content/70">
                            Protecting buyers. Empowering agents. Regulating developers.
            Together, we make every real estate journey transparent, fair, and safe.
                        </p>
                    </div>

                    <div className="w-full max-w-3xl px-4" ref={searchRef}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                placeholder={isSearchFocused ? 'Type to search properties...' : searchPlaceholder}
                                className="input input-xl input-bordered w-full px-6 py-4 text-lg rounded-full 
                                        transition-all duration-300 pl-14 bg-base-100 border-2 
                                        focus:outline-none shadow-md hover:shadow-lg 
                                        placeholder-base-content/60 text-base-content"
                            />
                            <MagnifyingGlassIcon 
                                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 
                                        pointer-events-none text-base-content/70"
                            />

                            {/* Search Results Dropdown */}
                            {isSearchFocused && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-base-100 rounded-2xl shadow-xl 
                                            border border-base-200 overflow-hidden max-h-[60vh] overflow-y-auto">
                                    {searchResults.map((listing) => (
                                        <div
                                            key={listing.id}
                                            onClick={() => handleResultClick(listing)}
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
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-center mt-14 md:mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/properties')}
                                className="btn btn-primary btn-lg rounded-full font-medium px-8 py-3 
                                        shadow-lg hover:shadow-xl transition-all duration-300
                                        flex items-center gap-2"
                            >
                                View All Properties
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator - now in normal document flow */}
                <motion.div 
                    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 
                                transition-opacity mt-11 md:mt-12 pb-4"
                    onClick={scrollToSolutions}
                    animate={{ 
                        y: [0, -10, 0] 
                    }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                >
                    <span className="text-xs md:text-sm text-primary font-medium">
                        Scroll to explore
                    </span>
                    <ChevronDownIcon 
                        className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary" 
                        aria-label="Scroll to solutions"
                    />
                </motion.div>
            </section>
        </>
    );
}

export default Homepage;