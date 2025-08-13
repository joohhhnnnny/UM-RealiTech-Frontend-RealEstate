import React, { useState, useEffect, useRef } from 'react';
import { 
  RiBuildingLine, 
  RiErrorWarningLine,
  RiMoneyDollarCircleLine,
  RiNotificationLine,
  RiVipCrownFill,
  RiImageLine,
  RiVideoLine,
  RiUploadCloud2Line,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFileTextLine,
  RiUserLine,
  RiCalendarLine,
  RiSaveLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiDownloadLine,
  RiEyeLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiLockLine,
  RiLockUnlockLine
} from 'react-icons/ri';
import ProjectDashboard from './devportal/ProjectDashboard.jsx';
import SmartContract from './devportal/Escrow_Contracts.jsx';
import DiscrepancyLog from './devportal/Issues.jsx';
import SubscriptionManager from './devportal/SubscriptionManager.jsx';
import TimelineTracker from './devportal/TimelineTracker';
import EscrowManagement from './devportal/EscrowManagement';
import DocumentManagement from './devportal/DocumentManagement';
import { 
  projectService, 
  notificationService, 
  subscriptionService,
  realtimeService 
} from '../../services/buildsafeService.js';

function DeveloperBuildSafe() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flaggedIssuesCount, setFlaggedIssuesCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dynamic state from Firebase
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subscription, setSubscription] = useState(null);
  
  // New BuildSafe Features State
  const [constructionMilestones, setConstructionMilestones] = useState([]);
  const [mediaUploads, setMediaUploads] = useState([]);
  const [escrowReleases, setEscrowReleases] = useState([]);
  const [paymentMilestones, setPaymentMilestones] = useState([]);
  const [buyerDocuments, setBuyerDocuments] = useState([]);
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: '', description: '', percentage: 0, paymentAmount: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // File upload refs
  const mediaInputRef = useRef(null);
  const documentInputRef = useRef(null);
  
  // Mock developer ID - in real app, get from authentication
  const developerId = 'dev-001';

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load projects
        const projectsData = await projectService.getProjects(developerId);
        setProjects(projectsData);
        
        // Load notifications
        const notificationsData = await notificationService.getNotifications(developerId);
        setNotifications(notificationsData);
        
        // Load subscription
        const subscriptionData = await subscriptionService.getSubscription(developerId);
        setSubscription(subscriptionData);
        
        // Initialize BuildSafe data structures
        initializeBuildSafeData();
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        
        // Set empty arrays instead of static fallback
        setProjects([]);
        setNotifications([]);
        setSubscription(null);
        
        // Still initialize BuildSafe data for demo
        initializeBuildSafeData();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [developerId]);

  // Initialize BuildSafe specific data
  const initializeBuildSafeData = () => {
    // Initialize payment milestones with predefined structure
    const defaultPaymentMilestones = [
      { id: 'pm1', name: 'Land Development', percentage: 15, amount: 500000, status: 'pending', escrowHeld: true },
      { id: 'pm2', name: 'Foundation Complete', percentage: 25, amount: 750000, status: 'pending', escrowHeld: true },
      { id: 'pm3', name: 'Structural Framework', percentage: 40, amount: 1000000, status: 'pending', escrowHeld: true },
      { id: 'pm4', name: 'Roofing & Exterior', percentage: 60, amount: 800000, status: 'pending', escrowHeld: true },
      { id: 'pm5', name: 'Interior Finishing', percentage: 85, amount: 900000, status: 'pending', escrowHeld: true },
      { id: 'pm6', name: 'Final Inspection', percentage: 100, amount: 550000, status: 'pending', escrowHeld: true }
    ];
    setPaymentMilestones(defaultPaymentMilestones);
    
    // Initialize document categories with realistic data
    const defaultDocumentStatuses = {
      contracts: { total: 12, submitted: 8, processing: 3, delivered: 1 },
      permits: { total: 6, submitted: 4, processing: 1, delivered: 1 },
      titles: { total: 8, submitted: 5, processing: 2, delivered: 1 },
      receipts: { total: 15, submitted: 10, processing: 4, delivered: 1 }
    };
    setDocumentStatuses(defaultDocumentStatuses);
    
    // Initialize sample buyer documents
    const sampleBuyerDocs = [
      {
        id: 'buyer-1',
        name: 'Juan Dela Cruz',
        email: 'juan@email.com',
        unit: 'A-101',
        project: 'Horizon Residences',
        documents: [
          { type: 'contract', status: 'delivered', uploadDate: '2024-08-10' },
          { type: 'receipt', status: 'processing', uploadDate: '2024-08-12' },
          { type: 'title', status: 'submitted', uploadDate: '2024-08-13' },
          { type: 'permit', status: 'delivered', uploadDate: '2024-08-09' }
        ],
        completionPercentage: 75
      },
      {
        id: 'buyer-2', 
        name: 'Maria Santos',
        email: 'maria@email.com',
        unit: 'B-203',
        project: 'Vista Heights',
        documents: [
          { type: 'contract', status: 'delivered', uploadDate: '2024-08-08' },
          { type: 'receipt', status: 'delivered', uploadDate: '2024-08-10' },
          { type: 'title', status: 'processing', uploadDate: '2024-08-12' },
          { type: 'permit', status: 'submitted', uploadDate: '2024-08-13' }
        ],
        completionPercentage: 87
      }
    ];
    setBuyerDocuments(sampleBuyerDocs);
  };

  // Set up real-time listeners
  useEffect(() => {
    let unsubscribeProjects;
    let unsubscribeNotifications;

    if (!loading && !error) {
      // Listen to projects changes
      unsubscribeProjects = realtimeService.subscribeToProjects(developerId, (updatedProjects) => {
        setProjects(updatedProjects);
      });

      // Listen to notifications changes
      unsubscribeNotifications = realtimeService.subscribeToNotifications(developerId, (updatedNotifications) => {
        setNotifications(updatedNotifications);
      });
    }

    return () => {
      if (unsubscribeProjects) unsubscribeProjects();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [developerId, loading, error]);

  const handleIssueCountChange = (counts) => {
    setFlaggedIssuesCount(counts.pending);
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state optimistically
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Milestone Management Functions
  const handleAddMilestone = async () => {
    if (!selectedProject || !newMilestone.name) return;
    
    try {
      const milestone = {
        id: `milestone-${Date.now()}`,
        ...newMilestone,
        projectId: selectedProject.id,
        completed: false,
        verified: false,
        createdDate: new Date().toLocaleDateString(),
        mediaFiles: [],
        paymentAmount: `₱${parseInt(newMilestone.paymentAmount).toLocaleString()}`
      };
      
      // Add to local state
      setConstructionMilestones(prev => [...prev, milestone]);
      
      // Add to payment milestones if payment amount specified
      if (newMilestone.paymentAmount) {
        const paymentMilestone = {
          id: `pm-${Date.now()}`,
          name: newMilestone.name,
          percentage: newMilestone.percentage,
          amount: parseInt(newMilestone.paymentAmount),
          status: 'pending',
          escrowHeld: true,
          milestoneId: milestone.id
        };
        setPaymentMilestones(prev => [...prev, paymentMilestone]);
      }
      
      // Send notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'milestone',
        message: `New milestone "${newMilestone.name}" added to ${selectedProject.name}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Reset form
      setNewMilestone({ name: '', description: '', percentage: 0, paymentAmount: '' });
      setShowMilestoneModal(false);
      
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleUploadMedia = async (milestoneId, files) => {
    if (!files || files.length === 0) return;
    
    setUploadProgress(0);
    const newUploads = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mov'];
        if (!validTypes.includes(file.type)) {
          alert(`File ${file.name} is not a supported format`);
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`File ${file.name} is too large (max 10MB)`);
          continue;
        }
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadProgress(progress);
        }
        
        const upload = {
          id: `upload-${Date.now()}-${i}`,
          milestoneId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toLocaleDateString(),
          uploadTime: new Date().toLocaleTimeString(),
          url: URL.createObjectURL(file), // In real app, this would be Firebase Storage URL
          thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        };
        
        newUploads.push(upload);
      }
      
      setMediaUploads(prev => [...prev, ...newUploads]);
      
      // Send notification about media upload
      if (newUploads.length > 0) {
        const notification = {
          id: `notif-${Date.now()}`,
          type: 'media',
          message: `${newUploads.length} media file(s) uploaded for milestone verification`,
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
      }
      
    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleMilestoneComplete = async (milestoneId) => {
    try {
      // Update construction milestones
      setConstructionMilestones(prev => 
        prev.map(milestone => 
          milestone.id === milestoneId 
            ? { 
                ...milestone, 
                completed: true, 
                completedDate: new Date().toLocaleDateString(),
                completedTime: new Date().toLocaleTimeString()
              }
            : milestone
        )
      );
      
      // Update project milestones if applicable
      setProjects(prev =>
        prev.map(project => ({
          ...project,
          milestones: project.milestones?.map(milestone =>
            milestone.id === milestoneId
              ? { 
                  ...milestone, 
                  completed: true, 
                  date: new Date().toLocaleDateString(),
                  completedTime: new Date().toLocaleTimeString()
                }
              : milestone
          ) || []
        }))
      );
      
      // Send notification
      const milestone = constructionMilestones.find(m => m.id === milestoneId);
      if (milestone) {
        const notification = {
          id: `notif-${Date.now()}`,
          type: 'milestone',
          message: `Milestone "${milestone.name}" marked as complete and awaiting verification`,
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
      }
      
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  };

  const handleEscrowRelease = async (milestoneId, amount) => {
    try {
      const release = {
        id: `release-${Date.now()}`,
        milestoneId,
        amount: typeof amount === 'string' ? amount : `₱${amount.toLocaleString()}`,
        releaseDate: new Date().toLocaleDateString(),
        releaseTime: new Date().toLocaleTimeString(),
        status: 'pending_verification',
        requestedBy: developerId
      };
      
      setEscrowReleases(prev => [...prev, release]);
      
      // Update payment milestone status
      setPaymentMilestones(prev =>
        prev.map(pm => 
          pm.milestoneId === milestoneId || pm.id === milestoneId
            ? { ...pm, status: 'release_requested', requestDate: new Date().toLocaleDateString() }
            : pm
        )
      );
      
      // Send notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'escrow',
        message: `Escrow release requested: ${release.amount} pending verification`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
    } catch (error) {
      console.error('Error requesting escrow release:', error);
    }
  };

  const handleDocumentStatusUpdate = async (docId, status) => {
    try {
      setDocumentStatuses(prev => ({
        ...prev,
        [docId]: status
      }));
      
      // Update buyer documents
      setBuyerDocuments(prev =>
        prev.map(buyer => ({
          ...buyer,
          documents: buyer.documents.map(doc =>
            doc.id === docId
              ? { ...doc, status, lastUpdated: new Date().toLocaleDateString() }
              : doc
          )
        }))
      );
      
      // Send notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'document',
        message: `Document status updated to: ${status.toUpperCase()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  // Document Upload Handler
  const handleDocumentUpload = async (documentData) => {
    try {
      const newDocument = {
        id: `doc-${Date.now()}`,
        ...documentData,
        uploadDate: new Date().toLocaleDateString(),
        uploadTime: new Date().toLocaleTimeString(),
        status: 'submitted',
        uploadedBy: developerId
      };
      
      // Update document statuses
      const category = documentData.category;
      setDocumentStatuses(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          total: prev[category].total + 1,
          submitted: prev[category].submitted + 1
        }
      }));
      
      // Send notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'document',
        message: `New ${category} document uploaded and submitted for review`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading BuildSafe data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-error max-w-md">
            <div>
              <h3 className="font-bold">Connection Error</h3>
              <div className="text-xs">{error}</div>
            </div>
          </div>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard projects={projects} />;
      case 'timeline':
        return <TimelineTracker 
                 projects={projects}
                 selectedProject={selectedProject}
                 setSelectedProject={setSelectedProject}
                 constructionMilestones={constructionMilestones}
                 setConstructionMilestones={setConstructionMilestones}
                 mediaUploads={mediaUploads}
                 setMediaUploads={setMediaUploads}
                 showMilestoneModal={showMilestoneModal}
                 setShowMilestoneModal={setShowMilestoneModal}
                 newMilestone={newMilestone}
                 setNewMilestone={setNewMilestone}
                 mediaInputRef={mediaInputRef}
                 handleAddMilestone={handleAddMilestone}
                 handleUploadMedia={handleUploadMedia}
                 handleMilestoneComplete={handleMilestoneComplete}
                 setNotifications={setNotifications}
               />;
      case 'escrow':
        return <EscrowManagement
                 projects={projects}
                 selectedProject={selectedProject}
                 setSelectedProject={setSelectedProject}
                 paymentMilestones={paymentMilestones}
                 setPaymentMilestones={setPaymentMilestones}
                 escrowReleases={escrowReleases}
                 setEscrowReleases={setEscrowReleases}
                 setNotifications={setNotifications}
               />;
      case 'documents':
        return <DocumentManagement
                 projects={projects}
                 buyerDocuments={buyerDocuments}
                 setBuyerDocuments={setBuyerDocuments}
                 documentStatuses={documentStatuses}
                 setDocumentStatuses={setDocumentStatuses}
                 notifications={notifications}
                 setNotifications={setNotifications}
                 handleDocumentUpload={handleDocumentUpload}
                 handleDocumentStatusUpdate={handleDocumentStatusUpdate}
               />;
      case 'smart-contracts':
        return <SmartContract projects={projects} />;
      case 'subscription':
        return <SubscriptionManager projects={projects} />;
      case 'issues':
        return <DiscrepancyLog 
                 projects={projects} 
                 onIssueCountChange={handleIssueCountChange} 
               />;
      default:
        return <ProjectDashboard projects={projects} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <RiBuildingLine className="text-primary" />
              BuildSafe Developer Portal
            </h1>
            <p className="text-sm text-base-content/70">
              Manage project timelines, escrow releases, and documentation
            </p>
          </div>
          
          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <div className="indicator">
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="indicator-item badge badge-error badge-sm">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
              <button className="btn btn-ghost btn-circle">
                <RiNotificationLine className="text-xl" />
              </button>
            </div>
            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 mt-2">
              {notifications.length > 0 ? (
                <>
                  <li className="menu-title">
                    <span>Notifications</span>
                  </li>
                  {notifications.map(notification => (
                    <li key={notification.id}>
                      <a 
                        className={!notification.read ? 'active' : ''}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{notification.message}</span>
                          <span className="text-xs text-gray-500">
                            {notification.project} • {notification.date}
                          </span>
                        </div>
                      </a>
                    </li>
                  ))}
                </>
              ) : (
                <li>
                  <a>No new notifications</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <RiBuildingLine className="w-4 h-4 mr-2" />
            Dashboard
          </button> 
          
          <button 
            className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            <RiTimeLine className="w-4 h-4 mr-2" />
            Timeline
          </button>
          
          <button 
            className={`tab ${activeTab === 'escrow' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('escrow')}
          >
            <RiMoneyDollarCircleLine className="w-4 h-4 mr-2" />
            Escrow
          </button>
          
          <button 
            className={`tab ${activeTab === 'documents' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <RiFileTextLine className="w-4 h-4 mr-2" />
            Documents
          </button>
          
          <button 
            className={`tab ${activeTab === 'smart-contracts' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('smart-contracts')}
          >
            <RiShieldCheckLine className="w-4 h-4 mr-2" />
            Contracts
          </button>
          
          <button 
            className={`tab ${activeTab === 'subscription' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            <RiVipCrownFill className="w-4 h-4 mr-2" />
            Subscription
          </button> 
          
          <button 
            className={`tab ${activeTab === 'issues' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <RiErrorWarningLine className="w-4 h-4 mr-2" />
            Issues
            {flaggedIssuesCount > 0 && (
              <span className="ml-2 badge badge-error badge-sm">
                {flaggedIssuesCount}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-base-100 rounded-lg shadow-lg">
          {renderActiveTab()}
        </div>

        {/* Milestone Modal */}
        {showMilestoneModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Add Construction Milestone</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Milestone Name *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={newMilestone.name}
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                      placeholder="e.g., Foundation Complete"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Progress Percentage *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={newMilestone.percentage}
                      onChange={(e) => setNewMilestone({ ...newMilestone, percentage: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      placeholder="0-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    placeholder="Detailed description of this milestone..."
                    rows="3"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Payment Amount (Optional)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={newMilestone.paymentAmount}
                    onChange={(e) => setNewMilestone({ ...newMilestone, paymentAmount: e.target.value })}
                    placeholder="Enter amount without ₱ symbol"
                  />
                </div>
                <div className="alert alert-info">
                  <RiAlertLine />
                  <div>
                    <div className="font-semibold">Milestone Guidelines:</div>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Milestone names should be descriptive and specific</li>
                      <li>• Progress percentages help track overall project completion</li>
                      <li>• Payment amounts will be held in escrow until milestone verification</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => setShowMilestoneModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddMilestone}
                  disabled={!newMilestone.name || newMilestone.percentage < 0}
                >
                  <RiSaveLine className="w-4 h-4 mr-2" />
                  Add Milestone
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={mediaInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            const milestoneId = selectedProject?.currentMilestone || selectedProject?.id || 'default';
            handleUploadMedia(milestoneId, e.target.files);
            e.target.value = ''; // Reset file input
          }
        }}
      />
      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.png"
        className="hidden"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            // Handle document upload
            const file = e.target.files[0];
            handleDocumentUpload({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              category: 'contract', // Default category
              projectId: selectedProject?.id
            });
            e.target.value = ''; // Reset file input
          }
        }}
      />
    </div>
  );

  // Timeline Tracker Component
  const renderTimelineTracker = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Project Timeline Tracker</h2>
        <div className="flex gap-2">
          <select 
            className="select select-bordered"
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === e.target.value);
              setSelectedProject(project);
            }}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => setShowMilestoneModal(true)}
            disabled={!selectedProject}
          >
            <RiAddLine className="w-4 h-4 mr-2" />
            Add Milestone
          </button>
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          {/* Project Overview */}
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{selectedProject.name}</h3>
                  <p className="text-base-content/70">{selectedProject.location}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>📅 Start: {selectedProject.startDate}</span>
                    <span>🎯 Expected: {selectedProject.expectedCompletion}</span>
                    <span>💰 Investment: {selectedProject.totalInvestment}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-2">{selectedProject.progress}%</div>
                  <div className={`badge ${
                    selectedProject.status === 'On Track' ? 'badge-success' :
                    selectedProject.status === 'Delayed' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {selectedProject.status}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{selectedProject.progress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full h-3" 
                  value={selectedProject.progress} 
                  max="100"
                ></progress>
              </div>
            </div>
          </div>

          {/* Construction Milestones Timeline */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <RiTimeLine />
                Construction Milestones Timeline
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-base-300"></div>
                
                {/* Default milestones from selected project */}
                {selectedProject.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="relative flex items-start mb-8">
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${
                      milestone.completed 
                        ? milestone.verified 
                          ? 'bg-success border-success' 
                          : 'bg-warning border-warning'
                        : 'bg-base-100 border-base-300'
                    } mr-6`}></div>
                    
                    {/* Milestone card */}
                    <div className="flex-1 card bg-base-100 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{milestone.name}</h4>
                              {milestone.completed ? (
                                <div className={`badge gap-2 ${milestone.verified ? 'badge-success' : 'badge-warning'}`}>
                                  <RiCheckboxCircleLine />
                                  {milestone.verified ? 'Verified' : 'Pending Verification'}
                                </div>
                              ) : (
                                <div className="badge badge-outline gap-2">
                                  <RiTimeLine />
                                  Pending
                                </div>
                              )}
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-base-content/70 mb-3">
                              <div>📊 Progress Target: {milestone.progressPercentage}%</div>
                              <div>💰 Payment: {milestone.paymentAmount}</div>
                              <div>📅 Due: {milestone.date}</div>
                            </div>
                          </div>
                          
                          <div className="dropdown dropdown-end">
                            <button className="btn btn-ghost btn-sm">
                              <RiImageLine />
                              Media
                            </button>
                            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56">
                              <li>
                                <a onClick={() => {
                                  // Set current milestone for media upload
                                  setSelectedProject({...selectedProject, currentMilestone: milestone.id});
                                  mediaInputRef.current?.click();
                                }}>
                                  <RiUploadCloud2Line />
                                  Upload Photos/Videos
                                </a>
                              </li>
                              <li>
                                <a onClick={() => {
                                  const mediaCount = mediaUploads.filter(u => u.milestoneId === milestone.id).length;
                                  alert(`${mediaCount} media files uploaded for this milestone`);
                                }}>
                                  <RiEyeLine />
                                  View Media ({mediaUploads.filter(u => u.milestoneId === milestone.id).length})
                                </a>
                              </li>
                              {!milestone.completed && (
                                <li>
                                  <a onClick={() => handleMilestoneComplete(milestone.id)}>
                                    <RiCheckboxCircleLine />
                                    Mark Complete
                                  </a>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Media preview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {mediaUploads
                            .filter(upload => upload.milestoneId === milestone.id)
                            .slice(0, 4)
                            .map(upload => (
                              <div key={upload.id} className="relative group">
                                {upload.fileType.startsWith('image/') ? (
                                  <img 
                                    src={upload.url} 
                                    alt={upload.fileName}
                                    className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(upload.url, '_blank')}
                                  />
                                ) : (
                                  <div className="w-full h-16 bg-base-300 rounded flex items-center justify-center cursor-pointer hover:opacity-80">
                                    <RiVideoLine className="text-xl" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                                  <RiEyeLine className="text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                            ))
                          }
                          {mediaUploads.filter(u => u.milestoneId === milestone.id).length > 4 && (
                            <div className="w-full h-16 bg-base-300 rounded flex items-center justify-center text-sm">
                              +{mediaUploads.filter(u => u.milestoneId === milestone.id).length - 4} more
                            </div>
                          )}
                        </div>

                        {/* Completion info */}
                        {milestone.completed && (
                          <div className="mt-3 p-3 bg-success/10 rounded-lg">
                            <div className="flex items-center gap-2 text-success text-sm">
                              <RiCheckboxCircleLine />
                              Completed on {milestone.date}
                              {milestone.completedTime && ` at ${milestone.completedTime}`}
                            </div>
                            {milestone.verified && (
                              <div className="text-xs text-success/80 mt-1">
                                ✅ Verified and approved for payment release
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom milestones */}
                {constructionMilestones
                  .filter(milestone => milestone.projectId === selectedProject.id)
                  .map((milestone, index) => (
                    <div key={milestone.id} className="relative flex items-start mb-8">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${
                        milestone.completed 
                          ? milestone.verified 
                            ? 'bg-success border-success' 
                            : 'bg-warning border-warning'
                          : 'bg-info border-info'
                      } mr-6`}></div>
                      
                      {/* Custom milestone card */}
                      <div className="flex-1 card bg-info/5 border border-info/20">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{milestone.name}</h4>
                                <div className="badge badge-info badge-sm">Custom</div>
                                {milestone.completed ? (
                                  <div className={`badge gap-2 ${milestone.verified ? 'badge-success' : 'badge-warning'}`}>
                                    <RiCheckboxCircleLine />
                                    {milestone.verified ? 'Verified' : 'Pending'}
                                  </div>
                                ) : (
                                  <div className="badge badge-outline gap-2">
                                    <RiTimeLine />
                                    In Progress
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-base-content/70 mb-2">{milestone.description}</p>
                              <div className="grid md:grid-cols-3 gap-4 text-sm text-base-content/70">
                                <div>📊 Progress: {milestone.percentage}%</div>
                                <div>💰 Payment: {milestone.paymentAmount}</div>
                                <div>📅 Created: {milestone.createdDate}</div>
                              </div>
                            </div>
                            
                            <div className="dropdown dropdown-end">
                              <button className="btn btn-ghost btn-sm">
                                <RiImageLine />
                              </button>
                              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                  <a onClick={() => {
                                    setSelectedProject({...selectedProject, currentMilestone: milestone.id});
                                    mediaInputRef.current?.click();
                                  }}>
                                    <RiUploadCloud2Line />
                                    Upload Media
                                  </a>
                                </li>
                                {!milestone.completed && (
                                  <li>
                                    <a onClick={() => handleMilestoneComplete(milestone.id)}>
                                      <RiCheckboxCircleLine />
                                      Mark Complete
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <a onClick={() => {
                                    if (confirm('Delete this custom milestone?')) {
                                      setConstructionMilestones(prev => prev.filter(m => m.id !== milestone.id));
                                    }
                                  }}>
                                    <RiDeleteBinLine />
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {/* Media uploads for custom milestone */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                            {mediaUploads
                              .filter(upload => upload.milestoneId === milestone.id)
                              .slice(0, 4)
                              .map(upload => (
                                <div key={upload.id} className="relative group">
                                  {upload.fileType.startsWith('image/') ? (
                                    <img 
                                      src={upload.url} 
                                      alt={upload.fileName}
                                      className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                    />
                                  ) : (
                                    <div className="w-full h-16 bg-base-300 rounded flex items-center justify-center">
                                      <RiVideoLine className="text-xl" />
                                    </div>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Media Upload Progress */}
          {uploadProgress > 0 && (
            <div className="card bg-base-200 border border-info">
              <div className="card-body p-4">
                <div className="flex items-center gap-3 mb-3">
                  <RiUploadCloud2Line className="animate-pulse text-info text-xl" />
                  <span className="font-medium">Uploading Construction Media...</span>
                </div>
                <progress className="progress progress-info w-full h-3" value={uploadProgress} max="100"></progress>
                <div className="text-sm text-base-content/70 mt-2">{uploadProgress}% completed</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="btn btn-outline" onClick={() => mediaInputRef.current?.click()}>
                  <RiUploadCloud2Line className="w-4 h-4 mr-2" />
                  Bulk Upload Media
                </button>
                <button className="btn btn-outline" onClick={() => setShowMilestoneModal(true)}>
                  <RiAddLine className="w-4 h-4 mr-2" />
                  Add Custom Milestone
                </button>
                <button className="btn btn-outline" onClick={() => {
                  const completedMilestones = [...(selectedProject.milestones?.filter(m => m.completed) || []), ...constructionMilestones.filter(m => m.completed)];
                  alert(`${completedMilestones.length} milestones completed and ready for verification`);
                }}>
                  <RiCheckboxCircleLine className="w-4 h-4 mr-2" />
                  Review Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <RiBuildingLine className="mx-auto text-6xl text-base-content/30 mb-6" />
          <h3 className="text-xl font-semibold mb-2">Select a Project</h3>
          <p className="text-base-content/70 mb-6">Choose a project to view and manage its construction timeline</p>
          {projects.length === 0 && (
            <div className="alert alert-info">
              <RiAlertLine />
              <span>No projects found. Create your first project to start tracking construction progress.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Escrow System Component
  const renderEscrowSystem = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Milestone-Based Escrow System</h2>
        <div className="badge badge-info">
          <RiShieldCheckLine className="w-4 h-4 mr-1" />
          Secure Payment Control
        </div>
      </div>

      {/* Escrow Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/20 rounded-full">
                <RiLockUnlockLine className="text-success text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-success">Funds Released</h3>
                <p className="text-2xl font-bold">₱12,450,000</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/20 rounded-full">
                <RiLockLine className="text-warning text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-warning">Funds In Escrow</h3>
                <p className="text-2xl font-bold">₱8,550,000</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-info/10 to-info/5 border border-info/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-info/20 rounded-full">
                <RiMoneyDollarCircleLine className="text-info text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-info">Next Release</h3>
                <p className="text-2xl font-bold">₱3,200,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <select 
          className="select select-bordered w-full max-w-xs"
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find(p => p.id === e.target.value);
            setSelectedProject(project);
          }}
        >
          <option value="">Select Project for Escrow Details</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          {/* Payment Milestones */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <RiMoneyDollarCircleLine />
                Payment Milestones - {selectedProject.name}
              </h3>
              
              <div className="space-y-4">
                {selectedProject.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        milestone.completed 
                          ? milestone.verified 
                            ? 'bg-success text-success-content' 
                            : 'bg-warning text-warning-content'
                          : 'bg-base-300 text-base-content'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        <p className="text-sm text-base-content/70">
                          Progress Target: {milestone.progressPercentage}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-lg">{milestone.paymentAmount}</div>
                      <div className={`badge ${
                        milestone.completed 
                          ? milestone.verified 
                            ? 'badge-success' 
                            : 'badge-warning'
                          : 'badge-outline'
                      }`}>
                        {milestone.completed 
                          ? milestone.verified 
                            ? 'Released' 
                            : 'Pending Release'
                          : 'In Escrow'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Escrow Release History */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <RiTimeLine />
                Escrow Release History
              </h3>
              
              {escrowReleases.length > 0 ? (
                <div className="space-y-3">
                  {escrowReleases.map(release => (
                    <div key={release.id} className="flex items-center justify-between p-3 bg-base-100 rounded">
                      <div>
                        <div className="font-medium">{release.amount}</div>
                        <div className="text-sm text-base-content/70">{release.releaseDate}</div>
                      </div>
                      <div className={`badge ${
                        release.status === 'released' ? 'badge-success' : 
                        release.status === 'pending_verification' ? 'badge-warning' : 'badge-outline'
                      }`}>
                        {release.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  <RiMoneyDollarCircleLine className="mx-auto text-4xl mb-2" />
                  <p>No escrow releases yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Release Actions */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Request Escrow Release</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Complete milestones and upload verification media to request fund releases
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {selectedProject.milestones
                  ?.filter(milestone => milestone.completed && !milestone.verified)
                  .map(milestone => (
                    <div key={milestone.id} className="p-4 bg-base-100 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{milestone.name}</h4>
                          <p className="text-sm text-base-content/70">
                            Amount: {milestone.paymentAmount}
                          </p>
                        </div>
                        <div className="badge badge-warning">Awaiting Verification</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEscrowRelease(milestone.id, milestone.paymentAmount)}
                      >
                        Request Release
                      </button>
                    </div>
                  ))
                }
              </div>
              
              {selectedProject.milestones?.every(m => !m.completed || m.verified) && (
                <div className="text-center py-4 text-base-content/50">
                  Complete milestones to request releases
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <RiMoneyDollarCircleLine className="mx-auto text-4xl text-base-content/50 mb-4" />
          <p className="text-base-content/70">Select a project to view escrow details</p>
        </div>
      )}
    </div>
  );

  // Document Tracker Component
  const renderDocumentTracker = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Document Upload & Delivery Tracker</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowDocumentModal(true)}
        >
          <RiAddLine className="w-4 h-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { name: 'Contracts', icon: RiFileTextLine, count: 5, color: 'text-blue-500' },
          { name: 'Permits', icon: RiShieldCheckLine, count: 3, color: 'text-green-500' },
          { name: 'Titles', icon: RiUserLine, count: 2, color: 'text-purple-500' },
          { name: 'Receipts', icon: RiMoneyDollarCircleLine, count: 8, color: 'text-orange-500' }
        ].map(category => (
          <div key={category.name} className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <category.icon className={`text-2xl ${category.color}`} />
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-base-content/70">{category.count} documents</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buyer Document Management */}
      <div className="space-y-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <RiUserLine />
              Buyer Documents by Project
            </h3>
            
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                      <div className="flex justify-between items-center">
                        <span>{project.name}</span>
                        <div className="flex gap-2">
                          <div className="badge badge-outline">{project.unitsSold || 0} buyers</div>
                          <div className="badge badge-primary">
                            {Math.floor(Math.random() * 15) + 5} docs
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="collapse-content">
                      <div className="space-y-3 pt-4">
                        {/* Mock buyer documents */}
                        {Array.from({ length: project.unitsSold || 3 }).map((_, index) => (
                          <div key={index} className="p-4 bg-base-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">Buyer {index + 1} - Unit {String.fromCharCode(65 + index)}</h4>
                                <p className="text-sm text-base-content/70">
                                  buyer{index + 1}@example.com
                                </p>
                              </div>
                              <div className="badge badge-info">
                                {Math.floor(Math.random() * 100)}% Complete
                              </div>
                            </div>
                            
                            {/* Document status grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[
                                { name: 'Contract', status: 'delivered' },
                                { name: 'Receipt', status: 'processing' },
                                { name: 'Title', status: 'submitted' },
                                { name: 'Permit', status: 'delivered' }
                              ].map(doc => (
                                <div key={doc.name} className="flex items-center gap-2 p-2 bg-base-100 rounded">
                                  <RiFileTextLine className="text-sm" />
                                  <span className="text-xs font-medium">{doc.name}</span>
                                  <div className={`badge badge-xs ${
                                    doc.status === 'delivered' ? 'badge-success' :
                                    doc.status === 'processing' ? 'badge-warning' :
                                    'badge-outline'
                                  }`}>
                                    {doc.status}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <button className="btn btn-xs btn-ghost">
                                <RiEyeLine className="w-3 h-3" />
                                View All
                              </button>
                              <button className="btn btn-xs btn-ghost">
                                <RiUploadCloud2Line className="w-3 h-3" />
                                Upload
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/50">
                <RiFileTextLine className="mx-auto text-4xl mb-2" />
                <p>No projects available</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Status Overview */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <RiTimeLine />
              Recent Document Activity
            </h3>
            
            <div className="space-y-3">
              {[
                { buyer: 'Juan Dela Cruz', document: 'Title Transfer', status: 'delivered', time: '2 hours ago', project: 'Horizon Residences' },
                { buyer: 'Maria Santos', document: 'Contract Amendment', status: 'processing', time: '4 hours ago', project: 'Vista Heights' },
                { buyer: 'Jose Rodriguez', document: 'Receipt of Payment', status: 'submitted', time: '1 day ago', project: 'Palm Gardens' },
                { buyer: 'Ana Garcia', document: 'Building Permit', status: 'delivered', time: '2 days ago', project: 'Horizon Residences' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-100 rounded">
                  <div className="flex items-center gap-3">
                    <RiFileTextLine className="text-lg text-base-content/70" />
                    <div>
                      <p className="font-medium">{activity.document}</p>
                      <p className="text-sm text-base-content/70">
                        {activity.buyer} • {activity.project}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      activity.status === 'delivered' ? 'badge-success' :
                      activity.status === 'processing' ? 'badge-warning' :
                      'badge-outline'
                    }`}>
                      {activity.status}
                    </div>
                    <p className="text-xs text-base-content/50 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <RiAlertLine />
              Pending Actions
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { action: 'Review Contract Amendments', count: 3, priority: 'high' },
                { action: 'Upload Title Documents', count: 2, priority: 'medium' },
                { action: 'Process Permit Applications', count: 5, priority: 'medium' },
                { action: 'Send Delivery Confirmations', count: 1, priority: 'low' }
              ].map((item, index) => (
                <div key={index} className="p-4 bg-base-100 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.action}</h4>
                    <div className={`badge badge-sm ${
                      item.priority === 'high' ? 'badge-error' :
                      item.priority === 'medium' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {item.priority}
                    </div>
                  </div>
                  <p className="text-sm text-base-content/70 mb-3">
                    {item.count} items requiring attention
                  </p>
                  <button className="btn btn-xs btn-primary">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Upload Buyer Document</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Document Category *</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    onChange={(e) => {
                      // Update form state for document category
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="contract">Contract</option>
                    <option value="permit">Building Permit</option>
                    <option value="title">Title Transfer</option>
                    <option value="receipt">Payment Receipt</option>
                    <option value="amendment">Contract Amendment</option>
                    <option value="clearance">Government Clearance</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Project *</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Buyer Name</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full" 
                    placeholder="Enter buyer's full name"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Unit Number</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full" 
                    placeholder="e.g., A-101, B-203"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Document File *</span>
                </label>
                <input 
                  type="file" 
                  className="file-input file-input-bordered w-full"
                  accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        e.target.value = '';
                        return;
                      }
                      
                      // Display file info
                      const fileInfo = document.getElementById('file-info');
                      if (fileInfo) {
                        fileInfo.innerHTML = `
                          <div class="alert alert-info">
                            <div>
                              <div class="font-semibold">${file.name}</div>
                              <div class="text-sm">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                          </div>
                        `;
                      }
                    }
                  }}
                />
                <div id="file-info" className="mt-2"></div>
                <div className="text-sm text-base-content/60 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Document Status</span>
                </label>
                <select className="select select-bordered w-full">
                  <option value="submitted">Submitted</option>
                  <option value="processing">Under Processing</option>
                  <option value="delivered">Delivered to Buyer</option>
                  <option value="pending">Pending Requirements</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full" 
                  placeholder="Additional notes about this document..."
                  rows="3"
                ></textarea>
              </div>
              
              <div className="alert alert-warning">
                <RiAlertLine />
                <div>
                  <div className="font-semibold">Document Upload Guidelines:</div>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Ensure documents are clear and readable</li>
                    <li>• Use appropriate categories for better organization</li>
                    <li>• Update status regularly to keep buyers informed</li>
                    <li>• Sensitive documents will be encrypted automatically</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDocumentModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // Simulate document upload
                  const notification = {
                    id: `notif-${Date.now()}`,
                    type: 'document',
                    message: 'Document uploaded successfully and submitted for processing',
                    timestamp: new Date().toISOString(),
                    read: false
                  };
                  setNotifications(prev => [notification, ...prev]);
                  setShowDocumentModal(false);
                  
                  // Update document counts
                  setDocumentStatuses(prev => ({
                    ...prev,
                    contracts: {
                      ...prev.contracts,
                      total: prev.contracts.total + 1,
                      submitted: prev.contracts.submitted + 1
                    }
                  }));
                }}
              >
                <RiUploadCloud2Line className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default DeveloperBuildSafe;  