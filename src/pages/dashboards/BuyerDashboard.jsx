import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiHomeSmileLine, 
  RiEarthLine, 
  RiBankLine, 
  RiHome6Line,  
  RiTimeLine,
  RiAddLine, 
  RiErrorWarningLine,
  RiMapPinLine,
  RiHotelBedLine,
  RiDropLine,
  RiPriceTag3Line,
  RiCalendarLine,
  RiHeartLine,
  RiEyeLine,
  RiCloseLine,
  RiDeleteBinLine
} from 'react-icons/ri';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [buyerData, setBuyerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [removingProperty, setRemovingProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  
  // Use the reusable toast hook
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Function to fetch buyer data
  const fetchBuyerData = useCallback(async (currentUser) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const buyerDoc = await getDoc(doc(db, 'buyers', currentUser.uid));
      if (buyerDoc.exists()) {
        setBuyerData(buyerDoc.data());
      }
    } catch (error) {
      console.error("Error fetching buyer data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchBuyerData(currentUser);
      } else {
        setLoading(false);
        setBuyerData(null);
      }
    });

    return () => unsubscribe();
  }, [fetchBuyerData]);

  // Refresh buyer data every 30 seconds to catch new saves (only if user is authenticated)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchBuyerData(user);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchBuyerData, user]);

  // Handler for browsing properties
  const handleBrowseProperties = useCallback(() => {
    // Navigate to BuySmartPH with specific state to go directly to Smart Listings
    navigate('/dashboard/buysmartph', { 
      state: { 
        userRole: 'buyer',
        activeStep: 5, // Direct navigation to Smart Listings step
        fromDashboard: true
      } 
    });
  }, [navigate]);

  // Handler for viewing property details
  const handleViewProperty = useCallback((property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  }, []);

  // Handler for removing property from saved list
  const handleRemoveProperty = useCallback(async (property) => {
    if (!user) {
      showError('Please login to remove properties');
      return;
    }

    setRemovingProperty(property.id);

    try {
      const db = getFirestore();
      const buyerRef = doc(db, 'buyers', user.uid);

      // Remove the property from saved properties array
      await updateDoc(buyerRef, {
        'buyerProfile.savedProperties': arrayRemove(property)
      });

      // Update local state by fetching fresh data
      await fetchBuyerData(user);

      showSuccess(`"${property.title}" removed from saved properties`);
    } catch (error) {
      console.error('Error removing property:', error);
      showError('Failed to remove property. Please try again.');
    } finally {
      setRemovingProperty(null);
    }
  }, [user, fetchBuyerData, showSuccess, showError]);

  // Function to render saved property cards - Fully Responsive
  const renderSavedPropertyCard = (property) => (
    <motion.div
      key={property.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300/10"
    >
      <div className="card-body p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Mobile Layout (< 640px) */}
        <div className="block sm:hidden">
          {/* Property Image */}
          <div className="w-full h-40 xs:h-48 rounded-lg overflow-hidden bg-base-200 mb-4">
            <img
              src={property.images?.[0] || "https://via.placeholder.com/400x200?text=No+Image"}
              alt={property.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          {/* Property Details */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm xs:text-base leading-tight line-clamp-2 text-base-content mb-1">
                  {property.title}
                </h3>
                <p className="text-xs xs:text-sm text-base-content/70 flex items-center gap-1 mb-2">
                  <RiMapPinLine className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                  <span className="truncate">{property.location}</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-base xs:text-lg text-primary mb-1">
                  {property.price}
                </p>
                {property.matchScore && (
                  <div className={`badge badge-xs xs:badge-sm ${
                    property.matchScore >= 80 ? 'badge-success' :
                    property.matchScore >= 60 ? 'badge-warning' :
                    property.matchScore >= 40 ? 'badge-info' :
                    'badge-error'
                  }`}>
                    {property.matchScore}%
                  </div>
                )}
              </div>
            </div>
            
            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {property.beds && (
                <div className="bg-base-200 p-2 rounded">
                  <div className="text-xs xs:text-sm font-semibold">{property.beds}</div>
                  <div className="text-2xs xs:text-xs text-base-content/60">beds</div>
                </div>
              )}
              {property.baths && (
                <div className="bg-base-200 p-2 rounded">
                  <div className="text-xs xs:text-sm font-semibold">{property.baths}</div>
                  <div className="text-2xs xs:text-xs text-base-content/60">baths</div>
                </div>
              )}
              {property.floor_area_sqm && (
                <div className="bg-base-200 p-2 rounded">
                  <div className="text-xs xs:text-sm font-semibold">{property.floor_area_sqm}</div>
                  <div className="text-2xs xs:text-xs text-base-content/60">sqm</div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button 
                className="btn btn-xs xs:btn-sm btn-primary flex-1 gap-1 xs:gap-2 min-h-8 xs:min-h-10"
                onClick={() => handleViewProperty(property)}
              >
                <RiEyeLine className="w-3 h-3 xs:w-4 xs:h-4" />
                <span className="text-2xs xs:text-xs">View</span>
              </button>
              <button 
                className="btn btn-xs xs:btn-sm btn-outline text-error hover:bg-error hover:text-error-content min-h-8 xs:min-h-10"
                onClick={() => handleRemoveProperty(property)}
                disabled={removingProperty === property.id}
                title="Remove from saved properties"
              >
                {removingProperty === property.id ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <RiHeartLine className="w-3 h-3 xs:w-4 xs:h-4" />
                )}
              </button>
            </div>
            
            {/* Saved Date */}
            <div className="flex items-center gap-1 text-2xs xs:text-xs text-base-content/50">
              <RiCalendarLine className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Saved {new Date(property.savedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop Layout (>= 640px) */}
        <div className="hidden sm:flex items-start gap-3 md:gap-4 lg:gap-6">
          {/* Property Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-lg overflow-hidden bg-base-200">
              <img
                src={property.images?.[0] || "https://via.placeholder.com/120x120?text=No+Image"}
                alt={property.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Property Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-1 line-clamp-2 text-base-content">
                  {property.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-base-content/70 flex items-center gap-1 mb-2">
                  <RiMapPinLine className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{property.location}</span>
                </p>
                
                {/* Property Stats */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-2xs sm:text-xs md:text-sm text-base-content/60 mb-2">
                  {property.beds && (
                    <div className="flex items-center gap-1">
                      <RiHotelBedLine className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="whitespace-nowrap">{property.beds} bed{property.beds > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.baths && (
                    <div className="flex items-center gap-1">
                      <RiDropLine className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="whitespace-nowrap">{property.baths} bath{property.baths > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.floor_area_sqm && (
                    <div className="flex items-center gap-1">
                      <RiHome6Line className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="whitespace-nowrap">{property.floor_area_sqm} sqm</span>
                    </div>
                  )}
                </div>

                {/* Saved Date */}
                <div className="flex items-center gap-1 text-2xs sm:text-xs text-base-content/50">
                  <RiCalendarLine className="w-3 h-3" />
                  Saved on {new Date(property.savedAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Price and Actions */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm sm:text-lg md:text-xl lg:text-2xl text-primary mb-2">
                  {property.price}
                </p>
                {property.matchScore && (
                  <div className={`badge badge-sm md:badge-md mb-3 ${
                    property.matchScore >= 80 ? 'badge-success' :
                    property.matchScore >= 60 ? 'badge-warning' :
                    property.matchScore >= 40 ? 'badge-info' :
                    'badge-error'
                  }`}>
                    {property.matchScore}% match
                  </div>
                )}
                <div className="flex gap-1 sm:gap-2">
                  <button 
                    className="btn btn-xs sm:btn-sm md:btn-md btn-outline hover:btn-primary"
                    onClick={() => handleViewProperty(property)}
                    title="View property details"
                  >
                    <RiEyeLine className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    className="btn btn-xs sm:btn-sm md:btn-md btn-outline text-error hover:bg-error hover:text-error-content"
                    onClick={() => handleRemoveProperty(property)}
                    disabled={removingProperty === property.id}
                    title="Remove from saved properties"
                  >
                    {removingProperty === property.id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <RiHeartLine className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Memoize stats data
  const stats = useMemo(() => {
    // Calculate dynamic trends based on data
    const savedPropertiesCount = buyerData?.buyerProfile?.savedProperties?.length || 0;
    const activeProjectsCount = buyerData?.buyerProfile?.activeProjects?.length || 0;
    const scheduledViewingsCount = buyerData?.buyerProfile?.scheduledViewings?.length || 0;
    const isPreApproved = buyerData?.buyerProfile?.financialInfo?.preApprovalStatus === 'approved';

    // Calculate trends (these could be enhanced with historical data)
    const savedPropertiesTrend = savedPropertiesCount > 0 ? 
      savedPropertiesCount === 1 ? "First property saved!" : 
      savedPropertiesCount <= 3 ? "Building your list" :
      savedPropertiesCount <= 5 ? "Great selection!" : "Excellent choices!"
      : "Start saving properties";

    const activeProjectsTrend = activeProjectsCount > 0 ? 
      `${activeProjectsCount} active project${activeProjectsCount > 1 ? 's' : ''}` : 
      "No active projects";

    const viewingsTrend = scheduledViewingsCount > 0 ? 
      scheduledViewingsCount === 1 ? "1 viewing scheduled" :
      `${scheduledViewingsCount} viewings planned` : 
      "No viewings scheduled";

    const preApprovalTrend = isPreApproved ? 
      "Ready to purchase" : 
      "Apply for pre-approval";

    return [
      {
        title: "Active Projects",
        value: activeProjectsCount.toString(),
        subtitle: "Ongoing developments",
        icon: RiHomeSmileLine,
        trend: activeProjectsTrend,
        color: "text-blue-500",
        bgGradient: "from-blue-500/20 to-blue-500/5"
      },
      {
        title: "Saved Properties",
        value: savedPropertiesCount.toString(),
        subtitle: "Properties you've saved",
        icon: RiEarthLine,
        trend: savedPropertiesTrend,
        color: "text-emerald-500",
        bgGradient: "from-emerald-500/20 to-emerald-500/5"
      },
      {
        title: "Pre-Approved",
        value: isPreApproved ? "Yes" : "No",
        subtitle: "Loan status",
        icon: RiBankLine,
        trend: preApprovalTrend,
        color: isPreApproved ? "text-purple-500" : "text-amber-500",
        bgGradient: isPreApproved ? "from-purple-500/20 to-purple-500/5" : "from-amber-500/20 to-amber-500/5"
      },
      {
        title: "Viewings Scheduled",
        value: scheduledViewingsCount.toString(),
        subtitle: "Upcoming property viewings",
        icon: RiHome6Line, 
        trend: viewingsTrend,
        color: "text-cyan-500",
        bgGradient: "from-cyan-500/20 to-cyan-500/5"
      }
    ];
  }, [buyerData]);

  // Function to render property detail modal - Fully Responsive
  const renderPropertyModal = () => {
    if (!selectedProperty) return null;

    return (
      <div className={`modal ${showPropertyModal ? 'modal-open' : ''}`}>
        <div className="modal-box w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-base-content mb-2 line-clamp-2">
                {selectedProperty.title}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-base-content/70 flex items-center gap-2">
                <RiMapPinLine className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="line-clamp-2 sm:line-clamp-1">{selectedProperty.location}</span>
              </p>
            </div>
            <div className="text-right w-full sm:w-auto flex-shrink-0">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2">
                {selectedProperty.price}
              </p>
              {selectedProperty.matchScore && (
                <div className={`badge badge-md sm:badge-lg ${
                  selectedProperty.matchScore >= 80 ? 'badge-success' :
                  selectedProperty.matchScore >= 60 ? 'badge-warning' :
                  selectedProperty.matchScore >= 40 ? 'badge-info' :
                  'badge-error'
                }`}>
                  {selectedProperty.matchScore}% AI Match
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Property Image */}
            <div className="space-y-4">
              <figure className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 rounded-lg overflow-hidden bg-base-200">
                <img 
                  src={selectedProperty.images?.[0] || "https://via.placeholder.com/600x400?text=No+Image"}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </figure>
              
              {/* Property Stats Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center">
                <div className="bg-base-200 p-3 sm:p-4 md:p-5 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                    {selectedProperty.beds || '0'}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-base-content/60">Bedrooms</div>
                </div>
                <div className="bg-base-200 p-3 sm:p-4 md:p-5 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                    {selectedProperty.baths || '0'}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-base-content/60">Bathrooms</div>
                </div>
                <div className="bg-base-200 p-3 sm:p-4 md:p-5 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                    {selectedProperty.floor_area_sqm || '0'}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-base-content/60">sqm</div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="font-semibold text-base sm:text-lg md:text-xl mb-3 text-base-content">
                  Property Information
                </h4>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-base-content/70 font-medium">Property Type:</span>
                    <span className="font-medium text-right">{selectedProperty.type || 'Residential'}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-base-content/70 font-medium">Floor Area:</span>
                    <span className="font-medium text-right">{selectedProperty.floor_area_sqm || 'N/A'} sqm</span>
                  </div>
                  {selectedProperty.lot_area_sqm && (
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-base-content/70 font-medium">Lot Area:</span>
                      <span className="font-medium text-right">{selectedProperty.lot_area_sqm} sqm</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Info */}
              <div className="bg-base-200 p-4 sm:p-5 rounded-lg">
                <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                  <RiHeartLine className="w-4 h-4 sm:w-5 sm:h-5 text-error" />
                  <span className="text-sm sm:text-base">Saved Property</span>
                </h4>
                <div className="text-xs sm:text-sm md:text-base text-base-content/70">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <RiCalendarLine className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      Saved on {new Date(selectedProperty.savedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <button 
                  className="btn btn-primary w-full gap-2 min-h-12 sm:min-h-14"
                  onClick={() => {
                    setShowPropertyModal(false);
                    handleBrowseProperties();
                  }}
                >
                  <RiEyeLine className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">View in Smart Listings</span>
                </button>
                
                <button 
                  className="btn btn-outline btn-error w-full gap-2 min-h-12 sm:min-h-14"
                  onClick={() => {
                    handleRemoveProperty(selectedProperty);
                    setShowPropertyModal(false);
                  }}
                  disabled={removingProperty === selectedProperty.id}
                >
                  {removingProperty === selectedProperty.id ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span className="text-sm sm:text-base">Removing...</span>
                    </>
                  ) : (
                    <>
                      <RiHeartLine className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Remove from Saved</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="modal-action mt-6 sm:mt-8">
            <button 
              className="btn btn-outline w-full sm:w-auto min-h-10 sm:min-h-12"
              onClick={() => setShowPropertyModal(false)}
            >
              <span className="text-sm sm:text-base">Close</span>
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setShowPropertyModal(false)}></div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout userRole="buyer">
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-sm sm:text-base text-base-content">
              {authLoading ? 'Authenticating...' : 'Loading your dashboard...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If not authenticated, show a message
  if (!user) {
    return (
      <DashboardLayout userRole="buyer">
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 flex items-center justify-center">
          <div className="text-center max-w-sm sm:max-w-md mx-auto px-4">
            <RiErrorWarningLine className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-error mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-sm sm:text-base text-base-content/70 mb-6">
              Please log in to access your dashboard.
            </p>
            <button 
              className="btn btn-primary w-full sm:w-auto min-h-12"
              onClick={() => navigate('/auth')}
            >
              <span className="text-sm sm:text-base">Go to Login</span>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="buyer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100"
      >
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Welcome Section */}
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="card bg-gradient-to-r from-primary/90 to-primary shadow-lg overflow-hidden backdrop-blur-xl mb-6"
          >
            <div className="card-body p-4 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                <div className="space-y-2">
                  <h2 className="text-sm sm:text-base md:text-lg font-medium text-primary-content/80">
                    Welcome back, {buyerData?.fullName || user?.displayName || user?.email || 'Buyer'} 👋
                  </h2>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-content">
                    Buyer Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-primary-content/70 max-w-md">
                    Browse and track your favorite properties.
                  </p>
                </div>
                <div className="w-full lg:w-auto">
                  <div className="stats bg-primary-content/10 text-primary-content shadow-lg">
                    <div className="stat place-items-center px-4 py-3">
                      <div className="stat-title text-primary-content/80 text-xs sm:text-sm">Total</div>
                      <div className="stat-value text-lg sm:text-xl md:text-2xl">
                        {buyerData?.buyerProfile?.savedProperties?.length || 0}
                      </div>
                      <div className="stat-desc text-primary-content/60 text-2xs sm:text-xs">Saved Properties</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.title}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`card bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl shadow-lg`}
              >
                <div className="card-body p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-base-content/70 text-2xs sm:text-xs md:text-sm font-medium truncate">
                        {stat.title}
                      </p>
                      <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 sm:mt-2 ${stat.color}`}>
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg ${stat.bgGradient} flex-shrink-0`}>
                      <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 md:mt-4">
                    <p className="text-2xs sm:text-xs md:text-sm text-base-content/60 truncate">
                      {stat.subtitle}
                    </p>
                    <p className="text-2xs sm:text-xs text-success mt-1 truncate">
                      {stat.trend}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* My Properties Section */}
          <div data-tour="saved-properties">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">My Saved Properties</h2>
                <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                  {buyerData?.buyerProfile?.savedProperties?.length || 0} properties saved
                </p>
              </div>
              <button 
                className="btn btn-primary gap-2 w-full sm:w-auto min-h-10 sm:min-h-12"
                onClick={handleBrowseProperties}
                data-tour="properties"
              >
                <RiEyeLine className="w-4 h-4" />
                <span className="text-xs sm:text-sm md:text-base">Browse Properties</span>
              </button>
            </div>
            
            {buyerData?.buyerProfile?.savedProperties?.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {buyerData.buyerProfile.savedProperties.map((property) => 
                  renderSavedPropertyCard(property)
                )}
                
                {/* Show more properties if there are many */}
                {buyerData.buyerProfile.savedProperties.length > 5 && (
                  <div className="text-center pt-4">
                    <button className="btn btn-outline w-full sm:w-auto min-h-10 sm:min-h-12">
                      <span className="text-xs sm:text-sm md:text-base">
                        View All {buyerData.buyerProfile.savedProperties.length} Saved Properties
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center py-8 sm:py-12 md:py-16 px-4 sm:px-6">
                  <RiHeartLine className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">No Saved Properties Yet</h3>
                  <p className="text-xs sm:text-sm md:text-base text-base-content/70 mb-6 max-w-md mx-auto">
                    Start browsing properties and save your favorites to see them here. 
                    Our AI will help you find the perfect match based on your preferences.
                  </p>
                  <button 
                    className="btn btn-primary gap-2 w-full sm:w-auto min-h-12"
                    onClick={handleBrowseProperties}
                  >
                    <RiAddLine className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Browse Properties Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Property Detail Modal */}
      {renderPropertyModal()}
      
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        position="top-right"
      />
    </DashboardLayout>
  );
};

export default memo(BuyerDashboard);