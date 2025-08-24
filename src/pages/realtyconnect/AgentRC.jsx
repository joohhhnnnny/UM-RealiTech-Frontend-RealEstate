import React, { useState, useEffect, useCallback } from 'react';
import { FaChartLine, FaMoneyBillWave, FaRegClock, FaSpinner, FaPlus, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
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

  // Calculate stats from commissions data

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
        console.log('🔍 Loading agent verification status for user:', userId);
        
        // ALWAYS START WITH VERIFICATION REQUIRED - NEVER PRESERVE VERIFIED STATUS
        // This ensures that every time the page loads, user must go through verification flow
        console.log('🔄 FORCING VERIFICATION FLOW - Starting with not_submitted status');
        setVerificationStatus('not_submitted');
        
        // Subscribe to verification status changes during this session only
        const statusUnsubscribe = VerificationService.subscribeToVerificationStatus(
          userId,
          'agent',
          (status) => {
            console.log('📋 Agent verification status updated to:', status.status);
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
  const requiredDocuments = ['PRC License', 'Government ID', 'Professional Photo'];
  const uploadedDocumentTypes = documents.map(doc => doc.type || doc.name);
  
  console.log('📄 Documents submitted:', uploadedDocumentTypes);

  const userId = currentUser?.uid || 'demo-agent-user';
  
  // Set status to pending immediately when documents are submitted
  setVerificationStatus('pending');
  setShowVerificationModal(false);
  setShowProcessingModal(true);

  try {
    console.log('📤 Submitting verification documents with auto-approval...');
    
    // Submit verification documents to database with auto-approval
    const result = await VerificationService.submitVerification(
      userId,
      'agent',
      verificationData,
      documents
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit verification');
    }

    setShowProcessingModal(false);
    setVerificationStatus('verified');
    
    // Show success - automatically verified
    console.log('🎉 AGENT AUTOMATICALLY VERIFIED!');
    console.log('✅ Documents stored in Firebase');
    console.log('✅ Verification status set to VERIFIED');
    console.log('🔓 All features now unlocked');
    
    // Show success modal
    setShowSuccessModal(true);

  } catch (error) {
    console.error('❌ Agent verification submission failed:', error);
    setShowProcessingModal(false);
    setVerificationStatus('not_submitted');
    alert(`Failed to submit verification documents: ${error.message}. Please try again.`);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Verification Status */}
      <VerificationStatus 
        status={verificationStatus}
        onStartVerification={handleStartVerification}
      />

      {/* VERIFICATION SECTION - Match DeveloperRC.jsx structure EXACTLY */}
      {verificationStatus === 'not_submitted' && (
        <div className="card bg-base-200 border-2 border-dashed border-primary/30 mx-2 sm:mx-0">
          <div className="card-body text-center py-8 sm:py-16 px-4 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <FaChartLine className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary/50 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content mb-2">
                Verification Required
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-base-content/70 max-w-md mx-auto">
                  Submit your professional documents to unlock the Commission Tracker and start managing your real estate business.
                  <strong> All documents are required and will be manually reviewed by our admin team.</strong>
                </p>
                
                <div className="bg-base-100 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-w-lg mx-auto">
                  <h4 className="font-semibold text-sm sm:text-base text-base-content mb-2 sm:mb-3">📋 Required Documents:</h4>
                  <ul className="text-xs sm:text-sm text-base-content/70 space-y-1 text-left">
                    <li>• <strong>PRC License</strong> - Professional Regulation Commission License</li>
                    <li>• <strong>Valid Government ID</strong> - Driver's License, Passport, or National ID</li>
                    <li>• <strong>Professional Photo</strong> - Recent headshot for profile</li>
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
                      Commission Tracker
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      Client Management Tools
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      RealtyConnect Network
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      Full Dashboard Access
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                      Lead Generation Tools
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
                  <FaChartLine className="w-5 h-5" />
                  Start Verification Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="card bg-base-100 shadow-xl mx-2 sm:mx-0">
          <div className="card-body text-center py-8 sm:py-12 px-4 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-info/20 rounded-full flex items-center justify-center">
                <FaRegClock className="w-8 h-8 sm:w-12 sm:h-12 text-info" />
              </div>
            </div>
            <h2 className="card-title justify-center text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4">
              Verification Under Review
            </h2>
            <p className="text-sm sm:text-base text-base-content/70 mb-4 sm:mb-6 max-w-md mx-auto">
              Your documents have been submitted and are currently being reviewed by our team.
            </p>
            
            <div className="alert alert-info mb-4 sm:mb-6">
              <FaInfoCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Review process typically takes 24-48 hours</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <button 
                className="btn btn-outline btn-sm sm:btn-md"
                onClick={handleStartVerification}
              >
                Update Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="card bg-base-100 shadow-xl mx-2 sm:mx-0">
          <div className="card-body text-center py-8 sm:py-12 px-4 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-error/20 rounded-full flex items-center justify-center">
                <FaTimesCircle className="w-8 h-8 sm:w-12 sm:h-12 text-error" />
              </div>
            </div>
            <h2 className="card-title justify-center text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4">
              Verification Rejected
            </h2>
            <p className="text-sm sm:text-base text-base-content/70 mb-4 sm:mb-6 max-w-md mx-auto">
              Your submitted documents did not meet our verification requirements. Please review and resubmit.
            </p>
            
            <div className="alert alert-error mb-4 sm:mb-6">
              <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Please ensure all documents are clear and valid</span>
            </div>
            
            <div className="space-y-2 sm:space-y-3 mb-6">
              <p className="font-semibold text-sm sm:text-base">Common rejection reasons:</p>
              <ul className="text-xs sm:text-sm text-base-content/70 space-y-1">
                <li>• Documents are blurry or unreadable</li>
                <li>• Missing required information</li>
                <li>• Expired licenses or IDs</li>
                <li>• Invalid document format</li>
              </ul>
            </div>
            
            <button 
              className="btn btn-primary mt-4 sm:mt-6 btn-sm sm:btn-md"
              onClick={handleStartVerification}
            >
              Resubmit Documents
            </button>
          </div>
        </div>
      )}

      {/* Check if agent is verified before showing features - EXACT copy from DeveloperRC.jsx */}
      {verificationStatus === 'verified' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-0">
            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-primary">
                <FaChartLine className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Active Listings</div>
              <div className="stat-value text-sm sm:text-lg">{stats.activeListings}</div>
              <div className="stat-desc text-success text-xs">In progress</div>
            </div>
            
            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-warning">
                <FaRegClock className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Pending Commissions</div>
              <div className="stat-value text-xs sm:text-sm">{stats.pendingCommissions}</div>
              <div className="stat-desc text-xs">Awaiting release</div>
            </div>
            
            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-success">
                <FaMoneyBillWave className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Released This Month</div>
              <div className="stat-value text-xs sm:text-sm">{stats.releasedThisMonth}</div>
              <div className="stat-desc text-success text-xs">Paid out</div>
            </div>
            
            <div className="stat bg-base-100 rounded-box shadow p-3 sm:p-4">
              <div className="stat-figure text-info">
                <FaChartLine className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="stat-title text-xs sm:text-sm">Sales This Month</div>
              <div className="stat-value text-sm sm:text-lg">{stats.salesThisMonth}</div>
              <div className="stat-desc text-xs">Transactions</div>
            </div>
          </div>

          {/* Commission Tracker - Only visible when verified */}
          <div className="card bg-base-100 shadow-xl mx-2 sm:mx-0">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div>
                  <h2 className="card-title text-lg sm:text-xl">Commission Tracker</h2>
                  <p className="text-xs sm:text-sm opacity-70">Track your commission payments and releases</p>
                </div>
                <button 
                  className="btn btn-primary gap-2 btn-sm sm:btn-md w-full sm:w-auto"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Commission</span>
                </button>
              </div>

              {commissions.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-base sm:text-lg opacity-70">No commissions found</p>
              <p className="text-xs sm:text-sm opacity-50">Add your first commission to get started</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-0 sm:overflow-x-auto">
              {/* Mobile card view */}
              <div className="block sm:hidden space-y-3">
                {commissions.map((item) => (
                  <div key={item.id} className="border border-base-300 rounded-lg p-3 bg-base-50">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-sm">{item.client}</h3>
                          <p className="text-xs text-base-content/70">{item.project}</p>
                        </div>
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-base-content/60">Sale Amount:</span>
                          <div className="font-semibold">₱{parseFloat(item.saleAmount || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-base-content/60">Commission:</span>
                          <div className="font-semibold">₱{parseFloat(item.commissionAmount || 0).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-xs text-base-content/60">
                        Release Date: {item.releaseDate || 'TBD'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop table view */}
              <table className="hidden sm:table table w-full">
                <thead>
                  <tr>
                    <th className="text-xs lg:text-sm">Client</th>
                    <th className="text-xs lg:text-sm">Project</th>
                    <th className="text-xs lg:text-sm">Sale Amount</th>
                    <th className="text-xs lg:text-sm">Commission</th>
                    <th className="text-xs lg:text-sm">Status</th>
                    <th className="text-xs lg:text-sm">Release Date</th>
                    <th className="text-xs lg:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((item) => (
                    <tr key={item.id}>
                      <td className="text-xs lg:text-sm">{item.client}</td>
                      <td className="text-xs lg:text-sm">{item.project}</td>
                      <td className="text-xs lg:text-sm">₱{parseFloat(item.saleAmount || 0).toLocaleString()}</td>
                      <td className="text-xs lg:text-sm">₱{parseFloat(item.commissionAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-xs lg:text-sm">{item.releaseDate || 'TBD'}</td>
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
          <div className="card bg-base-100 shadow-xl mx-2 sm:mx-0">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <h2 className="card-title text-lg sm:text-xl">Buyer Connections</h2>
                <div className="badge badge-info text-xs">{connections.length} total</div>
              </div>
              
              {connections.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-sm sm:text-base text-base-content/70">No buyer connections yet</p>
                  <p className="text-xs sm:text-sm text-base-content/50">Buyers will appear here when they contact you</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-0 sm:overflow-x-auto">
                  {/* Mobile card view */}
                  <div className="block sm:hidden space-y-3">
                    {connections.map((connection) => (
                      <div key={connection.id} className="border border-base-300 rounded-lg p-3 bg-base-50">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-sm">{connection.buyerName}</h3>
                              <p className="text-xs text-base-content/70">📧 {connection.buyerEmail}</p>
                            </div>
                            <span className={`badge ${connection.connectionType === 'meeting' ? 'badge-primary' : 'badge-secondary'} badge-sm`}>
                              {connection.connectionType === 'meeting' ? '📅 Meeting' : '📧 Contact'}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className={`badge ${connection.status === 'initiated' ? 'badge-warning' : 'badge-info'} badge-xs mr-2`}>
                              {connection.status}
                            </span>
                            {connection.createdAt?.toDate ? 
                              connection.createdAt.toDate().toLocaleDateString() : 
                              new Date(connection.createdAt).toLocaleDateString()
                            }
                          </div>
                          <div className="text-xs text-base-content/60">
                            {connection.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop table view */}
                  <table className="hidden sm:table table-zebra">
                    <thead>
                      <tr>
                        <th className="text-xs lg:text-sm">Buyer</th>
                        <th className="text-xs lg:text-sm">Contact</th>
                        <th className="text-xs lg:text-sm">Type</th>
                        <th className="text-xs lg:text-sm">Status</th>
                        <th className="text-xs lg:text-sm">Date</th>
                        <th className="text-xs lg:text-sm">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connections.map((connection) => (
                        <tr key={connection.id}>
                          <td>
                            <div className="font-medium text-xs lg:text-sm">{connection.buyerName}</div>
                          </td>
                          <td>
                            <div className="text-xs lg:text-sm">
                              <div>📧 {connection.buyerEmail}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${connection.connectionType === 'meeting' ? 'badge-primary' : 'badge-secondary'} badge-sm`}>
                              {connection.connectionType === 'meeting' ? '📅 Meeting' : '📧 Contact'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${connection.status === 'initiated' ? 'badge-warning' : 'badge-info'} badge-sm`}>
                              {connection.status}
                            </span>
                          </td>
                          <td>
                            <div className="text-xs lg:text-sm">
                              {connection.createdAt?.toDate ? 
                                connection.createdAt.toDate().toLocaleDateString() : 
                                new Date(connection.createdAt).toLocaleDateString()
                              }
                            </div>
                          </td>
                          <td>
                            <div className="text-xs lg:text-sm max-w-xs truncate" title={connection.message}>
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
      ) : null}

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
                Saving documents to Firebase and verifying...
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="loading loading-dots loading-sm"></span>
                  <span className="text-sm">Almost done...</span>
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
                Verification Complete!
              </h3>
              <p className="text-base-content/70 mb-4">
                Your documents have been saved and you are now verified! All platform features are unlocked.
              </p>
              <div className="bg-success/10 p-4 rounded-lg mb-6">
                <div className="text-success font-semibold mb-2">✅ What's Unlocked:</div>
                <ul className="text-sm text-left space-y-1">
                  <li>• Commission Tracker</li>
                  <li>• Client Management Tools</li>
                  <li>• RealtyConnect Network</li>
                  <li>• Full Dashboard Access</li>
                </ul>
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-success"
                onClick={() => {
                  setShowSuccessModal(false);
                  // KEEP VERIFIED STATUS - Don't reset until user navigates away
                  console.log('✅ SUCCESS MODAL CLOSED - Keeping verified status, user can use dashboard');
                  // Don't reset verification status here - let user enjoy verified dashboard
                }}
              >
                Start Using RealtyConnect
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/20" onClick={() => {
            setShowSuccessModal(false);
            // KEEP VERIFIED STATUS - Don't reset until user navigates away
            console.log('✅ SUCCESS MODAL CLOSED - Keeping verified status, user can use dashboard');
            // Don't reset verification status here - let user enjoy verified dashboard
          }}></div>
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
      <div className="modal-box w-full max-w-lg">
        <h3 className="font-bold text-lg">Add New Commission</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="label">
              <span className="label-text text-sm">Client Name</span>
            </label>
            <input 
              type="text" 
              name="client"
              className="input input-bordered w-full text-sm" 
              value={formData.client}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text text-sm">Project</span>
            </label>
            <input 
              type="text" 
              name="project"
              className="input input-bordered w-full text-sm" 
              value={formData.project}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text text-sm">Sale Amount</span>
            </label>
            <input 
              type="number" 
              name="saleAmount"
              className="input input-bordered w-full text-sm" 
              value={formData.saleAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text text-sm">Commission Amount</span>
            </label>
            <input 
              type="number" 
              name="commissionAmount"
              className="input input-bordered w-full text-sm" 
              value={formData.commissionAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text text-sm">Expected Release Date</span>
            </label>
            <input 
              type="date" 
              name="releaseDate"
              className="input input-bordered w-full text-sm" 
              value={formData.releaseDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="modal-action">
            <button type="submit" className="btn btn-primary btn-sm">Add Commission</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
}

export default AgentRC;
