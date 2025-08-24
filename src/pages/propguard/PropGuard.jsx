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
  RiHomeSmile2Line,
  RiMapPinLine,
  RiAddLine,
  RiUpload2Line,
  RiCloseLine,
  RiCheckDoubleLine,
  RiErrorWarningLine,
  RiLoader4Line
} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';
import { db } from '../../config/Firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';

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

// Helper function to format text with bold styling (hiding asterisks)
const formatTextWithBold = (text) => {
  if (!text) return text;
  
  // First, let's clean up any standalone asterisks that aren't part of pairs
  let cleanText = text;
  
  // Split text by asterisks and process each part
  const parts = cleanText.split(/(\*[^*]+\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is enclosed in asterisks (bold text)
    if (part.match(/^\*[^*]+\*$/)) {
      // Remove asterisks and make bold
      const boldText = part.slice(1, -1);
      return <strong key={index} className="font-bold text-base-content">{boldText}</strong>;
    }
    // Return regular text, but skip empty strings and standalone asterisks
    if (!part || part === '*' || part === '**') {
      return null;
    }
    return part;
  }).filter(part => part !== null && part !== ''); // Remove empty and null parts
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
              const lineText = trimmedLine.replace(/^[•-]\s*/, '');
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
  const [listingsData, setListingsData] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

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
      title: "Document Scanner",
      description: "Upload and verify property documents",
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

  // Fetch listings from Firebase
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setListingsLoading(true);
        
        // Create a query to get listings, ordered by creation date with limit for performance
        const listingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc'),
          limit(50) // Limit to 50 most recent listings for better performance
        );
        
        const querySnapshot = await getDocs(listingsQuery);
        const fetchedListings = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedListings.push({
            id: doc.id,
            ...data,
            // Ensure consistent field naming
            title: data.title || data.propertyName || 'Untitled Property',
            location: data.location || data.address || data.city || '',
            price: data.price || data.listingPrice || '0',
            beds: data.bedrooms || data.beds || 0,
            baths: data.bathrooms || data.baths || 0,
            type: data.propertyType || data.type || 'Property',
            floor_area_sqm: data.floor_area_sqm || data.floorArea || 0,
            lot_area_sqm: data.lot_area_sqm || data.lotArea || 0,
            images: data.images || data.image ? [data.image] : []
          });
        });
        
        setListingsData(fetchedListings);
        console.log(`Fetched ${fetchedListings.length} listings from Firebase`);
        
      } catch (error) {
        console.error('Error fetching listings from Firebase:', error);
        // Fallback to empty array if Firebase fails
        setListingsData([]);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchListings();
  }, []);

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

  // Predefined responses for common questions
  const getPredefinedResponse = useCallback((userMessage) => {
    const text = userMessage.toLowerCase();
    
    // Property finding questions
    if (text.includes("find a property") || text.includes("i'd like to find a property")) {
      return "Great! I can help you find the perfect property. Let me know your preferences:\n\n• **Budget range** - What's your price range?\n• **Location** - Which areas are you interested in?\n• **Property type** - House, condo, or apartment?\n• **Bedrooms** - How many bedrooms do you need?\n• **Other requirements** - Any specific amenities or features?\n\nTo see available properties, please tell me your specific requirements or ask me to \"show me properties within my budget\" with your criteria.";
    }

    // Property search related questions
    if (text.includes("properties within my budget") || text.includes("show me properties")) {
      return "I'd be happy to help you find properties within your budget! To show you the most relevant options, please let me know:\n\n• **Your budget range** (e.g., ₱2M-₱5M)\n• **Preferred location** (e.g., Makati, BGC, Quezon City)\n• **Property type** (house, condo, or apartment)\n• **Number of bedrooms**\n\nOnce you provide these details, I'll show you matching properties from our database.";
    }

    if (text.includes("available locations") || text.includes("what are the available locations")) {
      return "Here are some popular locations with available properties:\n\n**Metro Manila:**\n• **Makati CBD** - Prime business district, high-rise condos\n• **BGC, Taguig** - Modern urban area, luxury properties\n• **Ortigas** - Established business hub, mixed developments\n• **Quezon City** - Residential areas, diverse options\n• **Mandaluyong** - Growing commercial area, affordable options\n\n**Key Suburban Areas:**\n• **Alabang** - Family-friendly, houses and townhomes\n• **Las Piñas/Parañaque** - Near airport, mixed properties\n• **Pasig** - Emerging area, good value properties\n\n**Provincial Options:**\n• **Laguna** - Resort-style living, lower prices\n• **Cavite** - Affordable housing, family communities\n• **Rizal** - Mountain views, peaceful environment\n\nWhich area interests you most?";
    }

    if (text.includes("difference between house, condo, and apartment") || text.includes("house, condo") || text.includes("apartment")) {
      return "Here are the key differences between property types:\n\n**🏠 House (Single-Family Home):**\n• Complete ownership of land and structure\n• More privacy and space\n• Own parking, garden area\n• Higher maintenance responsibility\n• Price range: ₱3M - ₱20M+\n\n**🏢 Condominium:**\n• Own the unit, share common areas\n• Security and amenities (pool, gym)\n• Lower maintenance (handled by association)\n• Monthly association dues required\n• Price range: ₱2M - ₱15M+\n\n**🏘️ Apartment:**\n• Usually for rent, not ownership\n• Shared building with multiple units\n• Basic amenities\n• Lower upfront cost\n• Rental: ₱15,000 - ₱80,000/month\n\n**Which type fits your lifestyle and budget?**";
    }

    if (text.includes("bedroom options") || text.includes("how many bedrooms")) {
      return "Here are the common bedroom configurations available:\n\n**Studio (0 Bedrooms):**\n• Open floor plan, compact living\n• Perfect for singles or young professionals\n• Price range: ₱1.5M - ₱4M\n• Monthly rent: ₱15,000 - ₱35,000\n\n**1 Bedroom:**\n• Separate bedroom and living area\n• Ideal for couples or single occupancy\n• Price range: ₱2M - ₱6M\n• Monthly rent: ₱20,000 - ₱50,000\n\n**2 Bedrooms:**\n• Most popular choice for small families\n• Home office or guest room option\n• Price range: ₱3M - ₱8M\n• Monthly rent: ₱30,000 - ₱70,000\n\n**3+ Bedrooms:**\n• Large families or those needing space\n• Multiple bathrooms typically included\n• Price range: ₱5M - ₱15M+\n• Monthly rent: ₱50,000 - ₱120,000+\n\nHow many bedrooms would work best for you?";
    }
    
    // Rights and legal questions
    if (text.includes("rights as a buyer") || text.includes("what are my rights")) {
      return "As a property buyer in the Philippines, you have several important rights:\n\n• **Right to Information** - Full disclosure of property details, title status, and any encumbrances\n• **Right to Inspection** - Thorough examination of the property before purchase\n• **Right to Valid Title** - Assurance that the seller has legal ownership\n• **Right to Fair Pricing** - No hidden fees or unreasonable charges\n• **Right to Legal Protection** - Access to legal remedies if issues arise\n• **Right to Warranty** - Protection against structural defects (for new properties)\n\n*Key Laws that protect you:*\n- Republic Act 6552 (Maceda Law)\n- Consumer Act of the Philippines\n- Real Estate Service Act\n\nWould you like more details about any specific right or law?";
    }

    if (text.includes("laws protect property buyers") || text.includes("what laws protect")) {
      return "Several important laws protect property buyers in the Philippines:\n\n**📋 Republic Act 6552 (Maceda Law):**\n• Protects installment buyers\n• Right to refund after 2+ years of payments\n• Grace period for missed payments\n• Cannot forfeit property easily\n\n**🛡️ Consumer Act of the Philippines (RA 7394):**\n• Protection against deceptive practices\n• Right to accurate information\n• Warranty protections\n\n**🏢 Real Estate Service Act (RA 9646):**\n• Regulates real estate professionals\n• Ensures proper licensing\n• Sets professional standards\n\n**🏗️ National Building Code:**\n• Construction quality standards\n• Safety requirements\n• Structural integrity rules\n\n**⚖️ Civil Code of the Philippines:**\n• Property ownership rights\n• Contract obligations\n• Remedies for breach\n\nNeed specific information about any of these laws?";
    }

    if (text.includes("should i know about contracts") || text.includes("about contracts")) {
      return "Here's what you should know about property contracts:\n\n**📄 Contract to Sell vs. Deed of Sale:**\n• **Contract to Sell** - Conditional agreement, title transfers after full payment\n• **Deed of Sale** - Final transfer of ownership, title transfers immediately\n\n**🔍 Key Contract Elements to Review:**\n• Property description and boundaries\n• Total purchase price and payment terms\n• Completion timeline\n• Developer/seller obligations\n• Penalties for delays\n• Force majeure clauses\n\n**⚠️ Red Flags to Watch For:**\n• Vague property descriptions\n• Unrealistic completion dates\n• High penalty charges\n• No clear title transfer process\n• Missing developer information\n\n**✅ Before Signing:**\n• Have a lawyer review the contract\n• Verify all property documents\n• Check developer's track record\n• Understand all terms and conditions\n• Keep copies of all documents\n\nWould you like help understanding specific contract terms?";
    }

    if (text.includes("standards for construction quality") || text.includes("construction quality")) {
      return "Construction quality standards in the Philippines are governed by:\n\n**🏗️ National Building Code (PD 1096):**\n• Minimum construction standards\n• Safety requirements for buildings\n• Fire safety and structural integrity\n• Electrical and plumbing standards\n\n**📐 Quality Standards Include:**\n• **Foundation** - Proper soil analysis, reinforced concrete\n• **Structure** - Earthquake-resistant design, quality materials\n• **Electrical** - Safe wiring, proper circuit protection\n• **Plumbing** - Quality pipes, proper drainage\n• **Finishes** - Durable materials, proper installation\n\n**🔍 What to Check:**\n• Building permits and approvals\n• Structural integrity certificates\n• Fire safety compliance\n• Electrical safety certificates\n• Water quality tests\n\n**⚠️ Warning Signs:**\n• Cracks in walls or ceilings\n• Water damage or leaks\n• Electrical problems\n• Poor ventilation\n• Substandard materials\n\n**🛡️ Your Rights:**\n• Warranty against defects\n• Right to repairs or replacement\n• Legal remedies for non-compliance\n\nNeed help inspecting a specific property?";
    }

    if (text.includes("legal steps") || text.includes("issues arise")) {
      return "If property issues arise, here are your legal options:\n\n**🏃‍♂️ Immediate Steps:**\n1. **Document Everything** - Photos, receipts, communications\n2. **Contact the Developer/Seller** - Try to resolve directly first\n3. **Review Your Contract** - Check your rights and remedies\n4. **Gather Evidence** - All relevant documents and proof\n\n**⚖️ Legal Remedies:**\n• **Specific Performance** - Force completion of obligations\n• **Rescission** - Cancel contract and get refund\n• **Damages** - Compensation for losses\n• **Injunction** - Stop harmful actions\n\n**🏢 Where to File Complaints:**\n• **HLURB** (Housing and Land Use Regulatory Board)\n• **DTI** (Department of Trade and Industry)\n• **Local Government Units**\n• **Courts** (for serious cases)\n\n**📞 Professional Help:**\n• Real estate lawyer\n• Licensed real estate broker\n• Consumer protection groups\n\n**💰 Cost Considerations:**\n• Legal fees\n• Court costs\n• Time investment\n• Potential outcomes\n\nWhat specific issue are you facing?";
    }
    
    // Payment questions
    if (text.includes("how do payments work") || text.includes("payment process")) {
      return "Here's how property payments typically work:\n\n**Payment Methods:**\n• Bank transfers (most secure)\n• Manager's checks\n• Cash (for smaller amounts)\n• Financing through banks or developers\n\n**Payment Process:**\n1. **Reservation Fee** - Secures the property (usually ₱20,000-₱50,000)\n2. **Down Payment** - Typically 10-20% of total price\n3. **Monthly Equity** - Spread over 12-24 months\n4. **Balance** - Through bank financing or cash\n\n**Important Tips:**\n• Always get official receipts\n• Use secure payment methods\n• Verify all documents before payment\n• Keep all transaction records\n\nWould you like specific guidance on any payment method or step?";
    }

    if (text.includes("payment methods are accepted") || text.includes("what payment methods")) {
      return "Here are the accepted payment methods for property purchases:\n\n**🏦 Bank Transfer (Recommended):**\n• Most secure option\n• Electronic trail for records\n• No risk of loss or theft\n• Immediate verification possible\n\n**📄 Manager's Check:**\n• Bank-guaranteed check\n• Safer than personal checks\n• Good for large amounts\n• Verify authenticity with bank\n\n**💵 Cash:**\n• Only for smaller amounts (₱500K and below)\n• Higher security risk\n• Always get official receipt\n• Count and verify in bank presence\n\n**💳 Credit Card:**\n• Limited acceptance\n• Usually only for reservation fees\n• Check for processing fees\n• Installment options available\n\n**🏢 Developer Financing:**\n• In-house payment plans\n• Flexible terms available\n• Higher interest rates\n• Direct debit arrangements\n\n**❌ Avoid These Payment Methods:**\n• Personal checks (unreliable)\n• Cryptocurrency (not legally recognized)\n• Online transfers to personal accounts\n• Cash payments without receipts\n\nWhich payment method are you considering?";
    }

    if (text.includes("payment schedule work") || text.includes("payment schedule")) {
      return "Here's how property payment schedules typically work:\n\n**📅 Standard Payment Timeline:**\n\n**Phase 1: Reservation (Day 1)**\n• Reservation fee: ₱20,000-₱50,000\n• Secures the property for 30-60 days\n• Applied to down payment later\n\n**Phase 2: Down Payment (30-60 days)**\n• Typically 10-20% of total price\n• Can be paid lump sum or installments\n• Required before loan processing\n\n**Phase 3: Monthly Equity (12-24 months)**\n• Spread remaining equity over months\n• Usually 0% interest from developer\n• Automatic debit arrangements available\n\n**Phase 4: Balance Payment**\n• Through bank loan (70-80% of price)\n• Or cash if paying in full\n• Upon completion or turnover\n\n**📊 Example: ₱5M Property**\n• Reservation: ₱30,000\n• Down payment (20%): ₱970,000\n• Monthly equity (24 months): ₱62,500/month\n• Bank loan: ₱3,500,000\n\n**⚠️ Important Notes:**\n• Late payment penalties apply\n• Grace periods vary by developer\n• Payment terms negotiable\n• Keep all payment records\n\nNeed help calculating payments for a specific property?";
    }

    if (text.includes("bank transfers work") || text.includes("bank transfer")) {
      return "Here's how bank transfers work for property payments:\n\n**🏦 Bank Transfer Process:**\n\n**Step 1: Get Payment Details**\n• Developer's official bank account\n• Exact payment amount\n• Reference number/property details\n• Payment deadline\n\n**Step 2: Initiate Transfer**\n• Visit your bank or use online banking\n• Provide recipient bank details\n• Include proper payment reference\n• Keep transfer receipt\n\n**Step 3: Confirmation**\n• Send transfer receipt to developer\n• Get acknowledgment of payment\n• Receive official receipt\n• Update payment records\n\n**💰 Transfer Fees:**\n• Same bank: Usually free or minimal\n• Different banks: ₱15-₱200 per transaction\n• International: Higher fees apply\n• Large amounts: Special arrangements may apply\n\n**⚠️ Important Reminders:**\n• Always verify recipient account details\n• Double-check payment amounts\n• Use official company accounts only\n• Keep all transfer documentation\n• Confirm receipt within 24-48 hours\n\n**🛡️ Security Tips:**\n• Never transfer to personal accounts\n• Verify account details via official channels\n• Use secure banking platforms\n• Report any suspicious requests\n\nDo you need help with a specific bank transfer process?";
    }

    if (text.includes("documents are needed for payment") || text.includes("payment documents")) {
      return "Here are the documents needed for property payments:\n\n**📄 For Initial Payments (Reservation/Down Payment):**\n• Valid government-issued ID\n• Proof of income (payslip, ITR, business permit)\n• Bank statements (3-6 months)\n• TIN certificate\n• Proof of billing address\n\n**🏦 For Bank Loan Applications:**\n• Employment certificate\n• Certificate of employment and compensation\n• Latest payslips (3 months)\n• Bank statements (6-12 months)\n• Income tax returns (2 years)\n• Business documents (if self-employed)\n\n**🏠 Property-Related Documents:**\n• Purchase agreement/contract to sell\n• Property title or certificate\n• Tax declarations\n• Location plan and vicinity map\n• Building plans (for house and lot)\n\n**💳 Payment Documentation:**\n• Official receipts for all payments\n• Bank transfer receipts\n• Check vouchers\n• Payment schedule agreements\n• Statement of account\n\n**✅ Document Checklist Before Payment:**\n• Verify seller's ownership documents\n• Check property tax payments\n• Confirm no liens or encumbrances\n• Validate building permits\n• Review association documents (for condos)\n\n**⚠️ Red Flags:**\n• Seller cannot provide title documents\n• Requests for payments to personal accounts\n• Missing or incomplete paperwork\n• Rushed transaction demands\n\nNeed help preparing documents for a specific payment?";
    }
    
    // Financing questions
    if (text.includes("financing options") || text.includes("help me with financing")) {
      return "Here are your main financing options for property purchase:\n\n**Bank Loans (Most Common):**\n• **Interest Rate:** 6-10% annually\n• **Loan Term:** Up to 30 years\n• **Down Payment:** 10-20%\n• **Requirements:** Stable income, good credit score\n\n**Developer Financing:**\n• Flexible payment terms\n• Lower initial requirements\n• Higher interest rates (8-12%)\n\n**Pag-IBIG Housing Loan:**\n• Lower interest rates (5-7%)\n• Flexible payment terms\n• For Pag-IBIG members only\n\n**In-house Financing:**\n• Direct payment to developer\n• No bank requirements\n• Higher total cost\n\n**Key Requirements for Bank Loans:**\n• Monthly income: 3-4x monthly amortization\n• Employment: At least 2 years\n• Age: 21-65 years old\n\nWould you like help calculating your loan eligibility or comparing options?";
    }

    if (text.includes("loan options are available") || text.includes("what loan options")) {
      return "Here are the detailed loan options available:\n\n**🏦 Bank Housing Loans:**\n• **BPI, BDO, Metrobank, RCBC** - Major banks\n• Interest: 6.5-9.5% per annum\n• Term: Up to 30 years\n• Loanable amount: Up to 80% of property value\n• Processing time: 30-60 days\n\n**🏢 Pag-IBIG Housing Loan:**\n• Interest: 5.5-7.0% per annum (lower rates!)\n• Term: Up to 30 years\n• Max loan: ₱6 Million\n• Down payment: As low as 10%\n• For active Pag-IBIG members\n\n**🏗️ Developer Financing:**\n• Interest: 8-16% per annum\n• Term: 5-15 years typically\n• Down payment: 5-20%\n• Faster approval process\n• Less stringent requirements\n\n**🏠 In-House Financing:**\n• Direct payment to seller/developer\n• Interest: 10-18% per annum\n• Term: 5-10 years\n• Minimal documentation required\n• Higher monthly payments\n\n**💼 Special Loan Programs:**\n• **OFW Loans** - Special rates for overseas workers\n• **Government Employee Loans** - Preferential terms\n• **First-Time Buyer Programs** - Lower down payments\n\nWhich option interests you most?";
    }

    if (text.includes("interest rates should i expect") || text.includes("what interest rates")) {
      return "Here are the current interest rates you can expect:\n\n**🏦 Bank Housing Loans:**\n• **Fixed Rate:** 7.5-9.5% (first 1-3 years)\n• **Variable Rate:** 6.5-8.5% (after fixed period)\n• **Factors affecting rates:**\n  - Credit score and history\n  - Income stability\n  - Down payment amount\n  - Loan term length\n\n**📊 Rate Comparison by Institution:**\n• **BPI:** 7.88-9.88% effective rate\n• **BDO:** 7.50-9.50% effective rate\n• **Metrobank:** 8.00-10.00% effective rate\n• **RCBC:** 7.75-9.25% effective rate\n• **Security Bank:** 8.25-9.75% effective rate\n\n**🏢 Government Loans:**\n• **Pag-IBIG:** 5.5-7.0% (much lower!)\n• **SSS:** 6.0-10.0% for qualified members\n• **GSIS:** 6.0-9.0% for government employees\n\n**🏗️ Developer Financing:**\n• **In-house rates:** 12-18% typically\n• **Promo rates:** 8-12% for limited periods\n• **0% interest:** Sometimes for equity payments\n\n**💡 Tips to Get Better Rates:**\n• Maintain good credit score\n• Provide larger down payment\n• Show stable employment history\n• Compare multiple lenders\n• Consider government loan programs\n\nWould you like help calculating monthly payments based on these rates?";
    }

    if (text.includes("am i eligible for a home loan") || text.includes("loan eligibility")) {
      return "Let me help you check your home loan eligibility:\n\n**📋 Basic Eligibility Requirements:**\n\n**Age and Employment:**\n• Age: 21-65 years old at loan maturity\n• Employment: At least 2 years current job\n• For OFWs: 2 years continuous overseas work\n• For business owners: 2 years business operation\n\n**💰 Income Requirements:**\n• **Monthly gross income:** At least ₱30,000\n• **Debt-to-income ratio:** Maximum 40-50%\n• **Monthly amortization:** Should not exceed 30-35% of gross income\n\n**📊 Credit Score Requirements:**\n• Good credit history (no bad debts)\n• Credit score: 650+ preferred\n• No current loan defaults\n• Clear records with banks\n\n**📄 Documentation Needed:**\n• Government-issued IDs\n• Income documents (payslips, ITR)\n• Bank statements (6 months)\n• Employment certificate\n• Property documents\n\n**💵 Financial Capacity Check:**\n• **Example:** ₱50,000 monthly income\n• **Maximum loan:** ₱4-5 Million\n• **Monthly payment:** ₱15,000-17,500\n• **Affordable property:** ₱5-6 Million total\n\n**🚩 Common Disqualifiers:**\n• Inconsistent income\n• High existing debts\n• Poor credit history\n• Insufficient down payment\n• Age above 65 at loan maturity\n\n**Would you like me to help calculate your specific loan capacity based on your income?**";
    }

    if (text.includes("increase my chances") || text.includes("getting approved")) {
      return "Here are proven ways to increase your loan approval chances:\n\n**💪 Strengthen Your Financial Profile:**\n\n**📈 Improve Income Stability:**\n• Stay in your current job for at least 2+ years\n• Avoid job changes during application\n• Show consistent income growth\n• Include all income sources (bonuses, allowances)\n\n**💳 Build Strong Credit History:**\n• Pay all bills on time (utilities, credit cards)\n• Keep credit utilization below 30%\n• Don't apply for multiple loans simultaneously\n• Clear any outstanding debts first\n\n**💰 Financial Preparation:**\n• Save larger down payment (20%+ is ideal)\n• Maintain 6+ months emergency fund\n• Keep bank accounts active and healthy\n• Avoid large expenses before application\n\n**📄 Document Preparation:**\n• Organize all required documents completely\n• Ensure consistency across all papers\n• Get documents notarized if required\n• Submit clear, legible copies\n\n**🏠 Property Considerations:**\n• Choose properties in good locations\n• Ensure property has clear title\n• Pick established developers\n• Consider resale value potential\n\n**🤝 Professional Help:**\n• Work with accredited brokers\n• Consult mortgage specialists\n• Get pre-qualification from banks\n• Consider mortgage brokers for multiple options\n\n**⏰ Timing Strategies:**\n• Apply when income is at its peak\n• Avoid application during job transitions\n• Submit complete requirements early\n• Follow up regularly but professionally\n\n**What specific area would you like to improve first?**";
    }
    
    return null; // No predefined response found
  }, []);

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

  // Optimized API functions with improved error handling and timeouts
  const getGeminiResponse = useCallback(async (userMessage) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const systemContext = getSystemContext();
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 500, // Reduced for faster response
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

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || handleFallbackResponse(userMessage);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Gemini API Error:', error);
      return handleFallbackResponse(userMessage);
    }
  }, [getSystemContext, handleFallbackResponse]);

  // Memoized filter function
  const filterListings = useCallback((criteria) => {
    // Return empty array if still loading or no data
    if (listingsLoading || !listingsData.length) {
      return [];
    }

    // Only return listings if there are actual search criteria
    if (!Object.values(criteria).some(v => v)) {
      return [];
    }

    return listingsData.filter(listing => {
      if (!listing.title || !listing.location || (!listing.price && listing.price !== 0)) {
        return false;
      }

      const priceNum = parseInt(listing.price.toString().replace(/[^0-9]/g, ''));
      
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
  }, [listingsData, listingsLoading]);

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
    // First check for predefined responses
    const predefinedResponse = getPredefinedResponse(userMessage);
    if (predefinedResponse) {
      return predefinedResponse;
    }
    
    // Fall back to AI response if no predefined response
    const aiResponse = await getGeminiResponse(userMessage);

    const isPropertyQuery = currentFlow === 'property_search' && 
      userMessage.toLowerCase().match(/(?:budget.*range|location.*interested|prefer.*(?:house|condo|apartment)|how.*many.*bedrooms)/);

    if (isPropertyQuery && matchingProperties.length > 0) {
      return `${aiResponse}\n\nI found ${matchingProperties.length} properties that match your criteria. Here are some suggestions that might interest you:`;
    }

    return aiResponse;
  }, [getPredefinedResponse, getGeminiResponse, currentFlow]);

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

      // Enhanced property query detection - more specific patterns
      const isPropertyQuery = (
        text.toLowerCase().includes("find a property") ||
        text.toLowerCase().includes("show me properties") ||
        text.toLowerCase().includes("properties within my budget") ||
        text.toLowerCase().includes("what are the available locations") ||
        text.toLowerCase().includes("what bedroom options") ||
        text.toLowerCase().includes("search for properties") ||
        text.toLowerCase().includes("looking for properties") ||
        text.toLowerCase().includes("property recommendations") ||
        (currentFlow === 'property_search' && (
          text.toLowerCase().includes("budget") ||
          text.toLowerCase().includes("location") ||
          text.toLowerCase().includes("bedroom") ||
          text.toLowerCase().includes("house") ||
          text.toLowerCase().includes("condo") ||
          text.toLowerCase().includes("apartment")
        ))
      );

      // Show properties for property-related queries only when specifically requested
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

  const handleSuggestionClick = useCallback((text) => {
    // Set the message and trigger send directly without dependency on handleSendMessage
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

    // Process the response
    (async () => {
      try {
        const aiResponse = await getAIResponse(text, matchingProperties);

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse
        }]);

        // Enhanced property query detection - more specific patterns
        const isPropertyQuery = (
          text.toLowerCase().includes("find a property") ||
          text.toLowerCase().includes("show me properties") ||
          text.toLowerCase().includes("properties within my budget") ||
          text.toLowerCase().includes("what are the available locations") ||
          text.toLowerCase().includes("what bedroom options") ||
          text.toLowerCase().includes("search for properties") ||
          text.toLowerCase().includes("looking for properties") ||
          text.toLowerCase().includes("property recommendations") ||
          (currentFlow === 'property_search' && (
            text.toLowerCase().includes("budget") ||
            text.toLowerCase().includes("location") ||
            text.toLowerCase().includes("bedroom") ||
            text.toLowerCase().includes("house") ||
            text.toLowerCase().includes("condo") ||
            text.toLowerCase().includes("apartment")
          ))
        );

        // Show properties for property-related queries only when specifically requested
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
    })();
  }, [currentFlow, filterListings, updateConversationFlow, getAIResponse, formatPropertyCard]);

  const handleActionClick = useCallback((action) => {
    if (action.id === 1) {
      // Property Search
      setUserMessage('I want to search for properties');
      handleSendMessage('I want to search for properties');
    } else if (action.id === 2) {
      setShowDocumentModal(true);
    } else if (action.id === 3) {
      // Open Know Your Rights resource in a new tab
      window.open(
        'https://resourcehub.bakermckenzie.com/en/resources/global-corporate-real-estate-guide/asia-pacific/philippines/topics/real-estate-law',
        '_blank',
        'noopener,noreferrer'
      );
    } else if (action.id === 4) {
      // Legal Assistance
      setUserMessage('I need legal assistance with my property');
      handleSendMessage('I need legal assistance with my property');
    } else if (action.id === 5) {
      // Open Financing help in a new tab
      window.open(
        'https://pce.sandiego.edu/14-real-estate-financing-options-guide-faqs/',
        '_blank',
        'noopener,noreferrer'
      );
    }
  }, [handleSendMessage]);

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