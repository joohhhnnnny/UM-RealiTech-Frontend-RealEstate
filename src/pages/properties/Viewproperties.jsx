import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import listingsData from "../../json/listings.json";
import {
  ArrowLeftIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  Square2StackIcon,
  MapIcon,
  CalendarDaysIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon as DollarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

function ViewProperties() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const foundProperty = listingsData.find((p) => p.id === id);
    if (foundProperty) {
      setProperty(foundProperty);
    }
    setLoading(false);
  }, [id]);

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
    const isCommercial = property?.title?.toLowerCase().includes("office");
    return isCommercial
      ? "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg"
      : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    return price.includes("/mo") ? price : price.trim();
  };

  const handlePrevImage = () => {
    const images =
      property.images?.length > 0
        ? property.images
        : [getDefaultImage(property)];
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images =
      property.images?.length > 0
        ? property.images
        : [getDefaultImage(property)];
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  // Helper function to generate Google Maps URL for external links
  const getGoogleMapsUrl = (location) => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  // Helper function to get Google Maps embed URL from property data
  const getGoogleMapsEmbedUrl = (property) => {
    // First, try to use the manual embed URL from the JSON
    if (property.maps_embed_url) {
      return property.maps_embed_url;
    }
    
    // Fallback: generate a basic embed URL without API key
    const encodedLocation = encodeURIComponent(property.location);
    return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/70 font-medium">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="text-8xl mb-6">🏠</div>
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Property Not Found
            </h2>
            <p className="text-base-content/60 mb-8 text-lg">
              The property you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => navigate("/properties")}
              className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Properties
            </button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  const images =
    property.images?.length > 0 ? property.images : [getDefaultImage(property)];
  const location =
    property.location ||
    getLocationFromDescription(property.description) ||
    "Location details in description";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        {/* Enhanced Back Button */}
        <div className="bg-base-100/80 backdrop-blur-sm border-b border-base-300/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate("/properties")}
              className="btn btn-ghost gap-2 text-base-content hover:bg-base-content/10 hover:text-primary transition-all duration-300"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Properties
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Enhanced Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
              >
                <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-base-200 shadow-xl">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => setIsImageModalOpen(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getDefaultImage(property);
                    }}
                  />

                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost bg-base-100/20 hover:bg-base-100/40 text-base-content border-none backdrop-blur-sm shadow-lg transition-all duration-300"
                      >
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost bg-base-100/20 hover:bg-base-100/40 text-base-content border-none backdrop-blur-sm shadow-lg transition-all duration-300"
                      >
                        <ChevronRightIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Enhanced Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-base-100/90 text-base-content px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg border border-base-300/50">
                    <EyeIcon className="w-4 h-4 inline mr-2" />
                    {currentImageIndex + 1} / {images.length}
                  </div>

                  {/* Enhanced Property Type Badge */}
                  <div className="absolute top-4 left-4">
                    {property.title?.toLowerCase().includes("office") ? (
                      <div 
                        className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                        style={{ backgroundColor: '#F5A623' }}
                      >
                        <BuildingOffice2Icon className="w-4 h-4" />
                        Commercial Property
                      </div>
                    ) : (
                      <div 
                        className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                        style={{ backgroundColor: '#6EC1E4' }}
                      >
                        <HomeIcon className="w-4 h-4" />
                        Residential Property
                      </div>
                    )}
                  </div>

                  {/* Days on Market Badge */}
                  {property.days_on_market && (
                    <div className="absolute top-4 right-4">
                      <div 
                        className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2"
                        style={{ backgroundColor: '#22C55E' }}
                      >
                        <ClockIcon className="w-4 h-4" />
                        {property.days_on_market}
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-18 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-lg ${
                          index === currentImageIndex
                            ? "border-primary ring-2 ring-primary/30 scale-105"
                            : "border-base-300/50 hover:border-primary/50 hover:scale-102"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getDefaultImage(property);
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Enhanced Property Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Enhanced Title and Price */}
                <div className="bg-base-100/80 backdrop-blur-sm p-8 rounded-2xl border border-base-300/50 shadow-lg">
                  <h1 className="text-4xl font-bold text-base-content mb-4 leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-3 text-base-content/70 mb-6">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <span className="text-lg">{location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarIcon className="w-8 h-8 text-primary" />
                    <div className="text-4xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                  </div>
                </div>

                {/* Enhanced Key Features */}
                <div className="bg-base-100/80 backdrop-blur-sm p-8 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-3">
                    <HomeIcon className="w-7 h-7 text-primary" />
                    Property Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {property.beds && (
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl text-center border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                        <HomeIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                        <div className="text-2xl font-bold text-base-content mb-1">
                          {property.beds}
                        </div>
                        <div className="text-sm text-base-content/60 font-medium">
                          Bedrooms
                        </div>
                      </div>
                    )}
                    {property.baths && (
                      <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-xl text-center border border-secondary/20 hover:border-secondary/30 transition-all duration-300 hover:shadow-md">
                        <div className="w-8 h-8 text-secondary mx-auto mb-3 flex items-center justify-center text-2xl">
                          🚿
                        </div>
                        <div className="text-2xl font-bold text-base-content mb-1">
                          {property.baths}
                        </div>
                        <div className="text-sm text-base-content/60 font-medium">
                          Bathrooms
                        </div>
                      </div>
                    )}
                    {property.floor_area_sqm && (
                      <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-6 rounded-xl text-center border border-accent/20 hover:border-accent/30 transition-all duration-300 hover:shadow-md">
                        <Square2StackIcon className="w-8 h-8 text-accent mx-auto mb-3" />
                        <div className="text-2xl font-bold text-base-content mb-1">
                          {property.floor_area_sqm}
                        </div>
                        <div className="text-sm text-base-content/60 font-medium">
                          sqm Floor
                        </div>
                      </div>
                    )}
                    {property.lot_area_sqm && property.lot_area_sqm !== "0" && (
                      <div className="bg-gradient-to-br from-info/10 to-info/5 p-6 rounded-xl text-center border border-info/20 hover:border-info/30 transition-all duration-300 hover:shadow-md">
                        <div className="w-8 h-8 text-info mx-auto mb-3 flex items-center justify-center text-2xl">
                          🏞️
                        </div>
                        <div className="text-2xl font-bold text-base-content mb-1">
                          {property.lot_area_sqm}
                        </div>
                        <div className="text-sm text-base-content/60 font-medium">
                          sqm Lot
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Property Information */}
                <div className="bg-base-100/80 backdrop-blur-sm p-8 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-3">
                    <TagIcon className="w-7 h-7 text-primary" />
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {property.furnishing && (
                      <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                        <span className="text-base-content/70 font-medium">
                          Furnishing Status:
                        </span>
                        <div className="badge badge-primary badge-lg">
                          {property.furnishing}
                        </div>
                      </div>
                    )}
                    {property.days_on_market && (
                      <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                        <span className="text-base-content/70 font-medium">
                          Days on Market:
                        </span>
                        <span className="font-bold text-base-content text-lg">
                          {property.days_on_market}
                        </span>
                      </div>
                    )}
                    {property.association_dues && (
                      <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                        <span className="text-base-content/70 font-medium">
                          Association Dues:
                        </span>
                        <span className="font-bold text-base-content text-lg">
                          {property.association_dues}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div className="bg-base-100/80 backdrop-blur-sm p-8 rounded-2xl border border-base-300/50 shadow-lg">
                    <h3 className="text-2xl font-bold text-base-content mb-6">
                      Amenities & Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg border border-base-300/30 hover:border-primary/30 transition-all duration-300">
                          <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-base-content/80 font-medium">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Description */}
                {property.description && (
                  <div className="bg-base-100/80 backdrop-blur-sm p-8 rounded-2xl border border-base-300/50 shadow-lg">
                    <h3 className="text-2xl font-bold text-base-content mb-6">
                      Property Description
                    </h3>
                    <div className="prose prose-lg max-w-none text-base-content/80 leading-relaxed">
                      {property.description
                        .split("\n")
                        .map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Google Maps Section */}
                <div className="bg-base-100/80 backdrop-blur-sm p-8 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-3">
                    <MapIcon className="w-7 h-7 text-primary" />
                    Location & Map
                  </h3>
                  
                  {/* Interactive Map */}
                  <div className="rounded-xl overflow-hidden border border-base-300/50 mb-6 shadow-lg">
                    {!mapError ? (
                      <iframe
                        src={getGoogleMapsEmbedUrl(property)}
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-96"
                        title={`Map showing location of ${property.title}`}
                        onLoad={() => console.log('Map loaded successfully')}
                        onError={() => {
                          console.log('Map failed to load');
                          setMapError(true);
                        }}
                      ></iframe>
                    ) : (
                      <div className="w-full h-96 bg-base-200/80 flex items-center justify-center rounded-xl border border-base-300/50">
                        <div className="text-center p-8">
                          <MapIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                          <p className="text-base-content/60 mb-4 text-lg">Map temporarily unavailable</p>
                          <a
                            href={getGoogleMapsUrl(location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary gap-2"
                          >
                            <MapIcon className="w-5 h-5" />
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Location Info and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-primary" />
                      <span className="text-base-content font-medium">{location}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <a
                        href={getGoogleMapsUrl(location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm gap-2 hover:btn-primary transition-all duration-300"
                      >
                        <MapIcon className="w-4 h-4" />
                        Open in Maps
                      </a>
                      
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm gap-2 shadow-md hover:shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Right Column - Contact and Actions */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="sticky top-32 space-y-6"
              >
                {/* Enhanced Quick Actions */}
                <div className="bg-base-100/90 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-primary" />
                    Quick Actions
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={`btn flex-1 gap-2 transition-all duration-300 ${
                        isFavorited 
                          ? "btn-error text-error-content shadow-lg" 
                          : "btn-outline text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content"
                      }`}
                    >
                      {isFavorited ? (
                        <HeartIconSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      {isFavorited ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={handleShare}
                      className="btn btn-outline text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Enhanced Contact Information */}
                <div className="bg-base-100/90 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                    Contact Agent
                  </h3>
                  <div className="space-y-3">
                    <button className="btn btn-outline w-full gap-2 text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300">
                      <PhoneIcon className="w-5 h-5" />
                      Call Now
                    </button>
                    <button className="btn btn-outline w-full gap-2 text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300">
                      <EnvelopeIcon className="w-5 h-5" />
                      Send Message
                    </button>
                  </div>
                  
                  {/* Agent Info Placeholder */}
                  <div className="mt-6 p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                    <div className="text-sm text-base-content/70 mb-2">Listed by:</div>
                    <div className="font-semibold text-base-content">Professional Agent</div>
                    <div className="text-sm text-base-content/60">Licensed Real Estate Broker</div>
                  </div>
                </div>

                {/* Enhanced Location Actions */}
                <div className="bg-base-100/90 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-primary" />
                    Location Tools
                  </h3>
                  <div className="space-y-3">
                    <a
                      href={getGoogleMapsUrl(location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline w-full gap-2 text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300"
                    >
                      <MapIcon className="w-5 h-5" />
                      View on Google Maps
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Get Directions
                    </a>
                  </div>
                  
                  {/* Nearby Places */}
                  <div className="mt-6 p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                    <div className="text-sm font-medium text-base-content mb-3">Explore Nearby:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <a href={`${getGoogleMapsUrl(location + " restaurants")}`} target="_blank" rel="noopener noreferrer" className="text-base-content/70 hover:text-primary transition-colors">🍽️ Restaurants</a>
                      <a href={`${getGoogleMapsUrl(location + " schools")}`} target="_blank" rel="noopener noreferrer" className="text-base-content/70 hover:text-primary transition-colors">🏫 Schools</a>
                      <a href={`${getGoogleMapsUrl(location + " hospital")}`} target="_blank" rel="noopener noreferrer" className="text-base-content/70 hover:text-primary transition-colors">🏥 Hospitals</a>
                      <a href={`${getGoogleMapsUrl(location + " shopping")}`} target="_blank" rel="noopener noreferrer" className="text-base-content/70 hover:text-primary transition-colors">🛍️ Shopping</a>
                    </div>
                  </div>
                </div>

                {/* Enhanced Related Properties */}
                <div className="bg-base-100/90 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <BuildingOffice2Icon className="w-5 h-5 text-primary" />
                    More Properties
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-base-content/60 mb-4">
                      Discover similar properties in this area and expand your options.
                    </div>
                    <button
                      onClick={() => navigate("/properties")}
                      className="btn btn-ghost w-full text-base-content hover:btn-primary hover:text-primary-content transition-all duration-300"
                    >
                      View All Properties
                    </button>
                    <button
                      onClick={() => navigate(`/properties?type=${property.title?.toLowerCase().includes("office") ? "commercial" : "residential"}`)}
                      className="btn btn-outline w-full text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300"
                    >
                      Similar Properties
                    </button>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="bg-base-100/90 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-lg font-bold text-base-content mb-4">Property Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Views Today:</span>
                      <span className="font-semibold text-base-content">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Total Views:</span>
                      <span className="font-semibold text-base-content">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Last Updated:</span>
                      <span className="font-semibold text-base-content">2 days ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Enhanced Image Modal */}
        {isImageModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box max-w-7xl w-full h-[95vh] p-0 relative bg-base-100/95 backdrop-blur-md border border-base-300/50 rounded-2xl shadow-2xl">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-6 right-6 btn btn-circle btn-ghost z-10 bg-base-100/20 text-base-content hover:bg-base-100/40 border-none backdrop-blur-sm shadow-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full p-4">
                <img
                  src={images[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultImage(property);
                  }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost bg-base-100/20 hover:bg-base-100/40 text-base-content border-none backdrop-blur-sm shadow-lg"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost bg-base-100/20 hover:bg-base-100/40 text-base-content border-none backdrop-blur-sm shadow-lg"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image info overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                  <div className="bg-base-100/90 text-base-content px-4 py-2 rounded-full backdrop-blur-sm">
                    Image {currentImageIndex + 1} of {images.length}
                  </div>
                  <button
                    onClick={() => setIsImageModalOpen(false)}
                    className="btn btn-ghost bg-base-100/90 text-base-content backdrop-blur-sm"
                  >
                    Close Gallery
                  </button>
                </div>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop bg-black/50">
              <button onClick={() => setIsImageModalOpen(false)}>close</button>
            </form>
          </dialog>
        )}
      </div>

      <Footer />
    </>
  );
}

export default ViewProperties;
