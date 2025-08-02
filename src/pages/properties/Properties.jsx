import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '/src/components/Navbar.jsx';
import Footer from '/src/components/Footer.jsx';
import listingsData from '../../json/listings.json';
// Add Map imports
import { 
    MagnifyingGlassIcon, 
    AdjustmentsHorizontalIcon,
    MapPinIcon,
    HomeIcon,
    CurrencyDollarIcon,
    BuildingOffice2Icon,
    Square2StackIcon,
    MapIcon
} from '@heroicons/react/24/outline';

function Properties() {
    // Helper function to get location from description if location field is empty
    const getLocationFromDescription = (description) => {
        if (!description) return null;
        
        // Common location patterns in descriptions
        const locationPatterns = [
            /Location:\s*([^\.|\n]+)/i,
            /located at\s*([^\.|\n]+)/i,
            /located in\s*([^\.|\n]+)/i,
            /address:\s*([^\.|\n]+)/i,
        ];

        for (const pattern of locationPatterns) {
            const match = description.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return null;
    };

    // Helper function to get default image for property type
    const getDefaultImage = (property) => {
        const isCommercial = property.title?.toLowerCase().includes('office');
        return isCommercial 
            ? 'https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg' // Modern office building
            : 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'; // Modern house
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [propertyType, setPropertyType] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const propertiesPerPage = 9;
    const location = window.location;

    // Check for property ID in the URL hash and set initial search
    useEffect(() => {
        const hash = location.hash;
        if (hash) {
            const propertyId = hash.replace('#', '');
            const property = listingsData.find(p => p.id === propertyId);
            if (property) {
                // Set the search term to match the property location and title
                const searchValue = property.location || '';
                setSearchTerm(searchValue);
                setSelectedProperty(property);
                const modal = document.getElementById('property_modal');
                if (modal) {
                    modal.showModal();
                    // Add event listener for when modal is closed
                    const handleClose = () => {
                        modal.removeEventListener('close', handleClose);
                        // Clear the URL hash when modal is closed
                        window.history.pushState('', document.title, window.location.pathname);
                    };
                    modal.addEventListener('close', handleClose);
                }
            }
        }
    }, [location]);
    const propertiesSectionRef = useRef(null);



    // Format price for display
    const formatPriceInput = (value) => {
        if (!value) return '';
        const number = parseInt(value.replace(/[^0-9]/g, ''));
        return new Intl.NumberFormat('en-PH').format(number);
    };

    // Parse price input
    const parsePriceInput = (value) => {
        return value.replace(/[^0-9]/g, '');
    };

    // Handle price input change
    const handlePriceChange = (type, value) => {
        const numericValue = parsePriceInput(value);
        setPriceRange(prev => ({ ...prev, [type]: numericValue }));
    };

    // Filter and sort properties
    const filteredProperties = useMemo(() => {
        return listingsData
            .filter(property => {
                const matchesSearch = 
                    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     property.location?.toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesType = propertyType === 'all' ? true :
                    propertyType === 'residential' ? !property.title?.toLowerCase().includes('office') :
                    propertyType === 'commercial' ? property.title?.toLowerCase().includes('office') : true;

                const price = parseInt(property.price?.replace(/[^0-9]/g, '')) || 0;
                const matchesPrice = 
                    (!priceRange.min || price >= parseInt(parsePriceInput(priceRange.min))) &&
                    (!priceRange.max || price <= parseInt(parsePriceInput(priceRange.max)));

                return matchesSearch && matchesType && matchesPrice;
            })
            .sort((a, b) => {
                if (sortBy === 'price-asc') {
                    return (parseInt(a.price?.replace(/[^0-9]/g, '')) || 0) - (parseInt(b.price?.replace(/[^0-9]/g, '')) || 0);
                }
                if (sortBy === 'price-desc') {
                    return (parseInt(b.price?.replace(/[^0-9]/g, '')) || 0) - (parseInt(a.price?.replace(/[^0-9]/g, '')) || 0);
                }
                // Default to latest
                return new Date(b.days_on_market || 0) - new Date(a.days_on_market || 0);
            });
    }, [searchTerm, sortBy, propertyType, priceRange]);

    // Get current properties for pagination
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

    const formatPrice = (price) => {
        if (!price) return 'Price on request';
        return price.includes('/mo') ? price : price.trim();
    };

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, propertyType, priceRange]);

    // Scroll to top when page changes
    useEffect(() => {
        if (propertiesSectionRef.current) {
            propertiesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);



    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (property) => {
        setSelectedProperty(property);
        // Update URL hash with property ID
        window.history.pushState('', document.title, `#${property.id}`);
        const modal = document.getElementById('property_modal');
        modal.showModal();
        
        // Add event listener for cleanup when modal is closed
        const handleClose = () => {
            setSelectedProperty(null);
            modal.removeEventListener('close', handleClose);
            // Don't clear the search term when closing the modal
            // This keeps the filtered list visible
        };
        modal.addEventListener('close', handleClose);
    };

    return (
        <>
            <Navbar />
            
            <section className="min-h-screen bg-base-100">   
                <motion.section 
                    ref={propertiesSectionRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-4xl font-bold text-base-content"
                            >
                                Properties
                            </motion.h1>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Clear search to view all properties..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input input-bordered w-full pl-10 pr-4 bg-base-100 min-w-[320px]"
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                </div>

                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-bordered bg-base-100"
                                >
                                    <option value="latest">Latest</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>

                                <select
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className="select select-bordered bg-base-100"
                                >
                                    <option value="all">All Types</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </motion.div>
                        </div>

                        <div className="mb-8 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base-content/70">Price Range:</span>
                                <div className="join">
                                    <div className="join-item flex items-center px-3 bg-base-200 border border-base-300">
                                        ₱
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="1,000,000"
                                        value={formatPriceInput(priceRange.min)}
                                        onChange={(e) => handlePriceChange('min', e.target.value)}
                                        className="input input-bordered input-sm w-36 join-item"
                                        min="0"
                                        step="100000"
                                    />
                                </div>
                                <span>-</span>
                                <div className="join">
                                    <div className="join-item flex items-center px-3 bg-base-200 border border-base-300">
                                        ₱
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="10,000,000"
                                        value={formatPriceInput(priceRange.max)}
                                        onChange={(e) => handlePriceChange('max', e.target.value)}
                                        className="input input-bordered input-sm w-36 join-item"
                                        min="0"
                                        step="100000"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {currentProperties.map((property, index) => (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200 overflow-hidden group"
                                >
                                    <div className="relative">
                                        <div className="h-72 relative overflow-hidden">
                                            <img 
                                                src={property.images?.[0] || getDefaultImage(property)}
                                                alt={property.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = getDefaultImage(property);
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <div className="flex items-center gap-2">
                                                    <div className="badge badge-primary gap-2">
                                                        {property.title?.toLowerCase().includes('office') ? (
                                                            <>
                                                                <BuildingOffice2Icon className="w-4 h-4" />
                                                                Commercial
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HomeIcon className="w-4 h-4" />
                                                                Residential
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="text-xl font-bold line-clamp-1">{formatPrice(property.price)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <div className="badge badge-accent badge-outline">
                                                {property.days_on_market || 'New'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-body p-6 flex flex-col h-full">
                                        {/* Title and Location - Fixed Height Section */}
                                        <div className="flex-none">
                                            <h2 className="text-lg font-bold text-base-content line-clamp-2 mb-2">{property.title}</h2>
                                            
                                            <div className="flex items-center gap-2 text-base-content/70">
                                                <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                                                <p className="text-sm line-clamp-1">
                                                    {property.location || getLocationFromDescription(property.description) || 'Location details in description'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="divider my-3"></div>

                                        {/* Property Features - Fixed Height Section */}
                                        <div className="flex-none">
                                            <div className="grid grid-cols-2 gap-4">
                                                {property.beds && (
                                                    <div className="flex items-center gap-2">
                                                        <HomeIcon className="w-4 h-4 text-primary" />
                                                        <span className="text-sm">{property.beds} Beds</span>
                                                    </div>
                                                )}
                                                {property.floor_area_sqm && (
                                                    <div className="flex items-center gap-2">
                                                        <Square2StackIcon className="w-4 h-4 text-primary" />
                                                        <span className="text-sm">{property.floor_area_sqm} sqm</span>
                                                    </div>
                                                )}
                                                {property.furnishing && (
                                                    <div className="flex items-center gap-2 col-span-2">
                                                        <div className="badge badge-ghost badge-sm">{property.furnishing}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Buttons - Always at Bottom */}
                                        <div className="mt-auto pt-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-sm gap-2 flex-1"
                                                >
                                                    <MapIcon className="w-4 h-4" />
                                                    View Map
                                                </a>
                                                <button 
                                                    className="btn btn-primary btn-sm flex-1"
                                                    onClick={() => handleViewDetails(property)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Property Details Modal */}
                        <dialog id="property_modal" className="modal">
                            <div className="modal-box max-w-2xl relative">
                                <form method="dialog" className="absolute right-2 top-2 z-30">
                                    <button className="btn btn-circle btn-ghost">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </form>
                                {selectedProperty && (
                                    <>
                                        <div className="relative h-64 -mt-6 -mx-6 mb-4">
                                            <div className="carousel w-full h-full">
                                                {(selectedProperty.images?.length > 0 ? selectedProperty.images : [getDefaultImage(selectedProperty)]).map((image, index) => (
                                                    <div key={index} className="carousel-item relative w-full h-full">
                                                        <img 
                                                            src={image} 
                                                            alt={`${selectedProperty.title} - Image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = getDefaultImage(selectedProperty);
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    <h3 className="font-bold text-xl mb-4">{selectedProperty.title}</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon className="w-5 h-5 text-primary" />
                                            <span>{selectedProperty.location || getLocationFromDescription(selectedProperty.description) || 'Location details in description'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CurrencyDollarIcon className="w-5 h-5 text-primary" />
                                            <span className="font-bold">{formatPrice(selectedProperty.price)}</span>
                                        </div>
                                        {selectedProperty.beds && (
                                            <div className="flex items-center gap-2">
                                                <HomeIcon className="w-5 h-5 text-primary" />
                                                <span>{selectedProperty.beds} Bedrooms</span>
                                            </div>
                                        )}
                                        {selectedProperty.floor_area_sqm && (
                                            <div className="flex items-center gap-2">
                                                <Square2StackIcon className="w-5 h-5 text-primary" />
                                                <span>{selectedProperty.floor_area_sqm} sqm</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedProperty.furnishing && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold mb-2">Furnishing:</h4>
                                            <div className="badge badge-primary">{selectedProperty.furnishing}</div>
                                        </div>
                                    )}

                                    </>
                                )}
                            </div>
                            <form method="dialog" className="modal-backdrop">
                                <button>close</button>
                            </form>
                        </dialog>



                        {filteredProperties.length > propertiesPerPage && (
                            <div className="flex justify-center mt-12">
                                <div className="join">
                                    <button 
                                        onClick={() => {
                                            handlePageChange(Math.max(currentPage - 1, 1));
                                        }}
                                        disabled={currentPage === 1}
                                        className="join-item btn"
                                    >
                                        «
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            handlePageChange(Math.min(currentPage + 1, totalPages));
                                        }}
                                        disabled={currentPage === totalPages}
                                        className="join-item btn"
                                    >
                                        »
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.section>
            </section>
           
            <Footer />
        </>
    );
}

export default Properties;