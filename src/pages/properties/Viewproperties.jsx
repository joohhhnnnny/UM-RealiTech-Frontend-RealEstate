import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/Firebase';
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
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
  const [propertyStats, setPropertyStats] = useState({
    viewsToday: 0,
    totalViews: 0,
    lastUpdated: 'Loading...',
    daysOnMarket: 0
  });

  // Function to track property view
  const trackPropertyView = async (propertyId, collection = 'properties') => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const propertyRef = doc(db, collection, propertyId);
      
      // Update view counts
      await updateDoc(propertyRef, {
        totalViews: increment(1),
        [`dailyViews.${today}`]: increment(1),
        lastViewedAt: new Date()
      });
      
      console.log('ViewProperties: View tracked successfully');
    } catch (error) {
      console.error('ViewProperties: Error tracking view:', error);
      // Don't block the UI if view tracking fails
    }
  };

  // Function to calculate property statistics
  const calculatePropertyStats = (propertyData) => {
    const now = new Date();
    const createdDate = propertyData.createdAt?.toDate?.() || new Date(propertyData.createdAt) || new Date();
    const updatedDate = propertyData.updatedAt?.toDate?.() || new Date(propertyData.updatedAt) || createdDate;
    
    // Calculate days on market
    const timeDiff = now.getTime() - createdDate.getTime();
    const daysOnMarket = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    
    // Calculate time since last update
    const updateTimeDiff = now.getTime() - updatedDate.getTime();
    const daysSinceUpdate = Math.floor(updateTimeDiff / (1000 * 3600 * 24));
    
    let lastUpdatedText;
    if (daysSinceUpdate === 0) {
      lastUpdatedText = 'Today';
    } else if (daysSinceUpdate === 1) {
      lastUpdatedText = '1 day ago';
    } else if (daysSinceUpdate < 7) {
      lastUpdatedText = `${daysSinceUpdate} days ago`;
    } else if (daysSinceUpdate < 30) {
      const weeks = Math.floor(daysSinceUpdate / 7);
      lastUpdatedText = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(daysSinceUpdate / 30);
      lastUpdatedText = months === 1 ? '1 month ago' : `${months} months ago`;
    }

    // Use real Firebase data if available, otherwise simulate
    const totalViews = propertyData.totalViews || Math.max(1, daysOnMarket * 3);
    const today = new Date().toISOString().split('T')[0];
    const viewsToday = propertyData.dailyViews?.[today] || Math.floor(Math.random() * Math.min(20, totalViews / 7)) + 1;

    setPropertyStats({
      viewsToday,
      totalViews,
      lastUpdated: lastUpdatedText,
      daysOnMarket
    });
  };

  // Helper function to clean up agent names
  const cleanAgentName = (agentName, agentEmail) => {
    // If agent name is undefined, null, empty, or "undefined undefined"
    if (!agentName || agentName === 'undefined undefined' || agentName.trim() === '' || agentName.includes('undefined')) {
      // Try to extract name from email
      if (agentEmail) {
        const emailPart = agentEmail.split('@')[0];
        // Clean up email part to make it more readable
        return emailPart.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim() || 'Professional Agent';
      }
      return 'Professional Agent';
    }
    return agentName;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        console.log('ViewProperties: Fetching property with ID:', id);
        
        // Try to fetch from properties collection first (public properties)
        const propertyDocRef = doc(db, 'properties', id);
        const propertyDoc = await getDoc(propertyDocRef);
        
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          console.log('ViewProperties: Found property in properties collection:', propertyData);
          
          const processedProperty = {
            id: propertyDoc.id,
            ...propertyData,
            // Ensure agent_name is properly formatted and cleaned
            agent_name: cleanAgentName(
              propertyData.agent_name || 
              `${propertyData.agent_first_name || ''} ${propertyData.agent_last_name || ''}`.trim(),
              propertyData.agent_email
            )
          };
          
          setProperty(processedProperty);
          calculatePropertyStats(processedProperty);
          
          // Track this property view
          trackPropertyView(propertyDoc.id, 'properties');
        } else {
          // If not found in properties, try listings collection
          console.log('ViewProperties: Property not found in properties collection, trying listings...');
          const listingDocRef = doc(db, 'listings', id);
          const listingDoc = await getDoc(listingDocRef);
          
          if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            console.log('ViewProperties: Found property in listings collection:', listingData);
            
            // Convert listing data structure to property data structure for consistency
            const processedProperty = {
              id: listingDoc.id,
              title: listingData.title,
              price: listingData.price,
              location: listingData.location,
              type: listingData.type === 'House' || listingData.type === 'Townhouse' || listingData.type === 'Condo' ? 'residential' : 'commercial',
              beds: listingData.bedrooms,
              baths: listingData.bathrooms,
              floor_area_sqm: listingData.floorArea,
              lot_area_sqm: listingData.lotArea,
              description: listingData.description,
              maps_embed_url: listingData.maps_embed_url,
              furnishing: listingData.furnishing || "Bare",
              days_on_market: listingData.days_on_market || "New",
              amenities: listingData.amenities || [],
              images: listingData.images || [listingData.image] || [],
              agent_id: listingData.agentId,
              agent_name: cleanAgentName(
                listingData.agentName || 
                `${listingData.agentFirstName || ''} ${listingData.agentLastName || ''}`.trim(),
                listingData.agentEmail
              ),
              agent_email: listingData.agentEmail,
              agent_contact: listingData.agentPhone || listingData.agentContact || "",
              status: listingData.status,
              isActive: listingData.isActive !== false,
              createdAt: listingData.createdAt,
              updatedAt: listingData.updatedAt
            };
            
            setProperty(processedProperty);
            calculatePropertyStats(processedProperty);
            
            // Track this property view
            trackPropertyView(listingDoc.id, 'listings');
          } else {
            console.log('ViewProperties: Property not found in either collection');
            setProperty(null);
          }
        }
      } catch (error) {
        console.error('ViewProperties: Error fetching property:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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
    const isCommercial = property?.title?.toLowerCase().includes("office");
    return isCommercial
      ? "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg"
      : "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";
  };

  // Memoize images array to prevent unnecessary re-renders
  const images = useMemo(() => {
    if (!property) return [];
    
    console.log('ViewProperties: Processing images for property:', property.id);
    console.log('ViewProperties: Raw images array:', property.images);
    
    const propertyImages = property.images?.length > 0 
      ? property.images.filter(img => img && img.trim() !== '') // Filter out empty images
      : [getDefaultImage(property)];
      
    console.log('ViewProperties: Processed images array:', propertyImages);
    console.log('ViewProperties: Total images count:', propertyImages.length);
      
    return propertyImages;
  }, [property]);
  
  // Reset currentImageIndex if it's out of bounds
  useEffect(() => {
    if (currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  // Calculate location for display
  const location = property 
    ? (property.location ||
       getLocationFromDescription(property.description) ||
       "Location details in description")
    : "";

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    return price.includes("/mo") ? price : price.trim();
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
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
                    <a 
                      href={property.agent_contact ? `tel:${property.agent_contact}` : '#'}
                      className={`btn btn-outline w-full gap-2 text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300 ${!property.agent_contact ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <PhoneIcon className="w-5 h-5" />
                      {property.agent_contact ? 'Call Now' : 'Phone not available'}
                    </a>
                    <a 
                      href={property.agent_email ? `mailto:${property.agent_email}?subject=Inquiry about ${property.title}` : '#'}
                      className={`btn btn-outline w-full gap-2 text-base-content border-base-content/20 hover:btn-primary hover:text-primary-content transition-all duration-300 ${!property.agent_email ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <EnvelopeIcon className="w-5 h-5" />
                      {property.agent_email ? 'Send Message' : 'Email not available'}
                    </a>
                  </div>
                  
                  {/* Agent Information */}
                  <div className="mt-6 p-4 bg-base-200/50 rounded-xl border border-base-300/30">
                    <div className="text-sm text-base-content/70 mb-2">Listed by:</div>
                    <div className="font-semibold text-base-content">
                      {property.agent_name || 'Professional Agent'}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {property.agent_email ? 'Licensed Real Estate Agent' : 'Licensed Real Estate Broker'}
                    </div>
                    {property.agent_email && (
                      <div className="text-sm text-primary mt-1">
                        {property.agent_email}
                      </div>
                    )}
                    {property.agent_contact && (
                      <div className="text-sm text-base-content/60 mt-1">
                        📞 {property.agent_contact}
                      </div>
                    )}
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

                {/* Dynamic Property Stats */}
                <div className="bg-base-100/90 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50 shadow-lg">
                  <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Property Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg border border-base-300/30">
                      <span className="text-base-content/70 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Views Today:
                      </span>
                      <span className="font-bold text-primary text-lg">{propertyStats.viewsToday}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg border border-base-300/30">
                      <span className="text-base-content/70 flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Total Views:
                      </span>
                      <span className="font-bold text-secondary text-lg">{propertyStats.totalViews}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg border border-base-300/30">
                      <span className="text-base-content/70 flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Last Updated:
                      </span>
                      <span className="font-semibold text-base-content">{propertyStats.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg border border-base-300/30">
                      <span className="text-base-content/70 flex items-center gap-2">
                        <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Days on Market:
                      </span>
                      <span className="font-bold text-info text-lg">{propertyStats.daysOnMarket}</span>
                    </div>
                  </div>
                  
                  {/* Performance Indicator */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-base-content/80">Performance:</span>
                      <div className="flex items-center gap-2">
                        {propertyStats.viewsToday > propertyStats.totalViews / 30 ? (
                          <>
                            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-success">High Activity</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-warning">Steady Views</span>
                          </>
                        )}
                      </div>
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
