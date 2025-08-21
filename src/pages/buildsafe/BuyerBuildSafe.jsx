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
  RiCloseLine,
  RiBuildingLine
} from 'react-icons/ri';


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

  // Calculate progress based on document submission status - Method copied from Clients.jsx for consistency
  const calculateProgress = useCallback((submission) => {
    console.log('Calculating progress for submission:', submission);
    
    // Define all possible document fields that can be submitted - matching Clients.jsx logic exactly
    const documentFields = [
      // Personal Identification (always required)
      'hasGovernmentId',
      'hasBirthCertificate',
      
      // Civil Status (conditional - marriage certificate only if married)
      ...(submission.civilStatus === 'married' ? ['hasMarriageCertificate'] : []),
      
      // Employment Type Documents (conditional based on employment type)
      ...(submission.employmentType === 'employed' ? [
        'hasEmploymentDocs', // Represents payslips, employment cert, ITR
        'hasIncomeDocs'      // Represents ITR specifically
      ] : []),
      ...(submission.employmentType === 'self-employed' ? [
        'hasEmploymentDocs', // Represents business registration, audited financial statement
        'hasIncomeDocs'      // Represents ITR and bank statements
      ] : []),
      ...(submission.employmentType === 'ofw' ? [
        'hasEmploymentDocs', // Represents employment contract
        'hasIncomeDocs'      // Represents remittance proof
      ] : [])
    ];

    console.log('Required document fields for this submission:', documentFields);
    console.log('Employment type:', submission.employmentType);
    console.log('Civil status:', submission.civilStatus);
    
    if (documentFields.length === 0) {
      console.log('No required documents identified, using TIN-based progress');
      // Basic progress for having TIN number
      return submission.tinNumber ? 20 : 0;
    }
    
    let totalDocuments = documentFields.length;
    let submittedDocuments = 0;
    
    // Check each required document field using the same logic as Clients.jsx
    documentFields.forEach(field => {
      let isSubmitted = false;
      
      // Map the document fields to actual submission data fields
      switch (field) {
        case 'hasGovernmentId':
          isSubmitted = !!submission.governmentIdPath;
          break;
        case 'hasBirthCertificate':
          isSubmitted = !!submission.birthCertificatePath;
          break;
        case 'hasMarriageCertificate':
          isSubmitted = !!submission.marriageCertificatePath;
          break;
        case 'hasEmploymentDocs':
          isSubmitted = !!submission.employmentCertificatePath || 
                       !!submission.businessRegistrationPath || 
                       !!submission.employmentContractPath;
          break;
        case 'hasIncomeDocs':
          isSubmitted = !!submission.itrPath || 
                       !!submission.auditedFinancialStatementPath || 
                       !!(submission.remittanceProofPaths?.length);
          break;
        default:
          isSubmitted = false;
      }
      
      console.log(`Document field ${field}:`, isSubmitted ? 'Submitted' : 'Missing');
      
      if (isSubmitted) {
        submittedDocuments++;
      }
    });
    
    // Add TIN number as additional requirement if we have employment type - matching Clients.jsx
    if (submission.employmentType) {
      totalDocuments += 1;
      if (submission.tinNumber) {
        submittedDocuments += 1;
      }
    }
    
    console.log(`Progress calculation: ${submittedDocuments}/${totalDocuments} documents submitted`);
    
    // Calculate percentage
    const progress = totalDocuments > 0 ? Math.round((submittedDocuments / totalDocuments) * 100) : 0;
    
    // Ensure minimum progress for applications that have been started
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

  // Get document progress breakdown for detailed view - Updated to match Clients.jsx calculation
  const getDocumentBreakdown = useCallback((submission) => {
    const breakdown = {
      completed: [],
      missing: [],
      total: 0,
      completedCount: 0
    };

    // Define all possible document fields - matching the calculation method exactly
    const requiredDocs = [
      { field: 'hasGovernmentId', label: 'Government ID', required: true },
      { field: 'hasBirthCertificate', label: 'Birth Certificate', required: true },
      { field: 'hasMarriageCertificate', label: 'Marriage Certificate', required: submission.civilStatus === 'married' },
    ];

    // Employment-specific documents - matching Clients.jsx logic
    if (submission.employmentType === 'employed') {
      requiredDocs.push(
        { field: 'hasEmploymentDocs', label: 'Employment Documents (Payslips, Certificate)', required: true },
        { field: 'hasIncomeDocs', label: 'Income Tax Return', required: true }
      );
    } else if (submission.employmentType === 'self-employed') {
      requiredDocs.push(
        { field: 'hasEmploymentDocs', label: 'Business Registration & Financial Statement', required: true },
        { field: 'hasIncomeDocs', label: 'ITR & Bank Statements', required: true }
      );
    } else if (submission.employmentType === 'ofw') {
      requiredDocs.push(
        { field: 'hasEmploymentDocs', label: 'OFW Employment Contract', required: true },
        { field: 'hasIncomeDocs', label: 'Remittance Proof', required: true }
      );
    }

    // Add TIN requirement if employment type exists
    if (submission.employmentType) {
      requiredDocs.push({ field: 'tinNumber', label: 'TIN Number', required: true });
    }

    // Filter only required documents
    const applicableDocs = requiredDocs.filter(doc => doc.required);
    breakdown.total = applicableDocs.length;

    // Check each document using the same mapping as the calculation function
    applicableDocs.forEach(doc => {
      let isSubmitted = false;
      
      // Map the document fields to actual submission data fields - same logic as calculateProgress
      switch (doc.field) {
        case 'hasGovernmentId':
          isSubmitted = !!submission.governmentIdPath;
          break;
        case 'hasBirthCertificate':
          isSubmitted = !!submission.birthCertificatePath;
          break;
        case 'hasMarriageCertificate':
          isSubmitted = !!submission.marriageCertificatePath;
          break;
        case 'hasEmploymentDocs':
          isSubmitted = !!submission.employmentCertificatePath || 
                       !!submission.businessRegistrationPath || 
                       !!submission.employmentContractPath;
          break;
        case 'hasIncomeDocs':
          isSubmitted = !!submission.itrPath || 
                       !!submission.auditedFinancialStatementPath || 
                       !!(submission.remittanceProofPaths?.length);
          break;
        case 'tinNumber':
          isSubmitted = !!submission.tinNumber;
          break;
        default:
          isSubmitted = false;
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
    const baseProject = myProperties.find(p => p.id === selectedProject);
    
    // Enhanced BuildSafe Implementation - Three Core Features for Buyers
    const project = {
      ...baseProject,
      
      // 1. PROJECT TIMELINE TRACKER - Interactive construction dashboard with visual updates
      milestones: baseProject.milestones || [
        {
          id: 1,
          name: "Land Development & Foundation",
          description: "Site preparation, excavation, foundation work, and utility connections",
          percentage: 15,
          completed: true,
          paymentAmount: "₱247,500",
          paymentReleased: true,
          completedDate: "January 20, 2025",
          verificationDate: "January 22, 2025",
          verifiedBy: "Municipal Engineer - Engr. Roberto Cruz",
          status: "Completed",
          daysAheadBehind: "+3 days ahead",
          media: [
            "https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1590320515004-8f17b1e14c6c?w=400&h=300&fit=crop"
          ],
          notes: "Foundation completed ahead of schedule with premium concrete mix. Utility connections tested and approved.",
          qualityScore: 98
        },
        {
          id: 2,
          name: "Structural Framework & Columns", 
          description: "Main building frame, reinforced columns, beams, and floor slab construction",
          percentage: 35,
          completed: true,
          paymentAmount: "₱412,500",
          paymentReleased: true,
          completedDate: "March 15, 2025",
          verificationDate: "March 18, 2025",
          verifiedBy: "Structural Engineer - Engr. Maria Santos",
          status: "Completed",
          daysAheadBehind: "+2 days ahead",
          media: [
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop"
          ],
          notes: "All structural elements exceed building code requirements. Steel reinforcement properly installed and inspected.",
          qualityScore: 96
        },
        {
          id: 3,
          name: "Roofing & Exterior Walls",
          description: "Roof installation, exterior walls, weatherproofing, and window installation",
          percentage: 55,
          completed: true,
          paymentAmount: "₱330,000",
          paymentReleased: false,
          completedDate: "June 10, 2025",
          verificationDate: "",
          verifiedBy: "",
          status: "Pending Verification",
          daysAheadBehind: "On schedule",
          media: [
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
          ],
          notes: "Roofing and exterior work completed. Awaiting final third-party verification for payment release.",
          qualityScore: 94
        },
        {
          id: 4,
          name: "Interior Systems & MEP",
          description: "Electrical systems, plumbing, HVAC installation, and interior wall framing",
          percentage: 75,
          completed: false,
          paymentAmount: "₱412,500",
          paymentReleased: false,
          expectedDate: "September 15, 2025",
          status: "85% Complete - In Progress",
          daysAheadBehind: "2 days behind",
          media: [
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
          ],
          notes: "Electrical rough-in completed. Plumbing installation 90% done. HVAC system installation in progress.",
          qualityScore: 0
        },
        {
          id: 5,
          name: "Finishing & Fixtures",
          description: "Interior finishing, painting, flooring, kitchen and bathroom fixtures",
          percentage: 90,
          completed: false,
          paymentAmount: "₱165,000",
          paymentReleased: false,
          expectedDate: "November 30, 2025",
          status: "Scheduled",
          daysAheadBehind: "TBD",
          media: [],
          notes: "Scheduled to begin upon completion of interior systems. Premium fixtures and finishes selected.",
          qualityScore: 0
        },
        {
          id: 6,
          name: "Final Inspection & Property Turnover",
          description: "Final quality inspection, cleanup, documentation, and key handover to buyer",
          percentage: 100,
          completed: false,
          paymentAmount: "₱82,500",
          paymentReleased: false,
          expectedDate: "December 20, 2025",
          status: "Scheduled",
          daysAheadBehind: "TBD",
          media: [],
          notes: "Final walkthrough, property documentation handover, and official ownership transfer.",
          qualityScore: 0
        }
      ],
      
      // 2. MILESTONE-BASED ESCROW SYSTEM - Smart payment protection for buyers
      escrowDetails: {
        totalAmount: "₱1,650,000",
        totalPaid: "₱660,000",
        heldInEscrow: "₱990,000",
        nextRelease: "₱330,000",
        nextMilestone: "Roofing & Exterior Verification",
        escrowAgent: "SecureEscrow Philippines Inc.",
        accountNumber: "ESC-2025-BS-78912",
        paymentSchedule: [
          {
            milestone: "Contract Signing & Reservation",
            amount: "₱82,500",
            percentage: 5,
            status: "Released",
            releaseDate: "December 10, 2024",
            condition: "Initial contract execution and property reservation"
          },
          {
            milestone: "Foundation Completion",
            amount: "₱247,500",
            percentage: 15,
            status: "Released", 
            releaseDate: "January 25, 2025",
            condition: "Verified foundation and site development completion"
          },
          {
            milestone: "Structural Framework Completion", 
            amount: "₱330,000",
            percentage: 20,
            status: "Released",
            releaseDate: "March 20, 2025",
            condition: "Verified structural framework and safety inspection passed"
          },
          {
            milestone: "Roofing & Exterior Completion",
            amount: "₱330,000", 
            percentage: 20,
            status: "Pending Release",
            releaseDate: "",
            condition: "Awaiting third-party verification - completion confirmed"
          },
          {
            milestone: "Interior Systems Completion",
            amount: "₱412,500",
            percentage: 25,
            status: "In Escrow",
            releaseDate: "",
            condition: "Awaiting electrical, plumbing, and HVAC system completion"
          },
          {
            milestone: "Finishing Work Completion", 
            amount: "₱165,000",
            percentage: 10,
            status: "In Escrow",
            releaseDate: "",
            condition: "Awaiting interior finishing and fixture installation"
          },
          {
            milestone: "Final Turnover & Handover",
            amount: "₱82,500",
            percentage: 5,
            status: "In Escrow", 
            releaseDate: "",
            condition: "Final inspection passed and property documentation complete"
          }
        ]
      },
      
      // 3. DOCUMENT UPLOAD & DELIVERY TRACKER - Buyer-focused document delivery system
      documents: baseProject.documents || [
        {
          id: 1,
          name: "Contract to Sell - Original Copy",
          category: "Contract Documents",
          status: "Delivered",
          uploadDate: "January 5, 2025",
          deliveryDate: "January 8, 2025",
          type: "pdf",
          size: "2.3 MB",
          description: "Official contract to sell with all terms and conditions, stamped and notarized",
          downloadUrl: "#download-contract",
          importance: "critical",
          validUntil: "December 31, 2030"
        },
        {
          id: 2,
          name: "Building Permit & Approvals",
          category: "Legal Permits", 
          status: "Delivered",
          uploadDate: "January 12, 2025",
          deliveryDate: "January 15, 2025",
          type: "pdf",
          size: "3.1 MB",
          description: "Municipal building permit, barangay clearance, and HLURB approvals",
          downloadUrl: "#download-permits",
          importance: "high",
          validUntil: "December 2025"
        },
        {
          id: 3,
          name: "Architectural Plans & Blueprints",
          category: "Construction Plans",
          status: "Delivered",
          uploadDate: "January 15, 2025",
          deliveryDate: "January 18, 2025",
          type: "pdf",
          size: "18.5 MB",
          description: "Complete architectural, structural, electrical, and plumbing plans",
          downloadUrl: "#download-plans",
          importance: "high",
          validUntil: "Permanent"
        },
        {
          id: 4,
          name: "Property Title & Tax Declaration",
          category: "Ownership Documents",
          status: "Processing",
          uploadDate: "June 15, 2025",
          deliveryDate: "",
          type: "pdf",
          size: "",
          description: "Original property title, tax declaration, and land survey documents",
          downloadUrl: "",
          importance: "critical",
          estimatedDelivery: "August 30, 2025",
          processingStage: "Registry of Deeds - 80% complete"
        },
        {
          id: 5,
          name: "Quality Certificates & Warranties",
          category: "Quality Assurance", 
          status: "Processing",
          uploadDate: "July 1, 2025",
          deliveryDate: "",
          type: "pdf",
          size: "",
          description: "Material quality certificates, contractor warranties, and inspection reports",
          downloadUrl: "",
          importance: "medium",
          estimatedDelivery: "September 15, 2025",
          processingStage: "Quality testing - 60% complete"
        },
        {
          id: 6,
          name: "Completion Certificate & Occupancy Permit",
          category: "Final Documents",
          status: "Pending",
          uploadDate: "",
          deliveryDate: "",
          type: "",
          size: "",
          description: "Final completion certificate and certificate of occupancy from local government",
          downloadUrl: "",
          importance: "critical",
          estimatedDelivery: "December 30, 2025",
          processingStage: "Awaiting project completion"
        },
        {
          id: 7,
          name: "Property Insurance & Association Papers",
          category: "Property Management",
          status: "Pending",
          uploadDate: "",
          deliveryDate: "",
          type: "",
          size: "",
          description: "Property insurance documents and homeowners association membership papers",
          downloadUrl: "",
          importance: "medium",
          estimatedDelivery: "January 15, 2026",
          processingStage: "Awaiting turnover completion"
        }
      ],
      
      // BuildSafe Project Summary - Buyer-focused overview
      totalInvestment: baseProject.totalInvestment || "₱1,650,000",
      expectedTurnover: baseProject.expectedTurnover || "December 20, 2025",
      constructionProgress: 55, // Based on current milestone completion
      status: "On Track",
      lastUpdate: "August 21, 2025",
      developer: baseProject.developer || "Premium Developers Inc.",
      projectManager: "Engr. Maria Santos",
      developerContact: "+63 917 123 4567",
      escrowAgent: "SecureEscrow Philippines Inc.",
      propertyType: baseProject.unit || "2BR Townhouse Unit 45",
      projectLocation: baseProject.location || "Residences at Vista Grande, Davao City",
      // Buyer protection metrics
      paidSoFar: "₱660,000",
      inEscrow: "₱990,000",
      protectionLevel: "Premium Escrow Protection",
      verificationScore: "96/100",
      buyerRights: [
        "Milestone-based payment protection",
        "Third-party verification required", 
        "Quality guarantee coverage",
        "Completion timeline enforcement",
        "Full document transparency"
      ]
    };
    
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
                <p className="text-lg text-primary font-semibold">{project.propertyType}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`badge badge-lg ${
                    project.status === 'On Track' ? 'badge-success' : 
                    project.status === 'Delayed' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {project.status}
                  </div>
                  <span className="text-sm">Last update: {project.lastUpdate}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
                  <span>Developer: {project.developer}</span>
                  <span>PM: {project.projectManager}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="stat p-0 text-right">
                  <div className="stat-title">Construction Progress</div>
                  <div className="stat-value text-primary">{project.constructionProgress}%</div>
                  <div className="stat-desc">Project Status: {project.status}</div>
                </div>
                <progress 
                  className={`progress w-64 ${
                    project.constructionProgress === 100 ? 'progress-success' : 
                    project.constructionProgress >= 70 ? 'progress-primary' : 
                    project.constructionProgress >= 40 ? 'progress-warning' : 
                    'progress-info'
                  }`}
                  value={project.constructionProgress} 
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline View - BUYER-FOCUSED CONSTRUCTION DASHBOARD */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {/* Construction Progress Overview */}
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <RiBuildingLine className="w-6 h-6" />
                  Your Property Construction Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Overall Progress</div>
                    <div className="stat-value text-primary text-2xl">{project.constructionProgress}%</div>
                    <div className="stat-desc">{project.status}</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Completed Milestones</div>
                    <div className="stat-value text-success text-2xl">
                      {(project.milestones || []).filter(m => m.completed).length}
                    </div>
                    <div className="stat-desc">of {(project.milestones || []).length} total</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Expected Completion</div>
                    <div className="stat-value text-info text-lg">{project.expectedTurnover}</div>
                    <div className="stat-desc">Final turnover date</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Quality Score</div>
                    <div className="stat-value text-warning text-2xl">{project.verificationScore}</div>
                    <div className="stat-desc">Third-party verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestone Timeline with Visual Updates */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <RiTimeLine className="w-5 h-5" />
                  Construction Timeline with Visual Updates
                </h3>
                <div className="space-y-6">
                  {(project.milestones || []).length > 0 ? (
                    (project.milestones || []).map((milestone, index) => (
                    <div key={index} className="bg-base-100 rounded-xl p-6 border-2 hover:border-primary/30 transition-all duration-200">
                      {/* Milestone Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          milestone.completed ? 'bg-gradient-to-br from-success to-success-content shadow-lg' : 
                          milestone.status?.includes('Progress') ? 'bg-gradient-to-br from-warning to-warning-content shadow-md' :
                          'bg-base-300 text-base-content'
                        }`}>
                          {milestone.completed ? (
                            <RiCheckboxCircleLine className="w-8 h-8" />
                          ) : (
                            <span>{milestone.percentage}%</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-lg font-bold text-primary">{milestone.name}</h4>
                              <p className="text-base-content/70 mb-2">{milestone.description}</p>
                            </div>
                            <div className="text-right">
                              <div className={`badge badge-lg ${
                                milestone.status === 'Completed' ? 'badge-success' : 
                                milestone.status?.includes('Progress') ? 'badge-warning' :
                                milestone.status === 'Pending Verification' ? 'badge-info' :
                                'badge-ghost'
                              }`}>
                                {milestone.status}
                              </div>
                              {milestone.daysAheadBehind && (
                                <div className={`text-sm mt-1 ${
                                  milestone.daysAheadBehind.includes('ahead') ? 'text-success' :
                                  milestone.daysAheadBehind.includes('behind') ? 'text-warning' :
                                  'text-info'
                                }`}>
                                  {milestone.daysAheadBehind}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Timeline Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              {milestone.completed ? (
                                <span className="text-success">✓ Completed: {milestone.completedDate}</span>
                              ) : milestone.expectedDate ? (
                                <span className="text-info">📅 Expected: {milestone.expectedDate}</span>
                              ) : (
                                <span className="text-base-content/60">📅 Scheduled</span>
                              )}
                            </div>
                            <div>
                              {milestone.paymentAmount && (
                                <span className="text-primary font-semibold">💰 Payment: {milestone.paymentAmount}</span>
                              )}
                            </div>
                          </div>

                          {/* Progress Notes */}
                          {milestone.notes && (
                            <div className="bg-base-200 p-3 rounded-lg mb-4">
                              <p className="text-sm text-base-content/80 italic">
                                <strong>Update:</strong> {milestone.notes}
                              </p>
                            </div>
                          )}

                          {/* Verification Status */}
                          {milestone.verifiedBy && (
                            <div className="bg-success/10 p-3 rounded-lg mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <RiShieldCheckLine className="w-4 h-4 text-success" />
                                <span className="font-semibold text-success">Verified & Approved</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <p>Verified by: {milestone.verifiedBy}</p>
                                {milestone.verificationDate && (
                                  <p>Verification Date: {milestone.verificationDate}</p>
                                )}
                                {milestone.qualityScore > 0 && (
                                  <p>Quality Score: <span className="font-bold text-success">{milestone.qualityScore}/100</span></p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Visual Media Gallery */}
                          {milestone.media && milestone.media.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-semibold text-sm flex items-center gap-2">
                                <RiImageLine className="w-4 h-4" />
                                Construction Photos & Videos ({milestone.media.length})
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {milestone.media.map((mediaUrl, mediaIndex) => (
                                  <div key={mediaIndex} className="relative group cursor-pointer">
                                    <img
                                      src={mediaUrl}
                                      alt={`${milestone.name} progress ${mediaIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border-2 border-base-300 group-hover:border-primary transition-all"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                      <RiEyeLine className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RiTimeLine className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                      <p className="text-base-content/60">No milestone data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buyer Action Panel */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold mb-4">Buyer Actions & Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="btn btn-primary">
                    <RiContactsLine className="w-4 h-4" />
                    Contact Project Manager
                  </button>
                  <button className="btn btn-info">
                    <RiDownloadLine className="w-4 h-4" />
                    Download Progress Report
                  </button>
                  <button className="btn btn-warning">
                    <RiFlag2Line className="w-4 h-4" />
                    Report Construction Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Escrow View - MILESTONE-BASED ESCROW SYSTEM */}
        {viewMode === 'escrow' && (
          <div className="space-y-6">
            {/* Escrow Overview */}
            <div className="card bg-gradient-to-r from-success/10 to-info/10 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <RiShieldCheckLine className="w-6 h-6" />
                  Milestone-Based Escrow System
                </h3>
                
                {/* Enhanced Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Total Investment</div>
                    <div className="stat-value text-primary text-xl">{project.escrowDetails.totalAmount}</div>
                    <div className="stat-desc">Full Property Value</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Funds Released</div>
                    <div className="stat-value text-success text-xl">{project.escrowDetails.totalPaid}</div>
                    <div className="stat-desc">To Developer</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Held in Escrow</div>
                    <div className="stat-value text-info text-xl">{project.escrowDetails.heldInEscrow}</div>
                    <div className="stat-desc">Protected Funds</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Next Release</div>
                    <div className="stat-value text-warning text-xl">{project.escrowDetails.nextRelease}</div>
                    <div className="stat-desc">{project.escrowDetails.nextMilestone}</div>
                  </div>
                </div>

                {/* Escrow Protection Info */}
                <div className="alert alert-info mb-6">
                  <RiShieldCheckLine className="w-6 h-6" />
                  <div>
                    <h4 className="font-bold">Your Protection Guarantee</h4>
                    <p className="text-sm">
                      All payments are held in a secure escrow account and released only when construction 
                      milestones are independently verified and approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Milestone Payment Tracker */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Payment Release Schedule</h3>
                
                <div className="space-y-4">
                  {(project.milestones || []).map((milestone, index) => (
                    <div key={milestone.id} className="relative">
                      {/* Connecting line */}
                      {index < project.milestones.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-12 bg-base-300"></div>
                      )}
                      
                      <div className="flex items-start gap-6 p-6 bg-base-100 rounded-xl border-2">
                        {/* Payment Status Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          milestone.paymentReleased 
                            ? 'bg-success text-success-content' 
                            : milestone.completed && !milestone.paymentReleased
                            ? 'bg-warning text-warning-content'
                            : 'bg-base-300 text-base-content'
                        }`}>
                          {milestone.paymentReleased ? (
                            <RiLockUnlockLine className="w-6 h-6" />
                          ) : milestone.completed ? (
                            <RiTimeLine className="w-6 h-6" />
                          ) : (
                            <RiLockLine className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1">
                          {/* Milestone Payment Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-bold">{milestone.name}</h4>
                              <p className="text-base-content/70">{milestone.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary mb-1">
                                {milestone.paymentAmount}
                              </div>
                              <div className={`badge badge-lg ${
                                milestone.paymentReleased ? 'badge-success' : 
                                milestone.completed ? 'badge-warning' : 'badge-neutral'
                              }`}>
                                {milestone.paymentReleased ? 'Funds Released' : 
                                 milestone.completed ? 'Pending Verification' : 'Escrow Locked'}
                              </div>
                            </div>
                          </div>

                          {/* Payment Timeline */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.completed ? 'bg-success' : 'bg-base-300'
                              }`}></div>
                              <span className={milestone.completed ? 'text-success' : 'text-base-content/50'}>
                                Construction: {milestone.completed ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.verifiedBy ? 'bg-info' : 'bg-base-300'
                              }`}></div>
                              <span className={milestone.verifiedBy ? 'text-info' : 'text-base-content/50'}>
                                Verification: {milestone.verifiedBy ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.paymentReleased ? 'bg-success' : 'bg-base-300'
                              }`}></div>
                              <span className={milestone.paymentReleased ? 'text-success' : 'text-base-content/50'}>
                                Payment: {milestone.paymentReleased ? 'Released' : 'Held in Escrow'}
                              </span>
                            </div>
                          </div>

                          {/* Verification Details */}
                          {milestone.verifiedBy && (
                            <div className="mt-4 p-3 bg-info/10 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <RiShieldCheckLine className="w-4 h-4 text-info" />
                                <span className="font-semibold text-info">Verified</span>
                              </div>
                              <div className="text-sm space-y-1">
                                <p>Verified by: {milestone.verifiedBy}</p>
                                {milestone.verificationDate && (
                                  <p>Date: {milestone.verificationDate}</p>
                                )}
                                {milestone.notes && (
                                  <p className="italic">Notes: {milestone.notes}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Escrow Actions */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold mb-4">Escrow Management</h3>
                <div className="flex gap-4 flex-wrap">
                  <button className="btn btn-info">
                    <RiDownloadLine className="w-4 h-4" />
                    Download Payment History
                  </button>
                  <button className="btn btn-warning">
                    <RiFlag2Line className="w-4 h-4" />
                    Dispute Payment Release
                  </button>
                  <button className="btn btn-success">
                    <RiContactsLine className="w-4 h-4" />
                    Contact Escrow Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents View - DOCUMENT DELIVERY TRACKER (BUYER SIDE) */}
        {viewMode === 'documents' && (
          <div className="space-y-6">
            {/* Document Delivery Overview */}
            <div className="card bg-gradient-to-r from-info/10 to-primary/10 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <RiFileTextLine className="w-6 h-6" />
                  Property Documents - Delivery Tracker
                </h3>
                <p className="text-base-content/70 mb-6">
                  Track and download all property-related documents uploaded by your developer. 
                  Documents are processed and delivered as they become available throughout your property journey.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Total Documents</div>
                    <div className="stat-value text-primary text-lg">
                      {Array.isArray(project.documents) ? project.documents.length : 0}
                    </div>
                    <div className="stat-desc">Available</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Ready to Download</div>
                    <div className="stat-value text-success text-lg">
                      {Array.isArray(project.documents) ? project.documents.filter(d => d.status === 'Delivered').length : 0}
                    </div>
                    <div className="stat-desc">Completed</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">In Processing</div>
                    <div className="stat-value text-warning text-lg">
                      {Array.isArray(project.documents) ? project.documents.filter(d => d.status === 'Processing').length : 0}
                    </div>
                    <div className="stat-desc">Please Wait</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg p-4">
                    <div className="stat-title">Pending Upload</div>
                    <div className="stat-value text-info text-lg">
                      {Array.isArray(project.documents) ? project.documents.filter(d => d.status === 'Pending').length : 0}
                    </div>
                    <div className="stat-desc">Developer Side</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Delivery Timeline */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <RiDownloadLine className="w-5 h-5" />
                  Your Property Documents
                </h3>
                
                <div className="space-y-6">
                  {Array.isArray(project.documents) && project.documents.length > 0 ? (
                    project.documents.map((doc) => (
                      <div key={doc.id} className="bg-base-100 rounded-xl p-6 border-2 hover:border-primary/30 transition-all duration-200">
                        {/* Document Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-4 h-4 rounded-full ${
                                doc.status === 'Delivered' ? 'bg-success animate-pulse' :
                                doc.status === 'Processing' ? 'bg-warning animate-pulse' :
                                'bg-base-300'
                              }`}></div>
                              <h4 className="text-lg font-bold text-primary">{doc.name}</h4>
                              <div className={`badge badge-lg ${
                                doc.status === 'Delivered' ? 'badge-success' :
                                doc.status === 'Processing' ? 'badge-warning' :
                                'badge-ghost'
                              }`}>
                                {doc.status}
                              </div>
                            </div>
                            <p className="text-base-content/70 mb-2">{doc.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <RiFileTextLine className="w-4 h-4" />
                                Category: {doc.category}
                              </span>
                              {doc.size && (
                                <span className="flex items-center gap-1">
                                  <RiDownloadLine className="w-4 h-4" />
                                  Size: {doc.size}
                                </span>
                              )}
                              {doc.type && (
                                <span className="flex items-center gap-1">
                                  <RiFileTextLine className="w-4 h-4" />
                                  Type: {doc.type.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {doc.status === 'Delivered' && doc.downloadUrl ? (
                              <button className="btn btn-primary btn-sm">
                                <RiDownloadLine className="w-4 h-4" />
                                Download
                              </button>
                            ) : doc.status === 'Processing' ? (
                              <button className="btn btn-warning btn-sm" disabled>
                                <RiLoader4Line className="w-4 h-4 animate-spin" />
                                Processing
                              </button>
                            ) : (
                              <button className="btn btn-ghost btn-sm" disabled>
                                <RiTimeLine className="w-4 h-4" />
                                Pending
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Document Progress Timeline */}
                        <div className="divider my-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {/* Developer Upload Stage */}
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              doc.uploadDate ? 'bg-info text-info-content' : 'bg-base-300'
                            }`}>
                              {doc.uploadDate ? <RiCheckLine className="w-3 h-3" /> : '1'}
                            </div>
                            <div>
                              <div className="font-semibold">Developer Upload</div>
                              <div className="text-base-content/60">
                                {doc.uploadDate || 'Waiting for developer'}
                              </div>
                            </div>
                          </div>

                          {/* Processing Stage */}
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              doc.status === 'Processing' 
                                ? 'bg-warning text-warning-content' 
                                : doc.status === 'Delivered'
                                ? 'bg-success text-success-content'
                                : 'bg-base-300'
                            }`}>
                              {doc.status === 'Processing' ? (
                                <RiLoader4Line className="w-3 h-3 animate-spin" />
                              ) : doc.status === 'Delivered' ? (
                                <RiCheckLine className="w-3 h-3" />
                              ) : (
                                '2'
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">Document Review</div>
                              <div className="text-base-content/60">
                                {doc.status === 'Processing' ? 'Reviewing...' : 
                                 doc.status === 'Delivered' ? 'Approved' : 'Pending'}
                              </div>
                            </div>
                          </div>

                          {/* Delivery Stage */}
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              doc.status === 'Delivered' ? 'bg-success text-success-content' : 'bg-base-300'
                            }`}>
                              {doc.status === 'Delivered' ? <RiCheckLine className="w-3 h-3" /> : '3'}
                            </div>
                            <div>
                              <div className="font-semibold">Ready for Download</div>
                              <div className="text-base-content/60">
                                {doc.deliveryDate || 'Not ready yet'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Document Action Area */}
                        {doc.status === 'Delivered' && (
                          <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <RiCheckboxCircleLine className="w-5 h-5 text-success" />
                                <span className="font-semibold text-success">Document Ready</span>
                              </div>
                              <div className="flex gap-2">
                                <button className="btn btn-success btn-sm">
                                  <RiDownloadLine className="w-4 h-4" />
                                  Download Now
                                </button>
                                <button className="btn btn-outline btn-sm">
                                  <RiEyeLine className="w-4 h-4" />
                                  Preview
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-base-content/50">
                      <RiFileTextLine className="w-16 h-16 mx-auto mb-4" />
                      <h4 className="text-lg font-bold mb-2">No Documents Available Yet</h4>
                      <p className="mb-4">Your developer will upload property documents as they become available.</p>
                      <div className="alert alert-info max-w-md mx-auto">
                        <RiTimeLine className="w-5 h-5" />
                        <span className="text-sm">Expected documents: Contract, Building Permits, Architectural Plans, Title Transfer, Quality Certificates</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buyer Support & Actions */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-bold mb-4">Document Support & Help</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="alert alert-info">
                    <RiFileTextLine className="w-6 h-6" />
                    <div>
                      <h4 className="font-bold">Document Questions?</h4>
                      <p className="text-sm">
                        Contact your developer if expected documents are missing or delayed.
                      </p>
                    </div>
                  </div>
                  <div className="alert alert-success">
                    <RiShieldCheckLine className="w-6 h-6" />
                    <div>
                      <h4 className="font-bold">Secure & Encrypted</h4>
                      <p className="text-sm">
                        All documents are encrypted and securely stored for your protection.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  <button className="btn btn-primary">
                    <RiDownloadLine className="w-4 h-4" />
                    Download All Available
                  </button>
                  <button className="btn btn-warning">
                    <RiFlag2Line className="w-4 h-4" />
                    Report Missing Document
                  </button>
                  <button className="btn btn-info">
                    <RiContactsLine className="w-4 h-4" />
                    Contact Developer
                  </button>
                  <button className="btn btn-success">
                    <RiShieldCheckLine className="w-4 h-4" />
                    Request Document Status
                  </button>
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