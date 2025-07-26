import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  UserIcon,
  XMarkIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';
import { FaRobot, FaUser } from 'react-icons/fa';
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLocation } from 'react-router-dom';

const ChatBot = () => {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  
  // Determine chat mode based on user role
  const chatMode = (userRole === 'agent' || userRole === 'developer') ? 'agent' : 'client';
  
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentFlow, setCurrentFlow] = useState('greeting');
  const [userType, setUserType] = useState(null); // 'buying', 'selling', 'exploring'
  const [budget, setBudget] = useState('');
  const [showPresets, setShowPresets] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
    initializeChat();
  }, [userRole]); // Changed dependency from chatMode to userRole

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

  // Preset messages for quick interactions
  const getPresetMessages = () => {
    if (chatMode === 'agent') {
      // Different presets for agents vs developers
      if (userRole === 'developer') {
        return [
          { emoji: '🏗️', text: 'Project Management' },
          { emoji: '�', text: 'Sales Analytics' },
          { emoji: '🏠', text: 'Property Inventory' },
          { emoji: '📋', text: 'Buyer Applications' },
          { emoji: '💼', text: 'Partner Management' }
        ];
      } else {
        return [
          { emoji: '�👥', text: 'View Client Dashboard' },
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

    // Get response from Gemini API
    try {
      await getGeminiResponse(text);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to static response if API fails
      setTimeout(() => {
        handleFallbackResponse(text);
      }, 1000);
    }
  };

  const getGeminiResponse = async (userMessage) => {
    try {
      const systemContext = getSystemContext();
      const conversationHistory = messages.slice(-5).map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.message}`
      ).join('\n');

      const prompt = `${systemContext}

Previous conversation:
${conversationHistory}

User: ${userMessage}

Please provide a helpful, specific response based on your role as ${chatMode === 'agent' ? (userRole === 'developer' ? 'Developer Assistant' : 'Agent Assistant') : 'PropGuard Assistant'}. Keep responses concise but informative, and ask follow-up questions when appropriate.`;

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

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setShowPresets(true);
      setIsLoading(false);

      // Update flow based on user message
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
    let botResponse = '';
    let newFlow = currentFlow;

    if (chatMode === 'agent') {
      // Agent/Developer mode responses
      if (userRole === 'developer') {
        // Developer-specific responses
        if (userMessage.toLowerCase().includes('project management')) {
          botResponse = "Developer Project Overview:\n\n🏗️ Active Projects: 3\n📋 Total Units: 245\n💰 Sales Progress: 78%\n🏠 Available Units: 54\n📅 Next Milestone: Foundation Complete\n\nWhich project would you like to focus on?";
        } else if (userMessage.toLowerCase().includes('sales analytics')) {
          botResponse = "Sales Analytics Dashboard:\n\n📈 Monthly Sales: ₱45M\n🎯 Target Achievement: 85%\n🏠 Units Sold This Month: 12\n👥 Active Leads: 28\n💰 Average Unit Price: ₱3.8M\n\nWould you like detailed analytics for a specific project?";
        } else if (userMessage.toLowerCase().includes('property inventory')) {
          botResponse = "Property Inventory Status:\n\n🏠 Studio Units: 15 available\n🏡 1BR Units: 22 available\n🏢 2BR Units: 12 available\n🏘️ 3BR Units: 5 available\n💰 Price Range: ₱2.5M - ₱8.2M\n\nWhich unit type interests you?";
        } else {
          botResponse = "As your PropGuard Developer Assistant, I can help you with:\n\n🏗️ Project Management\n📊 Sales Analytics\n🏠 Property Inventory\n📋 Buyer Applications\n💼 Partner Management\n\nWhat would you like to focus on?";
        }
      } else {
        // Agent-specific responses
        if (userMessage.toLowerCase().includes('client dashboard')) {
          botResponse = "Here's your client dashboard overview:\n\n📊 Active Clients: 15\n🏠 Properties Listed: 8\n💰 Pending Transactions: 3\n📋 New Inquiries: 5\n\nWould you like to view details for any specific area?";
        } else if (userMessage.toLowerCase().includes('market analysis')) {
          botResponse = "Current Market Analysis:\n\n📈 Average Price Increase: 8.5% YoY\n🏙️ Hot Areas: BGC, Makati, Ortigas\n🏠 Most Demanded: 2-3BR Condos\n💰 Price Range: ₱4M - ₱12M\n\nWould you like detailed analytics for a specific area?";
        } else if (userMessage.toLowerCase().includes('property verification')) {
          botResponse = "Property Verification Services:\n\n✅ Title Authentication\n🔍 Fraud Detection Scan\n📋 Document Validation\n🏢 Developer Background Check\n💼 Legal Compliance Review\n\nWhich verification service do you need?";
        } else {
          botResponse = "As your PropGuard Agent Assistant, I can help you with:\n\n👥 Client Management\n📊 Market Analytics\n🔍 Property Verification\n📋 Application Processing\n💼 Lead Generation\n\nWhat would you like to focus on?";
        }
      }
    } else {
      // Client mode responses
      if (userMessage.toLowerCase().includes('buy') || userMessage.toLowerCase().includes('buying')) {
        botResponse = "Great! I'll help you find the perfect property. Let me gather some information:\n\n💰 What's your budget range?\n📍 Which area are you interested in?\n🏠 Property type preference?\n👨‍👩‍👧‍👦 Family size?\n\nThis will help me recommend suitable options for you.";
        newFlow = 'buying';
        setUserType('buying');
      } else if (userMessage.toLowerCase().includes('sell') || userMessage.toLowerCase().includes('selling')) {
        botResponse = "I'll help you sell your property effectively! Let me assist you with:\n\n🏠 Property valuation\n📸 Professional listing\n📋 Document preparation\n🔍 Market positioning\n💰 Price optimization\n\nTell me about your property - location, type, and size?";
        newFlow = 'selling';
        setUserType('selling');
      } else if (userMessage.toLowerCase().includes('exploring') || userMessage.toLowerCase().includes('explore')) {
        botResponse = "Perfect! I'll help you explore the real estate market. Here's what I can show you:\n\n📊 Current market trends\n🏙️ Popular locations\n💰 Price ranges by area\n📈 Investment opportunities\n💡 Market insights\n\nWhat specific information interests you most?";
        newFlow = 'exploring';
        setUserType('exploring');
      } else if (userMessage.toLowerCase().includes('fraud') || userMessage.toLowerCase().includes('verify')) {
        botResponse = "PropGuard Fraud Detection Services:\n\n🛡️ Property Listing Verification\n👤 Seller Identity Check\n📋 Document Authentication\n💰 Price Analysis\n🔍 Title History Review\n\nPlease provide the property details or listing link for verification.";
      } else if (userMessage.toLowerCase().includes('budget')) {
        botResponse = "Let's set your budget range. Please select or specify:\n\n💰 Under ₱2M - Affordable options\n💰 ₱2M - ₱5M - Mid-range properties\n💰 ₱5M - ₱10M - Premium selection\n💰 ₱10M+ - Luxury properties\n\nOr tell me your specific budget range?";
      } else {
        botResponse = "I understand you're interested in real estate. I'm here to help with:\n\n🏠 Property buying guidance\n💰 Selling assistance\n🔍 Market exploration\n🛡️ Fraud protection\n📋 Document verification\n\nHow can I assist you today?";
      }
    }

    const botMessage = {
      id: Date.now() + 1,
      sender: 'bot',
      message: botResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setCurrentFlow(newFlow);
    setShowPresets(true);
    setIsLoading(false);
  };

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-gradient-to-r from-blue-500/90 to-blue-600 shadow-lg overflow-hidden backdrop-blur-xl mb-6"
          >
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FaRobot className="w-8 h-8 text-primary-content" />
                  <div>
                    <h1 className="text-2xl font-bold text-primary-content">PropGuard ChatBot</h1>
                    <p className="text-primary-content/90">
                      AI-powered real estate assistant
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-xl border border-base-200"
          >
            <div className="card-body p-6">
              {/* Chat Messages Area */}
              <div className="space-y-4 min-h-[500px] max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-base-50">
                {messages.length === 0 ? (
                  <div className="text-center text-base-content/60 mt-16">
                    <FaRobot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Welcome to PropGuard Assistant</p>
                    <p className="text-sm mt-2">Start a conversation to get help with your real estate needs</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`chat ${msg.sender === 'user' ? 'chat-end' : 'chat-start'}`}>
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          {msg.sender === 'user' ? (
                            <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center">
                              <UserIcon className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="bg-gray-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                              <FaRobot className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent bg-gray-100 text-gray-800'}`}>
                        <div className="whitespace-pre-line">{msg.message}</div>
                      </div>
                      <div className="chat-footer opacity-50 text-xs">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <div className="bg-gray-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                          <FaRobot className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <div className="chat-bubble bg-gray-100 text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="loading loading-dots loading-sm"></div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Preset Messages */}
                {messages.length > 0 && showPresets && getPresetMessages().length > 0 && (
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
              
              {/* Message Input */}
              <div className="flex gap-3 mt-6">
                <input 
                  type="text" 
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..." 
                  className="input input-bordered flex-1 focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="btn btn-primary px-6"
                  disabled={!currentMessage.trim()}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ChatBot;
