import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  RiLayoutGridLine,
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiPhoneLine,
  RiCalculatorLine,
  RiFileTextLine,
  RiBuilding4Line,
  RiBarChartBoxLine,
  RiHome3Line,
  RiHotelBedLine,
  RiDropLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiHeartLine,
  RiHeartFill
} from 'react-icons/ri';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/Firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

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

  // Calculate match score based on profile data and listing
  const calculateMatchScore = useCallback((listing, profile) => {
    let score = 0;
    let maxPossibleScore = 0;
    let matchedFactors = [];

    console.log('Calculating score for:', listing.title, 'with profile:', profile);

    // Financial Affordability Check (highest weight - 35 points)
    maxPossibleScore += 35;
    if (profile.monthlyIncome && listing.price) {
      const monthlyIncome = parseInt(profile.monthlyIncome) || 0;
      const monthlyDebts = parseInt(profile.monthlyDebts) || 0;
      const spouseIncome = profile.hasSpouseIncome ? monthlyIncome * 0.5 : 0; // Assume spouse earns 50% of main income
      const totalMonthlyIncome = monthlyIncome + spouseIncome;
      const netIncome = totalMonthlyIncome - monthlyDebts;
      const propertyPrice = parseInt(listing.price.replace(/[₱,\s]/g, '')) || 0;

      // Calculate monthly payment (assuming 20% down payment, 6.5% interest, 15-year loan)
      const loanAmount = propertyPrice * 0.8; // 80% loan
      const monthlyInterestRate = 0.065 / 12;
      const numberOfPayments = 15 * 12;
      const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

      // Debt-to-income ratio calculation (should be max 30% for housing)
      const housingRatio = monthlyPayment / totalMonthlyIncome;
      const totalDebtRatio = (monthlyPayment + monthlyDebts) / totalMonthlyIncome;

      console.log('Financial calculation:', {
        totalIncome: totalMonthlyIncome,
        netIncome: netIncome,
        monthlyPayment: monthlyPayment,
        housingRatio: housingRatio,
        totalDebtRatio: totalDebtRatio
      });

      if (housingRatio <= 0.25 && totalDebtRatio <= 0.35) {
        score += 35; // Excellent affordability
        matchedFactors.push('financial-excellent');
      } else if (housingRatio <= 0.30 && totalDebtRatio <= 0.40) {
        score += 30; // Good affordability
        matchedFactors.push('financial-good');
      } else if (housingRatio <= 0.35 && totalDebtRatio <= 0.45) {
        score += 20; // Fair affordability
        matchedFactors.push('financial-fair');
      } else if (housingRatio <= 0.40 && totalDebtRatio <= 0.50) {
        score += 10; // Tight affordability
        matchedFactors.push('financial-tight');
      } else {
        score += 5; // Poor affordability
        matchedFactors.push('financial-poor');
      }
    }

    // Budget match (high weight - 25 points)
    maxPossibleScore += 25;
    if (profile.budgetRange && listing.price) {
      const price = parseInt(listing.price.replace(/[₱,\s]/g, '')) || 0;
      const budgetRanges = {
        '1M-3M': { min: 1000000, max: 3000000 },
        '3M-5M': { min: 3000000, max: 5000000 },
        '5M-10M': { min: 5000000, max: 10000000 },
        '10M+': { min: 10000000, max: Infinity }
      };
      const range = budgetRanges[profile.budgetRange];
      if (range) {
        if (price >= range.min && price <= range.max) {
          score += 25; // Perfect budget match
          matchedFactors.push('budget-perfect');
        } else if (price >= range.min * 0.7 && price <= range.max * 1.3) {
          score += 20; // Close budget match (within 30%)
          matchedFactors.push('budget-close');
        } else if (price >= range.min * 0.5 && price <= range.max * 1.5) {
          score += 15; // Some budget match (within 50%)
          matchedFactors.push('budget-some');
        } else {
          score += 5; // Way outside budget but still some points
          matchedFactors.push('budget-far');
        }
      }
    }

    // Location match (high weight - 25 points)
    maxPossibleScore += 25;
    if (profile.preferredLocation && listing.location) {
      if (isLocationMatch(listing.location, profile.preferredLocation)) {
        score += 25; // Perfect location match
        matchedFactors.push('location-match');
      } else {
        score += 5; // No location match but has location data
        matchedFactors.push('location-no-match');
      }
    }

    // Buyer type specific matches (moderate weight - 15 points)
    maxPossibleScore += 15;
    if (profile.buyerType) {
      switch(profile.buyerType) {
        case 'First Time Buyer': {
          const firstTimeBuyerPrice = parseInt(listing.price?.replace(/[₱,\s]/g, '')) || 0;
          if (firstTimeBuyerPrice <= 3000000) {
            score += 15;
            matchedFactors.push('buyer-type-perfect');
          } else if (firstTimeBuyerPrice <= 5000000) {
            score += 10;
            matchedFactors.push('buyer-type-good');
          } else {
            score += 5;
            matchedFactors.push('buyer-type-some');
          }
          break;
        }
        case 'Investor':
          if (listing.title?.toLowerCase().includes('investment') ||
              listing.description?.toLowerCase().includes('investment') ||
              listing.amenities?.some(a => a.toLowerCase().includes('rental'))) {
            score += 15;
            matchedFactors.push('buyer-type-perfect');
          } else {
            score += 8; // Any property can be an investment
            matchedFactors.push('buyer-type-some');
          }
          break;
        case 'OFW':
          if (listing.description?.toLowerCase().includes('ofw friendly') ||
              listing.furnishing === 'Fully Furnished') {
            score += 15;
            matchedFactors.push('buyer-type-perfect');
          } else if (listing.furnishing === 'Semi Furnished') {
            score += 10;
            matchedFactors.push('buyer-type-good');
          } else {
            score += 5;
            matchedFactors.push('buyer-type-some');
          }
          break;
        case 'Upgrader': {
          const upgraderPrice = parseInt(listing.price?.replace(/[₱,\s]/g, '')) || 0;
          if (upgraderPrice >= 5000000 && listing.amenities?.length >= 3) {
            score += 15;
            matchedFactors.push('buyer-type-perfect');
          } else if (upgraderPrice >= 3000000) {
            score += 10;
            matchedFactors.push('buyer-type-good');
          } else {
            score += 5;
            matchedFactors.push('buyer-type-some');
          }
          break;
        }
        default:
          score += 8;
          matchedFactors.push('buyer-type-default');
      }
    }

    // Calculate percentage score
    const percentageScore = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 30;
    const finalScore = Math.min(100, Math.max(20, percentageScore));

    console.log('Score calculation result:', {
      listing: listing.title,
      score: score,
      maxPossible: maxPossibleScore,
      percentage: percentageScore,
      finalScore: finalScore,
      matchedFactors: matchedFactors
    });
    
    return finalScore;
  }, [isLocationMatch]);

  // Function to get affordability level for display
  const getAffordabilityLevel = useCallback((listing, profile) => {
    if (!profile.monthlyIncome || !listing.price) return 'unknown';
    
    const monthlyIncome = parseInt(profile.monthlyIncome) || 0;
    const monthlyDebts = parseInt(profile.monthlyDebts) || 0;
    const spouseIncome = profile.hasSpouseIncome ? monthlyIncome * 0.5 : 0;
    const totalMonthlyIncome = monthlyIncome + spouseIncome;
    const propertyPrice = parseInt(listing.price.replace(/[₱,\s]/g, '')) || 0;

    // Calculate monthly payment (assuming 20% down payment, 6.5% interest, 15-year loan)
    const loanAmount = propertyPrice * 0.8;
    const monthlyInterestRate = 0.065 / 12;
    const numberOfPayments = 15 * 12;
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                         (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const housingRatio = monthlyPayment / totalMonthlyIncome;
    const totalDebtRatio = (monthlyPayment + monthlyDebts) / totalMonthlyIncome;

    if (housingRatio <= 0.25 && totalDebtRatio <= 0.35) return 'excellent';
    if (housingRatio <= 0.30 && totalDebtRatio <= 0.40) return 'good';
    if (housingRatio <= 0.35 && totalDebtRatio <= 0.45) return 'fair';
    if (housingRatio <= 0.40 && totalDebtRatio <= 0.50) return 'tight';
    return 'stretch';
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

  // Calculate total pages
  const totalPages = Math.ceil(listings.length / itemsPerPage);

  // Get current listings
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);

  // Function to fetch listings from Firebase
  const fetchListingsFromFirebase = async () => {
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

      console.log('SmartListing: Final results:', {
        properties: propertiesData.length,
        listings: listingsData.length,
        total: uniqueListings.length,
        sampleData: uniqueListings.slice(0, 2), // Show first 2 items for debugging
        uniqueListings: uniqueListings
      });

      setOriginalListings(uniqueListings);
      
      return uniqueListings;
    } catch (error) {
      console.error('SmartListing: Error fetching listings:', error);
      setError('Failed to load properties. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

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
  }, [profileData, calculateMatchScore]); // Include profileData to recalculate when it changes

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
              <div className={`badge text-white border-0 backdrop-blur-md shadow-lg text-xs ${
                getAffordabilityLevel(listing, profileData) === 'excellent' ? 'bg-green-600/90' :
                getAffordabilityLevel(listing, profileData) === 'good' ? 'bg-blue-600/90' :
                getAffordabilityLevel(listing, profileData) === 'fair' ? 'bg-yellow-600/90' :
                getAffordabilityLevel(listing, profileData) === 'tight' ? 'bg-orange-600/90' :
                'bg-red-600/90'
              }`}>
                {getAffordabilityLevel(listing, profileData) === 'excellent' ? '💰 Excellent' :
                 getAffordabilityLevel(listing, profileData) === 'good' ? '💸 Good' :
                 getAffordabilityLevel(listing, profileData) === 'fair' ? '⚖️ Fair' :
                 getAffordabilityLevel(listing, profileData) === 'tight' ? '⚠️ Tight' :
                 '❌ Stretch'}
              </div>
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
              <div className="badge badge-info bg-blue-700/90 text-white border-0 backdrop-blur-md shadow-lg text-xs">Semi Furnished</div>
            )}
            {listing.furnishing === "Fully Furnished" && (
              <div className="badge badge-info bg-blue-600/90 text-white border-0 backdrop-blur-md shadow-lg text-xs">Fully Furnished</div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <button 
              onClick={() => handleSaveProperty(listing)}
              disabled={savingProperty === listing.id}
              className={`btn btn-circle btn-sm backdrop-blur-md border shadow-lg transition-all duration-300 hover:border-teal-600 ${
                savedProperties.has(listing.id) 
                  ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-500/20' 
                  : 'bg-base-100/90 hover:bg-teal-600 hover:text-white border-base-300/20 text-base-content'
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
            <h3 className="text-lg font-bold mb-1.5 line-clamp-2 leading-tight bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">
              {listing.title}
            </h3>
            <p className="text-sm text-base-content/70 flex items-center gap-1.5">
              <RiMapPinLine className="h-4 w-4 flex-shrink-0 text-teal-600" />
              <span className="truncate">{listing.location}</span>
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start justify-between mt-3 gap-3">
            {/* Property stats with icons - responsive grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-sm w-full lg:flex-1">
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal-700/5 to-teal-800/10 backdrop-blur-sm border border-teal-700/10 hover:border-teal-700/20 transition-colors">
                <RiHome3Line className="h-3 w-3 sm:h-4 sm:w-4 text-teal-700 mb-1" />
                <span className="text-base-content/70 text-xs">Area</span>
                <span className="font-semibold mt-0.5 text-teal-700 text-xs sm:text-sm">
                  {listing.floor_area_sqm || '0'} sqm
                </span>
              </div>
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal-600/5 to-teal-700/10 backdrop-blur-sm border border-teal-600/10 hover:border-teal-600/20 transition-colors">
                <RiHotelBedLine className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 mb-1" />
                <span className="text-base-content/70 text-xs">Beds</span>
                <span className="font-semibold mt-0.5 text-teal-600 text-xs sm:text-sm">
                  {listing.beds || '0'}
                </span>
              </div>
              <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal-500/5 to-teal-600/10 backdrop-blur-sm border border-teal-500/10 hover:border-teal-500/20 transition-colors">
                <RiDropLine className="h-3 w-3 sm:h-4 sm:w-4 text-teal-500 mb-1" />
                <span className="text-base-content/70 text-xs">Baths</span>
                <span className="font-semibold mt-0.5 text-teal-500 text-xs sm:text-sm">
                  {listing.baths || '0'}
                </span>
              </div>
            </div>
            
            {/* Price section */}
            <div className="text-center lg:text-right lg:ml-4 flex-none w-full lg:w-auto">
              <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-900 to-teal-700 text-white px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                {listing.price}
              </p>
              {profileData && profileData.monthlyIncome && (
                <p className="text-xs text-green-600 font-semibold mt-1 whitespace-nowrap">
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
          <div className="flex-none pt-2 border-t border-gradient-to-r from-teal-800/20 to-teal-600/20">
            <div className="flex items-center gap-2 mb-3 text-xs text-base-content/60">
              <RiPriceTag3Line className="h-3.5 w-3.5 text-teal-600" />
              Listed {listing.days_on_market === "Unknown" ? "Recently" : listing.days_on_market + " ago"}
            </div>
            
            <button 
              className="btn btn-primary w-full mb-2 normal-case bg-gradient-to-r from-teal-900 to-teal-700 text-white hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => setSelectedProperty(listing)}
            >
              View Details
            </button>
            
            <div className="grid grid-cols-3 gap-1">
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiCalculatorLine className="w-3 h-3" />
                <span className="hidden sm:inline">Loan</span>
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiFileTextLine className="w-3 h-3" />
                <span className="hidden sm:inline">Apply</span>
              </button>
              <button className="btn btn-sm btn-outline gap-1 text-xs">
                <RiPhoneLine className="w-3 h-3" />
                <span className="hidden sm:inline">Call</span>
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
        <div className="modal-box w-11/12 max-w-5xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-2xl text-teal-700">{selectedProperty.title}</h3>
              <p className="text-lg text-base-content/70 flex items-center gap-2 mt-2">
                <RiMapPinLine className="w-5 h-5" />
                {selectedProperty.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-teal-900">{selectedProperty.price}</p>
              <button 
                className="btn btn-sm btn-circle btn-ghost mt-2"
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
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700">{selectedProperty.floor_area_sqm || '0'}</div>
                  <div className="text-sm text-teal-600">sqm Floor Area</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700">{selectedProperty.beds || '0'}</div>
                  <div className="text-sm text-teal-600">Bedrooms</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-teal-700">{selectedProperty.baths || '0'}</div>
                  <div className="text-sm text-teal-600">Bathrooms</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">Property Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property Type:</span>
                    <span className="font-medium">{selectedProperty.property_type || 'House'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Furnishing:</span>
                    <span className="font-medium">{selectedProperty.furnishing || 'Unfurnished'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lot Area:</span>
                    <span className="font-medium">{selectedProperty.lot_area_sqm || '0'} sqm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sqm:</span>
                    <span className="font-medium">
                      ₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) / (selectedProperty.lot_area_sqm || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity) => (
                      <div key={amenity} className="badge badge-outline">{amenity}</div>
                    ))}
                  </div>
                </div>
              )}

              {profileData && profileData.monthlyIncome && (
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-green-600">💰 Financial Analysis</h4>
                  <div className="space-y-2 text-sm bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span>Estimated Monthly Payment:</span>
                      <span className="font-bold text-green-700">₱{calculateMonthlyPayment(selectedProperty.price).toLocaleString()}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment (20%):</span>
                      <span className="font-medium">₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span className="font-medium">₱{Math.round(parseInt(selectedProperty.price.replace(/[^0-9]/g, '')) * 0.8).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Monthly Income:</span>
                      <span className="font-medium">₱{parseInt(profileData.monthlyIncome).toLocaleString()}</span>
                    </div>
                    {profileData.hasSpouseIncome && (
                      <div className="flex justify-between">
                        <span>Combined Income (with spouse):</span>
                        <span className="font-medium">₱{Math.round(parseInt(profileData.monthlyIncome) * 1.5).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span>Affordability Level:</span>
                      <span className={`font-bold ${
                        getAffordabilityLevel(selectedProperty, profileData) === 'excellent' ? 'text-green-600' :
                        getAffordabilityLevel(selectedProperty, profileData) === 'good' ? 'text-blue-600' :
                        getAffordabilityLevel(selectedProperty, profileData) === 'fair' ? 'text-yellow-600' :
                        getAffordabilityLevel(selectedProperty, profileData) === 'tight' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {getAffordabilityLevel(selectedProperty, profileData) === 'excellent' ? '💰 Excellent' :
                         getAffordabilityLevel(selectedProperty, profileData) === 'good' ? '💸 Good' :
                         getAffordabilityLevel(selectedProperty, profileData) === 'fair' ? '⚖️ Fair' :
                         getAffordabilityLevel(selectedProperty, profileData) === 'tight' ? '⚠️ Tight Budget' :
                         '❌ Financial Stretch'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 italic">
                      *Based on 20% down payment, 6.5% interest, 15-year loan term
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <button 
                  className="btn btn-primary w-full gap-2"
                  onClick={() => setSelectedProperty(null)}
                >
                  <RiCalculatorLine className="w-5 h-5" />
                  Calculate Loan for This Property
                </button>
                <button 
                  className="btn btn-outline w-full gap-2"
                  onClick={() => setSelectedProperty(null)}
                >
                  <RiBarChartBoxLine className="w-5 h-5" />
                  Calculate Total Costs
                </button>
                <button 
                  className="btn btn-outline w-full gap-2"
                  onClick={() => setSelectedProperty(null)}
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
        <div className="modal-backdrop" onClick={() => setSelectedProperty(null)}></div>
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
      <div className="space-y-8">
        <div className="alert alert-error shadow-lg">
          <RiErrorWarningLine className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Error Loading Properties</h3>
            <div className="text-sm">{error}</div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <button 
            className="btn btn-primary gap-2"
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchListingsFromFirebase();
            }}
          >
            <RiLoader4Line className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && listings.length === 0) {
    return (
      <div className="space-y-8">
        <div className="alert alert-warning shadow-lg">
          <RiErrorWarningLine className="w-6 h-6" />
          <div>
            <h3 className="font-bold">No Properties Found</h3>
            <div className="text-sm">No properties match your current criteria. Try adjusting your filters.</div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-2xl font-bold mb-2">No listings available</h3>
          <p className="text-base-content/70 mb-6">Check back later or adjust your search criteria.</p>
          <button 
            className="btn btn-primary gap-2"
            onClick={() => {
              setLoading(true);
              fetchListingsFromFirebase();
            }}
          >
            <RiLoader4Line className="w-5 h-5" />
            Refresh Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Recommendations Banner */}
      <div className="alert alert-success shadow-lg">
        <RiRobot2Line className="w-6 h-6" />
        <div>
          <h3 className="font-bold">
            {profileData && profileData.buyerType ? 'AI Smart Recommendations Ready!' : 'Available Properties'}
          </h3>
          <div className="text-sm">
            {profileData && profileData.buyerType
              ? `Based on your ${profileData.buyerType} profile (${profileData.preferredLocation || 'No location'}, ${profileData.budgetRange || 'No budget'}, ₱${parseInt(profileData.monthlyIncome || 0).toLocaleString()}/month income), showing ${listings.length} properties ranked by compatibility and affordability.`
              : `Showing ${listings.length} available properties. Complete your AI profile for personalized recommendations.`
            }
          </div>
        </div>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="card bg-gradient-to-br from-teal-500/20 to-teal-500/5 backdrop-blur-xl shadow-lg"
      >
        <div className="card-body p-6">
          <div className="flex items-start justify-between">
            <div>
              <RiLayoutGridLine className="w-8 h-8 text-teal-500 mb-4" />
              <h3 className="text-lg font-bold text-teal-500">Smart Listings</h3>
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
        <h2 id="listings-heading" className="text-xl sm:text-2xl font-bold">Smart Property Recommendations</h2>
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
    </div>
  );
}

export default SmartListing;