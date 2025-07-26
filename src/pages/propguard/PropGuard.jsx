import React from 'react';
import { motion } from "framer-motion";
import { useState } from "react";
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
  RiFingerprint2Line
} from 'react-icons/ri';
import { useLocation } from 'react-router-dom';

function PropGuard() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm PropGuard AI Assistant. I'm here to help protect your real estate journey and provide guidance. How can I assist you today?"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

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
      title: "Document Verification",
      description: "Verify property documents and certificates",
      icon: RiFileShieldLine,
      color: "secondary"
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
      title: "Financing Help",
      description: "Get guidance on property financing",
      icon: RiMoneyDollarCircleLine,
      color: "success"
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: newMessage
    }]);

    // Simulate bot response (you can replace this with actual AI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm analyzing your request. Let me help you with that..."
      }]);
    }, 500);

    setNewMessage('');
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
                          <div className={`inline-block rounded-lg p-3 
                            ${message.type === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-base-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="input input-bordered flex-1"
                      />
                      <button type="submit" className="btn btn-primary">
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