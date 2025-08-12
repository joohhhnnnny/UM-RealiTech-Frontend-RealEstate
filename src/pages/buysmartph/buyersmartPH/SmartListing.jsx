import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiLayoutGridLine,
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiPhoneLine,
  RiCalculatorLine,
  RiFileTextLine,
  RiHome3Line,
  RiHotelBedLine,
  RiDropLine,
  RiLoader4Line,
  RiHeartLine,
  RiHeartFill,
  RiMailLine,
  RiUserLine
} from 'react-icons/ri';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/Firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { propertyRecommendationEngine } from '../../../services/PropertyRecommendationEngine';
import PropertyEmptyState from '../../../components/PropertyEmptyState';
import PropertySuccessBanner from '../../../components/PropertySuccessBanner';
import DocumentSubmissionModal from '../../../components/DocumentSubmissionModal';
import CostBreakdownComponent from '../../../components/CostBreakdownComponent';
import agentsData from '../../../json/agents.json';

function SmartListing({ profileData }) {
  const [user, authLoading] = useAuthState(auth);
  const [listings, setListings] = useState([]);
  const [sortBy, setSortBy] = useState('match'); // Set default sort to match score
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalListings, setOriginalListings] = useState([]); // Store original fetched data
  const [savedProperties, setSavedProperties] = useState(new Set());
  const [savingProperty, setSavingProperty] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentModalProperty, setDocumentModalProperty] = useState(null);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const itemsPerPage = 9;

  // Smart location matching function
  const isLocationMatch = useCallback((listingLocation, preferredLocation) => {
    if (!listingLocation || !preferredLocation) return false;
    
    // Convert to lowercase for case-insensitive matching
    const listing = listingLocation.toLowerCase().trim();
    const preferred = preferredLocation.toLowerCase().trim();
    
    // Direct substring match (current behavior)
    if (listing.includes(preferred) || preferred.includes(listing)) {
      return true;
    }
    
    // Split into keywords and check for partial matches
    const preferredKeywords = preferred.split(/[\s,.-]+/).filter(word => word.length > 2);
    const listingKeywords = listing.split(/[\s,.-]+/).filter(word => word.length > 2);
    
    // Check if any preferred keyword is found in listing
    const keywordMatches = preferredKeywords.some(prefKeyword => 
      listingKeywords.some(listKeyword => 
        listKeyword.includes(prefKeyword) || prefKeyword.includes(listKeyword)
      )
    );
    
    if (keywordMatches) return true;
    
    // Location synonyms and common abbreviations
    const locationSynonyms = {
      'qc': ['quezon city', 'quezon'],
      'quezon city': ['qc', 'quezon'],
      'quezon': ['qc', 'quezon city'],
      'makati': ['makati city', 'mkt'],
      'makati city': ['makati', 'mkt'],
      'bgc': ['bonifacio global city', 'taguig', 'fort bonifacio'],
      'bonifacio global city': ['bgc', 'taguig', 'fort bonifacio'],
      'taguig': ['bgc', 'bonifacio global city', 'fort bonifacio'],
      'manila': ['manila city', 'mla'],
      'manila city': ['manila', 'mla'],
      'pasig': ['pasig city'],
      'pasig city': ['pasig'],
      'mandaluyong': ['mandaluyong city', 'mandal'],
      'mandaluyong city': ['mandaluyong', 'mandal'],
      'ortigas': ['pasig', 'mandaluyong', 'ortigas center'],
      'ortigas center': ['ortigas', 'pasig', 'mandaluyong'],
      'alabang': ['muntinlupa', 'filinvest'],
      'muntinlupa': ['alabang', 'filinvest'],
      'eastwood': ['quezon city', 'qc', 'libis'],
      'libis': ['quezon city', 'qc', 'eastwood']
    };
    
    // Check synonyms
    const preferredSynonyms = locationSynonyms[preferred] || [];
    const listingSynonyms = locationSynonyms[listing] || [];
    
    // Check if preferred location matches any listing synonyms
    if (preferredSynonyms.some(synonym => listing.includes(synonym))) {
      return true;
    }
    
    // Check if listing location matches any preferred synonyms
    if (listingSynonyms.some(synonym => preferred.includes(synonym))) {
      return true;
    }
    
    // Cross-check synonyms
    const hasCommonSynonym = preferredSynonyms.some(prefSyn => 
      listingSynonyms.includes(prefSyn)
    );
    
    return hasCommonSynonym;
  }, []);

  // Helper function to assign agent data to properties that don't have agents
  const assignAgentToProperty = useCallback((listing) => {
    // If the listing already has agent info, keep it
    if (listing.agent_name && listing.agent_email) {
      return {
        ...listing,
        agentName: listing.agent_name,
        agentEmail: listing.agent_email
      };
    }
    
    // Otherwise, assign a random agent from the agents data
    const randomAgent = agentsData[Math.floor(Math.random() * agentsData.length)];
    
    return {
      ...listing,
      agentName: randomAgent.name,
      agentEmail: randomAgent.email,
      agentPhone: randomAgent.phone,
      agentAgency: randomAgent.agency
    };
  }, []);

  // Enhanced MCDA + Content-Based Filtering Algorithm
  const calculateMatchScore = useCallback((listing, profile) => {
    if (!profile || !listing) {
      return 30; // Default score for incomplete data
    }

    try {
      // Use the professional recommendation engine
      const scoredProperty = propertyRecommendationEngine.calculateRecommendationScore(listing, profile);
      
      console.log('Professional MCDA Score Result:', {
        property: listing.title,
        finalScore: scoredProperty.matchScore,
        detailedScores: scoredProperty.detailedScores,
        matchFactors: scoredProperty.matchFactors,
        explanation: scoredProperty.explanation
      });

      return scoredProperty.matchScore;
    } catch (error) {
      console.error('Error in recommendation scoring:', error);
      return 30; // Fallback score
    }
  }, []);

  // Helper function to get affordability styling and display
  const getAffordabilityDisplay = useCallback((level) => {
    const affordabilityMap = {
      excellent: {
        bgClass: 'bg-success',
        textClass: 'text-success',
        label: '💰 Excellent',
        badgeLabel: '💰 Excellent'
      },
      good: {
        bgClass: 'bg-info',
        textClass: 'text-info',
        label: '💸 Good',
        badgeLabel: '💸 Good'
      },
      fair: {
        bgClass: 'bg-warning',
        textClass: 'text-warning',
        label: '⚖️ Fair',
        badgeLabel: '⚖️ Fair'
      },
      tight: {
        bgClass: 'bg-warning',
        textClass: 'text-warning',
        label: '⚠️ Tight Budget',
        badgeLabel: '⚠️ Tight'
      },
      stretch: {
        bgClass: 'bg-error',
        textClass: 'text-error',
        label: '❌ Financial Stretch',
        badgeLabel: '❌ Stretch'
      }
    };

    return affordabilityMap[level] || {
      bgClass: 'bg-base-300',
      textClass: 'text-base-content',
      label: 'Unknown',
      badgeLabel: 'Unknown'
    };
  }, []);

  // Function to calculate monthly payment for display
  const calculateMonthlyPayment = useCallback((priceString) => {
    const propertyPrice = parseInt(priceString.replace(/[₱,\s]/g, '')) || 0;
    const loanAmount = propertyPrice * 0.8; // 80% loan
    const monthlyInterestRate = 0.065 / 12; // 6.5% annual interest
    const numberOfPayments = 15 * 12; // 15 years
    
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                         (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
    return Math.round(monthlyPayment);
  }, []);

  // Function to get affordability level for display (uses calculateMonthlyPayment to avoid duplication)
  const getAffordabilityLevel = useCallback((listing, profile) => {
    if (!profile.monthlyIncome || !listing.price) return 'unknown';
    
    const monthlyIncome = parseInt(profile.monthlyIncome) || 0;
    const monthlyDebts = parseInt(profile.monthlyDebts) || 0;
    const spouseIncome = profile.hasSpouseIncome ? monthlyIncome * 0.5 : 0;
    const totalMonthlyIncome = monthlyIncome + spouseIncome;

    // Use the existing calculateMonthlyPayment function to avoid code duplication
    const monthlyPayment = calculateMonthlyPayment(listing.price);

    const housingRatio = monthlyPayment / totalMonthlyIncome;
    const totalDebtRatio = (monthlyPayment + monthlyDebts) / totalMonthlyIncome;

    if (housingRatio <= 0.25 && totalDebtRatio <= 0.35) return 'excellent';
    if (housingRatio <= 0.30 && totalDebtRatio <= 0.40) return 'good';
    if (housingRatio <= 0.35 && totalDebtRatio <= 0.45) return 'fair';
    if (housingRatio <= 0.40 && totalDebtRatio <= 0.50) return 'tight';
    return 'stretch';
  }, [calculateMonthlyPayment]);

  // Function to fetch user's saved properties
  const fetchSavedProperties = useCallback(async () => {
    if (!user) return;
    
    try {
      const buyerDoc = await getDoc(doc(db, 'buyers', user.uid));
      if (buyerDoc.exists()) {
        const buyerData = buyerDoc.data();
        const saved = buyerData.buyerProfile?.savedProperties || [];
        setSavedProperties(new Set(saved.map(prop => prop.id)));
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  }, [user]);

  // Function to save/unsave property
  const handleSaveProperty = useCallback(async (listing) => {
    if (!user) {
      setError('Please login to save properties');
      return;
    }

    setSavingProperty(listing.id);

    try {
      const buyerRef = doc(db, 'buyers', user.uid);
      const isCurrentlySaved = savedProperties.has(listing.id);

      // Prepare property data to save
      const propertyData = {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        location: listing.location,
        type: listing.type,
        beds: listing.beds,
        baths: listing.baths,
        floor_area_sqm: listing.floor_area_sqm,
        images: listing.images || [],
        matchScore: listing.matchScore,
        savedAt: new Date().toISOString()
      };

      if (isCurrentlySaved) {
        // Remove from saved properties
        await updateDoc(buyerRef, {
          'buyerProfile.savedProperties': arrayRemove(propertyData)
        });
        setSavedProperties(prev => {
          const newSet = new Set(prev);
          newSet.delete(listing.id);
          return newSet;
        });
      } else {
        // Add to saved properties
        await updateDoc(buyerRef, {
          'buyerProfile.savedProperties': arrayUnion(propertyData)
        });
        setSavedProperties(prev => new Set([...prev, listing.id]));
      }

    } catch (error) {
      console.error('Error saving/unsaving property:', error);
      setError('Failed to save property. Please try again.');
    } finally {
      setSavingProperty(null);
    }
  }, [user, savedProperties]);

  // Function to open document submission modal
  const handleApplyForProperty = useCallback((listing) => {
    if (!user) {
      setError('Please login to apply for properties');
      return;
    }
    setDocumentModalProperty(listing);
    setShowDocumentModal(true);
  }, [user]);

  // Function to close document modal
  const handleCloseDocumentModal = useCallback(() => {
    setShowDocumentModal(false);
    setDocumentModalProperty(null);
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  // Get current listings
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);

  // Function to fetch listings from Firebase
  const fetchListingsFromFirebase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('SmartListing: Fetching properties from Firebase...');
      
      // Fetch from properties collection (public listings)
      const propertiesRef = collection(db, 'properties');
      const propertiesQuery = query(
        propertiesRef, 
        where('isActive', '==', true),
        where('status', '==', 'Available')
      );
      
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const propertiesData = propertiesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          price: data.price,
          location: data.location,
          type: data.type,
          beds: data.beds,
          baths: data.baths,
          floor_area_sqm: data.floor_area_sqm,
          lot_area_sqm: data.lot_area_sqm,
          description: data.description,
          furnishing: data.furnishing || 'Bare',
          days_on_market: data.days_on_market || 'New',
          amenities: data.amenities || [],
          images: data.images || [],
          agent_id: data.agent_id,
          agent_name: data.agent_name,
          agent_email: data.agent_email,
          agent_contact: data.agent_contact,
          property_type: data.type === 'residential' ? 'House' : 'Commercial',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });

      // Fetch from listings collection with less restrictive query
      const listingsRef = collection(db, 'listings');
      // Try with just status filter first, then add more filters if needed
      const listingsQuery = query(listingsRef);
      
      const listingsSnapshot = await getDocs(listingsQuery);
      console.log('SmartListing: Raw listings from Firebase:', listingsSnapshot.size);
      
      const listingsData = listingsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('SmartListing: Processing listing:', data);
        
        // Only include Available listings
        if (data.status !== 'Available') {
          console.log('SmartListing: Skipping non-available listing:', data.status);
          return null;
        }
        
        return {
          id: doc.id,
          title: data.title,
          price: data.price,
          location: data.location,
          type: data.type === 'House' || data.type === 'Townhouse' || data.type === 'Condo' ? 'residential' : 'commercial',
          beds: data.bedrooms,
          baths: data.bathrooms,
          floor_area_sqm: data.floorArea,
          lot_area_sqm: data.lotArea,
          description: data.description,
          furnishing: data.furnishing || 'Bare',
          days_on_market: data.days_on_market || 'New',
          amenities: data.amenities || [],
          images: data.images || [data.image] || [],
          agent_id: data.agentId,
          agent_name: data.agentName,
          agent_email: data.agentEmail,
          agent_contact: data.agentPhone || data.agentContact,
          property_type: data.type,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      }).filter(Boolean); // Remove null entries

      // Combine both collections and remove duplicates
      const allListings = [...propertiesData, ...listingsData];
      const uniqueListings = allListings.filter((listing, index, self) => 
        index === self.findIndex(l => l.title === listing.title && l.location === listing.location)
      );

      // Assign agents to properties that don't have agent data
      const listingsWithAgents = uniqueListings.map(listing => assignAgentToProperty(listing));

      console.log('SmartListing: Final results:', {
        properties: propertiesData.length,
        listings: listingsData.length,
        total: listingsWithAgents.length,
        sampleData: listingsWithAgents.slice(0, 2), // Show first 2 items for debugging
        uniqueListings: listingsWithAgents
      });

      setOriginalListings(listingsWithAgents);
      
      return listingsWithAgents;
    } catch (error) {
      console.error('SmartListing: Error fetching listings:', error);
      setError('Failed to load properties. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [assignAgentToProperty]); // Add dependencies for useCallback

  // Initial data loading effect
  useEffect(() => {
    const loadInitialData = async () => {
      const fetchedListings = await fetchListingsFromFirebase();
      
      console.log('SmartListing: Fetched listings count:', fetchedListings.length);
      console.log('SmartListing: Profile data:', profileData);
      console.log('SmartListing: Sample fetched listings:', fetchedListings.slice(0, 2));
      
      if (fetchedListings.length > 0) {
        if (profileData && profileData.buyerType) {
          // Calculate match scores based on profile
          const listingsWithScores = fetchedListings.map(listing => ({
            ...listing,
            matchScore: calculateMatchScore(listing, profileData)
          }));

          // Sort by match score by default
          const sortedListings = [...listingsWithScores].sort((a, b) => 
            (b.matchScore || 0) - (a.matchScore || 0)
          );
          
          console.log('SmartListing: Setting listings with scores:', {
            total: sortedListings.length,
            scores: sortedListings.slice(0, 5).map(l => ({ title: l.title, score: l.matchScore }))
          });
          setListings(sortedListings);
        } else {
          // No profile data, just set the listings with default match scores
          const listingsWithDefaultScores = fetchedListings.map(listing => ({
            ...listing,
            matchScore: 50 // Default score when no profile data
          }));
          
          console.log('SmartListing: Setting listings without profile:', listingsWithDefaultScores.length);
          setListings(listingsWithDefaultScores);
        }
      } else {
        console.log('SmartListing: No listings fetched from Firebase');
        setListings([]);
      }
    };

    loadInitialData();
  }, [profileData, calculateMatchScore, fetchListingsFromFirebase, assignAgentToProperty]); // Include profileData to recalculate when it changes

  // Fetch saved properties when user changes
  useEffect(() => {
    if (user) {
      fetchSavedProperties();
    } else {
      setSavedProperties(new Set());
    }
  }, [user, fetchSavedProperties]);

  // Profile-based filtering and scoring effect
  useEffect(() => {
    if (originalListings.length === 0) return;
    
    // If no profile data, show all listings with default match scores
    if (!profileData || !profileData.buyerType) {
      const listingsWithDefaultScores = originalListings.map(listing => ({
        ...listing,
        matchScore: 50 // Default score
      }));
      
      setListings(listingsWithDefaultScores);
      setCurrentPage(1);
      return;
    }

    // Calculate match scores for ALL listings (no filtering, just scoring)
    const listingsWithScores = originalListings.map(listing => ({
      ...listing,
      matchScore: calculateMatchScore(listing, profileData)
    }));

    // Only filter out properties with extremely low scores (less than 35%)
    const filtered = listingsWithScores.filter(listing => listing.matchScore >= 35);

    console.log('SmartListing: Listings after scoring:', {
      total: originalListings.length,
      afterScoring: listingsWithScores.length,
      afterFiltering: filtered.length,
      profileData: profileData,
      sampleScores: listingsWithScores.slice(0, 3).map(l => ({
        title: l.title,
        location: l.location,
        price: l.price,
        score: l.matchScore
      }))
    });

    // Sort by current sort preference
    const sorted = [...filtered].sort((a, b) => {
      const priceA = parseInt(a.price?.replace(/[₱,\s]/g, '')) || 0;
      const priceB = parseInt(b.price?.replace(/[₱,\s]/g, '')) || 0;
      
      switch(sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'match': return (b.matchScore || 0) - (a.matchScore || 0);
        case 'latest':
        default: 
          return (b.days_on_market || '').localeCompare(a.days_on_market || '');
      }
    });

    setListings(sorted);
    setCurrentPage(1); // Reset to first page when filters change
  }, [profileData, originalListings, sortBy, calculateMatchScore, isLocationMatch]);

  // Add this useEffect hook to handle scrolling
  useEffect(() => {
    // Scroll to the "Smart Property Recommendations" heading when page changes
    const heading = document.getElementById('listings-heading');
    if (heading) {
        heading.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  // Function to render property cards (improved with icons and responsiveness)
  const renderPropertyCards = () => {
    return currentListings.map((listing) => (
      <motion.div 
        key={listing.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.random() * 0.2 }}
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group backdrop-blur-xl border border-base-300/10"
      >
        <figure className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent z-10"></div>
          <img 
            src={listing.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
            <div className={`badge text-white border-0 backdrop-blur-md shadow-lg text-xs ${
              listing.matchScore >= 80 ? 'badge-success bg-green-600/90' :
              listing.matchScore >= 60 ? 'badge-warning bg-yellow-600/90' :
              listing.matchScore >= 40 ? 'badge-info bg-blue-600/90' :
              'badge-error bg-gray-600/90'
            }`}>
              AI Match: {listing.matchScore}%
            </div>
            {profileData && profileData.monthlyIncome && (
              (() => {
                const affordabilityLevel = getAffordabilityLevel(listing, profileData);
                const affordabilityDisplay = getAffordabilityDisplay(affordabilityLevel);
                return (
                  <div className={`badge text-white border-0 backdrop-blur-md shadow-lg text-xs ${affordabilityDisplay.bgClass}`}>
                    {affordabilityDisplay.badgeLabel}
                  </div>
                );
              })()
            )}
            {profileData && (
              <div className={`badge text-white border-0 backdrop-blur-md shadow-lg text-xs ${
                listing.matchScore >= 80 ? 'bg-green-500/90' :
                listing.matchScore >= 60 ? 'bg-yellow-500/90' :
                listing.matchScore >= 40 ? 'bg-blue-500/90' :
                'bg-gray-500/90'
              }`}>
                {listing.matchScore >= 80 ? '🎯 Perfect' :
                 listing.matchScore >= 60 ? '⭐ Good' :
                 listing.matchScore >= 40 ? '👍 Fair' :
                 '📍 Basic'}
              </div>
            )}
            {listing.furnishing === "Semi Furnished" && (
              <div className="badge badge-info text-white border-0 backdrop-blur-md shadow-lg text-xs">Semi Furnished</div>
            )}
            {listing.furnishing === "Fully Furnished" && (
              <div className="badge badge-info text-white border-0 backdrop-blur-md shadow-lg text-xs">Fully Furnished</div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <button 
              onClick={() => handleSaveProperty(listing)}
              disabled={savingProperty === listing.id}
              className={`btn btn-circle btn-sm backdrop-blur-md border shadow-lg transition-all duration-300 hover:border-primary ${
                savedProperties.has(listing.id) 
                  ? 'bg-error hover:bg-error text-white border-error/20' 
                  : 'bg-base-100/90 hover:bg-primary hover:text-white border-base-300/20 text-base-content'
              }`}
            >
              {savingProperty === listing.id ? (
                <RiLoader4Line className="h-4 w-4 animate-spin" />
              ) : savedProperties.has(listing.id) ? (
                <RiHeartFill className="h-4 w-4" />
              ) : (
                <RiHeartLine className="h-4 w-4" />
              )}
            </button>
          </div>
        </figure>
        <div className="card-body p-4 flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200/20">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-1.5 line-clamp-2 leading-tight text-base-content">
              {listing.title}
            </h3>
            <p className="text-sm text-base-content/70 flex items-center gap-1.5">
              <RiMapPinLine className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="truncate">{listing.location}</span>
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start justify-between mt-3 gap-3">
            {/* Property stats with icons - responsive grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-sm w-full lg:flex-1">
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-base-200/30 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-colors">
                <RiHome3Line className="h-3 w-3 sm:h-4 sm:w-4 text-primary mb-1" />
                <span className="text-base-content/70 text-xs">Area</span>
                <span className="font-semibold mt-0.5 text-primary text-xs sm:text-sm">
                  {listing.floor_area_sqm || '0'} sqm
                </span>
              </div>
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-base-200/30 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-colors">
                <RiHotelBedLine className="h-3 w-3 sm:h-4 sm:w-4 text-primary mb-1" />
                <span className="text-base-content/70 text-xs">Beds</span>
                <span className="font-semibold mt-0.5 text-primary text-xs sm:text-sm">
                  {listing.beds || '0'}
                </span>
              </div>
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-base-200/30 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-colors">
                <RiDropLine className="h-3 w-3 sm:h-4 sm:w-4 text-primary mb-1" />
                <span className="text-base-content/70 text-xs">Baths</span>
                <span className="font-semibold mt-0.5 text-primary text-xs sm:text-sm">
                  {listing.baths || '0'}
                </span>
              </div>
            </div>
            
            {/* Price section */}
            <div className="text-center lg:text-right lg:ml-4 flex-none w-full lg:w-auto">
              <p className="text-lg sm:text-xl font-bold bg-primary text-primary-content px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                {listing.price}
              </p>
              {profileData && profileData.monthlyIncome && (
                <p className="text-xs text-success font-semibold mt-1 whitespace-nowrap">
                  ₱{calculateMonthlyPayment(listing.price).toLocaleString()}/month
                </p>
              )}
              {listing.lot_area_sqm > 0 && (
                <p className="text-xs text-base-content/50 mt-1 whitespace-nowrap">
                  ₱{Math.round(parseInt(listing.price.replace(/[^0-9]/g, '')) / listing.lot_area_sqm).toLocaleString()}/sqm
                </p>
              )}
            </div>
          </div>

          {/* Amenities badges */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 my-3">
              {listing.amenities.slice(0, 3).map((amenity) => (
                <div key={amenity} className="badge badge-outline bg-gradient-to-r from-teal-800/10 to-teal-700/10 text-base-content border-teal-700/20 hover:border-teal-600/30 transition-colors backdrop-blur-sm text-xs">
                  {amenity}
                </div>
              ))}
              {listing.amenities.length > 3 && (
                <div className="badge badge-outline bg-gradient-to-r from-teal-700/10 to-teal-600/10 text-base-content border-teal-600/20 hover:border-teal-500/30 transition-colors backdrop-blur-sm text-xs">
                  +{listing.amenities.length - 3} more
                </div>
              )}
            </div>
          )}

          {/* Footer section */}
          <div className="flex-none pt-2 border-t border-base-content/10">
            <div className="flex items-center gap-2 mb-3 text-xs text-base-content/60">
              <RiPriceTag3Line className="h-3.5 w-3.5 text-primary" />
              Listed {listing.days_on_market === "Unknown" ? "Recently" : listing.days_on_market + " ago"}
            </div>
            
            <button 
              className="btn btn-primary w-full mb-2 normal-case hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setSelectedProperty(listing)}
            >
              View Details
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="btn btn-sm btn-outline gap-1 text-xs hover:btn-primary transition-colors"
                onClick={() => handleApplyForProperty(listing)}
              >
                <RiFileTextLine className="w-3 h-3" />
                <span className="hidden sm:inline">Apply</span>
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs hover:btn-secondary transition-colors">
                <RiMailLine className="w-3 h-3" />
                <span className="hidden sm:inline">Send Email</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    ));
  };

  // Function to render property detail modal (keeping exactly the same)
  const renderPropertyModal = () => {
    if (!selectedProperty) return null;
    
    return (
      <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-5xl bg-base-100 text-base-content">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-2xl text-primary">{selectedProperty.title}</h3>
              <p className="text-lg text-base-content/70 flex items-center gap-2 mt-2">
                <RiMapPinLine className="w-5 h-5" />
                {selectedProperty.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{selectedProperty.price}</p>
              <button 
                className="btn btn-sm btn-circle btn-ghost mt-2 text-base-content hover:bg-base-200"
                onClick={() => setSelectedProperty(null)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <figure className="h-64 rounded-lg overflow-hidden">
                <img 
                  src={selectedProperty.images?.[0] || "https://via.placeholder.com/600x400?text=No+Image"}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              </figure>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-base-200 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedProperty.floor_area_sqm || '0'}</div>
                  <div className="text-sm text-base-content/70">sqm Floor Area</div>
                </div>
                <div className="bg-base-200 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedProperty.beds || '0'}</div>
                  <div className="text-sm text-base-content/70">Bedrooms</div>
                </div>
                <div className="bg-base-200 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedProperty.baths || '0'}</div>
                  <div className="text-sm text-base-content/70">Bathrooms</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-base-content">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Property Type:</span>
                    <span className="font-medium text-base-content">{selectedProperty.property_type || 'House'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Furnishing:</span>
                    <span className="font-medium text-base-content">{selectedProperty.furnishing || 'Unfurnished'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Lot Area:</span>
                    <span className="font-medium text-base-content">{selectedProperty.lot_area_sqm || '0'} sqm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Price per sqm:</span>
                    <span className="font-medium text-base-content">
                      ₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) / (selectedProperty.lot_area_sqm || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* MCDA Algorithm Insights */}
              {profileData && (
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-info">🤖 AI Match Analysis</h4>
                  <div className="space-y-2 bg-base-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Overall Match Score:</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-2 rounded-full ${
                          selectedProperty.matchScore >= 80 ? 'bg-success' :
                          selectedProperty.matchScore >= 60 ? 'bg-warning' :
                          selectedProperty.matchScore >= 40 ? 'bg-info' :
                          'bg-base-content/30'
                        }`}></div>
                        <span className="font-bold text-lg text-base-content">
                          {selectedProperty.matchScore || calculateMatchScore(selectedProperty, profileData)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-base-content/60">
                      {selectedProperty.matchScore >= 80 ? '🎯 Excellent match for your profile' :
                       selectedProperty.matchScore >= 60 ? '⭐ Good match with strong compatibility' :
                       selectedProperty.matchScore >= 40 ? '👍 Fair match with some benefits' :
                       '📍 Basic match - consider your priorities'}
                    </div>
                  </div>
                </div>
              )}

              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-base-content">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity) => (
                      <div key={amenity} className="badge badge-outline text-base-content border-base-content/30">{amenity}</div>
                    ))}
                  </div>
                </div>
              )}

              {profileData && profileData.monthlyIncome && (
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-success">💰 Financial Analysis</h4>
                  <div className="space-y-2 text-sm bg-base-200 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Estimated Monthly Payment:</span>
                      <span className="font-bold text-success">₱{calculateMonthlyPayment(selectedProperty.price).toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Down Payment (20%):</span>
                      <span className="font-medium text-base-content">₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Loan Amount:</span>
                      <span className="font-medium text-base-content">₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) * 0.8).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Your Monthly Income:</span>
                      <span className="font-medium text-base-content">₱{parseInt(profileData.monthlyIncome).toLocaleString()}</span>
                    </div>
                    {profileData.hasSpouseIncome && (
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Combined Income (with spouse):</span>
                        <span className="font-medium text-base-content">₱{Math.round(parseInt(profileData.monthlyIncome) * 1.5).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-base-content/20 pt-2">
                      <span className="text-base-content/70">Affordability Level:</span>
                      {(() => {
                        const affordabilityLevel = getAffordabilityLevel(selectedProperty, profileData);
                        const affordabilityDisplay = getAffordabilityDisplay(affordabilityLevel);
                        return (
                          <span className={`font-bold ${affordabilityDisplay.textClass}`}>
                            {affordabilityDisplay.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-xs text-base-content/50 italic">
                      *Based on 20% down payment, 6.5% interest, 15-year loan term
                    </div>
                  </div>
                </div>
              )}

              {/* Full Cost Details Section */}
              <CostBreakdownComponent 
                selectedProperty={selectedProperty} 
                isOpen={showCostBreakdown} 
              />

              {/* Agent Information Section */}
              {selectedProperty.agentName && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-base-content">
                    <RiUserLine className="text-blue-600 dark:text-blue-400" />
                    Agent Information
                  </h4>
                  <div className="bg-base-200 dark:bg-base-200 p-4 rounded-xl border border-base-300 dark:border-base-600">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                        <RiUserLine className="text-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base-content mb-1">
                          {selectedProperty.agentName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <RiMailLine className="text-blue-600 dark:text-blue-400" />
                          <a 
                            href={`mailto:${selectedProperty.agentEmail}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                          >
                            {selectedProperty.agentEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3 pt-4">
                <button 
                  className="btn btn-primary w-full gap-2"
                  onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                >
                  <RiCalculatorLine className="w-5 h-5" />
                  Full Cost Details
                </button>
                <button 
                  className="btn btn-outline w-full gap-2"
                  onClick={() => {
                    setDocumentModalProperty(selectedProperty);
                    setShowDocumentModal(true);
                  }}
                >
                  <RiFileTextLine className="w-5 h-5" />
                  Submit Documents for This Property
                </button>
                <button className="btn btn-success w-full gap-2">
                  <RiPhoneLine className="w-5 h-5" />
                  Contact Agent
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm" onClick={() => setSelectedProperty(null)}></div>
      </div>
    );
  };

  // Function to render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <div className="join">
          <button 
            className="join-item btn" 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              className={`join-item btn ${currentPage === number ? 'btn-active btn-primary' : ''}`}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </button>
          ))}
          <button 
            className="join-item btn" 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="space-y-8">
        <div className="alert alert-info shadow-lg">
          <RiLoader4Line className="w-6 h-6 animate-spin" />
          <div>
            <h3 className="font-bold">
              {authLoading ? 'Authenticating...' : 'Loading Properties...'}
            </h3>
            <div className="text-sm">
              {authLoading ? 'Please wait while we authenticate your session.' : 'Fetching the latest listings from our database.'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-xl animate-pulse">
              <div className="h-48 bg-base-300 rounded-t-2xl"></div>
              <div className="card-body p-4">
                <div className="h-4 bg-base-300 rounded mb-2"></div>
                <div className="h-3 bg-base-300 rounded mb-4 w-3/4"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-12 bg-base-300 rounded"></div>
                  <div className="h-12 bg-base-300 rounded"></div>
                  <div className="h-12 bg-base-300 rounded"></div>
                </div>
                <div className="h-8 bg-base-300 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <PropertyEmptyState
        type="error"
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          fetchListingsFromFirebase();
        }}
        isRefreshing={loading}
      />
    );
  }

  // Empty state
  if (!loading && listings.length === 0) {
    return (
      <PropertyEmptyState
        type="no-listings"
        onRefresh={() => {
          setLoading(true);
          fetchListingsFromFirebase();
        }}
        isRefreshing={loading}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Recommendations Banner */}
      <PropertySuccessBanner 
        profileData={profileData}
        listingsCount={listings.length}
        isAIRecommendationsReady={profileData && profileData.buyerType}
      />

      {/* Header Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="card bg-base-200/20 backdrop-blur-xl shadow-lg border border-primary/10"
      >
        <div className="card-body p-6">
          <div className="flex items-start justify-between">
            <div>
              <RiLayoutGridLine className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-bold text-primary">Smart Listings</h3>
              <p className="text-base-content/70 text-sm mt-2">AI-powered property recommendations based on your profile</p>
            </div>
            <div className="rounded-full bg-success/10 p-1">
              <RiCheckboxCircleLine className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        <div className="space-y-2">
          <h2 id="listings-heading" className="text-xl sm:text-2xl font-bold">Smart Property Recommendations</h2>
          {profileData && (
            <div className="flex items-center gap-2">
              <div className="badge badge-success text-white gap-1">
                <RiRobot2Line className="w-3 h-3" />
                MCDA Algorithm Active
              </div>
              <div className="text-xs text-base-content/70">
                Personalized matching for {profileData.buyerType}s
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <button className="btn btn-outline btn-sm gap-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <select 
            className="select select-bordered select-sm w-full sm:w-48 min-w-0" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="match">Best Match</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="latest">Latest First</option>
          </select>
        </div>
      </div>

      {/* Property Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {renderPropertyCards()}
      </div>

      {/* Property Detail Modal */}
      {renderPropertyModal()}

      {/* Pagination */}
      {renderPagination()}

      {/* Document Submission Modal */}
      <DocumentSubmissionModal
        isOpen={showDocumentModal}
        onClose={handleCloseDocumentModal}
        selectedProperty={documentModalProperty}
      />
    </div>
  );
}

export default SmartListing;