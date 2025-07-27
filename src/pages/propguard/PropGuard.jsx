import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiHomeSmileLine,
  RiFileShieldLine,
  RiScales3Line,
  RiMoneyDollarCircleLine,
  RiSendPlaneFill,
  RiRobot2Fill,
  RiUser3Fill,
  RiShieldCheckLine,
  RiAlertLine,
  RiFingerprint2Line,
  RiHomeSmile2Line,
  RiBuilding4Line,
  RiMapPinLine
} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import listingsData from '../../listings.json';

function PropGuard() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentFlow, setCurrentFlow] = useState('greeting');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Get system context based on user role
  const getSystemContext = () => {
    if (userRole === 'developer') {
      return `You are PropGuard Developer Assistant, an AI assistant for real estate developers. You help with project management, sales analytics, property inventory, buyer applications, and partner management. You have access to:
        - Active Projects: 3 projects with 245 total units, 78% sales progress, 54 available units
        - Monthly Sales: ₱45M with 85% target achievement
        - Unit inventory: Studio (15), 1BR (22), 2BR (12), 3BR (5 units available)
        - Price range: ₱2.5M - ₱8.2M
        Respond professionally and provide specific data when relevant.`;
    } else if (userRole === 'agent') {
      return `You are PropGuard Agent Assistant, an AI assistant for real estate agents. You help with client management, market analytics, property verification, application processing, and lead generation. You have access to:
        - Active Clients: 15 clients
        - Properties Listed: 8 properties
        - Pending Transactions: 3 transactions
        - New Inquiries: 5 inquiries
        - Market data: 8.5% YoY price increase, hot areas include BGC, Makati, Ortigas
        - Most demanded: 2-3BR Condos, Price range: ₱4M - ₱12M
        Respond professionally and provide market insights when relevant.`;
    } else {
      return `You are PropGuard Assistant, an AI-powered real estate assistant helping clients with property inquiries, fraud detection, and real estate guidance. You help with:
        - Property buying guidance and recommendations
        - Property selling assistance and valuation
        - Market exploration and investment tips
        - Fraud protection and property verification
        - Document verification and legal compliance
        - Budget planning and financing options
        Respond in a friendly, helpful manner and ask relevant follow-up questions to better assist the user.`;
    }
  };

  const getAIResponse = (userMessage, matchingProperties = []) => {
    const isPropertyQuery = userMessage.toLowerCase().match(/(?:property|house|condo|apartment|looking|buy|price|bedroom|location)/);
    const context = getSystemContext();

    // Common response patterns based on message content
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return "Hello! How can I assist you with your real estate needs today?";
    }

    if (userMessage.toLowerCase().includes('budget')) {
      return "I can help you with budget planning. What's your target price range for a property?";
    }

    if (userMessage.toLowerCase().includes('fraud') || userMessage.toLowerCase().includes('scam')) {
      return "I understand your concern about fraud. I can help verify property authenticity and check for common red flags. Would you like me to explain our fraud detection process?";
    }

    if (userMessage.toLowerCase().includes('document')) {
      return "I can assist with document verification and submissions. What type of documents do you need help with - property titles, contracts, or other legal documents?";
    }

    if (isPropertyQuery) {
      return `I found ${matchingProperties.length} properties that match your criteria. ${
        matchingProperties.length > 0 
          ? "Here are some suggestions that might interest you:" 
          : "Could you provide more details about what you're looking for? For example, your preferred location or budget range?"
      }`;
    }

    if (userMessage.toLowerCase().includes('right') || userMessage.toLowerCase().includes('law')) {
      return "I can guide you through your real estate rights and legal considerations. What specific aspect would you like to learn more about?";
    }

    if (userMessage.toLowerCase().includes('finance') || userMessage.toLowerCase().includes('loan')) {
      return "I can help you understand your financing options. Would you like to know about mortgage rates, loan requirements, or payment terms?";
    }

    // Default contextual response based on role
    return userRole === 'developer' 
      ? "I can help you manage your development projects, track sales, or handle buyer applications. What would you like to focus on?"
      : userRole === 'agent'
      ? "I can assist you with client management, market analysis, or property listings. What area would you like to explore?"
      : "I'm here to help protect your real estate journey. Would you like to explore properties, verify documents, or learn about financing options?";
  };

  const updateConversationFlow = (message) => {
    const text = message.toLowerCase();
    if (text.includes('buy') || text.includes('property') || text.includes('house') || text.includes('condo')) {
      setCurrentFlow('buying');
    } else if (text.includes('document') || text.includes('submit') || text.includes('verification')) {
      setCurrentFlow('documents');
    } else if (text.includes('right') || text.includes('law') || text.includes('legal')) {
      setCurrentFlow('rights');
    } else if (text.includes('payment') || text.includes('finance') || text.includes('money')) {
      setCurrentFlow('finance');
    }
  };

  // Initialize chat when component mounts
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: "Hello! I'm PropGuard AI Assistant. I'm here to help protect your real estate journey and provide guidance. How can I assist you today?"
    };
    setMessages([welcomeMessage]);
    setCurrentFlow('greeting');
    setShowSuggestions(true);
  };

  const getSuggestions = () => {
    switch (currentFlow) {
      case 'greeting':
        return [
          { emoji: '🏠', text: 'I want to buy a property' },
          { emoji: '📋', text: 'Submit property documents' },
          { emoji: '🔍', text: 'Check property authenticity' },
          { emoji: '💰', text: 'Help with financing' },
          { emoji: '📄', text: 'Understand my rights' }
        ];
      case 'buying':
        return [
          { emoji: '💵', text: 'Set my budget range' },
          { emoji: '📍', text: 'Show properties in my area' },
          { emoji: '🏢', text: 'Find condos' },
          { emoji: '🏡', text: 'Find house and lot' },
          { emoji: '📋', text: 'Property buying guide' }
        ];
      case 'documents':
        return [
          { emoji: '📄', text: 'Submit title documents' },
          { emoji: '📝', text: 'Contract verification' },
          { emoji: '✍️', text: 'Digital signatures' },
          { emoji: '📋', text: 'Required document checklist' }
        ];
      default:
        return [
          { emoji: '🏠', text: 'Show me properties' },
          { emoji: '📋', text: 'Document help' },
          { emoji: '💰', text: 'Payment assistance' },
          { emoji: '❓', text: 'Legal rights info' }
        ];
    }
  };

  // Quick action buttons configuration
  const actions = [
    {
      id: 1,
      title: "Find Properties",
      description: "Search and verify legitimate properties",
      icon: RiHomeSmileLine,
      color: "primary"
    },
    {
      id: 2,
      title: "Document Submissions",
      description: "Submit and process property documents",
      icon: RiFileShieldLine,
      color: "info"
    },
    {
      id: 3,
      title: "Know Your Rights",
      description: "Learn about real estate laws and rights",
      icon: RiScales3Line,
      color: "accent"
    },
    {
      id: 4,
      title: "Payments",
      description: "Manage payments and transactions",
      icon: RiMoneyDollarCircleLine,
      color: "warning"
    },
    {
      id: 5,
      title: "Financing Help",
      description: "Get guidance on property financing",
      icon: RiMoneyDollarCircleLine,
      color: "success"
    }
  ];

  const filterListings = (criteria) => {
    // Default return all listings if no criteria
    if (!Object.values(criteria).some(v => v)) {
      return listingsData.slice(0, 5); // Return first 5 listings by default
    }

    return listingsData.filter(listing => {
      if (!listing.title || !listing.location || (!listing.price && listing.price !== 0)) {
        return false;
      }

      const priceNum = parseInt(listing.price.replace(/[^0-9]/g, ''));
      
      // More lenient price matching
      if (criteria.minPrice && priceNum < criteria.minPrice) return false;
      if (criteria.maxPrice && priceNum > criteria.maxPrice) return false;
      
      // Fuzzy location matching
      if (criteria.location) {
        const locationTerms = criteria.location.toLowerCase().split(/\s+/);
        const listingLocation = listing.location.toLowerCase();
        if (!locationTerms.some(term => listingLocation.includes(term))) {
          return false;
        }
      }
      
      // Flexible bed matching
      if (criteria.beds) {
        const listingBeds = parseInt(listing.beds) || 0;
        const criteriBeds = parseInt(criteria.beds);
        if (listingBeds !== criteriBeds) return false;
      }
      
      // Flexible property type matching
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
      
      return true;
    });
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

  const handleSuggestionClick = (text) => {
    handleSendMessage(text);
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || newMessage;
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: text
    }]);
    setNewMessage('');
    setShowSuggestions(false);
    setIsLoading(true);

    // Extract property search criteria from message
    const criteria = {
      minPrice: text.match(/(?:under|less than|maximum|max|below|within|budget) (?:₱|P)?(\d+(?:[,.]\d+)?[MmKk]?)/i)?.[1],
      maxPrice: text.match(/(?:over|more than|minimum|min|above|at least|starting|from) (?:₱|P)?(\d+(?:[,.]\d+)?[MmKk]?)/i)?.[1],
      location: text.match(/(?:in|at|near|around|within|close to) ([^,.]+?)(?:,|\.|$)/i)?.[1] || 
               text.match(/(?:show|find|looking|searching).*(?:in|at) ([^,.]+?)(?:,|\.|$)/i)?.[1],
      beds: text.match(/(\d+)(?:\s*(?:bedroom|bed|br|bhk))/i)?.[1],
      propertyType: text.match(/(?:looking for|want|need|show|find) (?:a |an )?([^,.]+?)(?:,|\.|$)/i)?.[1] ||
                   text.match(/(?:house|condo|apartment|property|lot)/i)?.[0]
    };

    // Convert price strings to numbers
    if (criteria.minPrice) {
      criteria.minPrice = parseInt(criteria.minPrice.replace(/[^0-9]/g, '')) * 
        (criteria.minPrice.toLowerCase().includes('m') ? 1000000 : 
         criteria.minPrice.toLowerCase().includes('k') ? 1000 : 1);
    }
    if (criteria.maxPrice) {
      criteria.maxPrice = parseInt(criteria.maxPrice.replace(/[^0-9]/g, '')) * 
        (criteria.maxPrice.toLowerCase().includes('m') ? 1000000 : 
         criteria.maxPrice.toLowerCase().includes('k') ? 1000 : 1);
    }

    // Search for matching properties
    const matchingProperties = filterListings(criteria);

    // Update conversation flow based on message
    updateConversationFlow(text);

    // Generate bot response
    setTimeout(() => {
      const hasPropertyMatches = matchingProperties.length > 0;
      const isPropertyQuery = text.toLowerCase().match(/(?:property|house|condo|apartment|looking|buy|price|bedroom|location)/);
      
      // Get personalized AI response based on user message and role
      const aiResponse = getAIResponse(text, matchingProperties);

      // Add bot response message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse
      }]);

      // If property matches found, show them
      if (hasPropertyMatches && isPropertyQuery) {
        matchingProperties.forEach((property, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + index + 2,
              type: 'bot',
              ...formatPropertyCard(property)
            }]);
          }, 300 * (index + 1));
        });
      }

      setIsLoading(false);
      setShowSuggestions(true);
    }, 1000);
  };

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto max-w-[1400px] space-y-8">
          {/* AI Assistant Chat Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card bg-base-100 shadow-lg border border-base-200"
              >
                <div className="card-body p-0">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-base-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <RiRobot2Fill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">PropGuard AI Assistant</h2>
                      <p className="text-sm text-base-content/60">Your real estate protection guide</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 h-[400px] overflow-y-auto space-y-4">
                    {messages.map(message => (
                      <motion.div
                        key={message.id}
                        initial={{ x: message.type === 'user' ? 20 : -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                          ${message.type === 'user' ? 'bg-primary text-primary-content' : 'bg-base-300'}`}
                        >
                          {message.type === 'user' ? (
                            <RiUser3Fill className="w-5 h-5" />
                          ) : (
                            <RiRobot2Fill className="w-5 h-5" />
                          )}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                          {message.type === 'property' ? (
                            <div className="card bg-base-100 shadow-md w-64">
                              <figure className="relative h-32">
                                <img 
                                  src={message.content.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                                  alt={message.content.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <div className="badge badge-primary">{message.content.type || 'Property'}</div>
                                </div>
                              </figure>
                              <div className="card-body p-3">
                                <h3 className="font-bold text-sm line-clamp-2">{message.content.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-base-content/70">
                                  <RiMapPinLine className="w-3 h-3" />
                                  <span className="truncate">{message.content.location || 'Location not specified'}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="flex items-center">
                                      <RiHomeSmile2Line className="w-3 h-3 mr-1" />
                                      {message.content.beds || 0} Beds
                                    </div>
                                    <div className="text-primary font-semibold">
                                      {message.content.floor_area_sqm} sqm
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-sm">{message.content.formattedPrice}</div>
                                    {message.content.pricePerSqm && (
                                      <div className="text-xs text-base-content/60">{message.content.pricePerSqm}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className={`inline-block rounded-lg p-3 
                              ${message.type === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
                            >
                              {message.content}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-base-content/60">
                        <div className="loading loading-dots loading-sm"></div>
                        <span>PropGuard is thinking...</span>
                      </div>
                    )}

                    {/* Message Suggestions */}
                    {showSuggestions && getSuggestions().length > 0 && (
                      <div className="space-y-2 mt-6 pt-4 border-t border-base-200">
                        <p className="text-sm text-base-content/60 text-center font-medium">Quick options:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {getSuggestions().map((suggestion, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => handleSuggestionClick(suggestion.text)}
                              className="btn btn-sm btn-outline hover:btn-primary text-left justify-start transition-all duration-200"
                            >
                              <span className="mr-2">{suggestion.emoji}</span>
                              {suggestion.text}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-base-200">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="input input-bordered flex-1"
                      />
                      <button type="submit" className="btn btn-primary" disabled={!newMessage.trim() || isLoading}>
                        <RiSendPlaneFill className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="sticky top-4">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="grid gap-4">
                  {actions.map((action) => (
                    <motion.button
                      key={action.id}
                      initial={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`btn btn-${action.color} btn-outline justify-start gap-4 h-auto py-4 px-6 normal-case`}
                    >
                      <action.icon className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold">{action.title}</div>
                        <div className="text-sm opacity-80">{action.description}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default PropGuard;