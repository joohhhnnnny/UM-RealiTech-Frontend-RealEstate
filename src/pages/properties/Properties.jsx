import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "/src/components/Navbar.jsx";
import Footer from "/src/components/Footer.jsx";
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../config/Firebase';
import { getThumbnailImageUrl } from '../../utils/imageHelpers';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  Square2StackIcon,
  ArrowRightIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

function Properties() {
  const navigate = useNavigate();

  // Helper function to get location from description if location field is empty
  const getLocationFromDescription = (description) => {
    if (!description) return null;

    const locationPatterns = [
      /Location:\s*([^.|\n]+)/i,
      /located at\s*([^.|\n]+)/i,
      /located in\s*([^.|\n]+)/i,
      /address:\s*([^.|\n]+)/i,
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
    const isCommercial = property.title?.toLowerCase().includes("office");
    return isCommercial
      ? "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg"
      : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";
  };

  // Professional time-based property status helper function
  const getPropertyStatus = (property) => {
    // If days_on_market is explicitly set, use it
    if (property.days_on_market) {
      const days = parseInt(property.days_on_market);
      if (!isNaN(days)) {
        return days.toString();
      }
      return property.days_on_market;
    }

    // Calculate days since property was created
    if (property.createdAt) {
      let createdDate;
      
      // Handle Firestore timestamp format
      if (property.createdAt.seconds) {
        createdDate = new Date(property.createdAt.seconds * 1000);
      } else if (property.createdAt.toDate) {
        createdDate = property.createdAt.toDate();
      } else {
        createdDate = new Date(property.createdAt);
      }

      const now = new Date();
      const daysDifference = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

      // Define status based on time constraints
      if (daysDifference < 0) {
        return "New"; // Future date edge case
      } else if (daysDifference === 0) {
        return "Today";
      } else if (daysDifference <= 3) {
        return "New";
      } else if (daysDifference <= 7) {
        return "Fresh";
      } else if (daysDifference <= 14) {
        return `${daysDifference}d`;
      } else if (daysDifference <= 30) {
        return `${daysDifference}d`;
      } else if (daysDifference <= 90) {
        const weeks = Math.floor(daysDifference / 7);
        return `${weeks}w`;
      } else {
        const months = Math.floor(daysDifference / 30);
        return months > 12 ? `${Math.floor(months / 12)}y` : `${months}m`;
      }
    }

    // Fallback if no date information is available
    return "New";
  };

  // Helper function to get status color based on property age
  const getStatusColor = (property) => {
    const status = getPropertyStatus(property);
    
    // Calculate actual days for color determination
    let days = 0;
    if (property.createdAt) {
      let createdDate;
      if (property.createdAt.seconds) {
        createdDate = new Date(property.createdAt.seconds * 1000);
      } else if (property.createdAt.toDate) {
        createdDate = property.createdAt.toDate();
      } else {
        createdDate = new Date(property.createdAt);
      }
      days = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    }

    // Return colors based on property age
    if (status === "New" || status === "Today" || days <= 3) {
      return "#22C55E"; // Green for new listings
    } else if (status === "Fresh" || days <= 7) {
      return "#3B82F6"; // Blue for fresh listings
    } else if (days <= 30) {
      return "#F59E0B"; // Orange for recent listings
    } else {
      return "#6B7280"; // Gray for older listings
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const propertiesPerPage = 12;
  const propertiesSectionRef = useRef(null);

  // Fetch properties from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        console.log('Properties.jsx: Fetching properties from Firebase...');
        
        const propertiesRef = collection(db, 'properties');
        const q = query(
          propertiesRef,
          where('isActive', '==', true)
        );
        
        console.log('Properties.jsx: Executing query...');
        const querySnapshot = await getDocs(q);
        console.log('Properties.jsx: Found', querySnapshot.size, 'active properties');
        
        const fetchedProperties = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Properties.jsx: Property found:', { 
            id: doc.id, 
            title: data.title, 
            price: data.price, 
            isActive: data.isActive,
            agentId: data.agentId 
          });
          fetchedProperties.push({
            id: doc.id,
            ...data,
            // Ensure compatibility with existing property structure
            price: data.price?.startsWith('₱') ? data.price : `₱ ${data.price}`,
            images: data.images || [data.image] || []
          });
        });
        
        // Sort in JavaScript instead of Firestore to avoid index requirements
        fetchedProperties.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime; // Newest first
        });
        
        setProperties(fetchedProperties);
        console.log('Properties.jsx: Final properties set:', fetchedProperties.length, fetchedProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Format price for display
  const formatPriceInput = (value) => {
    if (!value) return "";
    const number = parseInt(value.replace(/[^0-9]/g, ""));
    return new Intl.NumberFormat("en-PH").format(number);
  };

  // Parse price input
  const parsePriceInput = (value) => {
    return value.replace(/[^0-9]/g, "");
  };

  // Handle price input change
  const handlePriceChange = (type, value) => {
    const numericValue = parsePriceInput(value);
    setPriceRange((prev) => ({ ...prev, [type]: numericValue }));
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter((property) => {
        const matchesSearch =
          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
          propertyType === "all"
            ? true
            : propertyType === "residential"
            ? property.type === "residential"
            : propertyType === "commercial"
            ? property.type === "commercial"
            : true;

        const price = parseInt(property.price?.replace(/[^0-9]/g, "")) || 0;
        const matchesPrice =
          (!priceRange.min ||
            price >= parseInt(parsePriceInput(priceRange.min))) &&
          (!priceRange.max ||
            price <= parseInt(parsePriceInput(priceRange.max)));

        return matchesSearch && matchesType && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return (
            (parseInt(a.price?.replace(/[^0-9]/g, "")) || 0) -
            (parseInt(b.price?.replace(/[^0-9]/g, "")) || 0)
          );
        }
        if (sortBy === "price-desc") {
          return (
            (parseInt(b.price?.replace(/[^0-9]/g, "")) || 0) -
            (parseInt(a.price?.replace(/[^0-9]/g, "")) || 0)
          );
        }
        return (
          new Date(b.createdAt?.seconds * 1000 || 0) - new Date(a.createdAt?.seconds * 1000 || 0)
        );
      });
  }, [properties, searchTerm, sortBy, propertyType, priceRange]);

  // Get current properties for pagination
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    return price.includes("/mo") ? price : price.trim();
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, propertyType, priceRange]);

  // Scroll to top when page changes
  useEffect(() => {
    if (propertiesSectionRef.current) {
      propertiesSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (property) => {
    // Navigate to the property details page
    console.log('Properties.jsx: Navigating to property:', property.id, property.title);
    navigate(`/properties/${property.id}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPropertyType("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("latest");
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        {/* Mobile-Optimized Hero Section */}
        <div className="bg-gradient-to-r from-blue-700/5 via-blue-400/5 to-accent/5 border-b border-base-300/50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                Discover Properties
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-base-content/70 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Find your perfect home or investment opportunity with our
                advanced search technology
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-base-content/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>
                    {loading ? "Loading..." : `${filteredProperties.length} Properties Available`}
                  </span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-base-content/30 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  <span>Real-time Updates</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.section
          ref={propertiesSectionRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-8 sm:py-12 lg:py-16 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto"
        >
          {/* Mobile-Optimized Search and Filters */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            {/* Mobile-Friendly Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative mb-6 sm:mb-8"
            >
              <div className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-10 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-5 text-sm sm:text-base lg:text-lg bg-base-100 text-base-content placeholder:text-base-content/50 border-2 border-base-300/50 focus:border-primary focus:outline-none transition-all duration-300 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg"
                />
                <MagnifyingGlassIcon className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 text-base-content/40" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content hover:bg-base-content/10"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* Mobile-Optimized Filters and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-base-100/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-base-300/30"
            >
              {/* Mobile Filter Row 1: Filter Toggle and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn btn-sm sm:btn-md btn-outline gap-2 text-base-content border-base-content/20 hover:border-primary hover:bg-primary hover:text-primary-content transition-all duration-300 ${
                      showFilters
                        ? "btn-primary shadow-lg"
                        : "shadow-sm hover:shadow-md"
                    }`}
                  >
                    <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline sm:inline">Advanced</span> Filters
                    {(propertyType !== "all" ||
                      priceRange.min ||
                      priceRange.max) && (
                      <div className="badge badge-primary badge-xs animate-pulse">
                        !
                      </div>
                    )}
                  </button>

                  {/* Clear Filters Button */}
                  {(searchTerm ||
                    propertyType !== "all" ||
                    priceRange.min ||
                    priceRange.max ||
                    sortBy !== "latest") && (
                    <button
                      onClick={clearFilters}
                      className="btn btn-ghost btn-sm text-error hover:bg-error/10 hover:text-error transition-all duration-300"
                    >
                      Clear
                    </button>
                  )}

                  {/* Results count on mobile */}
                  <div className="text-xs sm:text-sm font-medium text-base-content/60 bg-base-200/50 px-2 py-1 rounded-full">
                    {filteredProperties.length} results
                  </div>
                </div>

                {/* Mobile Controls Row */}
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-base-content/70 hidden sm:inline">
                      Sort:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="select select-bordered select-xs sm:select-sm bg-base-100 text-base-content border-base-300/50 focus:border-primary focus:outline-none transition-all duration-300 text-xs sm:text-sm"
                    >
                      <option value="latest">Latest</option>
                      <option value="price-asc">Price: Low</option>
                      <option value="price-desc">Price: High</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="join shadow-sm">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`btn btn-xs sm:btn-sm join-item transition-all duration-300 ${
                        viewMode === "grid"
                          ? "btn-primary shadow-md"
                          : "btn-ghost text-base-content hover:bg-base-content/10"
                      }`}
                    >
                      <Squares2X2Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`btn btn-xs sm:btn-sm join-item transition-all duration-300 ${
                        viewMode === "list"
                          ? "btn-primary shadow-md"
                          : "btn-ghost text-base-content hover:bg-base-content/10"
                      }`}
                    >
                      <ViewColumnsIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Type Filters Row - Mobile Optimized */}
              <div className="flex flex-wrap gap-2 mt-4">
                {["all", "residential", "commercial"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`btn btn-xs sm:btn-sm transition-all duration-300 ${
                      propertyType === type
                        ? "btn-primary shadow-md"
                        : "btn-ghost text-base-content hover:bg-base-content/10 hover:shadow-sm"
                    }`}
                  >
                    {type === "all"
                      ? "All"
                      : type === "residential"
                      ? "Residential"
                      : "Commercial"}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Mobile-Optimized Expandable Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 sm:mt-6 p-4 sm:p-6 lg:p-8 bg-base-100/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-base-300/40 shadow-lg"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Price Range - Mobile Optimized */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-base-content text-sm sm:text-base">
                        Price Range
                      </span>
                    </label>
                    <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
                      <div className="join flex-1">
                        <div className="join-item flex items-center px-2 sm:px-4 bg-base-200/70 text-base-content border border-base-300/50 text-xs sm:text-sm font-medium">
                          ₱
                        </div>
                        <input
                          type="text"
                          placeholder="Min"
                          value={formatPriceInput(priceRange.min)}
                          onChange={(e) =>
                            handlePriceChange("min", e.target.value)
                          }
                          className="input input-bordered input-sm join-item flex-1 bg-base-100 text-base-content placeholder:text-base-content/50 border-base-300/50 focus:border-primary transition-all duration-300 text-xs sm:text-sm"
                        />
                      </div>
                      <span className="text-base-content/50 font-medium text-center block sm:inline">
                        to
                      </span>
                      <div className="join flex-1">
                        <div className="join-item flex items-center px-2 sm:px-4 bg-base-200/70 text-base-content border border-base-300/50 text-xs sm:text-sm font-medium">
                          ₱
                        </div>
                        <input
                          type="text"
                          placeholder="Max"
                          value={formatPriceInput(priceRange.max)}
                          onChange={(e) =>
                            handlePriceChange("max", e.target.value)
                          }
                          className="input input-bordered input-sm join-item flex-1 bg-base-100 text-base-content placeholder:text-base-content/50 border-base-300/50 focus:border-primary transition-all duration-300 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Type Filter */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-base-content text-sm sm:text-base">
                        Property Type
                      </span>
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="select select-bordered select-sm sm:select-md w-full bg-base-100 text-base-content border-base-300/50 focus:border-primary transition-all duration-300 text-xs sm:text-sm"
                    >
                      <option value="all">All Property Types</option>
                      <option value="residential">Residential Properties</option>
                      <option value="commercial">Commercial Properties</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-16 sm:py-24"
            >
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="loading loading-spinner loading-md sm:loading-lg text-primary"></div>
                <p className="text-base sm:text-xl text-base-content/70">Loading properties...</p>
                <p className="text-xs sm:text-sm text-base-content/50 text-center px-4">Fetching the latest listings from our database</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Mobile-Optimized Results Grid/List - Fixed Static Layout */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full overflow-hidden"
                    : "space-y-4 sm:space-y-6 lg:space-y-8 w-full overflow-hidden"
                }
              >
                {currentProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.6, duration: 0.4 }}
                    className={`group cursor-pointer w-full ${
                      viewMode === "grid"
                        ? "card bg-base-100 shadow-md hover:shadow-2xl border border-base-300/30 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 rounded-xl sm:rounded-2xl max-w-full sm:min-w-[280px] md:min-w-[300px] lg:min-w-[320px] xl:min-w-[380px]"
                        : "flex flex-col sm:flex-row bg-base-100 shadow-md hover:shadow-xl border border-base-300/30 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 max-w-full"
                    }`}
                    onClick={() => handleViewDetails(property)}
                  >
                    {viewMode === "grid" ? (
                      <>
                        {/* Mobile-Static Grid View */}
                        <div className="relative w-full">
                          <div className="h-48 sm:h-52 md:h-56 lg:h-60 xl:h-72 relative overflow-hidden w-full">
                            <img
                              src={
                                getThumbnailImageUrl(property) || getDefaultImage(property)
                              }
                              alt={property.title}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getDefaultImage(property);
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Mobile-Optimized Badges - No Overflow */}
                            <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 right-2 sm:right-3 md:right-4 flex justify-between items-start gap-1 flex-wrap sm:flex-nowrap">
                              {property.title?.toLowerCase().includes("office") ? (
                                <div
                                  className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white text-xs sm:text-sm lg:text-base font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0"
                                  style={{ backgroundColor: "#F5A623" }}
                                >
                                  <BuildingOffice2Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                                  <span className="whitespace-nowrap hidden sm:inline">Commercial</span>
                                  <span className="whitespace-nowrap sm:hidden">Com</span>
                                </div>
                              ) : (
                                <div
                                  className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white text-xs sm:text-sm lg:text-base font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0"
                                  style={{ backgroundColor: "#6EC1E4" }}
                                >
                                  <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                                  <span className="whitespace-nowrap hidden sm:inline">Residential</span>
                                  <span className="whitespace-nowrap sm:hidden">Res</span>
                                </div>
                              )}
                              <div
                                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white text-xs sm:text-sm lg:text-base font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 whitespace-nowrap flex-shrink-0"
                                style={{ backgroundColor: getStatusColor(property) }}
                              >
                                {getPropertyStatus(property)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile-Static Card Body */}
                        <div className="card-body p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex flex-col h-full w-full min-w-0">
                          <div className="flex-none mb-2 sm:mb-3 md:mb-4 w-full">
                            <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-primary truncate">
                              {formatPrice(property.price)}
                            </div>
                          </div>

                          <div className="flex-none mb-3 sm:mb-4 md:mb-5 w-full min-w-0">
                            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-base-content line-clamp-2 mb-1.5 sm:mb-2 md:mb-3 group-hover:text-primary transition-colors duration-300 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3.5rem] lg:min-h-[4rem]">
                              {property.title}
                            </h2>

                            <div className="flex items-start gap-1 sm:gap-2 text-base-content/60 w-full min-w-0">
                              <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0 text-primary/70 mt-0.5" />
                              <p className="text-xs sm:text-sm md:text-base line-clamp-2 flex-1 min-w-0">
                                {property.location ||
                                  getLocationFromDescription(property.description) ||
                                  "Location details in description"}
                              </p>
                            </div>
                          </div>

                          {/* Mobile-Static Property Details */}
                          <div className="flex-none mb-4 sm:mb-5 md:mb-6 w-full">
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4 w-full">
                              {property.beds && (
                                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 lg:p-4 bg-base-200/40 rounded-lg border border-base-300/20 min-w-0 flex-1">
                                  <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary/70 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm md:text-base font-medium text-base-content truncate">
                                    {property.beds} <span className="hidden sm:inline">Beds</span><span className="sm:hidden">B</span>
                                  </span>
                                </div>
                              )}
                              {property.floor_area_sqm && (
                                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 lg:p-4 bg-base-200/40 rounded-lg border border-base-300/20 min-w-0 flex-1">
                                  <Square2StackIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary/70 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm md:text-base font-medium text-base-content truncate">
                                    {property.floor_area_sqm} sqm
                                  </span>
                                </div>
                              )}
                            </div>

                            {property.furnishing && (
                              <div className="min-h-[1.5rem] sm:min-h-[2rem] md:min-h-[2.5rem] flex items-center w-full">
                                <div className="badge badge-ghost text-base-content/70 bg-base-200/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 truncate max-w-full">
                                  {property.furnishing}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mobile-Static Button */}
                          <div className="mt-auto flex-none w-full">
                            <button
                              className="btn btn-sm sm:btn-md lg:btn-lg btn-primary w-full gap-1 sm:gap-2 md:gap-3 shadow-md hover:shadow-lg group-hover:btn-secondary transition-all duration-300 text-xs sm:text-sm lg:text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(property);
                              }}
                            >
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden">View</span>
                              <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Mobile-Static List View */}
                        <div className="w-full sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-40 sm:h-48 md:h-56 lg:h-64 relative overflow-hidden flex-shrink-0">
                          <img
                            src={getThumbnailImageUrl(property) || getDefaultImage(property)}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getDefaultImage(property);
                            }}
                          />
                          <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 max-w-[calc(100%-2rem)]">
                            {property.title?.toLowerCase().includes("office") ? (
                              <div
                                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white text-xs sm:text-sm lg:text-base font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1 sm:gap-2 md:gap-3 max-w-full"
                                style={{ backgroundColor: "#F5A623" }}
                              >
                                <BuildingOffice2Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                                <span className="whitespace-nowrap truncate">Commercial</span>
                              </div>
                            ) : (
                              <div
                                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white text-xs sm:text-sm lg:text-base font-semibold shadow-lg backdrop-blur-sm flex items-center gap-1 sm:gap-2 md:gap-3 max-w-full"
                                style={{ backgroundColor: "#6EC1E4" }}
                              >
                                <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                                <span className="whitespace-nowrap truncate">Residential</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mobile-Static List Content */}
                        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-between min-w-0 w-full">
                          <div className="w-full min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3 md:mb-4 gap-1 sm:gap-2 w-full min-w-0">
                              <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-bold text-base-content line-clamp-2 group-hover:text-primary transition-colors duration-300 flex-1 min-w-0">
                                {property.title}
                              </h2>
                              <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-primary whitespace-nowrap flex-shrink-0">
                                {formatPrice(property.price)}
                              </div>
                            </div>

                            <div className="flex items-start gap-1 sm:gap-2 text-base-content/60 mb-3 sm:mb-4 md:mb-6 w-full min-w-0">
                              <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0 text-primary/70 mt-0.5" />
                              <p className="text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 flex-1 min-w-0">
                                {property.location ||
                                  getLocationFromDescription(property.description) ||
                                  "Location details in description"}
                              </p>
                            </div>

                            {/* Mobile-Static List Details */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-3 sm:mb-4 md:mb-6 w-full">
                              {property.beds && (
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary/70" />
                                  <span className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-base-content whitespace-nowrap">
                                    {property.beds} <span className="hidden sm:inline">Beds</span><span className="sm:hidden">B</span>
                                  </span>
                                </div>
                              )}
                              {property.floor_area_sqm && (
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  <Square2StackIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary/70" />
                                  <span className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-base-content whitespace-nowrap">
                                    {property.floor_area_sqm} sqm
                                  </span>
                                </div>
                              )}
                              {property.furnishing && (
                                <div className="badge badge-ghost text-base-content/70 bg-base-200/30 text-xs sm:text-sm lg:text-base px-2 sm:px-3 py-1 sm:py-2 truncate max-w-full flex-shrink-0">
                                  {property.furnishing}
                                </div>
                              )}
                              <div
                                className="px-2 sm:px-3 py-1 sm:py-2 rounded-full text-white text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0"
                                style={{ backgroundColor: getStatusColor(property) }}
                              >
                                {getPropertyStatus(property)}
                              </div>
                            </div>
                          </div>

                          {/* Mobile-Static List Button */}
                          <div className="flex justify-end w-full">
                            <button
                              className="btn btn-sm sm:btn-md lg:btn-lg btn-primary gap-1 sm:gap-2 md:gap-3 shadow-md hover:shadow-lg text-xs sm:text-sm lg:text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(property);
                              }}
                            >
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden">View</span>
                              <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {/* Mobile-Optimized Pagination */}
                {filteredProperties.length > propertiesPerPage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="flex justify-center mt-12 sm:mt-16 lg:mt-20"
                  >
                    <div className="join shadow-lg bg-base-100 rounded-xl sm:rounded-2xl overflow-hidden">
                      <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="join-item btn btn-sm sm:btn-md lg:btn-lg hover:btn-primary transition-all duration-300"
                      >
                        «
                      </button>
                      {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 3 : 5) }, (_, i) => {
                        const pageNum =
                          currentPage <= 3
                            ? i + 1
                            : currentPage >= totalPages - 2
                            ? totalPages - (window.innerWidth < 640 ? 2 : 4) + i
                            : currentPage - (window.innerWidth < 640 ? 1 : 2) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`join-item btn btn-sm sm:btn-md lg:btn-lg transition-all duration-300 ${
                              currentPage === pageNum
                                ? "btn-primary shadow-md"
                                : "hover:btn-primary/20"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() =>
                          handlePageChange(Math.min(currentPage + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="join-item btn btn-sm sm:btn-md lg:btn-lg hover:btn-primary transition-all duration-300"
                      >
                        »
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Mobile-Optimized No Results */}
                {filteredProperties.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 sm:py-24 px-4"
                  >
                    <div className="text-6xl sm:text-8xl lg:text-9xl mb-6 sm:mb-8">🔍</div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-base-content mb-4 sm:mb-6">
                      No Properties Found
                    </h3>
                    <p className="text-sm sm:text-lg lg:text-xl text-base-content/60 mb-8 sm:mb-10 max-w-lg mx-auto">
                      We couldn't find any properties matching your search criteria.
                      Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn btn-sm sm:btn-md lg:btn-lg btn-primary gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
                    >
                      <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </motion.section>
      </section>

      <Footer />
    </>
  );
}

export default Properties;