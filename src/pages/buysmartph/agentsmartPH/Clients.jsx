import { useState, useEffect, useCallback } from 'react'; 
import { motion } from "framer-motion";
import { 
  RiTeamLine,
  RiMessageLine,
  RiMailLine,
  RiFilterLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiLoader4Line,
  RiUserLine
} from 'react-icons/ri';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/Firebase';

function Clients() {
  const [currentUser, setCurrentUser] = useState(null);
  const [clientRequests, setClientRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Get current authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
      } else {
        // Fallback to localStorage for agent data
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

  // Fetch agent's properties
  const fetchAgentProperties = useCallback(async () => {
    if (!currentUser?.uid) return [];

    try {
      const properties = [];
      
      // Fetch from listings collection
      const listingsRef = collection(db, 'listings');
      const listingsQuery = query(listingsRef, where('agentId', '==', currentUser.uid));
      const listingsSnapshot = await getDocs(listingsQuery);
      
      listingsSnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data(),
          source: 'listings'
        });
      });

      // Fetch from properties collection
      const propertiesRef = collection(db, 'properties');
      const propertiesQuery = query(propertiesRef, where('agent_id', '==', currentUser.uid));
      const propertiesSnapshot = await getDocs(propertiesQuery);
      
      propertiesSnapshot.forEach((doc) => {
        properties.push({
          id: doc.id,
          ...doc.data(),
          source: 'properties'
        });
      });

      console.log('Agent properties found:', properties.length);
      return properties;
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      return [];
    }
  }, [currentUser?.uid]);

  // Helper function to format names professionally
  const formatClientName = useCallback((name) => {
    if (!name || name.trim() === '') {
      return 'Anonymous Client';
    }
    
    // Only return Anonymous Client for specific placeholder names
    const lowerName = name.toLowerCase().trim();
    if (lowerName === 'client' || lowerName === 'buyer' || lowerName === 'user' || lowerName === 'unknown user') {
      return 'Anonymous Client';
    }
    
    // For real names, just capitalize properly without removing words
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }, []);

  // Helper function to get user profile picture - using same logic as Sidebar.jsx
  const getPlaceholderAvatar = useCallback((role) => {
    // Using UI Avatars as a more reliable service with role-specific styling
    const avatarConfigs = {
      buyer: {
        name: 'Buyer',
        background: '3b82f6',
        color: 'ffffff',
        size: '400'
      },
      agent: {
        name: 'Agent',
        background: '10b981',
        color: 'ffffff',
        size: '400'
      },
      developer: {
        name: 'Developer',
        background: 'f59e0b',
        color: 'ffffff',
        size: '400'
      }
    };

    const config = avatarConfigs[role] || avatarConfigs.buyer;
    
    // Using UI Avatars - more reliable and professional looking
    return `https://ui-avatars.com/api/?name=${config.name}&background=${config.background}&color=${config.color}&size=${config.size}&font-size=0.6&rounded=true&bold=true`;
  }, []);

  const getUserProfilePicture = useCallback((userId) => {
    // Try to get from localStorage first (if user data exists)
    try {
      const userData = localStorage.getItem(`userProfile_${userId}`);
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.profilePicture && parsed.profilePicture !== '') {
          return parsed.profilePicture;
        }
      }
    } catch (error) {
      console.warn('Error accessing profile picture from localStorage:', error);
    }

    // Default: Return buyer placeholder avatar (same as Sidebar.jsx)
    return getPlaceholderAvatar('buyer');
  }, [getPlaceholderAvatar]);

  // Enhanced function to fetch client data with profile pictures
  const fetchClientSubmissions = useCallback(async (propertyIds) => {
    if (!propertyIds || propertyIds.length === 0) {
      console.log('No property IDs provided for client submissions');
      return [];
    }

    try {
      console.log('Fetching client submissions for property IDs:', propertyIds);
      const submissions = [];
      const submissionsRef = collection(db, 'documentSubmissions');
      
      // Fetch all document submissions
      console.log('Querying documentSubmissions collection...');
      const allSubmissionsSnapshot = await getDocs(submissionsRef);
      
      console.log('Found total submissions:', allSubmissionsSnapshot.size);
      
      for (const docSnap of allSubmissionsSnapshot.docs) {
        const submissionData = docSnap.data();
        
        // Check if this submission is for one of the agent's properties
        if (propertyIds.includes(submissionData.propertyId)) {
          console.log('Found matching submission for property:', submissionData.propertyId, 'by user:', submissionData.userId);
          console.log('Submission data available:', {
            userId: submissionData.userId,
            userName: submissionData.userName,
            userEmail: submissionData.userEmail,
            personalInfo: submissionData.personalInfo,
            availableFields: Object.keys(submissionData)
          });
          
          // Get user details with enhanced profile picture handling
          let userName = 'Unknown User';
          let userEmail = '';
          let profilePicture = null;

          // First, try to extract name from submission data itself
          if (submissionData.personalInfo?.fullName) {
            userName = submissionData.personalInfo.fullName;
          } else if (submissionData.personalInfo?.firstName || submissionData.personalInfo?.lastName) {
            userName = `${submissionData.personalInfo.firstName || ''} ${submissionData.personalInfo.lastName || ''}`.trim();
          } else if (submissionData.userName) {
            userName = submissionData.userName;
          } else if (submissionData.userEmail) {
            userName = submissionData.userEmail.split('@')[0];
          }

          userEmail = submissionData.userEmail || submissionData.personalInfo?.email || '';

          // Try to get profile picture from submission data first
          profilePicture = submissionData.personalInfo?.profilePicture || submissionData.profilePicture;
          
          // Try to get profile picture from submission data first
          profilePicture = submissionData.personalInfo?.profilePicture || submissionData.profilePicture;

          // Try to supplement with buyer collection data (if accessible)
          if (submissionData.userId) {
            try {
              const buyerDoc = await getDoc(doc(db, 'buyers', submissionData.userId));
              if (buyerDoc.exists()) {
                const buyerData = buyerDoc.data();
                console.log('Successfully fetched buyer data for enhanced details');
                
                // Only override if we don't have good data from submission
                if (userName === 'Unknown User' || !userName) {
                  userName = buyerData.personalInfo?.fullName || 
                           buyerData.buyerProfile?.fullName ||
                           `${buyerData.personalInfo?.firstName || ''} ${buyerData.personalInfo?.lastName || ''}`.trim() ||
                           buyerData.email?.split('@')[0];
                }
                
                // Use buyer email if we don't have one
                if (!userEmail) {
                  userEmail = buyerData.email || '';
                }
                
                // Use buyer profile picture if we don't have one
                if (!profilePicture) {
                  profilePicture = buyerData.personalInfo?.profilePicture || 
                                 buyerData.buyerProfile?.profilePicture ||
                                 buyerData.profilePicture;
                }
              } else {
                console.log('No buyer document found for user:', submissionData.userId);
              }
            } catch (error) {
              console.warn('Could not fetch buyer details (using submission data):', submissionData.userId, error.code);
              // We already have fallback data from submission, so this is not critical
            }
          }

          // Final fallback if we still don't have a good name
          if (!userName || userName === 'Unknown User') {
            userName = 'Client';
          }

          // Generate profile picture if not found
          if (!profilePicture) {
            profilePicture = getUserProfilePicture(submissionData.userId);
          }

          // Format the client name professionally
          const formattedName = formatClientName(userName);

          submissions.push({
            id: docSnap.id,
            userId: submissionData.userId,
            userName: formattedName,
            userEmail,
            profilePicture,
            propertyId: submissionData.propertyId,
            propertyTitle: submissionData.propertyTitle,
            status: submissionData.status || 'draft',
            submittedAt: submissionData.submittedAt,
            createdAt: submissionData.createdAt,
            updatedAt: submissionData.updatedAt,
            // Document completion tracking
            hasGovernmentId: !!submissionData.governmentIdPath,
            hasBirthCertificate: !!submissionData.birthCertificatePath,
            hasMarriageCertificate: !!submissionData.marriageCertificatePath,
            hasEmploymentDocs: !!submissionData.employmentCertificatePath || !!submissionData.businessRegistrationPath || !!submissionData.employmentContractPath,
            hasIncomeDocs: !!submissionData.itrPath || !!submissionData.auditedFinancialStatementPath || !!submissionData.remittanceProofPaths?.length,
            civilStatus: submissionData.civilStatus,
            employmentType: submissionData.employmentType,
            tinNumber: submissionData.tinNumber
          });
        }
      }

      console.log('Client submissions found:', submissions.length);
      return submissions;
    } catch (error) {
      console.error('Error fetching client submissions:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return [];
    }
  }, [getUserProfilePicture, formatClientName]);

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch agent's properties
        const properties = await fetchAgentProperties();
        
        // Extract property IDs
        const propertyIds = properties.map(p => p.id);
        
        // Fetch client submissions for these properties
        const submissions = await fetchClientSubmissions(propertyIds);
        setClientRequests(submissions);
        
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, fetchAgentProperties, fetchClientSubmissions]);

  // Calculate application progress percentage
  const calculateProgress = useCallback((client) => {
    let completed = 0;
    let total = 0;
    
    // Basic documents (always required)
    total += 3; // Government ID, Birth Certificate, TIN
    if (client.hasGovernmentId) completed++;
    if (client.hasBirthCertificate) completed++;
    if (client.tinNumber) completed++;
    
    // Civil status dependent
    if (client.civilStatus === 'married') {
      total += 1; // Marriage certificate
      if (client.hasMarriageCertificate) completed++;
    }
    
    // Employment dependent
    if (client.employmentType) {
      total += 2; // Employment docs + Income docs
      if (client.hasEmploymentDocs) completed++;
      if (client.hasIncomeDocs) completed++;
    }
    
    return Math.round((completed / total) * 100);
  }, []);

  // Get status badge info
  const getStatusInfo = useCallback((status, progress) => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          class: 'badge-success',
          icon: RiCheckboxCircleLine
        };
      case 'approved':
        return {
          label: 'Approved',
          class: 'badge-success',
          icon: RiCheckboxCircleLine
        };
      case 'rejected':
        return {
          label: 'Rejected',
          class: 'badge-error',
          icon: RiTimeLine
        };
      case 'draft':
      default:
        if (progress === 0) {
          return {
            label: 'Just Started',
            class: 'badge-info',
            icon: RiUserLine
          };
        } else if (progress < 50) {
          return {
            label: 'In Progress',
            class: 'badge-warning',
            icon: RiTimeLine
          };
        } else {
          return {
            label: 'Nearly Complete',
            class: 'badge-primary',
            icon: RiFileTextLine
          };
        }
    }
  }, []);

  // Filter and sort clients
  const filteredClients = clientRequests
    .filter(client => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return client.status === 'draft';
      if (statusFilter === 'submitted') return client.status === 'submitted';
      if (statusFilter === 'completed') return client.status === 'approved';
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt?.toDate() || b.createdAt?.toDate() || 0) - 
                 new Date(a.updatedAt?.toDate() || a.createdAt?.toDate() || 0);
        case 'progress':
          return calculateProgress(b) - calculateProgress(a);
        case 'name':
          return a.userName.localeCompare(b.userName);
        default:
          return 0;
      }
    });

  // Get time ago helper
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
        <p className="text-base-content/70">Loading client information...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <div className="bg-base-200/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <RiUserLine className="w-8 h-8 text-base-content/40" />
        </div>
        <h3 className="text-lg font-semibold text-base-content mb-2">Please log in</h3>
        <p className="text-base-content/60 text-sm">You need to be logged in to view your clients</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RiTeamLine className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Client Management</h2>
            <p className="text-sm text-base-content/60">
              {clientRequests.length} client{clientRequests.length !== 1 ? 's' : ''} interested in your properties
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-outline btn-sm gap-2">
              <RiFilterLine className="w-4 h-4" />
              Filter: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><button onClick={() => setStatusFilter('all')}>All Clients</button></li>
              <li><button onClick={() => setStatusFilter('active')}>Active Applications</button></li>
              <li><button onClick={() => setStatusFilter('submitted')}>Submitted</button></li>
              <li><button onClick={() => setStatusFilter('completed')}>Completed</button></li>
            </ul>
          </div>
          <div className="dropdown">
            <button tabIndex={0} className="btn btn-outline btn-sm gap-2">
              Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'progress' ? 'Progress' : 'Name'}
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
              <li><button onClick={() => setSortBy('recent')}>Recent</button></li>
              <li><button onClick={() => setSortBy('progress')}>Progress</button></li>
              <li><button onClick={() => setSortBy('name')}>Name</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {clientRequests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-lg border border-base-200">
            <div className="stat-title text-xs">Total Clients</div>
            <div className="stat-value text-2xl text-primary">{clientRequests.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-lg border border-base-200">
            <div className="stat-title text-xs">Active Applications</div>
            <div className="stat-value text-2xl text-warning">
              {clientRequests.filter(c => c.status === 'draft').length}
            </div>
          </div>
          <div className="stat bg-base-100 rounded-lg border border-base-200">
            <div className="stat-title text-xs">Submitted</div>
            <div className="stat-value text-2xl text-info">
              {clientRequests.filter(c => c.status === 'submitted').length}
            </div>
          </div>
          <div className="stat bg-base-100 rounded-lg border border-base-200">
            <div className="stat-title text-xs">Completed</div>
            <div className="stat-value text-2xl text-success">
              {clientRequests.filter(c => c.status === 'approved').length}
            </div>
          </div>
        </div>
      )}

      {/* Client Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-base-200/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <RiTeamLine className="w-8 h-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">No Clients Found</h3>
          <p className="text-base-content/60 text-sm">
            {statusFilter === 'all' 
              ? "No clients have started applications for your properties yet."
              : `No clients match the "${statusFilter}" filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const progress = calculateProgress(client);
            const statusInfo = getStatusInfo(client.status, progress);
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="card-body p-0">
                  {/* Client Header Section */}
                  <div className="p-6 pb-3">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Profile Picture */}
                      <div className="avatar flex-shrink-0">
                        <div className="w-16 h-16 rounded-full ring-2 ring-primary/20 bg-base-200">
                          <img 
                            src={client.profilePicture} 
                            alt={client.userName}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              // Fallback to buyer placeholder if image fails to load (same as Sidebar.jsx)
                              e.target.src = getPlaceholderAvatar('buyer');
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Client Info */}
                      <div className="flex-1 min-w-0 pr-2">
                        {/* Status Badge - positioned at top */}
                        <div className="flex justify-end mb-3">
                          <div className={`badge badge-sm ${statusInfo.class} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="text-xs">{statusInfo.label}</span>
                          </div>
                        </div>
                        
                        {/* Client Name and Details */}
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg leading-tight text-base-content break-words">
                            {client.userName}
                          </h3>
                          <p className="text-sm text-base-content/70">
                            {client.employmentType 
                              ? client.employmentType.charAt(0).toUpperCase() + client.employmentType.slice(1).replace('-', ' ')
                              : 'Property Applicant'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Application Progress Bar */}
                    <div className="bg-base-200/50 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-base-content/70 font-medium">Application Progress</span>
                        <span className="font-bold text-base-content">{progress}%</span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            progress === 100 ? 'bg-success' : 
                            progress >= 70 ? 'bg-primary' : 
                            progress >= 40 ? 'bg-warning' : 
                            'bg-info'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Property & Contact Information */}
                  <div className="px-6 pb-4">
                    <div className="bg-base-200/30 rounded-lg p-3 space-y-2">
                      {/* Applied Property */}
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-base-content/60 font-medium min-w-0 flex-shrink-0">Property:</span>
                        <span className="text-xs font-semibold text-base-content leading-tight flex-1">
                          {client.propertyTitle || 'Unknown Property'}
                        </span>
                      </div>
                      
                      {/* Civil Status */}
                      {client.civilStatus && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/60 font-medium">Status:</span>
                          <span className="text-xs font-medium text-base-content capitalize">
                            {client.civilStatus}
                          </span>
                        </div>
                      )}

                      {/* Contact Email */}
                      {client.userEmail && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-base-content/60 font-medium min-w-0 flex-shrink-0">Email:</span>
                          <span className="text-xs font-medium text-primary truncate flex-1" title={client.userEmail}>
                            {client.userEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Status Grid */}
                  <div className="px-6 pb-4">
                    <div className="text-xs text-base-content/70 font-medium mb-3">Document Checklist:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        client.hasGovernmentId ? 'bg-success/10 text-success' : 'bg-base-200/50 text-base-content/50'
                      }`}>
                        <RiCheckboxCircleLine className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs font-medium">Gov't ID</span>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        client.hasBirthCertificate ? 'bg-success/10 text-success' : 'bg-base-200/50 text-base-content/50'
                      }`}>
                        <RiCheckboxCircleLine className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs font-medium">Birth Cert</span>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        client.hasEmploymentDocs ? 'bg-success/10 text-success' : 'bg-base-200/50 text-base-content/50'
                      }`}>
                        <RiCheckboxCircleLine className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs font-medium">Employment</span>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        client.hasIncomeDocs ? 'bg-success/10 text-success' : 'bg-base-200/50 text-base-content/50'
                      }`}>
                        <RiCheckboxCircleLine className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs font-medium">Income</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 pb-4">
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm flex-1 gap-2">
                        <RiMessageLine className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                      <div className="flex gap-1">
                        {client.userEmail && (
                          <a
                            href={`mailto:${client.userEmail}?subject=Regarding your application for ${client.propertyTitle}&body=Hello ${client.userName},%0D%0A%0D%0AI hope this email finds you well. I wanted to follow up on your property application.%0D%0A%0D%0ABest regards`}
                            className="btn btn-outline btn-sm btn-square"
                            title="Send Email"
                          >
                            <RiMailLine className="w-4 h-4" />
                          </a>
                        )}
                        <button 
                          className="btn btn-outline btn-sm btn-square"
                          title="View Full Application"
                        >
                          <RiFileTextLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Last Activity */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between text-xs bg-base-200/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          client.status === 'submitted' ? 'bg-success' :
                          progress > 0 ? 'bg-primary' : 'bg-base-content/30'
                        }`}></div>
                        <span className="text-base-content/60 font-medium">Last activity</span>
                      </div>
                      <span className="text-base-content font-medium">
                        {getTimeAgo(client.updatedAt || client.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Clients;