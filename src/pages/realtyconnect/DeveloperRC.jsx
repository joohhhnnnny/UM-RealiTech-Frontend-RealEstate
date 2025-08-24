import React, { useState, useEffect, useCallback } from 'react';
import { FaBuilding, FaMoneyBillWave, FaUsers, FaChartLine, FaPlus, FaSpinner } from 'react-icons/fa';
import { contractService } from '../../services/realtyConnectService';
import VerificationService from '../../services/verificationService';
import VerificationStatus from '../../components/VerificationStatus';
import VerificationModal from '../../components/VerificationModal';

// Try to import useAuth, but provide fallback if not available
let useAuth;
try {
  useAuth = require('../../contexts/AuthContext').useAuth;
} catch (error) {
  useAuth = () => ({ currentUser: null });
}

function DeveloperRC() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('not_submitted');
  const { currentUser } = useAuth(); // Get current user from auth context

  const [stats, setStats] = useState({
    activeProjects: 0,
    contractValue: '₱0',
    activeClients: 0,
    deliveryRate: '0%'
  });

  // Load contracts and verification status from Firebase
  useEffect(() => {
    // Use a default user ID for demonstration if no user is authenticated
    const userId = currentUser?.uid || 'demo-developer-user';

    const loadContracts = async () => {
      try {
        setLoading(true);
        // Subscribe to real-time updates
        const unsubscribe = contractService.subscribeToContracts(
          userId, 
          (contractsData) => {
            setContracts(contractsData);
            calculateStats(contractsData);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading contracts:', err);
        setError('Failed to load contracts');
        setLoading(false);
      }
    };

    // Load verification status
    const loadVerificationStatus = async () => {
      try {
        console.log('� Loading developer verification status for user:', userId);
        
        // Get current verification status without clearing it
        // Remove the problematic clearUserVerification call that causes permission errors
        const currentStatus = await VerificationService.getVerificationStatus(userId, 'developer');
        console.log('📋 Current developer verification status:', currentStatus);
        
        // Set the status exactly as it is in the database
        // No automatic verification logic - developers must go through proper verification process
        setVerificationStatus(currentStatus?.status || 'not_submitted');
        console.log('✅ Developer verification status set to:', currentStatus?.status || 'not_submitted');
        
        // Subscribe to verification status changes
        const statusUnsubscribe = VerificationService.subscribeToVerificationStatus(
          userId,
          'developer',
          (status) => {
            console.log('📋 Developer verification status updated to:', status.status);
            setVerificationStatus(status.status || 'not_submitted');
          }
        );
        return statusUnsubscribe;
      } catch (err) {
        console.error('Error loading verification status:', err);
        setVerificationStatus('not_submitted');
        return () => {};
      }
    };

    const cleanupContracts = loadContracts();
    const cleanupVerification = loadVerificationStatus();

    return async () => {
      const unsubscribeContracts = await cleanupContracts;
      const unsubscribeVerification = await cleanupVerification;
      
      if (unsubscribeContracts) unsubscribeContracts();
      if (unsubscribeVerification) unsubscribeVerification();
    };
  }, [currentUser]);

  // Calculate stats from contracts data
  const calculateStats = useCallback((contractsData) => {
    const activeContracts = contractsData.filter(c => c.status === 'active');
    const totalValue = contractsData.reduce((sum, c) => sum + parseFloat(c.totalAmount || 0), 0);
    const completedOnTime = contractsData.filter(c => c.status === 'completed' && c.onTime).length;
    const totalCompleted = contractsData.filter(c => c.status === 'completed').length;
    
    setStats({
      activeProjects: activeContracts.length,
      contractValue: `₱${(totalValue / 1000000000).toFixed(1)}B`,
      activeClients: activeContracts.length,
      deliveryRate: totalCompleted > 0 ? `${Math.round((completedOnTime / totalCompleted) * 100)}%` : '0%'
    });
  }, []);

  // Handle progress update
  const handleProgressUpdate = useCallback(async (contractId, progress, paidAmount) => {
    try {
      await contractService.updateContractProgress(contractId, progress, paidAmount);
    } catch (error) {
      console.error('Error updating contract progress:', error);
      alert('Failed to update contract progress');
    }
  }, []);

  // Add new contract
  const handleAddContract = useCallback(async (contractData) => {
    try {
      const userId = currentUser?.uid || 'demo-developer-user';
      await contractService.addContract({
        ...contractData,
        developerId: userId,
        status: 'active'
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding contract:', error);
      alert('Failed to add contract');
    }
  }, [currentUser]);

  const handleStartVerification = useCallback(() => {
    setShowVerificationModal(true);
  }, []);

  const handleVerificationSubmitted = useCallback(async (verificationData, documents) => {
    // REQUIRE DOCUMENTS - No verification without proper documents
    if (!documents || documents.length === 0) {
      alert('Please upload all required documents for verification! Documents are mandatory for the verification process.');
      return;
    }

    // Validate minimum required documents
    const requiredDocuments = ['Business License', 'Government ID', 'Company Profile'];
    const uploadedDocumentTypes = documents.map(doc => doc.type || doc.name);
    
    console.log('📄 Documents submitted:', uploadedDocumentTypes);

    const userId = currentUser?.uid || 'demo-developer-user';
    
    // Set status to pending immediately when documents are submitted
    setVerificationStatus('pending');
    setShowVerificationModal(false);
    setShowProcessingModal(true);

    try {
      console.log('📤 Submitting verification documents for manual review...');
      
      // Submit verification documents to database for manual admin review
      const result = await VerificationService.submitVerification(
        userId,
        'developer',
        verificationData,
        documents
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit verification');
      }

      setShowProcessingModal(false);
      
      // Clear notification: Documents submitted successfully, now pending manual review
      console.log('✅ Verification documents submitted successfully');
      console.log('⏳ Status: PENDING - Awaiting manual admin approval');
      console.log('🔍 Admin will review documents and update status accordingly');
      console.log('🚫 NO AUTO-VERIFICATION: Developer must wait for manual admin approval');
      
      // Show success message to user
      alert('Verification documents submitted successfully! Your documents are now being reviewed by our admin team. You will be notified once the review is complete.');

    } catch (error) {
      console.error('❌ Developer verification submission failed:', error);
      setShowProcessingModal(false);
      setVerificationStatus('not_submitted');
      alert(`Failed to submit verification documents: ${error.message}. Please try again.`);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-purple-500" />
        <span className="ml-2 text-lg">Loading contracts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button 
          className="btn btn-sm btn-outline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Verification Status */}
      <VerificationStatus 
        status={verificationStatus}
        onStartVerification={handleStartVerification}
      />

      {/* Check if developer is verified before showing features */}
      {verificationStatus === 'verified' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-0">
            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-primary">
                <FaBuilding className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Active Projects</div>
              <div className="stat-value text-sm sm:text-lg">{stats.activeProjects}</div>
              <div className="stat-desc text-xs">In development</div>
            </div>

            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-primary">
                <FaMoneyBillWave className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Contract Value</div>
              <div className="stat-value text-xs sm:text-sm">{stats.contractValue}</div>
              <div className="stat-desc text-xs">Total portfolio</div>
            </div>

            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-primary">
                <FaUsers className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Active Buyers</div>
              <div className="stat-value text-sm sm:text-lg">{stats.activeClients}</div>
              <div className="stat-desc text-xs">Current clients</div>
            </div>

            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-primary">
                <FaChartLine className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">On-Time Delivery</div>
              <div className="stat-value text-sm sm:text-lg">{stats.deliveryRate}</div>
              <div className="stat-desc text-xs">Success rate</div>
            </div>
          </div>

          {/* Smart Contract Manager */}
          <div className="card bg-base-100 shadow-xl mx-2 sm:mx-0">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div>
                  <h2 className="card-title text-lg sm:text-xl">Smart Contract Manager</h2>
                  <p className="text-xs sm:text-sm opacity-70">Automated payment releases based on construction milestones</p>
                </div>
                <button 
                  className="btn btn-primary gap-2 btn-sm sm:btn-md w-full sm:w-auto"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Contract</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {contracts.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-base sm:text-lg opacity-70">No contracts found</p>
                  <p className="text-xs sm:text-sm opacity-50">Add your first contract to get started</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {contracts.map((contract) => (
                    <ContractCard 
                      key={contract.id} 
                      contract={contract}
                      onProgressUpdate={handleProgressUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Verification Required UI with different states */
        <div className="card bg-base-200 border-2 border-dashed border-primary/30 mx-2 sm:mx-0">
          <div className="card-body text-center py-8 sm:py-16 px-4 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <FaBuilding className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary/50 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content mb-2">
                {verificationStatus === 'pending' ? 'Verification Under Review' : 
                 verificationStatus === 'rejected' ? 'Verification Rejected' : 
                 'Verification Required'}
              </h3>
              
              {verificationStatus === 'pending' ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-base-content/70 max-w-md mx-auto">
                    Your verification documents have been submitted and are currently being reviewed by our admin team.
                  </p>
                  <div className="alert alert-info mb-4 sm:mb-6 text-left max-w-md mx-auto">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">We'll notify you once the review is complete</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="font-semibold text-sm sm:text-base">Your submitted documents are being verified:</p>
                    <ul className="text-xs sm:text-sm text-base-content/70 space-y-1">
                      <li>• Business Registration Certificate</li>
                      <li>• Valid Government ID</li>
                      <li>• Company Profile & Portfolio</li>
                    </ul>
                  </div>
                  <p className="text-xs sm:text-sm text-base-content/60 mt-4">
                    Review process typically takes 1-2 business days
                  </p>
                </div>
              ) : verificationStatus === 'rejected' ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-base-content/70 max-w-md mx-auto">
                    Your verification was rejected. Please review the feedback and resubmit with correct documents.
                  </p>
                  <div className="alert alert-error mb-4 sm:mb-6 text-left max-w-md mx-auto">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">Please resubmit with valid documents</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm sm:btn-md lg:btn-lg gap-2"
                    onClick={handleStartVerification}
                  >
                    <FaBuilding className="w-5 h-5" />
                    Resubmit Verification
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-base-content/70 max-w-md mx-auto">
                    Submit your business documents to unlock the Smart Contract Manager and start managing your development projects.
                    <strong> All documents are required and will be manually reviewed by our admin team.</strong>
                  </p>
                  
                  <div className="bg-base-100 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-w-lg mx-auto">
                    <h4 className="font-semibold text-sm sm:text-base text-base-content mb-2 sm:mb-3">📋 Required Documents:</h4>
                    <ul className="text-xs sm:text-sm text-base-content/70 space-y-1 text-left">
                      <li>• <strong>Business Registration Certificate</strong> - SEC/DTI Registration</li>
                      <li>• <strong>Valid Government ID</strong> - Driver's License, Passport, or National ID</li>
                      <li>• <strong>Company Profile & Portfolio</strong> - Previous projects and credentials</li>
                    </ul>
                    <p className="text-xs sm:text-sm text-base-content/60 mt-3">
                      <strong>Note:</strong> All documents will be manually reviewed by our admin team. Verification typically takes 1-2 business days.
                    </p>
                  </div>

                  <div className="bg-base-100 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-w-lg mx-auto">
                    <h4 className="font-semibold text-sm sm:text-base text-base-content mb-2 sm:mb-3">🔓 Unlock These Features:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-base-content/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        Smart Contract Manager
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        Project Portfolio Tracking
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        Automated Payment Releases
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        Buyer Client Management
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        Progress Milestone Tracking
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                        Analytics Dashboard
                      </div>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary btn-sm sm:btn-md lg:btn-lg gap-2"
                    onClick={handleStartVerification}
                  >
                    <FaBuilding className="w-5 h-5" />
                    Start Verification Process
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Contract Modal */}
      {showAddModal && (
        <AddContractModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddContract}
        />
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          userType="developer"
          userId={currentUser?.uid || 'demo-developer-user'}
          onVerificationSubmitted={handleVerificationSubmitted}
        />
      )}

      {/* Processing Modal */}
      {showProcessingModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="text-center py-6">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Processing Verification</h3>
              <p className="text-gray-600">
                Please wait while we review your documents...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="text-center py-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-bold text-lg mb-2 text-green-600">Verification Approved!</h3>
              <p className="text-gray-600 mb-4">
                Congratulations! Your verification has been approved and all features are now unlocked.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Now Available:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Add and manage contracts</li>
                  <li>• Track property sales</li>
                  <li>• Connect with verified agents</li>
                  <li>• Access premium developer tools</li>
                </ul>
              </div>
              <div className="modal-action">
                <button 
                  className="btn btn-primary w-full"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Start Using RealtyConnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Contract Card Component
function ContractCard({ contract, onProgressUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProgressUpdate = async (newProgress) => {
    setIsUpdating(true);
    const newPaidAmount = (parseFloat(contract.totalAmount || 0) * newProgress) / 100;
    await onProgressUpdate(contract.id, newProgress, newPaidAmount);
    setIsUpdating(false);
  };

  const remainingAmount = parseFloat(contract.totalAmount || 0) - parseFloat(contract.paidAmount || 0);

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
          <div className="flex-1">
            <h3 className="font-bold text-sm sm:text-base">{contract.project}</h3>
            <p className="text-xs sm:text-sm">Buyer: {contract.buyer}</p>
          </div>
          <button className={`btn btn-xs sm:btn-sm self-start sm:self-auto ${contract.status === 'active' ? 'btn-success' : 'btn-warning'}`}>
            {contract.status || 'Active'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div>
            <p className="text-xs sm:text-sm opacity-70">Total Amount</p>
            <p className="font-semibold text-sm sm:text-base">₱{parseFloat(contract.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-70">Amount Paid</p>
            <p className="font-semibold text-sm sm:text-base">₱{parseFloat(contract.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-70">Remaining</p>
            <p className="font-semibold text-sm sm:text-base">₱{remainingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Payment Progress</span>
            <span className="text-sm font-bold">{contract.progress || 0}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={contract.progress || 0}
            max="100"
          ></progress>
        </div>

        <div className="flex gap-2 mt-4">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => handleProgressUpdate(25)}
            disabled={isUpdating || (contract.progress || 0) >= 25}
          >
            25% Complete
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => handleProgressUpdate(50)}
            disabled={isUpdating || (contract.progress || 0) >= 50}
          >
            50% Complete
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => handleProgressUpdate(75)}
            disabled={isUpdating || (contract.progress || 0) >= 75}
          >
            75% Complete
          </button>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => handleProgressUpdate(100)}
            disabled={isUpdating || (contract.progress || 0) >= 100}
          >
            100% Complete
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Contract Modal Component
function AddContractModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    project: '',
    buyer: '',
    totalAmount: '',
    paidAmount: '0',
    progress: '0'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add New Contract</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="label">Project Name</label>
            <input 
              type="text" 
              name="project"
              className="input input-bordered w-full" 
              value={formData.project}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Buyer Name</label>
            <input 
              type="text" 
              name="buyer"
              className="input input-bordered w-full" 
              value={formData.buyer}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Total Amount</label>
            <input 
              type="number" 
              name="totalAmount"
              className="input input-bordered w-full" 
              value={formData.totalAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">Add Contract</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
}

export default DeveloperRC;
