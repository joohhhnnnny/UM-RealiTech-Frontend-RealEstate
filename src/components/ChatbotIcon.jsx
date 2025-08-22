import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  UserIcon,
  XMarkIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  HomeIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import { FaRobot } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/Firebase';

function ChatbotIcon() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  const chatMode = (userRole === 'agent' || userRole === 'developer') ? 'agent' : 'client';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentFlow, setCurrentFlow] = useState('greeting');
  const [userType, setUserType] = useState(null);
  const [budget, setBudget] = useState('');
  const [showPresets, setShowPresets] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const messageSequenceRef = useRef(0);
  const [windowSize, setWindowSize] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  // Cache for listings to avoid repeated fetches
  const [listingsCache, setListingsCache] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [lastFoundProperties, setLastFoundProperties] = useState([]); // Remember last search results
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Helper function to format text with bold styling (hiding asterisks)
  const formatTextWithBold = (text) => {
    if (!text) return text;
    
    // Handle multi-line text by splitting on line breaks first
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) return <br key={`br-${lineIndex}`} />;
      
      // Split line by asterisks and process each part
      const parts = line.split(/(\*[^*]+\*)/g);
      
      const processedParts = parts.map((part, index) => {
        // Check if this part is enclosed in asterisks (bold text)
        if (part.match(/^\*[^*]+\*$/)) {
          // Remove asterisks and make bold
          const boldText = part.slice(1, -1);
          return <strong key={`${lineIndex}-${index}`} className="font-bold text-base-content">{boldText}</strong>;
        }
        // Return regular text, but skip empty strings and standalone asterisks
        if (!part || part === '*' || part === '**') {
          return null;
        }
        return part;
      }).filter(part => part !== null && part !== ''); // Remove empty and null parts
      
      // Only return span if there are processed parts
      if (processedParts.length === 0) return null;
      
      return (
        <span key={lineIndex}>
          {processedParts}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    }).filter(part => part !== null); // Remove null lines
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch listings from Firebase Firestore
  const fetchListingsFromFirebase = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (listingsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        return listingsCache;
      }

      const listingsRef = collection(db, 'listings');
      
      // First try to get documents with ordering, fallback to simple query if it fails
      let querySnapshot;
      try {
        const orderedQuery = query(
          listingsRef,
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        querySnapshot = await getDocs(orderedQuery);
        console.log('Successfully fetched with ordering by createdAt');
      } catch (orderError) {
        console.warn('createdAt field may not exist or index missing, trying simple query:', orderError);
        const simpleQuery = query(listingsRef, limit(50));
        querySnapshot = await getDocs(simpleQuery);
        console.log('Successfully fetched with simple query');
      }
      const listings = [];
      
      console.log(`Firebase query returned ${querySnapshot.size} documents`); // Debug log
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Processing document ${doc.id}:`, data); // Debug log
        
        // Ensure required fields exist
        if (data.title && data.location && data.price) {
          listings.push({
            id: doc.id,
            ...data,
            // Normalize price format for consistency
            price: data.price?.startsWith('₱') ? data.price : `₱ ${data.price}`,
            // Ensure numeric fields are properly handled
            beds: data.beds?.toString() || '0',
            baths: data.baths?.toString() || '0',
            lot_area_sqm: parseInt(data.lot_area_sqm) || 0,
            floor_area_sqm: parseInt(data.floor_area_sqm) || 0,
            // Ensure images array exists
            images: Array.isArray(data.images) ? data.images : [data.image || "https://via.placeholder.com/400x300?text=No+Image"]
          });
        }
      });
      
      // Update cache
      setListingsCache(listings);
      setLastFetchTime(now);
      
      return listings;
    } catch (error) {
      console.error('Error fetching listings from Firebase:', error);
      
      // Return empty array on error, or cached data if available
      return listingsCache.length > 0 ? listingsCache : [];
    }
  }, [listingsCache, lastFetchTime, CACHE_DURATION]);

  // Filter listings based on search criteria
  const filterListings = async (criteria) => {
    try {
      // Fetch fresh listings from Firebase
      const allListings = await fetchListingsFromFirebase();
      
      console.log(`Fetched ${allListings.length} listings from Firebase`); // Debug log
      
      // If no criteria or empty criteria, return first 5 listings
      if (!criteria || !Object.values(criteria).some(v => v)) {
        console.log('No criteria found, returning first 5 listings'); // Debug log
        return allListings.slice(0, 5);
      }

      const filtered = allListings.filter(listing => {
        if (!listing.title || !listing.location || (!listing.price && listing.price !== 0)) {
          console.log('❌ Filtered out due to missing required fields:', listing.title);
          return false;
        }

        const priceNum = parseInt(listing.price.replace(/[^0-9]/g, ''));
        console.log(`🏠 Checking property: "${listing.title}" - Price: ${listing.price} (${priceNum})`);
        
        // Price range filtering
        if (criteria.minPrice && priceNum < criteria.minPrice) {
          console.log(`❌ Filtered out "${listing.title}": Price ${priceNum} < minPrice ${criteria.minPrice}`);
          return false;
        }
        if (criteria.maxPrice && priceNum > criteria.maxPrice) {
          console.log(`❌ Filtered out "${listing.title}": Price ${priceNum} > maxPrice ${criteria.maxPrice}`);
          return false;
        }
        
        // Location filtering (fuzzy match)
        if (criteria.location) {
          const locationTerms = criteria.location.toLowerCase().split(/\s+/);
          const listingLocation = listing.location.toLowerCase();
          if (!locationTerms.some(term => listingLocation.includes(term))) {
            return false;
          }
        }
        
        // Bedroom filtering
        if (criteria.beds) {
          const listingBeds = parseInt(listing.beds) || 0;
          const criteriaBeds = parseInt(criteria.beds);
          if (listingBeds !== criteriaBeds) return false;
        }
        
        // Property type filtering
        if (criteria.propertyType) {
          const propertyTypes = ['house', 'condo', 'apartment', 'lot'];
          const requestedType = criteria.propertyType.toLowerCase();
          if (propertyTypes.some(type => requestedType.includes(type))) {
            const listingType = listing.type?.toLowerCase() || listing.title.toLowerCase();
            if (!propertyTypes.some(type => 
              (requestedType.includes(type) && listingType.includes(type))
            )) {
              return false;
            }
          }
        }
        
        console.log(`✅ Property "${listing.title}" passed all filters`);
        return true;
      });

      console.log(`🎯 Filtering result: ${filtered.length}/${allListings.length} properties passed filters`);
      console.log('Filtered properties:', filtered.map(p => `${p.title} - ${p.price}`));
      
      return filtered.slice(0, 10); // Limit results to prevent overwhelming UI
    } catch (error) {
      console.error('Error filtering listings:', error);
      return [];
    }
  };

  // Calculate chat window position based on screen size and device type
  const getChatWindowPosition = () => {
    const windowWidth = windowSize.width;
    const windowHeight = windowSize.height;
    const isMobile = windowWidth < 768; // Mobile breakpoint
    
    if (isMobile) {
      return {
        position: 'centered'
      };
    } else {
      const chatWidth = 384;
      const chatHeight = 500;
      
      let bottom = 100;
      let right = 32;
      
      if (buttonPosition.x !== 0 || buttonPosition.y !== 0) {
        const buttonCenterX = buttonPosition.x;
        const buttonCenterY = buttonPosition.y;
        
        right = Math.max(16, windowWidth - buttonCenterX + 40);
        if (right + chatWidth > windowWidth) {
          right = Math.max(16, windowWidth - (buttonCenterX - chatWidth - 40));
        }
        
        bottom = Math.max(16, windowHeight - buttonCenterY - chatHeight / 2);
        if (bottom + chatHeight > windowHeight) {
          bottom = Math.max(16, windowHeight - chatHeight - 16);
        }
      }
      
      return { 
        position: 'absolute',
        bottom, 
        right 
      };
    }
  };

  const chatPosition = getChatWindowPosition();

  // Get system context based on user role and chat mode
  const getSystemContext = () => {
    if (chatMode === 'agent') {
      if (userRole === 'developer') {
        return `You are PropGuard Developer Assistant, an AI assistant for real estate developers. You help with project management, sales analytics, property inventory, buyer applications, and partner management. You have access to real-time property data from the Firebase database. Respond professionally and provide specific data when relevant.`;
      } else {
        return `You are PropGuard Agent Assistant, an AI assistant for real estate agents. You help with client management, market analytics, property verification, application processing, and lead generation. You have access to real-time property listings from the database. Respond professionally and provide market insights when relevant.`;
      }
    } else {
      return `You are PropGuard Assistant, an AI-powered real estate assistant helping clients with property inquiries, fraud detection, and real estate guidance. You have access to real-time property listings from our database. You help with:
      - Property buying guidance and recommendations
      - Property selling assistance and valuation
      - Market exploration and investment tips
      - Fraud protection and property verification
      - Document verification and legal compliance
      - Budget planning and financing options
      Respond in a friendly, helpful manner and ask relevant follow-up questions to better assist the user.`;
    }
  };

  // Initialize chat when component mounts
  const initializeChat = useCallback(() => {
    const welcomeMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'bot',
      message: chatMode === 'client' 
        ? "Hi! I'm PropGuard Assistant. I'm here to help you with property inquiries, fraud detection, and real estate guidance. I have access to real-time property listings from our database. How can I assist you today?"
        : `Welcome to PropGuard Agent Dashboard! I can help you manage client inquiries, process applications, and provide market insights with real-time property data. Hello ${userRole === 'developer' ? 'Developer' : 'Agent'}! What would you like to work on?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setCurrentFlow('greeting');
    setUserType(null);
    setBudget('');
    setShowPresets(true);
  }, [chatMode, userRole]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length, initializeChat]);

  // Pre-load listings when chat opens
  useEffect(() => {
    if (isOpen && listingsCache.length === 0) {
      fetchListingsFromFirebase().catch(error => {
        console.error('Error pre-loading listings:', error);
      });
    }
  }, [isOpen, listingsCache.length, fetchListingsFromFirebase]);

  const getPresetMessages = () => {
    if (chatMode === 'agent') {
      // Different presets for agents vs developers
      if (userRole === 'developer') {
        return [
          { emoji: '🏗️', text: 'Project Management' },
          { emoji: '📊', text: 'Sales Analytics' },
          { emoji: '🏠', text: 'Property Inventory' },
          { emoji: '📋', text: 'Buyer Applications' },
          { emoji: '💼', text: 'Partner Management' }
        ];
      } else {
        return [
          { emoji: '👥', text: 'View Client Dashboard' },
          { emoji: '📊', text: 'Market Analysis' },
          { emoji: '🔍', text: 'Property Verification' },
          { emoji: '📋', text: 'Application Processing' },
          { emoji: '💼', text: 'Lead Management' }
        ];
      }
    }

    // Client mode presets based on flow
    switch (currentFlow) {
      case 'greeting':
        return [
          { emoji: '🏠', text: 'I want to buy a property' },
          { emoji: '💰', text: 'I want to sell my property' },
          { emoji: '🔍', text: 'Just exploring options' },
          { emoji: '🛡️', text: 'Check property for fraud' },
          { emoji: '📄', text: 'Document verification' }
        ];
      case 'buying':
        return [
          { emoji: '💵', text: 'Set my budget range' },
          { emoji: '📍', text: 'Show properties in my area' },
          { emoji: '🏢', text: 'Condo units' },
          { emoji: '🏡', text: 'House and lot' },
          { emoji: '📋', text: 'Buying process guide' }
        ];
      case 'selling':
        return [
          { emoji: '💰', text: 'Property valuation' },
          { emoji: '📸', text: 'Listing requirements' },
          { emoji: '📋', text: 'Required documents' },
          { emoji: '🔍', text: 'Market analysis' },
          { emoji: '⚡', text: 'Quick sell options' }
        ];
      case 'exploring':
        return [
          { emoji: '📊', text: 'Market trends' },
          { emoji: '💡', text: 'Investment tips' },
          { emoji: '🏙️', text: 'Popular locations' },
          { emoji: '💰', text: 'Price ranges' },
          { emoji: '📚', text: 'First-time buyer guide' }
        ];
      default:
        return [
          { emoji: '🏠', text: 'Show me properties' },
          { emoji: '💰', text: 'Discuss pricing' },
          { emoji: '📋', text: 'More information' },
          { emoji: '🆘', text: 'I need help' }
        ];
    }
  };

  const handlePresetClick = (presetText) => {
    setCurrentMessage(presetText);
    handleSendMessage(presetText);
  };

  const formatPropertyCard = (listing) => {
    return {
      type: 'property',
      content: {
        ...listing,
        formattedPrice: listing.price,
        pricePerSqm: listing.lot_area_sqm > 0 
          ? `₱${Math.round(parseInt(listing.price.replace(/[^0-9]/g, '')) / listing.lot_area_sqm).toLocaleString()}/sqm`
          : null
      }
    };
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || currentMessage;
    if (!text.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}-${messageSequenceRef.current++}`,
      sender: 'user',
      message: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setShowPresets(false);
    setIsLoading(true);

    try {
      await getGeminiResponse(text);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setTimeout(() => {
        handleFallbackResponse(text);
      }, 1000);
    }
  };

  const getGeminiResponse = async (userMessage) => {
    try {
      const systemContext = getSystemContext();
      const conversationHistory = messages.slice(-5).map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.type === 'property' ? '[Property Suggestion]' : msg.message}`
      ).join('\n');

      // Extract potential property search criteria from user message
      const criteria = {
        maxPrice: userMessage.match(/(?:under|less than|maximum|max|below|within|budget) (?:₱|P)?(\d+(?:[,.]\d+)?[MmKk]?)/i)?.[1],
        minPrice: userMessage.match(/(?:over|more than|minimum|min|above|at least|starting|from) (?:₱|P)?(\d+(?:[,.]\d+)?[MmKk]?)/i)?.[1],
        location: userMessage.match(/(?:in|at|near|around|within|close to) ([^,.]+?)(?:,|\.|$)/i)?.[1] || 
                 userMessage.match(/(?:show|find|looking|searching).*(?:in|at) ([^,.]+?)(?:,|\.|$)/i)?.[1],
        beds: userMessage.match(/(\d+)(?:\s*(?:bedroom|bed|br|bhk))/i)?.[1],
        propertyType: userMessage.match(/(?:looking for|want|need|show|find) (?:a |an )?([^,.]+?)(?:,|\.|$)/i)?.[1] ||
                     userMessage.match(/(?:house|condo|apartment|property|lot)/i)?.[0]
      };

      // Convert price strings to numbers
      if (criteria.maxPrice) {
        criteria.maxPrice = parseInt(criteria.maxPrice.replace(/[^0-9]/g, '')) * 
          (criteria.maxPrice.toLowerCase().includes('m') ? 1000000 : 
           criteria.maxPrice.toLowerCase().includes('k') ? 1000 : 1);
      }
      if (criteria.minPrice) {
        criteria.minPrice = parseInt(criteria.minPrice.replace(/[^0-9]/g, '')) * 
          (criteria.minPrice.toLowerCase().includes('m') ? 1000000 : 
           criteria.minPrice.toLowerCase().includes('k') ? 1000 : 1);
      }

      // Search for matching properties if criteria found OR if user asks for all properties
      let matchingProperties = [];
      const showAllPropertiesPattern = /(?:show|find|display|list|view|see|browse|explore)\s+(?:all|available|every|some|any)?\s*(?:properties|listings|homes|houses|condos|apartments|real estate)/i;
      const generalPropertyQuery = /(?:property|properties|house|houses|condo|condos|apartment|apartments|home|homes|real estate|listing|listings)/i;
      
      const isShowAllRequest = showAllPropertiesPattern.test(userMessage) || 
                              userMessage.toLowerCase().includes('all properties') ||
                              userMessage.toLowerCase().includes('available properties') ||
                              userMessage.toLowerCase().includes('what properties') ||
                              userMessage.toLowerCase().includes('show properties');
      
      const isGeneralPropertyQuery = generalPropertyQuery.test(userMessage) && 
                                   (userMessage.toLowerCase().includes('show') || 
                                    userMessage.toLowerCase().includes('find') || 
                                    userMessage.toLowerCase().includes('looking') ||
                                    userMessage.toLowerCase().includes('want') ||
                                    userMessage.toLowerCase().includes('need'));
      
      // Check for follow-up requests to show previously found properties
      const isFollowUpShowRequest = userMessage.toLowerCase().match(/(?:see them|show them|view them|display them|let me see|i would like to see|yes please|sure|okay)/);
      
      console.log('Property query detection:', {
        userMessage,
        extractedCriteria: criteria,
        processedCriteria: {
          maxPrice: criteria.maxPrice,
          minPrice: criteria.minPrice,
          location: criteria.location,
          beds: criteria.beds,
          propertyType: criteria.propertyType
        },
        hasSpecificCriteria: Object.values(criteria).some(v => v),
        isShowAllRequest,
        isGeneralPropertyQuery,
        isFollowUpShowRequest: !!isFollowUpShowRequest,
        lastFoundPropertiesCount: lastFoundProperties.length
      });
      
      // Debug: Check if database has any properties at all
      if (listingsCache.length === 0) {
        console.log('⚠️ No properties in cache, attempting to fetch...');
        const testFetch = await fetchListingsFromFirebase();
        console.log(`📊 Database contains ${testFetch.length} total properties`);
      }
      
      if (Object.values(criteria).some(v => v) || isShowAllRequest || isGeneralPropertyQuery) {
        console.log('Searching for properties with criteria:', isShowAllRequest || isGeneralPropertyQuery ? 'SHOW ALL' : criteria);
        matchingProperties = await filterListings(isShowAllRequest || isGeneralPropertyQuery ? {} : criteria);
        matchingProperties = matchingProperties.slice(0, 3);
        setLastFoundProperties(matchingProperties); // Remember these properties
        console.log(`Found ${matchingProperties.length} matching properties`);
      } else if (isFollowUpShowRequest && lastFoundProperties.length > 0) {
        console.log('Using last found properties for follow-up request');
        matchingProperties = lastFoundProperties;
      }

      const prompt = `${systemContext}

Previous conversation:
${conversationHistory}

Available Properties: ${matchingProperties.length} properties match the search criteria from our real-time database.

User: ${userMessage}

Please provide a helpful response based on your role as ${chatMode === 'agent' ? (userRole === 'developer' ? 'Developer Assistant' : 'Agent Assistant') : 'PropGuard Assistant'}. If the user is asking about properties, I will show relevant ones from the matching properties after your response. Keep responses concise but informative.`;

      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I'm having trouble responding right now. Please try again.";

      // Send the bot's text response
      const botMessage = {
        id: `bot-${Date.now()}-${messageSequenceRef.current++}`,
        sender: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // If there are matching properties, show them for property-related queries or follow-up requests
      const shouldShowProperties = matchingProperties.length > 0 && (
        userMessage.toLowerCase().match(/(?:property|properties|house|houses|condo|condos|apartment|apartments|looking|buy|show|see|view|find|available|listing|listings|home|homes|them)/) ||
        isFollowUpShowRequest ||
        userMessage.toLowerCase().includes('show') ||
        userMessage.toLowerCase().includes('see') ||
        userMessage.toLowerCase().includes('view')
      );
      
      console.log('Property display check:', {
        matchingPropertiesCount: matchingProperties.length,
        shouldShowProperties,
        userMessage: userMessage.toLowerCase()
      });
      
      if (shouldShowProperties) {
        console.log('Displaying properties...');
        // Add a small delay before showing properties
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send property suggestions
        for (let i = 0; i < matchingProperties.length; i++) {
          const property = matchingProperties[i];
          const propertyMessage = {
            id: `property-${Date.now()}-${messageSequenceRef.current++}-${i}`,
            sender: 'bot',
            type: 'property',
            content: formatPropertyCard(property).content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, propertyMessage]);
          // Add small delay between property cards
          if (i < matchingProperties.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      } else if (matchingProperties.length > 0) {
        console.log('Properties found but not displaying due to query type:', userMessage);
      }

      setShowPresets(true);
      setIsLoading(false);

      updateConversationFlow(userMessage);

    } catch (error) {
      console.error('Gemini API Error:', error);
      handleFallbackResponse(userMessage);
    }
  };

  const updateConversationFlow = (userMessage) => {
    if (userMessage.toLowerCase().includes('buy') || userMessage.toLowerCase().includes('buying')) {
      setCurrentFlow('buying');
      setUserType('buying');
    } else if (userMessage.toLowerCase().includes('sell') || userMessage.toLowerCase().includes('selling')) {
      setCurrentFlow('selling');
      setUserType('selling');
    } else if (userMessage.toLowerCase().includes('exploring') || userMessage.toLowerCase().includes('explore')) {
      setCurrentFlow('exploring');
      setUserType('exploring');
    }
  };

  const handleFallbackResponse = (userMessage) => {
    let fallbackMessage = "I apologize, but I'm having trouble accessing the property database right now. Please try again in a moment, or let me know if you'd like general real estate guidance.";

    // Customize fallback responses based on user message
    if (userMessage.toLowerCase().includes('property')) {
      fallbackMessage = "I can help you with property inquiries once I reconnect to our database. In the meantime, I can provide general guidance about buying, selling, or property verification. What specific aspect interests you?";
    } else if (userMessage.toLowerCase().includes('fraud')) {
      fallbackMessage = "For fraud-related concerns, I can assist with property verification strategies and fraud detection tips. Please provide the property details you want to check, and I'll guide you through the verification process.";
    }

    const fallbackBotMessage = {
      id: `fallback-${Date.now()}-${messageSequenceRef.current++}`,
      sender: 'bot',
      message: fallbackMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, fallbackBotMessage]);
    setShowPresets(true);
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && chatPosition.position === 'centered' && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        {isOpen && (
          <motion.div
            key="chat-modal"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`bg-base-100 rounded-lg shadow-xl z-40 border border-base-200 text-base-content
              ${chatPosition.position === 'centered' 
                ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-sm h-[85vh] max-h-[600px]' 
                : 'fixed w-96'
              }`}
            style={
              chatPosition.position !== 'centered'
                ? {
                    bottom: `${chatPosition.bottom}px`,
                    right: `${chatPosition.right}px`,
                  }
                : {}
            }
          >
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-base-200 bg-primary rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaRobot className="w-6 h-6 text-primary-content" />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-primary-content">PropGuard Assistant</h3>
                    <p className="text-xs sm:text-sm text-primary-content/80">AI-powered real estate assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-circle text-primary-content"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className={`overflow-y-auto p-3 sm:p-4 bg-base-100 ${
              chatPosition.position === 'centered' 
                ? 'h-[calc(85vh-200px)] max-h-[400px]' 
                : 'h-[300px]'
            }`}>
              {messages.length === 0 ? (
                <div className="text-center text-base-content/60 mt-16">
                  <FaRobot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Welcome to PropGuard Assistant</p>
                  <p className="text-sm mt-2">Start a conversation to get help with your real estate needs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    // Ensure the message has a valid ID
                    if (!msg.id) {
                      console.warn('Message without ID found:', msg);
                      return null;
                    }
                    
                    return (
                      <div key={msg.id} className={`chat ${msg.sender === 'user' ? 'chat-end' : 'chat-start'}`}>
                      <div className="chat-image avatar">
                        <div className="w-8 rounded-full">
                          {msg.sender === 'user' ? (
                            <div className="bg-primary text-primary-content rounded-full w-8 h-8 flex items-center justify-center">
                              <UserIcon className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                              <FaRobot className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`chat-bubble ${
                        msg.sender === 'user' 
                          ? 'chat-bubble-primary' 
                          : 'bg-base-200'
                      }`}>
                        {msg.type === 'property' ? (
                          <div className="card bg-base-100 shadow-md w-full max-w-[240px] sm:max-w-[280px]">
                            <figure className="relative h-32">
                              <img 
                                src={msg.content.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                                alt={msg.content.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <div className="badge badge-primary">{msg.content.type || 'Property'}</div>
                              </div>
                            </figure>
                            <div className="card-body p-3">
                              <h3 className="font-bold text-sm line-clamp-2">{msg.content.title}</h3>
                              <div className="flex items-center gap-1 text-xs text-base-content/70">
                                <MapPinIcon className="w-3 h-3" />
                                <span className="truncate">{msg.content.location}</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="flex items-center">
                                    <HomeIcon className="w-3 h-3 mr-1" />
                                    {msg.content.beds || 0} Beds
                                  </div>
                                  <div className="text-primary font-semibold">
                                    {msg.content.floor_area_sqm} sqm
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{msg.content.formattedPrice}</div>
                                  {msg.content.pricePerSqm && (
                                    <div className="text-xs text-base-content/60">{msg.content.pricePerSqm}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>{formatTextWithBold(msg.message)}</div>
                        )}
                      </div>
                      <div className="chat-footer opacity-50 text-xs">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    );
                  })}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div key="loading-indicator" className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-8 rounded-full">
                          <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                            <FaRobot className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="chat-bubble bg-base-200">
                        <div className="flex items-center gap-2">
                          <div className="loading loading-dots loading-sm"></div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset Messages */}
                  {showPresets && getPresetMessages().length > 0 && (
                    <div key="preset-messages" className="space-y-2 mt-6 pt-4 border-t border-base-200">
                      <p className="text-sm text-base-content/60 text-center font-medium">Quick options:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                        {getPresetMessages().map((preset, index) => (
                          <motion.button
                            key={`preset-${preset.text.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handlePresetClick(preset.text)}
                            className="btn btn-sm btn-outline hover:btn-primary text-left justify-start transition-all duration-200"
                          >
                            <span className="mr-2">{preset.emoji}</span>
                            {preset.text}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 sm:p-4 border-t border-base-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="input input-bordered flex-1"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="btn btn-primary"
                  disabled={!currentMessage.trim() || isLoading}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: isDragging ? 1 : 1.1 }}
        whileTap={{ scale: isDragging ? 1 : 0.9 }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{
          top: -windowSize.height + 150,
          left: -windowSize.width + 150,
          right: windowSize.width - 150,
          bottom: windowSize.height - 150,
        }}
        onDrag={(event, info) => {
          setButtonPosition({
            x: info.point.x,
            y: info.point.y
          });
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 100);
        }}
        className="fixed bottom-8 right-8 z-50 select-none"
        style={{ 
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <button
          className="btn btn-primary btn-circle shadow-lg transition-all duration-200 hover:shadow-xl relative
                     w-14 h-14 sm:w-16 sm:h-16 lg:btn-lg"
          onClick={(e) => {
            e.preventDefault();
            // Only open/close chat if not dragging
            if (!isDragging) {
              setIsOpen(!isOpen);
            }
          }}
          style={{ 
            pointerEvents: 'auto',
            cursor: isDragging ? 'grabbing' : 'pointer',
            userSelect: 'none'
          }}
        >
          {isOpen ? (
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
          ) : (
            <>
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-error text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse pointer-events-none text-[10px] sm:text-xs">
                1
              </span>
            </>
          )}
        </button>
        
        {/* Drag indicator */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -inset-2 rounded-full border-2 border-primary border-dashed pointer-events-none"
          />
        )}
      </motion.div>
    </>
  );
}

export default ChatbotIcon;