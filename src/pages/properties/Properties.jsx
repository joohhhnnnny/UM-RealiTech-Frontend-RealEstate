import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "/src/components/Navbar.jsx";
import Footer from "/src/components/Footer.jsx";
import listingsData from "../../json/listings.json";
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
    const isCommercial = property.title?.toLowerCase().includes("office");
    return isCommercial
      ? "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg"
      : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const propertiesPerPage = 12;
  const propertiesSectionRef = useRef(null);

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
    return listingsData
      .filter((property) => {
        const matchesSearch =
          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
          propertyType === "all"
            ? true
            : propertyType === "residential"
            ? !property.title?.toLowerCase().includes("office")
            : propertyType === "commercial"
            ? property.title?.toLowerCase().includes("office")
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
          new Date(b.days_on_market || 0) - new Date(a.days_on_market || 0)
        );
      });
  }, [searchTerm, sortBy, propertyType, priceRange]);

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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700/5 via-blue-400/5 to-accent/5 border-b border-base-300/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent mb-6">
                Discover Properties
              </h1>
              <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
                Find your perfect home or investment opportunity with our
                advanced search technology
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-base-content/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>{filteredProperties.length} Properties Available</span>
                </div>
                <div className="w-1 h-1 bg-base-content/30 rounded-full"></div>
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
          className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          {/* Advanced Search and Filters */}
          <div className="mb-16">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="relative max-w-3xl mx-auto">
                <input
                  type="text"
                  placeholder="Search by property name, location, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-14 pr-12 py-5 text-lg bg-base-100 text-base-content placeholder:text-base-content/50 border-2 border-base-300/50 focus:border-primary focus:outline-none transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md focus:shadow-lg"
                />
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-base-content/40" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content hover:bg-base-content/10"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* Filters and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-base-100/50 backdrop-blur-sm rounded-2xl p-6 border border-base-300/30"
            >
              {/* Filter Toggle and Quick Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn btn-outline gap-2 text-base-content border-base-content/20 hover:border-primary hover:bg-primary hover:text-primary-content transition-all duration-300 ${
                    showFilters
                      ? "btn-primary shadow-lg"
                      : "shadow-sm hover:shadow-md"
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                  Advanced Filters
                  {(propertyType !== "all" ||
                    priceRange.min ||
                    priceRange.max) && (
                    <div className="badge badge-primary badge-sm animate-pulse">
                      !
                    </div>
                  )}
                </button>

                {/* Quick Type Filters */}
                <div className="flex gap-2">
                  {["all", "residential", "commercial"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setPropertyType(type)}
                      className={`btn btn-sm transition-all duration-300 ${
                        propertyType === type
                          ? "btn-primary shadow-md"
                          : "btn-ghost text-base-content hover:bg-base-content/10 hover:shadow-sm"
                      }`}
                    >
                      {type === "all"
                        ? "All Properties"
                        : type === "residential"
                        ? "Residential"
                        : "Commercial"}
                    </button>
                  ))}
                </div>

                {/* Clear Filters */}
                {(searchTerm ||
                  propertyType !== "all" ||
                  priceRange.min ||
                  priceRange.max ||
                  sortBy !== "latest") && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-sm text-error hover:bg-error/10 hover:text-error transition-all duration-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* View Controls and Sort */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-base-content/70">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="select select-bordered select-sm bg-base-100 text-base-content border-base-300/50 focus:border-primary focus:outline-none transition-all duration-300"
                  >
                    <option value="latest">Latest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="join shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`btn btn-sm join-item transition-all duration-300 ${
                      viewMode === "grid"
                        ? "btn-primary shadow-md"
                        : "btn-ghost text-base-content hover:bg-base-content/10"
                    }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`btn btn-sm join-item transition-all duration-300 ${
                      viewMode === "list"
                        ? "btn-primary shadow-md"
                        : "btn-ghost text-base-content hover:bg-base-content/10"
                    }`}
                  >
                    <ViewColumnsIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-medium text-base-content/60 bg-base-200/50 px-3 py-1 rounded-full">
                  {filteredProperties.length} results
                </div>
              </div>
            </motion.div>

            {/* Expandable Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-8 bg-base-100/70 backdrop-blur-sm rounded-2xl border border-base-300/40 shadow-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Price Range */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-base-content text-base">
                        Price Range
                      </span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="join flex-1">
                        <div className="join-item flex items-center px-4 bg-base-200/70 text-base-content border border-base-300/50 text-sm font-medium">
                          ₱
                        </div>
                        <input
                          type="text"
                          placeholder="Minimum"
                          value={formatPriceInput(priceRange.min)}
                          onChange={(e) =>
                            handlePriceChange("min", e.target.value)
                          }
                          className="input input-bordered input-sm join-item flex-1 bg-base-100 text-base-content placeholder:text-base-content/50 border-base-300/50 focus:border-primary transition-all duration-300"
                        />
                      </div>
                      <span className="text-base-content/50 font-medium">
                        —
                      </span>
                      <div className="join flex-1">
                        <div className="join-item flex items-center px-4 bg-base-200/70 text-base-content border border-base-300/50 text-sm font-medium">
                          ₱
                        </div>
                        <input
                          type="text"
                          placeholder="Maximum"
                          value={formatPriceInput(priceRange.max)}
                          onChange={(e) =>
                            handlePriceChange("max", e.target.value)
                          }
                          className="input input-bordered input-sm join-item flex-1 bg-base-100 text-base-content placeholder:text-base-content/50 border-base-300/50 focus:border-primary transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Type Filter */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-base-content text-base">
                        Property Type
                      </span>
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="select select-bordered w-full bg-base-100 text-base-content border-base-300/50 focus:border-primary transition-all duration-300"
                    >
                      <option value="all">All Property Types</option>
                      <option value="residential">
                        Residential Properties
                      </option>
                      <option value="commercial">Commercial Properties</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Grid/List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                : "space-y-8"
            }
          >
            {currentProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.6, duration: 0.4 }}
                className={`group cursor-pointer ${
                  viewMode === "grid"
                    ? "card bg-base-100 shadow-md hover:shadow-2xl border border-base-300/30 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 rounded-2xl"
                    : "flex bg-base-100 shadow-md hover:shadow-xl border border-base-300/30 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30"
                }`}
                onClick={() => handleViewDetails(property)}
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Grid View */}
                    <div className="relative">
                      <div className="h-64 relative overflow-hidden">
                        <img
                          src={
                            property.images?.[0] || getDefaultImage(property)
                          }
                          alt={property.title}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getDefaultImage(property);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Custom Color Badges */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          {property.title?.toLowerCase().includes("office") ? (
                            <div
                              className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                              style={{ backgroundColor: "#F5A623" }}
                            >
                              <BuildingOffice2Icon className="w-4 h-4" />
                              Commercial
                            </div>
                          ) : (
                            <div
                              className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                              style={{ backgroundColor: "#6EC1E4" }}
                            >
                              <HomeIcon className="w-4 h-4" />
                              Residential
                            </div>
                          )}
                          <div
                            className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm"
                            style={{ backgroundColor: "#22C55E" }}
                          >
                            {property.days_on_market || "New"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body with Enhanced Design */}
                    <div className="card-body p-6 flex flex-col h-full">
                      {/* Price Section */}
                      <div className="flex-none mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(property.price)}
                        </div>
                      </div>

                      {/* Title and Location */}
                      <div className="flex-none mb-4">
                        <h2 className="text-lg font-bold text-base-content line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300 min-h-[3.5rem]">
                          {property.title}
                        </h2>

                        <div className="flex items-center gap-2 text-base-content/60">
                          <MapPinIcon className="w-4 h-4 flex-shrink-0 text-primary/70" />
                          <p className="text-sm line-clamp-1">
                            {property.location ||
                              getLocationFromDescription(
                                property.description
                              ) ||
                              "Location details in description"}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex-none mb-6">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {property.beds && (
                            <div className="flex items-center gap-2 p-2.5 bg-base-200/40 rounded-lg border border-base-300/20">
                              <HomeIcon className="w-4 h-4 text-primary/70" />
                              <span className="text-sm font-medium text-base-content">
                                {property.beds} Beds
                              </span>
                            </div>
                          )}
                          {property.floor_area_sqm && (
                            <div className="flex items-center gap-2 p-2.5 bg-base-200/40 rounded-lg border border-base-300/20">
                              <Square2StackIcon className="w-4 h-4 text-primary/70" />
                              <span className="text-sm font-medium text-base-content">
                                {property.floor_area_sqm} sqm
                              </span>
                            </div>
                          )}
                        </div>

                        {property.furnishing && (
                          <div className="min-h-[2rem] flex items-center">
                            <div className="badge badge-ghost text-base-content/70 bg-base-200/30">
                              {property.furnishing}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div className="mt-auto flex-none">
                        <button
                          className="btn btn-primary w-full gap-2 shadow-md hover:shadow-lg group-hover:btn-secondary transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(property);
                          }}
                        >
                          View Details
                          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="w-80 h-56 relative overflow-hidden flex-shrink-0">
                      <img
                        src={property.images?.[0] || getDefaultImage(property)}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDefaultImage(property);
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        {property.title?.toLowerCase().includes("office") ? (
                          <div
                            className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                            style={{ backgroundColor: "#F5A623" }}
                          >
                            <BuildingOffice2Icon className="w-4 h-4" />
                            Commercial
                          </div>
                        ) : (
                          <div
                            className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                            style={{ backgroundColor: "#6EC1E4" }}
                          >
                            <HomeIcon className="w-4 h-4" />
                            Residential
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-2xl font-bold text-base-content line-clamp-2 group-hover:text-primary transition-colors duration-300 flex-1 mr-6">
                            {property.title}
                          </h2>
                          <div className="text-2xl font-bold text-primary whitespace-nowrap">
                            {formatPrice(property.price)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-base-content/60 mb-6">
                          <MapPinIcon className="w-4 h-4 flex-shrink-0 text-primary/70" />
                          <p className="text-base">
                            {property.location ||
                              getLocationFromDescription(
                                property.description
                              ) ||
                              "Location details in description"}
                          </p>
                        </div>

                        <div className="flex items-center gap-8 mb-6">
                          {property.beds && (
                            <div className="flex items-center gap-2">
                              <HomeIcon className="w-5 h-5 text-primary/70" />
                              <span className="text-base font-medium text-base-content">
                                {property.beds} Beds
                              </span>
                            </div>
                          )}
                          {property.floor_area_sqm && (
                            <div className="flex items-center gap-2">
                              <Square2StackIcon className="w-5 h-5 text-primary/70" />
                              <span className="text-base font-medium text-base-content">
                                {property.floor_area_sqm} sqm
                              </span>
                            </div>
                          )}
                          {property.furnishing && (
                            <div className="badge badge-ghost text-base-content/70 bg-base-200/30">
                              {property.furnishing}
                            </div>
                          )}
                          <div
                            className="px-2 py-1 rounded-full text-white text-sm font-medium"
                            style={{ backgroundColor: "#22C55E" }}
                          >
                            {property.days_on_market || "New"}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          className="btn btn-primary gap-2 shadow-md hover:shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(property);
                          }}
                        >
                          View Details
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Pagination */}
          {filteredProperties.length > propertiesPerPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex justify-center mt-20"
            >
              <div className="join shadow-lg bg-base-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="join-item btn btn-lg hover:btn-primary transition-all duration-300"
                >
                  «
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum =
                    currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`join-item btn btn-lg transition-all duration-300 ${
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
                  className="join-item btn btn-lg hover:btn-primary transition-all duration-300"
                >
                  »
                </button>
              </div>
            </motion.div>
          )}

          {/* Enhanced No Results */}
          {filteredProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24"
            >
              <div className="text-9xl mb-8">🔍</div>
              <h3 className="text-4xl font-bold text-base-content mb-6">
                No Properties Found
              </h3>
              <p className="text-xl text-base-content/60 mb-10 max-w-lg mx-auto">
                We couldn't find any properties matching your search criteria.
                Try adjusting your filters or search terms.
              </p>
              <button
                onClick={clearFilters}
                className="btn btn-primary btn-lg gap-3 shadow-lg hover:shadow-xl"
              >
                <FunnelIcon className="w-6 h-6" />
                Clear All Filters
              </button>
            </motion.div>
          )}
        </motion.section>
      </section>

      <Footer />
    </>
  );
}

export default Properties;
