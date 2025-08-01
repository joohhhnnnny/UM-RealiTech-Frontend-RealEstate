import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsModal = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 300,
                duration: 0.4 
              }}
              className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-400 p-6 text-center relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4"
                >
                  <DocumentTextIcon className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Terms and Conditions
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90"
                >
                  Please read these terms carefully before using RealiTech
                </motion.p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-base-100">
                <div className="max-w-none">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-base-content">RealiTech Terms and Conditions</h3>
                    <p className="text-sm text-base-content/60">Effective Date: August 1, 2025</p>
                  </div>

                  <div className="space-y-6 text-base-content/80">
                    <div className="bg-base-200 p-4 rounded-lg">
                      <p className="text-base">
                        Welcome to RealiTech. These Terms and Conditions ("Terms") govern your access to and use of our platform, mobile applications, websites, and services ("Services"). By accessing or using RealiTech, you agree to be bound by these Terms.
                      </p>
                    </div>

                    {/* Section 1 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">1. Acceptance of Terms</h4>
                      <p>By accessing or using RealiTech, you confirm that you have read, understood, and agree to comply with these Terms. If you do not agree with any part of these Terms, please do not use the Service.</p>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">2. Eligibility</h4>
                      <p>You must be at least 18 years old and have the legal capacity to enter into a binding agreement. If you are using RealiTech on behalf of a company or organization, you represent and warrant that you are authorized to do so.</p>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">3. Our Services</h4>
                      <p>RealiTech provides tools and services that may include but are not limited to:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Property listing and discovery</li>
                        <li>Chatbot assistant for buyers</li>
                        <li>Post-sale tracking and updates</li>
                        <li>Loan calculators and financial tools</li>
                        <li>Developer and agent matching</li>
                        <li>Educational content for real estate buyers</li>
                      </ul>
                      <p className="mt-2">We reserve the right to modify or discontinue parts of the Service at any time without notice.</p>
                    </div>

                    {/* Section 4 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">4. User Responsibilities</h4>
                      <p>As a user, you agree:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>To provide accurate and up-to-date information.</li>
                        <li>Not to use the Service for any unlawful or fraudulent activities.</li>
                        <li>Not to upload, post, or transmit any harmful or misleading content.</li>
                        <li>To respect the intellectual property rights of RealiTech and third parties.</li>
                      </ul>
                    </div>

                    {/* Section 5 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">5. User Accounts</h4>
                      <p>Some features may require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    </div>

                    {/* Section 6 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">6. Intellectual Property</h4>
                      <p>All content and technology used in or associated with RealiTech—including but not limited to logos, software, branding, and designs—are owned by or licensed to RealiTech and are protected by copyright, trademark, and other laws.</p>
                      <p className="mt-2">You may not copy, modify, distribute, or reverse-engineer any part of the platform without our written consent.</p>
                    </div>

                    {/* Section 7 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">7. Data Privacy</h4>
                      <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your data.</p>
                    </div>

                    {/* Section 8 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">8. Third-Party Services</h4>
                      <p>RealiTech may contain links to or integrate with third-party services. We are not responsible for the content, accuracy, or practices of third-party websites or services.</p>
                    </div>

                    {/* Section 9 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">9. Limitations of Liability</h4>
                      <p>To the maximum extent permitted by law, RealiTech shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of or inability to use the Services.</p>
                    </div>

                    {/* Section 10 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">10. Disclaimer</h4>
                      <p>All content and services provided through RealiTech are for informational purposes only. We do not guarantee the accuracy, completeness, or usefulness of any property listings, financial calculations, or chatbot responses.</p>
                    </div>

                    {/* Section 11 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">11. Termination</h4>
                      <p>We may suspend or terminate your access to the Services at any time if you violate these Terms or for any other reason at our sole discretion. Upon termination, your right to use the Services will immediately cease.</p>
                    </div>

                    {/* Section 12 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">12. Modifications to Terms</h4>
                      <p>We reserve the right to update or change these Terms at any time. We will notify you of any significant changes, and continued use of the Services after such changes constitutes your acceptance of the new Terms.</p>
                    </div>

                    {/* Section 13 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">13. Governing Law</h4>
                      <p>These Terms shall be governed by and interpreted in accordance with the laws of the Republic of the Philippines, without regard to conflict of law principles.</p>
                    </div>

                    {/* Section 14 */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-base-content mb-2">14. Contact Us</h4>
                      <p>For questions or concerns regarding these Terms, you may contact us at:</p>
                      <div className="mt-2 space-y-1">
                        <p>📧 Email: hello@realitech.com</p>
                        <p>📍 Address: Mc Arthur Ave, Davao City, Philippines</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-base-300 p-6 bg-base-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full btn btn-primary font-semibold text-lg shadow-lg"
                >
                  I Have Read and Understood
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;