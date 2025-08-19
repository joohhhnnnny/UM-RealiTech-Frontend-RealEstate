import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  RiMapPinLine,
  RiAddLine,
  RiUpload2Line,
  RiCloseLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiLoader4Line
} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';

// Memoized PropertyCard component
const PropertyCard = memo(({ property }) => {
  return (
    <div className="card bg-base-100 shadow-md w-64">
      <figure className="relative h-32">
        <img 
          src={property.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <div className="badge badge-primary">{property.type || 'Property'}</div>
        </div>
      </figure>
      <div className="card-body p-3">
        <h3 className="font-bold text-sm line-clamp-2">{property.title}</h3>
        <div className="flex items-center gap-1 text-xs text-base-content/70">
          <RiMapPinLine className="w-3 h-3" />
          <span className="truncate">{property.location || 'Location not specified'}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center">
              <RiHomeSmile2Line className="w-3 h-3 mr-1" />
              {property.beds || 0} Beds
            </div>
            <div className="text-primary font-semibold">
              {property.floor_area_sqm} sqm
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm">{property.formattedPrice}</div>
            {property.pricePerSqm && (
              <div className="text-xs text-base-content/60">{property.pricePerSqm}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

// Helper function to format text with bold styling
const formatTextWithBold = (text) => {
  if (!text) return text;
  
  // Split text by asterisks and process each part
  const parts = text.split(/(\*[^*]+\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is enclosed in asterisks
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      // Remove asterisks and make bold with black color
      const boldText = part.slice(1, -1);
      return <strong key={index} className="font-bold text-content">{boldText}</strong>;
    }
    // Return regular text, filter out standalone asterisks
    return part === '*' ? '' : part;
  }).filter(part => part !== ''); // Remove empty parts
};

// Helper function to format bot messages
const formatBotMessage = (content) => {
  if (!content) return content;
  
  // Split content into paragraphs and format them
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    const trimmedParagraph = paragraph.trim();
    
    // Handle bullet points
    if (trimmedParagraph.includes('•') || trimmedParagraph.includes('-')) {
      const lines = trimmedParagraph.split('\n');
      return (
        <div key={index} className="mb-3">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
              const lineText = trimmedLine.replace(/^[•\-]\s*/, '');
              return (
                <div key={lineIndex} className="flex items-start gap-2 mb-1">
                  <span className="text-primary mt-1">•</span>
                  <span className="flex-1">{formatTextWithBold(lineText)}</span>
                </div>
              );
            }
            return <div key={lineIndex} className="mb-2">{formatTextWithBold(trimmedLine)}</div>;
          })}
        </div>
      );
    }
    
    // Handle numbered lists
    if (/^\d+\./.test(trimmedParagraph)) {
      const lines = trimmedParagraph.split('\n');
      return (
        <div key={index} className="mb-3">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            const numberMatch = trimmedLine.match(/^(\d+\.)\s*(.*)/);
            if (numberMatch) {
              return (
                <div key={lineIndex} className="flex items-start gap-2 mb-2">
                  <span className="text-primary font-semibold min-w-[24px]">{numberMatch[1]}</span>
                  <span className="flex-1">{formatTextWithBold(numberMatch[2])}</span>
                </div>
              );
            }
            return <div key={lineIndex} className="mb-1">{formatTextWithBold(trimmedLine)}</div>;
          })}
        </div>
      );
    }
    
    // Regular paragraphs
    return (
      <div key={index} className="mb-3 leading-relaxed">
        {formatTextWithBold(trimmedParagraph)}
      </div>
    );
  });
};

// Memoized ChatMessage component
const ChatMessage = memo(({ message }) => {
  return (
    <motion.div
      key={message.id}
      initial={{ x: message.type === 'user' ? 20 : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${message.type === 'user' ? 'bg-primary text-primary-content' : 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary'}`}
      >
        {message.type === 'user' ? (
          <RiUser3Fill className="w-5 h-5" />
        ) : (
          <RiRobot2Fill className="w-5 h-5" />
        )}
      </div>
      <div className={`flex-1 max-w-[85%] ${message.type === 'user' ? 'text-right' : ''}`}>
        {message.type === 'property' ? (
          <PropertyCard property={message.content} />
        ) : (
          <div className={`rounded-lg p-4 shadow-sm border
            ${message.type === 'user' 
              ? 'bg-primary text-primary-content ml-auto inline-block max-w-[90%]' 
              : 'bg-base-100 border-base-200 w-full'
            }`}
          >
            {message.type === 'user' ? (
              <div className="text-sm leading-relaxed">{message.content}</div>
            ) : (
              <div className="text-sm">
                {formatBotMessage(message.content)}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

// Memoized SuggestionButtons component
const SuggestionButtons = memo(({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-base-200/50">
      <p className="text-sm text-base-content/70 text-center font-medium mb-4">
        💡 Try asking about:
      </p>
      <div className="grid grid-cols-1 gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={`${suggestion.text}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="btn btn-sm btn-ghost hover:btn-primary hover:text-primary-content text-left justify-start transition-all duration-200 rounded-lg border border-base-200 hover:border-primary hover:shadow-md"
          >
            <span className="text-lg mr-3">{suggestion.emoji}</span>
            <span className="text-sm font-medium">{suggestion.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

SuggestionButtons.displayName = 'SuggestionButtons';

// Memoized QuickActions component
const QuickActions = memo(({ actions, onActionClick }) => {
  return (
    <div className="sticky top-4">
      <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
      <div className="grid gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onActionClick(action)}
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
  );
});

QuickActions.displayName = 'QuickActions';

// Memoized DocumentModal component
const DocumentModal = memo(({ 
  showModal, 
  onClose, 
  documentType, 
  setDocumentType, 
  uploadedFile, 
  onFileUpload, 
  onScan, 
  isScanning, 
  scanResult 
}) => {
  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Upload Document</h3>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Document Type</label>
              <select
                className="select select-bordered w-full"
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
              >
                <option value="">Select document type</option>
                <option value="contract">Contract</option>
                <option value="deed">Title Deed</option>
                <option value="permit">Building Permit</option>
                <option value="certificate">Tax Certificate</option>
                <option value="id">ID Verification</option>
              </select>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {!uploadedFile ? (
                <>
                  <RiUpload2Line className="w-12 h-12 mx-auto mb-2 text-base-content/40" />
                  <label className="block">
                    <span className="btn btn-primary btn-sm">Choose File</span>
                    <input type="file" className="hidden" onChange={onFileUpload} />
                  </label>
                  <p className="text-sm text-base-content/60 mt-2">
                    Supported formats: PDF, JPG, PNG (max 10MB)
                  </p>
                </>
              ) : (
                <div>
                  <RiFileShieldLine className="w-12 h-12 mx-auto mb-2 text-success" />
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-base-content/60">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {scanResult && (
              <div className={`alert ${scanResult.status === 'success' ? 'alert-success' : 'alert-error'}`}>
                <div className="flex items-center gap-2">
                  {scanResult.status === 'success' ? (
                    <RiCheckDoubleLine className="w-5 h-5" />
                  ) : (
                    <RiErrorWarningLine className="w-5 h-5" />
                  )}
                  <span>{scanResult.message}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={onScan}
                disabled={!uploadedFile || !documentType || isScanning}
              >
                {isScanning ? (
                  <>
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <RiShieldCheckLine className="w-5 h-5" />
                    Scan Document
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

DocumentModal.displayName = 'DocumentModal';

function PropGuard() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [currentFlow, setCurrentFlow] = useState('greeting');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized actions configuration
  const actions = useMemo(() => [
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
  ], []);

  // Memoized system context function
  const getSystemContext = useCallback(() => {
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
  }, [userRole]);

  // Memoized suggestions based on current flow
  const suggestions = useMemo(() => {
  switch (currentFlow) {
    case 'greeting':
      return [
        { emoji: '🏠', text: "I'd like to find a property" },
        { emoji: '⚖️', text: 'What are my rights as a buyer?' },
        { emoji: '💳', text: 'How do payments work?' },
        { emoji: '💰', text: 'Help me with financing options' }
      ];
    case 'property_search':
      return [
        { emoji: '💵', text: 'Can you show me properties within my budget?' },
        { emoji: '📍', text: 'What are the available locations?' },
        { emoji: '🏗️', text: 'What’s the difference between house, condo, and apartment?' },
        { emoji: '🛏️', text: 'What bedroom options are available?' }
      ];
    case 'rights':
      return [
        { emoji: '🛡️', text: 'What laws protect property buyers?' },
        { emoji: '🤝', text: 'What should I know about contracts?' },
        { emoji: '🏗️', text: 'Are there standards for construction quality?' },
        { emoji: '⚖️', text: 'What legal steps can I take if issues arise?' }
      ];
    case 'payments':
      return [
        { emoji: '💳', text: 'What payment methods are accepted?' },
        { emoji: '📅', text: 'How does the payment schedule work?' },
        { emoji: '🏦', text: 'How do bank transfers work for property payments?' },
        { emoji: '📄', text: 'What documents are needed for payment?' }
      ];
    case 'financing':
      return [
        { emoji: '🏦', text: 'What loan options are available?' },
        { emoji: '📊', text: 'What interest rates should I expect?' },
        { emoji: '📋', text: 'Am I eligible for a home loan?' },
        { emoji: '💡', text: 'How can I increase my chances of getting approved?' }
      ];
    default:
      return [
        { emoji: '🏠', text: 'Can I search for properties here?' },
        { emoji: '⚖️', text: 'Can you tell me about buyer rights?' },
        { emoji: '💳', text: 'How does the payment process work?' },
        { emoji: '💰', text: 'Can I get help with financing?' }
      ];
  }
}, [currentFlow]);

  // Stable callback functions
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const handleScan = useCallback(async () => {
    if (!uploadedFile || !documentType) return;
    
    setIsScanning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setScanResult({
        status: 'success',
        message: 'Document validated successfully',
        details: {
          type: documentType,
          filename: uploadedFile.name,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      setScanResult({
        status: 'error',
        message: 'Error validating document',
        error: error.message
      });
    } finally {
      setIsScanning(false);
    }
  }, [uploadedFile, documentType]);

  const handleCloseModal = useCallback(() => {
    setShowDocumentModal(false);
    setUploadedFile(null);
    setDocumentType('');
    setScanResult(null);
  }, []);

  const handleActionClick = useCallback((action) => {
    if (action.id === 2) {
      setShowDocumentModal(true);
    }
  }, []);

  // Memoized API functions
  const getGeminiResponse = useCallback(async (userMessage) => {
    try {
      const systemContext = getSystemContext();
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error:', error);
      return handleFallbackResponse(userMessage);
    }
  }, [getSystemContext]);

  const handleFallbackResponse = useCallback((userMessage) => {
    let fallbackMessage = "I apologize, but I'm not able to assist with that. Can you please provide more details or ask something else?";
    
    if (userMessage.toLowerCase().includes('property')) {
      fallbackMessage = "I can help you search for properties, verify listings, or provide market insights. What specific information are you looking for?";
    } else if (userMessage.toLowerCase().includes('document')) {
      fallbackMessage = "I can assist with document verification, submissions, and legal requirements. What type of documents do you need help with?";
    } else if (userMessage.toLowerCase().includes('finance') || userMessage.toLowerCase().includes('payment')) {
      fallbackMessage = "I can guide you through financing options, payment processes, and budget planning. What would you like to know more about?";
    }
    
    return fallbackMessage;
  }, []);

  // Memoized filter function
  const filterListings = useCallback((criteria) => {
    if (!Object.values(criteria).some(v => v)) {
      return listingsData.slice(0, 5);
    }

    return listingsData.filter(listing => {
      if (!listing.title || !listing.location || (!listing.price && listing.price !== 0)) {
        return false;
      }

      const priceNum = parseInt(listing.price.replace(/[^0-9]/g, ''));
      
      if (criteria.minPrice && priceNum < criteria.minPrice) return false;
      if (criteria.maxPrice && priceNum > criteria.maxPrice) return false;
      
      if (criteria.location) {
        const locationTerms = criteria.location.toLowerCase().split(/\s+/);
        const listingLocation = listing.location.toLowerCase();
        if (!locationTerms.some(term => listingLocation.includes(term))) {
          return false;
        }
      }
      
      if (criteria.beds) {
        const listingBeds = parseInt(listing.beds) || 0;
        const criteriBeds = parseInt(criteria.beds);
        if (listingBeds !== criteriBeds) return false;
      }
      
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
  }, []);

  const formatPropertyCard = useCallback((listing) => {
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
  }, []);

  const updateConversationFlow = useCallback((message) => {
    const text = message.toLowerCase();
    
    if (text.includes('find') || text.includes('search') || text.includes('looking') || 
        text.includes('property') || text.includes('house') || text.includes('condo')) {
      setCurrentFlow('property_search');
    }
    else if (text.includes('right') || text.includes('law') || text.includes('legal') || 
             text.includes('protection') || text.includes('standard')) {
      setCurrentFlow('rights');
    }
    else if (text.includes('payment') || text.includes('pay') || text.includes('transaction') || 
             text.includes('transfer') || text.includes('process')) {
      setCurrentFlow('payments');
    }
    else if (text.includes('finance') || text.includes('loan') || text.includes('mortgage') || 
             text.includes('interest') || text.includes('bank')) {
      setCurrentFlow('financing');
    }
    else if (text.includes('back') || text.includes('start') || text.includes('hello')) {
      setCurrentFlow('greeting');
    }
  }, []);

  const getAIResponse = useCallback(async (userMessage, matchingProperties = []) => {
    const aiResponse = await getGeminiResponse(userMessage);

    const isPropertyQuery = currentFlow === 'property_search' && 
      userMessage.toLowerCase().match(/(?:budget.*range|location.*interested|prefer.*(?:house|condo|apartment)|how.*many.*bedrooms)/);

    if (isPropertyQuery && matchingProperties.length > 0) {
      return `${aiResponse}\n\nI found ${matchingProperties.length} properties that match your criteria. Here are some suggestions that might interest you:`;
    }

    return aiResponse;
  }, [getGeminiResponse, currentFlow]);

  const handleSuggestionClick = useCallback((text) => {
    handleSendMessage(text);
  }, []);

  const initializeChat = useCallback(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: userRole === 'agent' || userRole === 'developer'
        ? `Welcome to PropGuard ${userRole === 'developer' ? 'Developer' : 'Agent'} Dashboard! 🏢\n\nI'm here to help you with:\n• Client inquiry management\n• Application processing\n• Market insights and analytics\n• Property verification tools\n\nWhat would you like to work on today?`
        : "Hi there! 👋 I'm PropGuard Assistant, your AI-powered real estate companion.\n\nI can help you with:\n• Property search and recommendations\n• Fraud detection and verification\n• Real estate guidance and market insights\n• Document verification and legal compliance\n• Budget planning and financing options\n\nHow can I assist you today?"
    };
    setMessages([welcomeMessage]);
    setCurrentFlow('greeting');
    setShowSuggestions(true);
  }, [userRole]);

  const handleSendMessage = useCallback(async (messageText = null) => {
    const text = messageText || newMessage;
    if (!text.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: text
    }]);
    setNewMessage('');
    setShowSuggestions(false);
    setIsLoading(true);

    // Extract property search criteria
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

    const matchingProperties = filterListings(criteria);
    updateConversationFlow(text);

    try {
      const aiResponse = await getAIResponse(text, matchingProperties);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse
      }]);

      const isPropertyQuery = currentFlow === 'property_search' && 
        text.toLowerCase().match(/(?:budget.*range|location.*interested|prefer.*(?:house|condo|apartment)|how.*many.*bedrooms)/);

      if (matchingProperties.length > 0 && isPropertyQuery) {
        matchingProperties.slice(0, 5).forEach((property, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + index + 2,
              type: 'property',
              content: formatPropertyCard(property).content
            }]);
          }, 300 * (index + 1));
        });
      }

      setIsLoading(false);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I encountered an error. Please try again or ask a different question."
      }]);
      setIsLoading(false);
      setShowSuggestions(true);
    }
  }, [newMessage, currentFlow, filterListings, updateConversationFlow, getAIResponse, formatPropertyCard]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4 text-base-content"
      >
        <div className="container mx-auto max-w-[1400px] space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card bg-base-100 shadow-lg border border-base-200"
              >
                <div className="card-body p-0">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-base-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <RiRobot2Fill className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">PropGuard AI Assistant</h2>
                        <p className="text-sm text-base-content/60">Your real estate protection guide</p>
                      </div>
                    </div>
                    <button 
                      onClick={initializeChat}
                      className="btn btn-ghost btn-sm btn-circle tooltip tooltip-left"
                      data-tip="Start New Chat"
                    >
                      <RiAddLine className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-6 h-[500px] overflow-y-auto space-y-6 bg-gradient-to-b from-base-50 to-base-100">
                    {messages.map(message => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="flex items-center gap-3 text-base-content/60 py-4">
                        <div className="loading loading-dots loading-md text-primary"></div>
                        <span className="text-sm font-medium">PropGuard is thinking...</span>
                      </div>
                    )}

                    {/* Message Suggestions */}
                    {showSuggestions && (
                      <SuggestionButtons 
                        suggestions={suggestions} 
                        onSuggestionClick={handleSuggestionClick} 
                      />
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-base-200 bg-base-50">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask me anything about real estate..."
                        className="input input-bordered flex-1 focus:border-primary focus:outline-none transition-colors duration-200"
                        disabled={isLoading}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary hover:btn-primary-focus disabled:btn-disabled transition-all duration-200" 
                        disabled={!newMessage.trim() || isLoading}
                      >
                        {isLoading ? (
                          <RiLoader4Line className="w-5 h-5 animate-spin" />
                        ) : (
                          <RiSendPlaneFill className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <QuickActions actions={actions} onActionClick={handleActionClick} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Document Upload Modal */}
      <DocumentModal
        showModal={showDocumentModal}
        onClose={handleCloseModal}
        documentType={documentType}
        setDocumentType={setDocumentType}
        uploadedFile={uploadedFile}
        onFileUpload={handleFileUpload}
        onScan={handleScan}
        isScanning={isScanning}
        scanResult={scanResult}
      />
    </DashboardLayout>
  );
}

export default PropGuard;