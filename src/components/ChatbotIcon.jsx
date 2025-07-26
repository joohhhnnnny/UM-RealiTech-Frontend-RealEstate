import { motion, AnimatePresence } from "framer-motion";
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

function ChatbotIcon() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-24 right-8 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                    >
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-primary rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">RealiTech Support</h3>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="btn btn-primary rounded-full p-1"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>


                        {/* Chat Messages */}
                        <div className="h-80 overflow-y-auto p-4 bg-gray-50">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                                        <p className="text-sm text-gray-800">
                                            Hello! How can I help you today?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-200 ">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary transition-colors"
                                />
                                <button className="btn btn-primary px-4 py-2 rounded-full transition-colors">
                                    Send
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 right-8 z-50"
            >
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative group"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                    {!isOpen && (
                        <>
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                1
                            </span>
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                Chat with us!
                            </span>
                        </>
                    )}
                </button>
            </motion.div>

        </>
    );
}

export default ChatbotIcon;