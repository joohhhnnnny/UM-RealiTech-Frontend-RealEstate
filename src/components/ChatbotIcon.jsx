import React, { useState, useEffect } from 'react';
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
import listingsData from '../json/listings.json';

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

  // Calculate chat window position based on button position
  const getChatWindowPosition = () => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const chatWidth = 384; // 96 * 4 (w-96)
    const chatHeight = 500;
    
    // Default position (bottom-right)
    let bottom = 100;
    let right = 32;
    
    // If button has been dragged, calculate relative position
    if (buttonPosition.x !== 0 || buttonPosition.y !== 0) {
      // Position chat window near the button but ensure it stays on screen
      const buttonCenterX = buttonPosition.x;
      const buttonCenterY = buttonPosition.y;
      
      // Try to position chat to the left of button first
      right = Math.max(16, windowWidth - buttonCenterX + 40);
      if (right + chatWidth > windowWidth) {
        // If not enough space on the right, try left
        right = Math.max(16, windowWidth - (buttonCenterX - chatWidth - 40));
      }
      
      // Position vertically
      bottom = Math.max(16, windowHeight - buttonCenterY - chatHeight / 2);
      if (bottom + chatHeight > windowHeight) {
        bottom = Math.max(16, windowHeight - chatHeight - 16);
      }
    }
    
    return { bottom, right };
  };

  const chatPosition = getChatWindowPosition();

  // Get system context based on user role and chat mode
  const getSystemContext = () => {
    if (chatMode === 'agent') {
      if (userRole === 'developer') {
        return `You are PropGuard Developer Assistant, an AI assistant for real estate developers. You help with project management, sales analytics, property inventory, buyer applications, and partner management. You have access to:
        - Active Projects: 3 projects with 245 total units, 78% sales progress, 54 available units
        - Monthly Sales: ₱45M with 85% target achievement
        - Unit inventory: Studio (15), 1BR (22), 2BR (12), 3BR (5 units available)
        - Price range: ₱2.5M - ₱8.2M
        Respond professionally and provide specific data when relevant.`;
      } else {
        return `You are PropGuard Agent Assistant, an AI assistant for real estate agents. You help with client management, market analytics, property verification, application processing, and lead generation. You have access to:
        - Active Clients: 15 clients
        - Properties Listed: 8 properties
        - Pending Transactions: 3 transactions
        - New Inquiries: 5 inquiries
        - Market data: 8.5% YoY price increase, hot areas include BGC, Makati, Ortigas
        - Most demanded: 2-3BR Condos, Price range: ₱4M - ₱12M
        Respond professionally and provide market insights when relevant.`;
      }
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

  // Initialize chat when component mounts
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [userRole, isOpen]);

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      sender: 'bot',
      message: chatMode === 'client' 
        ? "Hi! I'm PropGuard Assistant. I'm here to help you with property inquiries, fraud detection, and real estate guidance. How can I assist you today?"
        : `Welcome to PropGuard Agent Dashboard! I can help you manage client inquiries, process applications, and provide market insights. Hello ${userRole === 'developer' ? 'Developer' : 'Agent'}! What would you like to work on?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setCurrentFlow('greeting');
    setUserType(null);
    setBudget('');
    setShowPresets(true);
  };

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
      
      // Flexible bed matching - convert to numbers for comparison
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

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || currentMessage;
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
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
        minPrice: userMessage.match(/(?:under|less than|maximum|max|below|within|budget) (?:₱|P)?(\d+(?:[,.]\d+)?[MmKk]?)/i)?.[1],
        maxPrice: userMessage.match(/(?:over|more than|minimum|min|above|at least|starting|from) (?:₱|P)?(\d+(?:[,.]\d+)?[MmKk]?)/i)?.[1],
        location: userMessage.match(/(?:in|at|near|around|within|close to) ([^,.]+?)(?:,|\.|$)/i)?.[1] || 
                 userMessage.match(/(?:show|find|looking|searching).*(?:in|at) ([^,.]+?)(?:,|\.|$)/i)?.[1],
        beds: userMessage.match(/(\d+)(?:\s*(?:bedroom|bed|br|bhk))/i)?.[1],
        propertyType: userMessage.match(/(?:looking for|want|need|show|find) (?:a |an )?([^,.]+?)(?:,|\.|$)/i)?.[1] ||
                     userMessage.match(/(?:house|condo|apartment|property|lot)/i)?.[0]
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

      // Search for matching properties if criteria found
      let matchingProperties = [];
      if (Object.values(criteria).some(v => v)) {
        matchingProperties = filterListings(criteria).slice(0, 3);
      }

      const prompt = `${systemContext}

Previous conversation:
${conversationHistory}

Available Properties: ${matchingProperties.length} properties match the search criteria.

User: ${userMessage}

Please provide a helpful response based on your role as ${chatMode === 'agent' ? (userRole === 'developer' ? 'Developer Assistant' : 'Agent Assistant') : 'PropGuard Assistant'}. If the user is asking about properties, suggest relevant ones from the matching properties. Keep responses concise but informative.`;

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
        id: Date.now() + 1,
        sender: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // If there are matching properties and the message suggests property interest, send them as separate messages
      const isPropertyQuery = userMessage.toLowerCase().match(/(?:property|house|condo|apartment|looking|buy|price|bedroom|location)/);
      if (matchingProperties.length > 0 && isPropertyQuery) {
        // Add a small delay before showing properties
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send property suggestions
        for (const property of matchingProperties) {
          const propertyMessage = {
            id: Date.now() + matchingProperties.indexOf(property) + 2,
            sender: 'bot',
            type: 'property',
            content: formatPropertyCard(property).content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, propertyMessage]);
          // Add small delay between property cards
          await new Promise(resolve => setTimeout(resolve, 300));
        }
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
    let fallbackMessage = "I apologize, but I'm not able to assist with that. Can you please provide more details or ask something else?";

    // Customize fallback responses based on user message
    if (userMessage.toLowerCase().includes('property')) {
      fallbackMessage = "I can help you with property inquiries, such as buying, selling, or checking property details. What do you need assistance with?";
    } else if (userMessage.toLowerCase().includes('fraud')) {
      fallbackMessage = "For fraud-related concerns, I can assist with property verification and fraud detection. Please provide the property details you want to check.";
    } else if (userMessage.toLowerCase().includes('document')) {
      fallbackMessage = "I can help you with document verification and provide information on required documents for property transactions. Which document do you need help with?";
    } else if (userMessage.toLowerCase().includes('budget')) {
      fallbackMessage = "To assist you with budget planning, I need to know your preferred price range and the type of property you are interested in. Can you provide more details?";
    } else if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('assist')) {
      fallbackMessage = "I'm here to help! You can ask me about property details, fraud detection, document verification, and more. What do you need assistance with?";
    }

    // Send fallback response as a bot message
    const fallbackBotMessage = {
      id: Date.now() + 1,
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
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed w-96 bg-base-100 rounded-lg shadow-xl z-40 border border-base-200 text-base-content"
            style={{
              bottom: `${chatPosition.bottom}px`,
              right: `${chatPosition.right}px`,
            }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-base-200 bg-primary rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaRobot className="w-6 h-6 text-primary-content" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-content">PropGuard Assistant</h3>
                    <p className="text-sm text-primary-content/80">AI-powered real estate assistant</p>
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
            <div className="h-[300px] overflow-y-auto p-4 bg-base-100">
              {messages.length === 0 ? (
                <div className="text-center text-base-content/60 mt-16">
                  <FaRobot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Welcome to PropGuard Assistant</p>
                  <p className="text-sm mt-2">Start a conversation to get help with your real estate needs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
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
                          <div className="card bg-base-100 shadow-md w-64">
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
                          <div className="whitespace-pre-line">{msg.message}</div>
                        )}
                      </div>
                      <div className="chat-footer opacity-50 text-xs">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="chat chat-start">
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
                    <div className="space-y-2 mt-6 pt-4 border-t border-base-200">
                      <p className="text-sm text-base-content/60 text-center font-medium">Quick options:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {getPresetMessages().map((preset, index) => (
                          <motion.button
                            key={index}
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
            <div className="p-4 border-t border-base-200">
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
          top: -window.innerHeight + 150,
          left: -window.innerWidth + 150,
          right: window.innerWidth - 150,
          bottom: window.innerHeight - 150,
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
          className="btn btn-primary btn-circle btn-lg shadow-lg transition-all duration-200 hover:shadow-xl relative"
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
            <XMarkIcon className="w-6 h-6 pointer-events-none" />
          ) : (
            <>
              <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 pointer-events-none" />
              <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse pointer-events-none">
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