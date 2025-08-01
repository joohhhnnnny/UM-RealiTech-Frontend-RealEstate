import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SuccessNotification = ({ isVisible, onClose, userNumber, userName, isLogin = false }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Notification Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 300,
                duration: 0.4 
              }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-green-200 dark:border-green-700 max-w-md w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  {isLogin ? 'Welcome Back!' : 'Welcome to RealiTech!'}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90"
                >
                  {isLogin ? 'Successfully signed in' : 'Account created successfully'}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {isLogin ? (
                      <>Welcome back, <span className="font-semibold text-gray-800 dark:text-gray-100">{userName}</span>! 
                      You have successfully signed in to your account.</>
                    ) : (
                      <>Hi <span className="font-semibold text-gray-800 dark:text-gray-100">{userName}</span>! 
                      Your account has been created successfully.</>
                    )}
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Your User ID:</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="text-lg font-mono font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded">
                        {userNumber}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(userNumber);
                          // Optional: Show a small "Copied!" feedback
                        }}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Continue to Dashboard
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessNotification;