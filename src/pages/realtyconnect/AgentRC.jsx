import React, { useState, useEffect, useCallback } from 'react';
import { FaChartLine, FaMoneyBillWave, FaRegClock, FaSpinner, FaPlus } from 'react-icons/fa';
import { commissionService, agentService, testFirebaseConnection } from '../../services/realtyConnectService';
import VerificationService from '../../services/verificationService';
import VerificationStatus from '../../components/VerificationStatus';
import VerificationModal from '../../components/VerificationModal';
import { db } from '../../config/Firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

// Try to import useAuth, but provide fallback if not available
let useAuth;
try {
  useAuth = require('../../contexts/AuthContext').useAuth;
} catch (error) {
  useAuth = () => ({ currentUser: null });
}

function AgentRC() {
  const [commissions, setCommissions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('not_submitted');
  const { currentUser } = useAuth(); // Get current user from auth context

  // Debug log for verification status changes
  useEffect(() => {
    console.log('AgentRC - Verification status changed to:', verificationStatus);
  }, [verificationStatus]);

  // Firebase connection debug
  useEffect(() => {
    console.log('=== FIREBASE DEBUG INFO ===');
    console.log('Firebase db object:', db);
    console.log('Current user:', currentUser);
    console.log('agentService:', agentService);
    console.log('commissionService:', commissionService);
    console.log('VerificationService:', VerificationService);
    console.log('testFirebaseConnection:', testFirebaseConnection);
    console.log('============================');

    // Test Firebase connection
    const runConnectionTest = async () => {
      console.log('Running Firebase connection test...');
      const isConnected = await testFirebaseConnection();
      console.log('Firebase connection result:', isConnected ? 'SUCCESS' : 'FAILED');
      
      if (!isConnected) {
        console.error('❌ Firebase connection failed! Check your Firebase configuration.');
      } else {
        console.log('✅ Firebase is connected and working!');
      }
    };
    
    runConnectionTest();
  }, [currentUser]);

  const [stats, setStats] = useState({
    activeListings: 0,
    pendingCommissions: '₱0',
    releasedThisMonth: '₱0',
    salesThisMonth: 0
  });

  // Load commissions and verification status from Firebase
  useEffect(() => {
    // Use a default user ID for demonstration if no user is authenticated
    const userId = currentUser?.uid || 'demo-agent-user';

    const loadCommissions = async () => {
      try {
        setLoading(true);
        // Subscribe to real-time updates
        const unsubscribe = commissionService.subscribeToCommissions(
          userId, 
          (commissionsData) => {
            setCommissions(commissionsData);
            calculateStats(commissionsData);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading commissions:', err);
        setError('Failed to load commissions');
        setLoading(false);
      }
    };

    // Load verification status
    const loadVerificationStatus = async () => {
      try {
        // ALWAYS START AS NOT_SUBMITTED - AGENT MUST SUBMIT DOCUMENTS FRESH
        setVerificationStatus('not_submitted');
        
        // Check if agent profile exists and reset their verification status
        const agentProfile = await agentService.getAgentByUserId(userId);
        
        if (agentProfile) {
          // Reset agent verification status to not_submitted
          await agentService.updateAgent(agentProfile.id, {
            verificationStatus: 'not_submitted'
          });
          console.log('Agent verification status reset to not_submitted');
          
          // Subscribe to agent profile changes
          const unsubscribe = agentService.subscribeToAgents((agents) => {
            const currentAgent = agents.find(agent => agent.userId === userId);
            if (currentAgent) {
              setVerificationStatus(currentAgent.verificationStatus || 'not_submitted');
            }
          });
          return unsubscribe;
        } else {
          // If no agent profile exists, status is not_submitted
          setVerificationStatus('not_submitted');
          return () => {};
        }
      } catch (err) {
        console.error('Error loading verification status:', err);
        setVerificationStatus('not_submitted');
        return () => {};
      }
    };

    const cleanupCommissions = loadCommissions();
    const cleanupVerification = loadVerificationStatus();

    // Load buyer connections
    const loadConnections = async () => {
      try {
        const userId = currentUser?.uid || 'demo-agent-user';
        const unsubscribe = agentService.subscribeToAgentConnections(
          userId,
          (connectionsData) => {
            setConnections(connectionsData);
            console.log('Agent connections loaded:', connectionsData.length);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading connections:', err);
        return () => {};
      }
    };

    const cleanupConnections = loadConnections();

    return async () => {
      const unsubscribeCommissions = await cleanupCommissions;
      const unsubscribeVerification = await cleanupVerification;
      const unsubscribeConnections = await cleanupConnections;
      
      if (unsubscribeCommissions) unsubscribeCommissions();
      if (unsubscribeVerification) unsubscribeVerification();
      if (unsubscribeConnections) unsubscribeConnections();
    };
  }, [currentUser]);

  // Calculate stats from commissions data
  const calculateStats = useCallback((commissionsData) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthCommissions = commissionsData.filter(commission => {
      const commissionDate = commission.createdAt?.toDate() || new Date();
      return commissionDate.getMonth() === currentMonth && 
             commissionDate.getFullYear() === currentYear;
    });

    const pendingAmount = commissionsData
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || 0), 0);

    const releasedAmount = commissionsData
      .filter(c => c.status === 'completed' && 
        c.releaseDate && 
        new Date(c.releaseDate).getMonth() === currentMonth)
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || 0), 0);

    setStats({
      activeListings: commissionsData.filter(c => c.status === 'in-process').length,
      pendingCommissions: `₱${pendingAmount.toLocaleString()}`,
      releasedThisMonth: `₱${releasedAmount.toLocaleString()}`,
      salesThisMonth: thisMonthCommissions.length
    });
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (commissionId, newStatus) => {
    try {
      await commissionService.updateCommissionStatus(commissionId, newStatus);
    } catch (error) {
      console.error('Error updating commission status:', error);
      alert('Failed to update commission status');
    }
  }, []);

  // Add new commission
  const handleAddCommission = useCallback(async (commissionData) => {
    try {
      const userId = currentUser?.uid || 'demo-agent-user';
      await commissionService.addCommission({
        ...commissionData,
        agentId: userId,
        status: 'pending'
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding commission:', error);
      alert('Failed to add commission');
    }
  }, [currentUser]);

  // Verification handlers
  const handleStartVerification = useCallback(() => {
    setShowVerificationModal(true);
  }, []);

  const handleVerificationSubmitted = useCallback(async (verificationData, documents) => {
    console.log('Starting verification submission with documents:', documents);
    
    // CHECK IF DOCUMENTS ARE ACTUALLY SUBMITTED
    if (!documents || documents.length === 0) {
      alert('Please submit required documents before verification!');
      return;
    }
    
    console.log('Documents provided, proceeding with verification...');
    
    // Set to pending immediately and close modal
    setVerificationStatus('pending');
    setShowVerificationModal(false);
    
    // Show processing modal
    setShowProcessingModal(true);
    
    try {
      const userId = currentUser?.uid || 'demo-agent-user';
      console.log('Creating agent profile for user:', userId);
      
      // Submit verification with actual documents to VerificationService
      const verificationResult = await VerificationService.submitVerification(
        userId,
        'agent',
        verificationData,
        documents
      );
      
      console.log('Verification submission result:', verificationResult);
      
      // CHECK IF VERIFICATION WAS SUCCESSFUL
      if (!verificationResult.success) {
        throw new Error(verificationResult.error || 'Failed to submit verification');
      }
      
      console.log(`Documents successfully processed: ${verificationResult.documentsCount} files with ID: ${verificationResult.verificationId}`);
      
      // Create or update agent profile with basic info
      const agentProfileData = {
        name: verificationData.fullName || currentUser?.displayName || 'Agent User',
        email: verificationData.email || currentUser?.email || 'agent@realitech.com',
        specialization: 'Residential', // Default, can be updated later
        rating: 4.5,
        deals: 0, // Starting with 0 deals
        agency: 'RealiTech Realty',
        image: currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent&backgroundColor=b6e3f4',
        bio: 'Professional real estate agent committed to providing excellent service.',
        verificationStatus: 'pending', // Set to pending initially
        verificationId: verificationResult.verificationId
      };

      // Create or update agent profile
      const agentId = await agentService.createOrUpdateAgentProfile(userId, agentProfileData);
      console.log('Agent profile created/updated with ID:', agentId);
      
      // Auto-verify after 3 seconds for demo purposes
      setTimeout(async () => {
        try {
          console.log('Auto-verifying agent after 3 seconds...');
          
          // Update agent profile with verified status
          const existingAgent = await agentService.getAgentByUserId(userId);
          if (existingAgent) {
            await agentService.updateAgent(existingAgent.id, {
              verificationStatus: 'verified'
            });
            console.log('Agent verification status updated to verified in Firebase');
            
            // Update local state
            setVerificationStatus('verified');
            console.log('Local verification status updated to verified');
          } else {
            console.error('Could not find agent profile to update');
          }
          
          // Close processing modal and show success modal
          setShowProcessingModal(false);
          setShowSuccessModal(true);
        } catch (error) {
          console.error('Error during auto-verification update:', error);
          setShowProcessingModal(false);
          setVerificationStatus('not_submitted'); // Reset on error
        }
      }, 3000); // 3 second delay to simulate processing
      
    } catch (error) {
      console.error('Error during verification submission:', error);
      setShowProcessingModal(false);
      setVerificationStatus('not_submitted'); // Reset on error
    }
  }, [currentUser]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'in-process':
        return 'badge badge-info';
      default:
        return 'badge';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-purple-500" />
        <span className="ml-2 text-lg">Loading commissions...</span>
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

      {/* RESTRICTION: Show content only if agent is verified */}
      {verificationStatus !== 'verified' ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-12">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-warning/20 rounded-full flex items-center justify-center">
                <FaRegClock className="w-12 h-12 text-warning" />
              </div>
            </div>
            <h2 className="card-title justify-center text-2xl mb-4">
              Verification Required
            </h2>
            <p className="text-base-content/70 mb-6 max-w-md mx-auto">
              Please submit your verification documents to access your agent dashboard and connect with buyers.
            </p>
            <div className="alert alert-warning mb-6">
              <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span>Agent features are disabled until verification is complete</span>
            </div>
            <div className="space-y-3">
              <p className="font-semibold">Required for verification:</p>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• PRC License</li>
                <li>• Valid Government ID</li>
                <li>• Professional Photo</li>
              </ul>
            </div>
            <button 
              className="btn btn-primary mt-6"
              onClick={handleStartVerification}
            >
              Start Verification Process
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Section - Only visible when verified */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-figure text-primary">
                <FaChartLine className="w-6 h-6" />
              </div>
              <div className="stat-title">Active Listings</div>
              <div className="stat-value">{stats.activeListings}</div>
              <div className="stat-desc text-success">In progress</div>
            </div>
            
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-figure text-warning">
                <FaRegClock className="w-6 h-6" />
              </div>
              <div className="stat-title">Pending Commissions</div>
              <div className="stat-value text-sm">{stats.pendingCommissions}</div>
              <div className="stat-desc">Awaiting release</div>
            </div>
            
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-figure text-success">
                <FaMoneyBillWave className="w-6 h-6" />
              </div>
              <div className="stat-title">Released This Month</div>
              <div className="stat-value text-sm">{stats.releasedThisMonth}</div>
              <div className="stat-desc text-success">Paid out</div>
            </div>
            
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-figure text-info">
                <FaChartLine className="w-6 h-6" />
              </div>
              <div className="stat-title">Sales This Month</div>
              <div className="stat-value">{stats.salesThisMonth}</div>
              <div className="stat-desc">Transactions</div>
            </div>
          </div>

          {/* Commission Tracker - Only visible when verified */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="card-title">Commission Tracker</h2>
                  <p className="text-sm opacity-70">Track your commission payments and releases</p>
                </div>
                <button 
                  className="btn btn-primary gap-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus />
                  Add Commission
                </button>
              </div>
          
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">No commissions found</p>
              <p className="text-sm opacity-50">Add your first commission to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Sale Amount</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Release Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.client}</td>
                      <td>{item.project}</td>
                      <td>₱{parseFloat(item.saleAmount || 0).toLocaleString()}</td>
                      <td>₱{parseFloat(item.commissionAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.releaseDate || 'TBD'}</td>
                      <td>
                        <div className="dropdown">
                          <label tabIndex={0} className="btn btn-ghost btn-xs">
                            Actions
                          </label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            {item.status === 'pending' && (
                              <li>
                                <button onClick={() => handleStatusUpdate(item.id, 'in-process')}>
                                  Mark In Process
                                </button>
                              </li>
                            )}
                            {item.status === 'in-process' && (
                              <li>
                                <button onClick={() => handleStatusUpdate(item.id, 'completed')}>
                                  Mark Completed
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </div>

          {/* Buyer Connections Section - Only visible when verified */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Buyer Connections</h2>
                <div className="badge badge-info">{connections.length} total</div>
              </div>          {connections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/70">No buyer connections yet</p>
              <p className="text-sm text-base-content/50">Buyers will appear here when they contact you</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((connection) => (
                    <tr key={connection.id}>
                      <td>
                        <div className="font-medium">{connection.buyerName}</div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>📧 {connection.buyerEmail}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${connection.connectionType === 'meeting' ? 'badge-primary' : 'badge-secondary'}`}>
                          {connection.connectionType === 'meeting' ? '📅 Meeting' : '📧 Contact'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${connection.status === 'initiated' ? 'badge-warning' : 'badge-info'}`}>
                          {connection.status}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm">
                          {connection.createdAt?.toDate ? 
                            connection.createdAt.toDate().toLocaleDateString() : 
                            new Date(connection.createdAt).toLocaleDateString()
                          }
                        </div>
                      </td>
                      <td>
                        <div className="text-sm max-w-xs truncate" title={connection.message}>
                          {connection.message}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

        {/* End of verified content */}
        </>
      )}

      {/* Add Commission Modal */}
      {showAddModal && (
        <AddCommissionModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCommission}
        />
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          userType="agent"
          userId={currentUser?.uid || 'demo-agent-user'}
          currentUser={currentUser}
          onVerificationSubmitted={handleVerificationSubmitted}
        />
      )}

      {/* Processing Modal */}
      {showProcessingModal && (
        <dialog className="modal modal-bottom sm:modal-middle" open>
          <div className="modal-box text-center">
            <div className="py-8">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <h3 className="font-bold text-lg mb-2">Processing Verification</h3>
              <p className="text-base-content/70">
                We're reviewing your documents and credentials...
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="loading loading-dots loading-sm"></span>
                  <span className="text-sm">This usually takes a moment</span>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop bg-black/30"></div>
        </dialog>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <dialog className="modal modal-bottom sm:modal-middle" open>
          <div className="modal-box text-center">
            <div className="py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-bold text-xl text-success mb-2">
                Verification Approved!
              </h3>
              <p className="text-base-content/70 mb-4">
                Congratulations! Your agent credentials have been verified.
                All platform features are now unlocked.
              </p>
              <div className="bg-success/10 p-4 rounded-lg mb-6">
                <div className="text-success font-semibold mb-2">✅ What's Unlocked:</div>
                <ul className="text-sm text-left space-y-1">
                  <li>• Add and manage commissions</li>
                  <li>• Access client management tools</li>
                  <li>• Participate in RealtyConnect network</li>
                  <li>• Full dashboard functionality</li>
                </ul>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-success"
                onClick={() => setShowSuccessModal(false)}
              >
                Start Using RealtyConnect
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/20" onClick={() => setShowSuccessModal(false)}></div>
        </dialog>
      )}
    </div>
  );
}

// Processing Modal Component
function ProcessingModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box text-center">
        <div className="py-8">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h3 className="font-bold text-lg mb-2">Processing Verification</h3>
          <p className="text-base-content/70">
            We're reviewing your documents and credentials...
          </p>
        </div>
      </div>
      <div className="modal-backdrop bg-black/30"></div>
    </dialog>
  );
}

// Add Commission Modal Component
function AddCommissionModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    saleAmount: '',
    commissionAmount: '',
    releaseDate: ''
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
        <h3 className="font-bold text-lg">Add New Commission</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="label">Client Name</label>
            <input 
              type="text" 
              name="client"
              className="input input-bordered w-full" 
              value={formData.client}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Project</label>
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
            <label className="label">Sale Amount</label>
            <input 
              type="number" 
              name="saleAmount"
              className="input input-bordered w-full" 
              value={formData.saleAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Commission Amount</label>
            <input 
              type="number" 
              name="commissionAmount"
              className="input input-bordered w-full" 
              value={formData.commissionAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Expected Release Date</label>
            <input 
              type="date" 
              name="releaseDate"
              className="input input-bordered w-full" 
              value={formData.releaseDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">Add Commission</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
}

export default AgentRC;
