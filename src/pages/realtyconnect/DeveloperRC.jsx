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
        const statusUnsubscribe = VerificationService.subscribeToVerificationStatus(
          userId,
          'developer',
          (status) => {
            setVerificationStatus(status.status);
          }
        );
        return statusUnsubscribe;
      } catch (err) {
        console.error('Error loading verification status:', err);
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

  // Verification handlers
  const handleStartVerification = useCallback(() => {
    setShowVerificationModal(true);
  }, []);

  const handleVerificationSubmitted = useCallback(() => {
    // Set to pending immediately and close modal
    setVerificationStatus('pending');
    setShowVerificationModal(false);
    
    // Show processing modal
    setShowProcessingModal(true);
    
    // Auto-verify after 2 seconds for demo purposes
    setTimeout(async () => {
      try {
        const userId = currentUser?.uid || 'demo-developer-user';
        console.log('Auto-verifying developer after 2 seconds...');
        setVerificationStatus('verified');
        
        // Close processing modal and show success modal
        setShowProcessingModal(false);
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error during auto-verification:', error);
        setShowProcessingModal(false);
      }
    }, 2000); // 2 second delay to simulate processing
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
    <div className="space-y-6">
      {/* Verification Status */}
      <VerificationStatus 
        status={verificationStatus}
        onStartVerification={handleStartVerification}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaBuilding className="w-6 h-6" />
          </div>
          <div className="stat-title">Active Projects</div>
          <div className="stat-value">{stats.activeProjects}</div>
          <div className="stat-desc">In development</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaMoneyBillWave className="w-6 h-6" />
          </div>
          <div className="stat-title">Contract Value</div>
          <div className="stat-value">{stats.contractValue}</div>
          <div className="stat-desc">Total portfolio</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaUsers className="w-6 h-6" />
          </div>
          <div className="stat-title">Active Buyers</div>
          <div className="stat-value">{stats.activeClients}</div>
          <div className="stat-desc">Current clients</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaChartLine className="w-6 h-6" />
          </div>
          <div className="stat-title">On-Time Delivery</div>
          <div className="stat-value">{stats.deliveryRate}</div>
          <div className="stat-desc">Success rate</div>
        </div>
      </div>

      {/* Smart Contract Manager */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="card-title">Smart Contract Manager</h2>
              <p className="text-sm opacity-70">Automated payment releases based on construction milestones</p>
            </div>
            {verificationStatus === 'verified' ? (
              <button 
                className="btn btn-primary gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus />
                Add Contract
              </button>
            ) : (
              <button 
                className="btn btn-disabled gap-2"
                disabled
                title="Verification required to add contracts"
              >
                <FaPlus />
                Add Contract
              </button>
            )}
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">No contracts found</p>
              <p className="text-sm opacity-50">Add your first contract to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
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
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{contract.project}</h3>
            <p className="text-sm">Buyer: {contract.buyer}</p>
          </div>
          <button className={`btn btn-sm ${contract.status === 'active' ? 'btn-success' : 'btn-warning'}`}>
            {contract.status || 'Active'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm opacity-70">Total Amount</p>
            <p className="font-semibold">₱{parseFloat(contract.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Amount Paid</p>
            <p className="font-semibold">₱{parseFloat(contract.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Remaining</p>
            <p className="font-semibold">₱{remainingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4">
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
