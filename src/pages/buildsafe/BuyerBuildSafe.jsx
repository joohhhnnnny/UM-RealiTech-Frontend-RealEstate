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
import BuyerTimelineView from './buyerportal/BuyerTimelineView';
import BuyerDocumentViewer from './buyerportal/BuyerDocumentViewer';
import NotificationSystem from './buyerportal/NotificationSystem';
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
  RiArrowLeftLine,
  RiBuildingLine
} from 'react-icons/ri';

// BuildSafe Component - Construction Progress Tracking for Purchased Properties
/**
 * BuyerBuildSafe Component  
 * Purpose: Track construction progress of PURCHASED properties (NOT application document submission)
 * Progress Type: Construction milestone completion (0-100% based on completed construction phases)
 * Data Source: Real-time from Firestore for purchased properties construction updates
 * Flow: User comes here AFTER purchasing property through BuySmartPH
 */
function BuyerBuildSafe() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, escrow, documents
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasedProperties, setPurchasedProperties] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // BuildSafe-specific states for construction tracking
  const [notifications, setNotifications] = useState([]);
  const [constructionMilestones, setConstructionMilestones] = useState([]);
  const [mediaUploads, setMediaUploads] = useState([]);
  const [propertyDocuments, setPropertyDocuments] = useState([]);
  const [escrowStatus, setEscrowStatus] = useState({});

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

  // Calculate construction progress based on completed milestones - NOT document submission
  const calculateConstructionProgress = useCallback((property) => {
    console.log('Calculating construction progress for property:', property);
    
    if (!property.constructionMilestones || property.constructionMilestones.length === 0) {
      return 0;
    }
    
    const completedMilestones = property.constructionMilestones.filter(milestone => milestone.completed);
    const totalMilestones = property.constructionMilestones.length;
    
    const progress = Math.round((completedMilestones.length / totalMilestones) * 100);
    
    console.log(`Construction progress: ${completedMilestones.length}/${totalMilestones} = ${progress}%`);
    
    return progress;
  }, []);

  // Format date properly
  const formatDate = useCallback((dateValue) => {
    if (!dateValue) return 'Not provided';
    
    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle date string
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      return !isNaN(date.getTime()) ? date.toLocaleDateString() : dateValue;
    }
    
    return dateValue;
  }, []);

  // Get construction status info with appropriate styling
  const getConstructionStatus = useCallback((constructionProgress) => {
    if (constructionProgress >= 100) {
      return {
        badge: 'badge-success',
        text: 'Construction Complete',
        bgColor: 'bg-success/10 border-success/20',
        textColor: 'text-success'
      };
    } else if (constructionProgress >= 80) {
      return {
        badge: 'badge-info',
        text: 'Final Phase',
        bgColor: 'bg-info/10 border-info/20',
        textColor: 'text-info'
      };
    } else if (constructionProgress >= 40) {
      return {
        badge: 'badge-warning',
        text: `${constructionProgress}% Built`,
        bgColor: 'bg-warning/10 border-warning/20',
        textColor: 'text-warning'
      };
    } else {
      return {
        badge: 'badge-primary',
        text: 'Early Phase',
        bgColor: 'bg-primary/10 border-primary/20',
        textColor: 'text-primary'
      };
    }
  }, []);

  // Fetch purchased properties from Firestore - Focus on PURCHASED properties for construction tracking
  const fetchPurchasedProperties = useCallback(async () => {
    if (!currentUser?.uid) {
      console.log('No current user, skipping purchased properties fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching purchased properties for user:', currentUser.uid);

      // In a real implementation, this would query for properties where:
      // - User has completed purchase (approved applications from BuySmartPH)
      // - Property is in construction phase
      // For now, we'll simulate this with sample data based on approved submissions

      // Query approved document submissions (these become purchased properties in BuildSafe)
      const submissionsQuery = query(
        collection(db, 'documentSubmissions'),
        where('userNumber', '==', currentUser.uid),
        where('status', '==', 'approved') // Only approved = purchased properties
      );

      const submissionsSnapshot = await getDocs(submissionsQuery);
      console.log('Found approved submissions (purchased properties):', submissionsSnapshot.size);

      if (submissionsSnapshot.empty) {
        console.log('No purchased properties found for user - redirect to BuySmartPH');
        setPurchasedProperties([]);
        return;
      }

      const properties = [];

      for (const submissionDoc of submissionsSnapshot.docs) {
        const submissionData = submissionDoc.data();
        console.log('Processing purchased property:', submissionDoc.id, submissionData);

        // Generate construction milestones for each purchased property
        const constructionMilestones = [
          {
            id: 'ms1',
            name: 'Land Development & Site Preparation',
            description: 'Site clearing, excavation, and foundation preparation',
            completed: true,
            verified: true,
            date: '2024-03-15',
            completedDate: '2024-03-15',
            verifiedDate: '2024-03-20',
            paymentAmount: '₱500,000',
            progressPercentage: 100
          },
          {
            id: 'ms2', 
            name: 'Foundation & Structural Framework',
            description: 'Concrete foundation, steel framework, and structural elements',
            completed: true,
            verified: false,
            date: '2024-06-30',
            completedDate: '2024-06-28',
            paymentAmount: '₱800,000',
            progressPercentage: 85
          },
          {
            id: 'ms3',
            name: 'Roofing & Exterior Work',
            description: 'Roof installation, exterior walls, and weatherproofing',
            completed: false,
            verified: false,
            date: '2024-09-15',
            paymentAmount: '₱600,000',
            progressPercentage: 60
          },
          {
            id: 'ms4',
            name: 'Interior Construction',
            description: 'Interior walls, electrical, plumbing, and HVAC systems',
            completed: false,
            verified: false,
            date: '2024-11-30',
            paymentAmount: '₱750,000',
            progressPercentage: 25
          },
          {
            id: 'ms5',
            name: 'Finishing & Final Inspection',
            description: 'Paint, flooring, fixtures, and government inspection',
            completed: false,
            verified: false,
            date: '2025-02-15',
            paymentAmount: '₱450,000',
            progressPercentage: 0
          }
        ];

        // Calculate construction progress
        const constructionProgress = calculateConstructionProgress({ constructionMilestones });
        
        // Get construction status info
        const statusInfo = getConstructionStatus(constructionProgress);

        // Try to get property details
        let propertyDetails = null;
        if (submissionData.propertyId) {
          try {
            const propertyDoc = await getDoc(doc(db, 'properties', submissionData.propertyId));
            if (propertyDoc.exists()) {
              propertyDetails = propertyDoc.data();
            }
          } catch (propError) {
            console.warn('Could not fetch property details:', propError);
          }
        }

        // Create purchased property object for construction tracking
        const property = {
          id: submissionDoc.id,
          purchaseData: submissionData, // Original purchase/approval data
          
          // Property Details
          projectName: propertyDetails?.name || submissionData.projectName || 'Your Property',
          name: propertyDetails?.name || submissionData.projectName || 'Your Property',
          location: propertyDetails?.location || submissionData.location || 'Location not specified',
          city: propertyDetails?.city || submissionData.city || propertyDetails?.location || 'City not specified',
          unit: submissionData.unitNumber || submissionData.unit || 'N/A',
          unitNumber: submissionData.unitNumber,
          
          // Financial Details
          price: propertyDetails?.price || submissionData.price || 'Price not specified',
          totalPrice: propertyDetails?.totalPrice || propertyDetails?.price || submissionData.price || 'Price not specified',
          totalInvestment: propertyDetails?.totalPrice || propertyDetails?.price || submissionData.price || '₱2,500,000',
          
          // Construction Status and Progress (THIS IS THE KEY DIFFERENCE FROM BUYSMARTPH)
          constructionStatus: 'in_progress',
          constructionProgress: constructionProgress,
          statusInfo: statusInfo,
          constructionMilestones: constructionMilestones,
          
          // Dates
          purchaseDate: formatDate(submissionData.submissionDate || submissionData.createdAt),
          constructionStartDate: '2024-01-15',
          expectedCompletion: '2025-12-31',
          expectedTurnover: '2026-01-15',
          
          // Escrow Information
          escrowStatus: {
            totalAmount: '₱3,100,000',
            releasedAmount: '₱1,300,000',
            heldAmount: '₱1,800,000',
            releasedPercentage: 42
          },
          
          // Property Documents (delivered by developer)
          propertyDocuments: [
            { 
              id: 'doc1',
              name: 'Purchase Contract', 
              status: 'delivered', 
              date: '2024-01-20', 
              downloadUrl: '#',
              type: 'contract'
            },
            { 
              id: 'doc2',
              name: 'Building Permit', 
              status: 'delivered', 
              date: '2024-02-05', 
              downloadUrl: '#',
              type: 'permit'
            },
            { 
              id: 'doc3',
              name: 'Title Transfer Documents', 
              status: 'processing', 
              date: '2024-07-20', 
              downloadUrl: null,
              type: 'title'
            }
          ]
        };

        properties.push(property);
      }

      console.log('Final purchased properties for construction tracking:', properties);
      setPurchasedProperties(properties);
      
    } catch (error) {
      console.error('Error fetching purchased properties:', error);
      setError('Failed to load your purchased properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, calculateConstructionProgress, getConstructionStatus, formatDate]);

  // Load purchased properties when user is available
  useEffect(() => {
    if (currentUser) {
      fetchPurchasedProperties();
      
      // Initialize sample construction media uploads
      const sampleMedia = [
        {
          id: 'media1',
          milestoneId: 'ms1',
          fileName: 'foundation_complete.jpg',
          fileType: 'image/jpeg',
          url: '/api/placeholder/400/300',
          uploadDate: '2024-03-15',
          description: 'Foundation work completed and inspected'
        },
        {
          id: 'media2',
          milestoneId: 'ms1',
          fileName: 'site_preparation.jpg', 
          fileType: 'image/jpeg',
          url: '/api/placeholder/400/300',
          uploadDate: '2024-03-10',
          description: 'Site clearing and preparation'
        },
        {
          id: 'media3',
          milestoneId: 'ms2',
          fileName: 'structural_frame.jpg',
          fileType: 'image/jpeg', 
          url: '/api/placeholder/400/300',
          uploadDate: '2024-06-25',
          description: 'Steel framework installation progress'
        }
      ];
      setMediaUploads(sampleMedia);
    }
  }, [currentUser, fetchPurchasedProperties]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RiLoader4Line className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p>Loading your properties...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RiAlertLine className="text-4xl text-error mx-auto mb-4" />
          <p className="text-error font-medium">{error}</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => {
              setError(null);
              fetchPurchasedProperties();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    const project = purchasedProperties.find(p => p.id === selectedProject);
    
    return (
      <div className="space-y-6">
        {/* Back button and view mode selector */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedProject(null)}
            className="btn btn-ghost btn-sm"
          >
            <RiArrowLeftLine className="w-4 h-4" />
            Back to My Properties
          </button>
          <div className="tabs">
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'timeline' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <RiTimeLine className="w-4 h-4 mr-2" />
              Timeline
            </a>
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'escrow' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('escrow')}
            >
              <RiMoneyDollarCircleLine className="w-4 h-4 mr-2" />
              Payments
            </a>
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'documents' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('documents')}
            >
              <RiFileTextLine className="w-4 h-4 mr-2" />
              Documents
            </a>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <BuyerTimelineView
            propertyInfo={{
              name: project.projectName || project.name,
              location: project.location || project.city,
              unit: project.unit || `Unit ${project.unitNumber || 'N/A'}`,
              startDate: project.constructionStartDate || '2024-01-15',
              expectedCompletion: project.expectedCompletion || '2025-12-31',
              totalInvestment: project.totalPrice || project.price || '₱2,500,000',
              progress: project.constructionProgress
            }}
            constructionMilestones={project.constructionMilestones || []}
            mediaUploads={mediaUploads}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        )}

        {/* Escrow View */}
        {viewMode === 'escrow' && (
          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Milestone Payment Status</h3>
                
                {/* Payment Summary */}
                <div className="stats shadow bg-base-100">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <RiMoneyDollarCircleLine className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Total Investment</div>
                    <div className="stat-value text-primary">{project.escrowStatus?.totalAmount || '₱3.1M'}</div>
                    <div className="stat-desc">Property purchase amount</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-success">
                      <RiLockUnlockLine className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Released</div>
                    <div className="stat-value text-success">{project.escrowStatus?.releasedAmount || '₱1.3M'}</div>
                    <div className="stat-desc">{project.escrowStatus?.releasedPercentage || 42}% of total amount</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-figure text-warning">
                      <RiLockLine className="w-8 h-8" />
                    </div>
                    <div className="stat-title">In Escrow</div>
                    <div className="stat-value text-warning">{project.escrowStatus?.heldAmount || '₱1.8M'}</div>
                    <div className="stat-desc">{100 - (project.escrowStatus?.releasedPercentage || 42)}% held securely</div>
                  </div>
                </div>

                {/* Payment Timeline */}
                <div className="space-y-4 mt-6">
                  {[
                    { milestone: 'Foundation Complete', amount: '₱500,000', status: 'released', date: '2024-03-20' },
                    { milestone: 'Structure Framework', amount: '₱800,000', status: 'released', date: '2024-06-30' },
                    { milestone: 'Roofing Work', amount: '₱600,000', status: 'pending', date: '2024-09-15' },
                    { milestone: 'Interior Work', amount: '₱750,000', status: 'locked', date: '2024-11-30' },
                    { milestone: 'Final Completion', amount: '₱450,000', status: 'locked', date: '2025-02-15' }
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.status === 'released' ? 'bg-success text-success-content' :
                          payment.status === 'pending' ? 'bg-warning text-warning-content' : 'bg-base-300'
                        }`}>
                          {payment.status === 'released' ? (
                            <RiCheckboxCircleLine className="w-5 h-5" />
                          ) : (
                            <RiLockLine className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{payment.milestone}</h4>
                          <p className="text-sm text-base-content/70">Target: {payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{payment.amount}</div>
                        <div className={`badge ${
                          payment.status === 'released' ? 'badge-success' :
                          payment.status === 'pending' ? 'badge-warning' : 'badge-outline'
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents View */}
        {viewMode === 'documents' && (
          <BuyerDocumentViewer
            propertyInfo={{
              name: project.projectName || project.name,
              location: project.location || project.city,
              unit: project.unit || `Unit ${project.unitNumber || 'N/A'}`
            }}
            buyerDocuments={project.propertyDocuments || []}
            documentStatuses={{
              contracts: { total: 2, submitted: 2, processing: 0, delivered: 2 },
              permits: { total: 1, submitted: 1, processing: 0, delivered: 1 },
              titles: { total: 1, submitted: 1, processing: 1, delivered: 0 },
              receipts: { total: 2, submitted: 2, processing: 0, delivered: 2 }
            }}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* My Purchased Properties Dashboard */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Property Construction Progress</h2>
          <div className="flex items-center gap-4">
            <NotificationSystem 
              notifications={notifications} 
              setNotifications={setNotifications} 
              userRole="buyer" 
            />
            <div className="stats shadow bg-gradient-to-r from-primary to-secondary text-primary-content">
              <div className="stat">
                <div className="stat-title text-primary-content/80">Properties Owned</div>
                <div className="stat-value">{purchasedProperties.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title text-primary-content/80">Completed</div>
                <div className="stat-value text-success">
                  {purchasedProperties.filter(p => p.constructionProgress >= 100).length}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-primary-content/80">In Construction</div>
                <div className="stat-value text-info">
                  {purchasedProperties.filter(p => p.constructionProgress < 100).length}
                </div>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : purchasedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProperties.map((property) => (
              <div 
                key={property.id} 
                className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border ${property.statusInfo.bgColor}`}
                onClick={() => setSelectedProject(property.id)}
              >
                <figure className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <RiBuildingLine className="text-6xl text-primary/60" />
                </figure>
                <div className="card-body p-6">
                  <h2 className="card-title flex items-center justify-between">
                    {property.projectName}
                    <div className={`badge ${property.statusInfo.badge}`}>
                      {property.statusInfo.text}
                    </div>
                  </h2>
                  
                  <div className="space-y-2 text-sm text-base-content/70">
                    <p>📍 {property.location}</p>
                    <p>🏠 {property.unit}</p>
                    <p>💰 {property.totalPrice}</p>
                    <p>📅 Purchased: {property.purchaseDate}</p>
                    <p>🏗️ Expected Completion: {property.expectedCompletion}</p>
                  </div>

                  {/* Construction Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Construction Progress</span>
                      <span className="text-sm font-bold">{property.constructionProgress}%</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={property.constructionProgress} 
                      max="100"
                    ></progress>
                  </div>

                  <div className="card-actions justify-between items-center mt-4">
                    <div className="flex gap-1">
                      {property.constructionProgress >= 100 && <RiStarFill className="w-4 h-4 text-success" />}
                      <RiShieldCheckLine className="w-4 h-4 text-primary" />
                      <RiEyeLine className="w-4 h-4 text-info" />
                    </div>
                    <button className="btn btn-primary btn-sm">
                      Track Construction
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <RiFileTextLine className="mx-auto text-6xl text-base-content/30 mb-6" />
            <h3 className="text-xl font-bold text-base-content mb-2">No Purchased Properties Yet</h3>
            <p className="text-base-content/60 mb-6">
              You don't have any purchased properties under construction yet. 
              Complete a property purchase through BuySmartPH first!
            </p>
            <button className="btn btn-primary">
              <RiContactsLine className="w-4 h-4 mr-2" />
              Go to BuySmartPH
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerBuildSafe;
