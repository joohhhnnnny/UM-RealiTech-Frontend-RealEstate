import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../config/Firebase';
import { 
  RiStarFill,
  RiFlag2Line,
  RiImageLine,
  RiCheckboxCircleLine,
  RiContactsLine,
  RiEyeLine,
  RiShieldCheckLine,
  RiDownloadLine,
  RiMoneyDollarCircleLine,
  RiLockLine,
  RiLockUnlockLine,
  RiFileTextLine,
  RiAlertLine,
  RiTimeLine,
  RiUserLine,
  RiLoader4Line,
  RiPercentLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';

// Dynamic BuyerBuildSafe Component - Updated with real Firestore integration and fixed progress calculation v2.1
function BuyerBuildSafe() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, escrow, documents
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myProperties, setMyProperties] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
      } else {
        // Fallback to localStorage for user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            const userObj = {
              uid: parsedData.uid || parsedData.userNumber || parsedData.id,
              email: parsedData.email,
              fullName: parsedData.fullName || `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim(),
            };
            setCurrentUser(userObj);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setCurrentUser(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Calculate progress based on document submission status
  const calculateProgress = useCallback((submission) => {
    console.log('Calculating progress for submission:', submission);
    
    // Define all possible document fields that can be submitted
    const documentFields = [
      // Personal Identification (always required)
      'governmentIdPath',
      'birthCertificatePath',
      
      // Civil Status (conditional - marriage certificate only if married)
      ...(submission.civilStatus === 'married' ? ['marriageCertificatePath'] : []),
      
      // Employment Type Documents (conditional based on employment type)
      ...(submission.employmentType === 'employed' ? [
        'payslipsPaths',
        'employmentCertificatePath',
        'itrPath'
      ] : []),
      ...(submission.employmentType === 'self-employed' ? [
        'businessRegistrationPath',
        'auditedFinancialStatementPath',
        'bankStatementsPaths',
        'itrPath'
      ] : []),
      ...(submission.employmentType === 'ofw' ? [
        'employmentContractPath',
        'remittanceProofPaths'
      ] : [])
    ];

    console.log('Required document fields for this submission:', documentFields);
    console.log('Employment type:', submission.employmentType);
    console.log('Civil status:', submission.civilStatus);
    
    if (documentFields.length === 0) {
      console.log('No required documents identified, using status-based progress');
      switch (submission.status) {
        case 'submitted': return 75;
        case 'approved': return 100;
        case 'rejected': return 50;
        default: return 10; // Some progress for having basic info
      }
    }
    
    let totalDocuments = documentFields.length;
    let submittedDocuments = 0;
    
    // Check each required document field
    documentFields.forEach(field => {
      const fieldValue = submission[field];
      let isSubmitted = false;
      
      if (field.endsWith('Paths')) {
        // Handle array fields (multiple files)
        isSubmitted = Array.isArray(fieldValue) && fieldValue.length > 0 && 
                     fieldValue.some(path => path && path.trim() !== '');
        console.log(`Array field ${field}:`, fieldValue, 'Submitted:', isSubmitted);
      } else if (field.endsWith('Path')) {
        // Handle single file fields
        isSubmitted = fieldValue && typeof fieldValue === 'string' && fieldValue.trim() !== '';
        console.log(`Single field ${field}:`, fieldValue, 'Submitted:', isSubmitted);
      }
      
      if (isSubmitted) {
        submittedDocuments++;
      }
    });
    
    console.log(`Progress calculation: ${submittedDocuments}/${totalDocuments} documents submitted`);
    
    // Calculate percentage
    const progress = totalDocuments > 0 ? Math.round((submittedDocuments / totalDocuments) * 100) : 0;
    
    // Ensure minimum progress for submissions that have been started
    if (progress === 0 && (submission.tinNumber || submission.civilStatus || submission.employmentType)) {
      console.log('Basic info provided, setting minimum progress');
      return 5; // Show some progress for having basic info
    }
    
    console.log('Final calculated progress:', progress);
    return progress;
  }, []);

  // Format date properly
  const formatDate = useCallback((dateValue) => {
    if (!dateValue) return 'Not available';
    
    try {
      let date;
      
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      // Handle ISO string or date string
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // Handle Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle timestamp number
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      else {
        return 'Invalid date';
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      // Format as: "Jan 15, 2024 at 2:30 PM"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.warn('Error formatting date:', error, dateValue);
      return 'Date error';
    }
  }, []);

  // Get document progress breakdown for detailed view
  const getDocumentBreakdown = useCallback((submission) => {
    const breakdown = {
      completed: [],
      missing: [],
      total: 0,
      completedCount: 0
    };

    // Define all possible document fields
    const requiredDocs = [
      { field: 'governmentIdPath', label: 'Government ID', required: true },
      { field: 'birthCertificatePath', label: 'Birth Certificate', required: true },
      { field: 'marriageCertificatePath', label: 'Marriage Certificate', required: submission.civilStatus === 'married' },
    ];

    // Employment-specific documents
    if (submission.employmentType === 'employed') {
      requiredDocs.push(
        { field: 'payslipsPaths', label: 'Payslips (3 months)', required: true, isArray: true },
        { field: 'employmentCertificatePath', label: 'Employment Certificate', required: true },
        { field: 'itrPath', label: 'Income Tax Return', required: true }
      );
    } else if (submission.employmentType === 'self-employed') {
      requiredDocs.push(
        { field: 'businessRegistrationPath', label: 'Business Registration (DTI/SEC)', required: true },
        { field: 'auditedFinancialStatementPath', label: 'Audited Financial Statement', required: true },
        { field: 'bankStatementsPaths', label: 'Bank Statements (6 months)', required: true, isArray: true },
        { field: 'itrPath', label: 'Income Tax Return', required: true }
      );
    } else if (submission.employmentType === 'ofw') {
      requiredDocs.push(
        { field: 'employmentContractPath', label: 'OFW Employment Contract', required: true },
        { field: 'remittanceProofPaths', label: 'Remittance Proof (6 months)', required: true, isArray: true }
      );
    }

    // Filter only required documents
    const applicableDocs = requiredDocs.filter(doc => doc.required);
    breakdown.total = applicableDocs.length;

    // Check each document
    applicableDocs.forEach(doc => {
      const fieldValue = submission[doc.field];
      let isSubmitted = false;

      if (doc.isArray) {
        isSubmitted = Array.isArray(fieldValue) && fieldValue.length > 0 && 
                     fieldValue.some(path => path && path.trim() !== '');
      } else {
        isSubmitted = fieldValue && typeof fieldValue === 'string' && fieldValue.trim() !== '';
      }

      if (isSubmitted) {
        breakdown.completed.push(doc.label);
        breakdown.completedCount++;
      } else {
        breakdown.missing.push(doc.label);
      }
    });

    return breakdown;
  }, []);

  // Get status info with appropriate styling
  const getStatusInfo = useCallback((status, progress) => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Under Review',
          class: 'badge-info',
          icon: RiTimeLine,
          description: 'Application submitted and under review'
        };
      case 'approved':
        return {
          label: 'Approved',
          class: 'badge-success',
          icon: RiCheckboxCircleLine,
          description: 'Application approved'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          class: 'badge-error',
          icon: RiAlertLine,
          description: 'Application rejected'
        };
      case 'draft':
      default:
        return {
          label: progress > 0 ? 'In Progress' : 'Draft',
          class: progress > 50 ? 'badge-warning' : 'badge-ghost',
          icon: RiFileTextLine,
          description: 'Application in progress'
        };
    }
  }, []);

  // Fetch property applications from Firestore
  const fetchPropertyApplications = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching property applications for user:', currentUser.uid);
      
      // Fetch user's document submissions
      const submissionsRef = collection(db, 'documentSubmissions');
      const userQuery = query(submissionsRef, where('userId', '==', currentUser.uid));
      const submissionsSnapshot = await getDocs(userQuery);
      
      console.log('Found submissions:', submissionsSnapshot.size);
      
      const applications = [];
      
      for (const docSnap of submissionsSnapshot.docs) {
        const submissionData = docSnap.data();
        console.log('Processing submission:', docSnap.id, submissionData);
        
        // Get property details
        let propertyDetails = null;
        if (submissionData.propertyId) {
          try {
            // Try listings collection first
            const listingDoc = await getDoc(doc(db, 'listings', submissionData.propertyId));
            if (listingDoc.exists()) {
              propertyDetails = { id: listingDoc.id, ...listingDoc.data(), source: 'listings' };
            } else {
              // Try properties collection
              const propertyDoc = await getDoc(doc(db, 'properties', submissionData.propertyId));
              if (propertyDoc.exists()) {
                propertyDetails = { id: propertyDoc.id, ...propertyDoc.data(), source: 'properties' };
              }
            }
          } catch (error) {
            console.warn('Error fetching property details:', error);
          }
        }

        // Get agent details if available
        let agentDetails = null;
        const agentId = propertyDetails?.agentId || propertyDetails?.agent_id;
        if (agentId) {
          try {
            const agentDoc = await getDoc(doc(db, 'agents', agentId));
            if (agentDoc.exists()) {
              agentDetails = agentDoc.data();
            }
          } catch (error) {
            console.warn('Error fetching agent details:', error);
          }
        }

        const progress = calculateProgress(submissionData);
        const status = submissionData.status || 'draft';
        const statusInfo = getStatusInfo(status, progress);
        
        console.log('Calculated progress for submission:', {
          submissionId: docSnap.id,
          progress,
          status,
          employmentType: submissionData.employmentType,
          civilStatus: submissionData.civilStatus,
          documentFields: {
            governmentIdPath: !!submissionData.governmentIdPath,
            birthCertificatePath: !!submissionData.birthCertificatePath,
            marriageCertificatePath: !!submissionData.marriageCertificatePath,
            payslipsPaths: submissionData.payslipsPaths?.length || 0,
            employmentCertificatePath: !!submissionData.employmentCertificatePath,
            itrPath: !!submissionData.itrPath,
            businessRegistrationPath: !!submissionData.businessRegistrationPath,
            auditedFinancialStatementPath: !!submissionData.auditedFinancialStatementPath,
            bankStatementsPaths: submissionData.bankStatementsPaths?.length || 0,
            employmentContractPath: !!submissionData.employmentContractPath,
            remittanceProofPaths: submissionData.remittanceProofPaths?.length || 0
          }
        });

        applications.push({
          id: docSnap.id,
          submissionId: docSnap.id,
          name: propertyDetails?.title || propertyDetails?.name || 'Property Application',
          unit: propertyDetails?.unit || 'Unit Details Pending',
          developer: propertyDetails?.developer || propertyDetails?.developerName || 'Developer Info Pending',
          developerLogo: propertyDetails?.developerLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(propertyDetails?.developer || 'Dev')}&background=3b82f6&color=ffffff&size=100`,
          agent: agentDetails ? 
            (agentDetails.fullName || `${agentDetails.firstName || ''} ${agentDetails.lastName || ''}`.trim()) : 
            'Agent Info Pending',
          agentContact: agentDetails?.phone || agentDetails?.phoneNumber || 'Contact Pending',
          agentEmail: agentDetails?.email || 'Email Pending',
          agentProfilePicture: agentDetails?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(agentDetails?.fullName || 'Agent')}&background=10b981&color=ffffff&size=100`,
          progress,
          status,
          statusInfo,
          submittedAt: submissionData.submittedAt || submissionData.createdAt,
          lastUpdate: submissionData.updatedAt || submissionData.submittedAt || submissionData.createdAt,
          lastUpdateFormatted: formatDate(submissionData.updatedAt || submissionData.submittedAt || submissionData.createdAt),
          image: propertyDetails?.images?.[0] || propertyDetails?.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          propertyDetails,
          submissionData,
          documents: submissionData.documents || {},
          personalInfo: submissionData.personalInfo || {},
          isStatic: false
        });
      }

      console.log('Processed applications:', applications);
      setMyProperties(applications);
      
    } catch (error) {
      console.error('Error fetching property applications:', error);
      setError('Failed to load property applications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, calculateProgress, getStatusInfo, formatDate]);

  // Load user's property applications when user is available
  useEffect(() => {
    if (currentUser) {
      fetchPropertyApplications();
    }
  }, [currentUser, fetchPropertyApplications]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading your properties...</p>
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

  if (selectedProject) {
    const project = myProperties.find(p => p.id === selectedProject);
    
    return (
      <div className="space-y-6">
        {/* Back button and view mode selector */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedProject(null)}
            className="btn btn-ghost btn-sm"
          >
            ← Back to My Properties
          </button>
          <div className="tabs">
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'timeline' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <RiEyeLine className="w-4 h-4 mr-1" />
              Timeline
            </a> 
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'escrow' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('escrow')}
            >
              <RiMoneyDollarCircleLine className="w-4 h-4 mr-1" />
              Escrow Status
            </a> 
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'documents' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('documents')}
            >
              <RiFileTextLine className="w-4 h-4 mr-1" />
              Documents
            </a>
          </div>
        </div>

        {/* Project Header */}
        <div className="card bg-base-200 shadow-xl">
          <figure className="h-64">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
          </figure>
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-lg text-primary font-semibold">{project.unit}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`badge badge-lg ${
                    project.status === 'On Track' ? 'badge-success' : 
                    project.status === 'Delayed' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {project.status}
                  </div>
                  <span className="text-sm">Last update: {project.lastUpdate}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="stat p-0 text-right">
                  <div className="stat-title">Document Submission Progress</div>
                  <div className="stat-value text-primary">{project.progress}%</div>
                  <div className="stat-desc">Application Status: {project.status}</div>
                </div>
                <progress 
                  className={`progress w-64 ${
                    project.progress === 100 ? 'progress-success' : 
                    project.progress >= 70 ? 'progress-primary' : 
                    project.progress >= 40 ? 'progress-warning' : 
                    'progress-info'
                  }`}
                  value={project.progress} 
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {/* Milestone Timeline */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4">Construction Timeline</h3>
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        milestone.completed ? 'bg-success text-success-content' : 'bg-base-300'
                      }`}>
                        {milestone.completed ? (
                          <RiCheckboxCircleLine className="w-6 h-6" />
                        ) : (
                          <span className="text-sm font-bold">{milestone.percentage}%</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{milestone.title}</p>
                            <p className="text-sm text-base-content/70">Scheduled: {milestone.date}</p>
                            {milestone.completed && (
                              <p className="text-xs mt-1">
                                Verified: {milestone.verification.date} by {milestone.verification.by}
                              </p>
                            )}
                          </div>
                          <div className={`badge ${
                            milestone.completed ? 'badge-success' : 'badge-warning'
                          }`}>
                            {milestone.completed ? 'Completed' : 'Upcoming'}
                          </div>
                        </div>
                        
                        {/* Media updates for this milestone */}
                        {milestone.media.length > 0 && (
                          <div className="mt-3">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {milestone.media.map((photo, i) => (
                                <img 
                                  key={i}
                                  src={photo} 
                                  alt={`Progress ${i + 1}`} 
                                  className="h-24 rounded-lg object-cover cursor-pointer"
                                  onClick={() => {/* Open lightbox */}}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button 
                className="btn btn-warning"
                onClick={() => setShowReportModal(true)}
              >
                <RiFlag2Line className="w-4 h-4" />
                Report an Issue
              </button>
              <button className="btn btn-info">
                <RiImageLine className="w-4 h-4" />
                View All Progress Photos
              </button>
              <button className="btn btn-ghost">
                <RiDownloadLine className="w-4 h-4" />
                Download Progress Report
              </button>
            </div>
          </div>
        )}

        {/* Escrow View */}
        {viewMode === 'escrow' && (
          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Milestone Payment Status</h3>
                
                {/* Payment Summary */}
                <div className="stats shadow bg-base-100 mb-6">
                  <div className="stat">
                    <div className="stat-title">Total Investment</div>
                    <div className="stat-value text-primary">{project.totalInvestment}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Paid So Far</div>
                    <div className="stat-value text-success">{project.paidSoFar}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Held in Escrow</div>
                    <div className="stat-value text-info">{project.inEscrow}</div>
                  </div>
                </div>
                
                {/* Milestone Payments */}
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        milestone.paymentReleased ? 'bg-success text-success-content' : 'bg-base-300'
                      }`}>
                        {milestone.paymentReleased ? (
                          <RiLockUnlockLine className="w-6 h-6" />
                        ) : (
                          <RiLockLine className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{milestone.title}</p>
                            <p className="text-sm text-base-content/70">Amount: {milestone.amount}</p>
                          </div>
                          <div className={`badge ${
                            milestone.paymentReleased ? 'badge-success' : 
                            milestone.completed ? 'badge-warning' : 'badge-neutral'
                          }`}>
                            {milestone.paymentReleased ? 'Funds Released' : 
                             milestone.completed ? 'Pending Verification' : 'Locked'}
                          </div>
                        </div>
                        
                        {milestone.verification.verified && (
                          <div className="mt-2 text-sm">
                            <p>Verified on: {milestone.verification.date}</p>
                            <p>By: {milestone.verification.by}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="alert alert-info">
              <RiShieldCheckLine className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Escrow Protection</h3>
                <div className="text-xs">
                  Your funds are securely held in escrow and will only be released to the developer 
                  after independent verification of each construction milestone.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents View */}
        {viewMode === 'documents' && (
          <div className="space-y-6">
            {/* User's Document Submission Progress */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <RiFileTextLine className="w-6 h-6 text-primary" />
                  Your Document Submission Progress
                </h3>
                
                {(() => {
                  const breakdown = getDocumentBreakdown(project.submissionData || {});
                  
                  return (
                    <div className="space-y-4">
                      {/* Progress Summary */}
                      <div className="stats bg-base-100 shadow">
                        <div className="stat">
                          <div className="stat-figure text-primary">
                            <RiCheckboxCircleLine className="w-8 h-8" />
                          </div>
                          <div className="stat-title">Documents Submitted</div>
                          <div className="stat-value text-primary">{breakdown.completedCount}</div>
                          <div className="stat-desc">of {breakdown.total} required</div>
                        </div>
                        
                        <div className="stat">
                          <div className="stat-figure text-warning">
                            <RiTimeLine className="w-8 h-8" />
                          </div>
                          <div className="stat-title">Remaining</div>
                          <div className="stat-value text-warning">{breakdown.missing.length}</div>
                          <div className="stat-desc">documents needed</div>
                        </div>
                        
                        <div className="stat">
                          <div className="stat-figure text-info">
                            <RiPercentLine className="w-8 h-8" />
                          </div>
                          <div className="stat-title">Completion</div>
                          <div className="stat-value text-info">{project.progress}%</div>
                          <div className="stat-desc">
                            {project.progress === 100 ? 'All done!' : 'In progress'}
                          </div>
                        </div>
                      </div>

                      {/* Document Checklist */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Completed Documents */}
                        {breakdown.completed.length > 0 && (
                          <div className="card bg-base-100 border border-success/20">
                            <div className="card-body p-4">
                              <h4 className="font-bold text-success flex items-center gap-2 mb-3">
                                <RiCheckboxCircleLine className="w-5 h-5" />
                                Submitted Documents ({breakdown.completed.length})
                              </h4>
                              <div className="space-y-2">
                                {breakdown.completed.map((doc, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <RiCheckLine className="w-4 h-4 text-success flex-shrink-0" />
                                    <span className="text-base-content">{doc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Missing Documents */}
                        {breakdown.missing.length > 0 && (
                          <div className="card bg-base-100 border border-warning/20">
                            <div className="card-body p-4">
                              <h4 className="font-bold text-warning flex items-center gap-2 mb-3">
                                <RiTimeLine className="w-5 h-5" />
                                Pending Documents ({breakdown.missing.length})
                              </h4>
                              <div className="space-y-2">
                                {breakdown.missing.map((doc, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <RiCloseLine className="w-4 h-4 text-warning flex-shrink-0" />
                                    <span className="text-base-content/70">{doc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {breakdown.missing.length > 0 && (
                        <div className="alert alert-warning">
                          <RiAlertLine className="w-6 h-6" />
                          <div>
                            <h3 className="font-bold">Documents Still Needed</h3>
                            <div className="text-xs">
                              You have {breakdown.missing.length} remaining documents to submit. 
                              Complete your submission to proceed with your property application.
                            </div>
                          </div>
                          <button className="btn btn-warning btn-sm">
                            Continue Submission
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Official Property Documents */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Official Property Documents</h3>
                
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.documents.map((doc, index) => (
                        <tr key={index}>
                          <td>{doc.name}</td>
                          <td>
                            <span className={`badge ${
                              doc.status === 'verified' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>{doc.date}</td>
                          <td>
                            {doc.downloadUrl ? (
                              <button className="btn btn-xs btn-primary">
                                <RiDownloadLine className="w-3 h-3" />
                                Download
                              </button>
                            ) : (
                              <span className="text-xs text-base-content/70">Not available yet</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="alert alert-warning">
              <RiAlertLine className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Missing Documents?</h3>
                <div className="text-xs">
                  If any required documents are missing or delayed, please contact your agent 
                  or use our support system to inquire about the status.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* My Properties Dashboard */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Property Applications</h2>
          <div className="stats shadow bg-gradient-to-r from-primary to-secondary text-primary-content">
            <div className="stat">
              <div className="stat-title text-primary-content/80">Total Applications</div>
              <div className="stat-value">{myProperties.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary-content/80">Approved</div>
              <div className="stat-value text-success">
                {myProperties.filter(p => p.status === 'approved').length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title text-primary-content/80">In Review</div>
              <div className="stat-value text-info">
                {myProperties.filter(p => p.status === 'submitted').length}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card bg-base-100 shadow-lg border border-base-200">
                <div className="card-body">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="h-3 bg-base-300 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-base-300 rounded"></div>
                      <div className="h-8 bg-base-300 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-base-300 rounded w-20"></div>
                      <div className="h-8 bg-base-300 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.length === 0 ? (
            <div className="col-span-full">
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="card-body text-center py-12">
                  <RiFileTextLine className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-xl font-bold text-base-content mb-2">No Property Applications Yet</h3>
                  <p className="text-base-content/70 mb-4">
                    You haven't submitted any property applications yet. Start browsing properties to begin your journey!
                  </p>
                  <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard/buysmartph'}>
                    Browse Properties
                  </button>
                </div>
              </div>
            </div>
          ) : (
            myProperties.map((property) => {
              const { statusInfo } = property;
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={property.id} 
                  className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedProject(property.id)}
                >
                  <figure className="h-48 relative">
                    <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4">
                      <div className={`badge ${statusInfo.class} gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="text-xs">{statusInfo.label}</span>
                      </div>
                    </div>
                  </figure>
                  
                  <div className="card-body p-6">
                    {/* Property Header */}
                    <div className="mb-4">
                      <h2 className="card-title text-lg font-bold text-base-content mb-2 leading-tight">
                        {property.name}
                      </h2>
                      <p className="text-sm text-base-content/80">{property.unit}</p>
                    </div>

                    {/* Application Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-base-content/70">Application Progress</span>
                        <span className={`font-bold ${
                          property.progress === 100 ? 'text-success' : 
                          property.progress >= 70 ? 'text-primary' : 
                          property.progress >= 40 ? 'text-warning' : 
                          property.progress > 0 ? 'text-info' : 'text-base-content/50'
                        }`}>
                          {property.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-3 mb-2">
                        <div 
                          className={`h-3 rounded-full transition-all duration-700 ${
                            property.progress === 100 ? 'bg-gradient-to-r from-success to-success-content shadow-lg' : 
                            property.progress >= 70 ? 'bg-gradient-to-r from-primary to-primary-focus shadow-md' : 
                            property.progress >= 40 ? 'bg-gradient-to-r from-warning to-warning-content shadow-sm' : 
                            property.progress > 0 ? 'bg-gradient-to-r from-info to-info-content' : 
                            'bg-base-content/20'
                          }`}
                          style={{ width: `${Math.max(property.progress, 2)}%` }}
                        ></div>
                      </div>
                      {/* Progress Description */}
                      <div className="text-xs text-base-content/60">
                        {property.progress === 100 ? 'All documents submitted ✓' :
                         property.progress >= 70 ? 'Almost complete - few documents remaining' :
                         property.progress >= 40 ? 'Making good progress on documents' :
                         property.progress > 0 ? 'Getting started with document submission' :
                         'Ready to begin document submission'}
                      </div>
                    </div>

                    {/* Developer & Agent Info */}
                    <div className="space-y-3 mb-4">
                      {/* Developer */}
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded bg-primary/10">
                            <img 
                              src={property.developerLogo} 
                              alt="Developer" 
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(property.developer)}&background=3b82f6&color=ffffff&size=100`;
                              }}
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-base-content/60 font-medium">Developer</p>
                          <p className="text-sm font-semibold text-base-content truncate">{property.developer}</p>
                        </div>
                      </div>

                      {/* Agent */}
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full bg-success/10">
                            <img 
                              src={property.agentProfilePicture} 
                              alt="Agent" 
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(property.agent)}&background=10b981&color=ffffff&size=100`;
                              }}
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-base-content/60 font-medium">Agent</p>
                          <p className="text-sm font-semibold text-base-content truncate">{property.agent}</p>
                        </div>
                      </div>
                    </div>

                    {/* Last Update */}
                    <div className="mb-4 p-3 bg-base-200/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RiTimeLine className="w-4 h-4 text-base-content/60" />
                        <div className="flex-1">
                          <p className="text-xs text-base-content/60">Last Updated</p>
                          <p className="text-sm font-medium text-base-content">
                            {property.lastUpdateFormatted || 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="card-actions justify-between">
                      <button 
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${property.agentEmail}`, '_blank');
                        }}
                      >
                        <RiContactsLine className="w-4 h-4" />
                        Contact Agent
                      </button>
                      <button className="btn btn-primary btn-sm gap-2">
                        <RiEyeLine className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default BuyerBuildSafe;