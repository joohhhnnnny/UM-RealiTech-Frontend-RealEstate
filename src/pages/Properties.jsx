import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '/src/components/Navbar.jsx';
import Footer from '/src/components/Footer.jsx';
import listingsData from '../listings.json';
import { 
    MagnifyingGlassIcon, 
    AdjustmentsHorizontalIcon,
    MapPinIcon,
    HomeIcon,
    CurrencyDollarIcon,
    BuildingOffice2Icon,
    Square2StackIcon
} from '@heroicons/react/24/outline';

function Properties() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [propertyType, setPropertyType] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 9;
    const propertiesSectionRef = useRef(null);

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
                    (!priceRange.min || price >= parseInt(priceRange.min)) &&
                    (!priceRange.max || price <= parseInt(priceRange.max));

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

    return (
        <>
            <Navbar />
            
            <section className="min-h-screen bg-base-100">   
                <motion.section 
                    ref={propertiesSectionRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="py-16 px-4 lg:px-24"
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search properties..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input input-bordered w-full pl-10 pr-4 bg-base-100"
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
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="input input-bordered input-sm w-24"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="input input-bordered input-sm w-24"
                                />
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
                                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                                >
                                    <div className="relative">
                                        <div className={`h-64 rounded-t-xl flex items-center justify-center relative overflow-hidden
                                                     ${property.title?.toLowerCase().includes('office') 
                                                       ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5'
                                                       : 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5'}`}
                                        >
                                            <div className="absolute inset-0 bg-base-200 opacity-50"></div>
                                            <div className="relative z-10 text-center p-4">
                                                {property.title?.toLowerCase().includes('office') ? (
                                                    <BuildingOffice2Icon className="w-16 h-16 mx-auto text-blue-500" />
                                                ) : (
                                                    <HomeIcon className="w-16 h-16 mx-auto text-emerald-500" />
                                                )}
                                                <p className="mt-4 font-semibold text-base-content/70">
                                                    {property.title?.toLowerCase().includes('office') 
                                                        ? 'Commercial Property'
                                                        : 'Residential Property'
                                                    }
                                                </p>
                                                <div className="mt-2 flex items-center justify-center gap-2">
                                                    {property.beds && (
                                                        <span className="badge badge-sm">{property.beds} Beds</span>
                                                    )}
                                                    {property.floor_area_sqm && (
                                                        <span className="badge badge-sm">{property.floor_area_sqm} sqm</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            {property.furnishing && (
                                                <div className="badge badge-primary">{property.furnishing}</div>
                                            )}
                                            {property.days_on_market && (
                                                <div className="badge badge-secondary badge-outline">
                                                    {property.days_on_market}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <h2 className="card-title text-base-content line-clamp-2">{property.title}</h2>
                                        
                                        <div className="flex items-center gap-2 text-base-content/70 mt-2">
                                            <MapPinIcon className="w-5 h-5" />
                                            <p className="line-clamp-1">{property.location || 'Location not specified'}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {property.beds && (
                                                <div className="flex items-center gap-1">
                                                    <HomeIcon className="w-5 h-5 text-primary" />
                                                    <span>{property.beds} Beds</span>
                                                </div>
                                            )}
                                            {property.floor_area_sqm && (
                                                <div className="flex items-center gap-1">
                                                    <Square2StackIcon className="w-5 h-5 text-primary" />
                                                    <span>{property.floor_area_sqm} sqm</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <CurrencyDollarIcon className="w-6 h-6 text-primary" />
                                                <span className="text-xl font-bold text-primary">
                                                    {formatPrice(property.price)}
                                                </span>
                                            </div>
                                            <button className="btn btn-primary btn-sm">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

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