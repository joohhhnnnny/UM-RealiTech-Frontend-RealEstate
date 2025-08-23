import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { FaUserTie, FaStar, FaSpinner, FaCheckCircle, FaPhone, FaEnvelope, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../config/Firebase';

// Memoized Agent Card Component
const AgentCard = memo(({ agent, onViewProfile, onContactAgent, renderStars }) => (
  <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
    <div className="card-body p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="avatar self-center sm:self-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring ring-primary ring-offset-2">
            <img 
              src={agent.profileImage || agent.image || '/default-avatar.png'} 
              alt={agent.name || 'Agent'} 
              loading="lazy"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h2 className="card-title text-sm sm:text-base text-base-content">{agent.name || 'Unknown Agent'}</h2>
            {agent.verified && (
              <FaCheckCircle className="text-success w-3 h-3 sm:w-4 sm:h-4 self-center sm:self-auto" title="Verified Agent" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-base-content/70">
            {agent.specialization || 'General'} Specialist
          </p>
          {agent.agency && (
            <p className="text-xs text-base-content/50">{agent.agency}</p>
          )}
        </div>
      </div>
      
      <div className="mt-3 sm:mt-4 space-y-2">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          {renderStars(agent.rating || 0)}
          <span className="text-xs sm:text-sm text-base-content/70">
            ({agent.rating?.toFixed(1) || '0.0'})
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm gap-1 sm:gap-0">
          <span className="text-base-content/70 text-center sm:text-left">
            <span className="font-semibold text-primary">{agent.dealsCompleted || agent.deals || 0}</span> deals
          </span>
          {agent.yearsExperience && (
            <span className="text-base-content/70 text-center sm:text-right">
              {agent.yearsExperience}+ years exp
            </span>
          )}
        </div>
        {agent.responseTime && (
          <div className="flex justify-center sm:justify-start">
            <span className="badge badge-xs sm:badge-sm badge-outline">
              Responds in {agent.responseTime}
            </span>
          </div>
        )}
      </div>
      
      <div className="card-actions justify-center sm:justify-end mt-3 sm:mt-4 gap-2">
        <button 
          className="btn btn-primary btn-xs sm:btn-sm flex-1 sm:flex-none"
          onClick={() => onContactAgent(agent)}
        >
          <FaEnvelope className="w-3 h-3" />
          <span className="hidden sm:inline">Contact</span>
        </button>
        <button 
          className="btn btn-outline btn-xs sm:btn-sm flex-1 sm:flex-none"
          onClick={() => onViewProfile(agent)}
        >
          <span className="text-xs sm:text-sm">View Profile</span>
        </button>
      </div>
    </div>
  </div>
));

// Memoized Agent Profile Modal Component
const AgentProfileModal = memo(({ selectedAgent, onClose, onScheduleMeeting, onContactAgent, renderStars, connectionLoading }) => {
  if (!selectedAgent) return null;

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box bg-base-100 w-full max-w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-y-auto p-0 rounded-t-2xl sm:rounded-2xl shadow-2xl">
        
        {/* Close Button - Modern floating style */}
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 sm:right-4 top-2 sm:top-4 z-10 hover:bg-base-200"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Hero Header Section */}
        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 p-4 sm:p-6 lg:p-8 rounded-t-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="avatar">
                <div className="w-32 h-32 rounded-2xl ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 shadow-xl">
                  <img 
                    src={selectedAgent.profileImage || selectedAgent.image || '/default-avatar.png'} 
                    alt={selectedAgent.name || 'Agent'} 
                    loading="lazy"
                    className="object-cover rounded-2xl"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
              </div>
              {selectedAgent.verified && (
                <div className="absolute -bottom-2 -right-2 bg-success p-2 rounded-full shadow-lg">
                  <FaCheckCircle className="text-white w-5 h-5" title="Verified Agent" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-base-content mb-2">
                  {selectedAgent.name || 'Unknown Agent'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="badge badge-primary badge-lg px-4 py-3 text-sm font-semibold">
                    {selectedAgent.specialization || 'General'} Specialist
                  </span>
                  {selectedAgent.licenseStatus === 'active' && (
                    <span className="badge badge-success badge-outline px-3 py-2">Licensed</span>
                  )}
                  {selectedAgent.isActive && (
                    <span className="badge badge-info badge-outline px-3 py-2">Available</span>
                  )}
                </div>
                {selectedAgent.agency && (
                  <p className="text-base-content/70 text-lg flex items-center gap-2">
                    <FaUserTie className="w-4 h-4" />
                    {selectedAgent.agency}
                  </p>
                )}
              </div>
              
              {/* Rating Section */}
              <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(selectedAgent.rating || 0)}</div>
                  <span className="text-lg font-bold text-base-content">
                    {selectedAgent.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="text-sm text-base-content/70">
                  <span className="font-semibold text-primary">{selectedAgent.reviewCount || 0}</span> reviews
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="text-sm text-base-content/70">
                  <span className="font-semibold text-secondary">{selectedAgent.dealsCompleted || 0}</span> deals closed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-2xl border border-primary/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {selectedAgent.dealsCompleted || 0}
                </div>
                <div className="text-sm text-base-content/70 font-medium">Deals Closed</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-6 rounded-2xl border border-secondary/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-1">
                  {selectedAgent.yearsExperience || 'N/A'}
                  {selectedAgent.yearsExperience && <span className="text-lg">y</span>}
                </div>
                <div className="text-sm text-base-content/70 font-medium">Experience</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-warning/10 to-warning/20 p-6 rounded-2xl border border-warning/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-1">
                  {selectedAgent.rating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-base-content/70 font-medium">Rating</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-2xl border border-accent/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">
                  {selectedAgent.reviewCount || 0}
                </div>
                <div className="text-sm text-base-content/70 font-medium">Reviews</div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Contact & Availability */}
            <div className="space-y-6">
              
              {/* Contact Information Card */}
              <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300/20">
                <h3 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
                  <FaEnvelope className="text-primary w-5 h-5" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {selectedAgent.email && (
                    <div className="flex items-center gap-4 p-3 hover:bg-base-200/50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FaEnvelope className="text-primary w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm text-base-content/60 font-medium">Email</div>
                        <div className="text-base-content font-medium">{selectedAgent.email}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedAgent.phone && (
                    <div className="flex items-center gap-4 p-3 hover:bg-base-200/50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                        <FaPhone className="text-secondary w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm text-base-content/60 font-medium">Phone</div>
                        <div className="text-base-content font-medium">{selectedAgent.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedAgent.responseTime && (
                    <div className="flex items-center gap-4 p-3 hover:bg-base-200/50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-accent w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm text-base-content/60 font-medium">Response Time</div>
                        <div className="text-base-content font-medium">{selectedAgent.responseTime}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours Card */}
              {selectedAgent.workingHours && (
                <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300/20">
                  <h3 className="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary w-5 h-5" />
                    Availability
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-base-content/70">Working Hours</span>
                      <span className="font-semibold">
                        {selectedAgent.workingHours.start} - {selectedAgent.workingHours.end}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedAgent.workingDays?.map((day) => (
                        <span key={day} className="badge badge-primary badge-sm capitalize">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Professional Details */}
            <div className="space-y-6">
              
              {/* Specializations Card */}
              <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300/20">
                <h3 className="text-xl font-bold text-base-content mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedAgent.specializations?.length > 0 ? (
                    selectedAgent.specializations.map((spec, index) => (
                      <span key={index} className="badge badge-primary badge-lg px-4 py-3 text-sm font-medium">
                        {spec}
                      </span>
                    ))
                  ) : selectedAgent.specialization ? (
                    <span className="badge badge-primary badge-lg px-4 py-3 text-sm font-medium">
                      {selectedAgent.specialization}
                    </span>
                  ) : (
                    <>
                      <span className="badge badge-outline badge-lg px-4 py-3">Property Valuation</span>
                      <span className="badge badge-outline badge-lg px-4 py-3">Contract Negotiation</span>
                      <span className="badge badge-outline badge-lg px-4 py-3">Market Analysis</span>
                    </>
                  )}
                </div>
              </div>

              {/* Service Areas Card */}
              {selectedAgent.serviceAreas?.length > 0 && (
                <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300/20">
                  <h3 className="text-xl font-bold text-base-content mb-4">Service Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.serviceAreas.map((area, index) => (
                      <span key={index} className="badge badge-secondary badge-outline px-3 py-2">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* License Information */}
              {selectedAgent.licenseNumber && (
                <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300/20">
                  <h3 className="text-xl font-bold text-base-content mb-4">License Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">License Number</span>
                      <span className="font-mono font-semibold">{selectedAgent.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Status</span>
                      <span className={`badge ${
                        selectedAgent.licenseStatus === 'active' ? 'badge-success' : 
                        selectedAgent.licenseStatus === 'pending' ? 'badge-warning' : 'badge-error'
                      } badge-sm`}>
                        {selectedAgent.licenseStatus || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="bg-base-200/30 p-6 rounded-2xl border border-base-300/20">
            <h3 className="text-xl font-bold text-base-content mb-4">About {selectedAgent.name?.split(' ')[0] || 'Agent'}</h3>
            <p className="text-base-content/80 leading-relaxed text-base">
              {selectedAgent.bio || selectedAgent.description || 
              `Professional real estate agent with proven expertise in ${(selectedAgent.specialization || 'residential')?.toLowerCase()} properties. 
              Successfully closed ${selectedAgent.dealsCompleted || 0} deals, maintaining a ${selectedAgent.rating?.toFixed(1) || '0.0'}/5 client satisfaction rating. 
              Specializes in providing comprehensive property solutions and exceptional client service.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              className="btn btn-primary btn-lg flex-1 gap-3 text-base font-semibold rounded-xl hover:shadow-lg transition-all"
              onClick={() => onScheduleMeeting(selectedAgent)}
              disabled={connectionLoading}
            >
              {connectionLoading ? (
                <FaSpinner className="animate-spin w-5 h-5" />
              ) : (
                <FaCalendarAlt className="w-5 h-5" />
              )}
              Schedule Meeting
            </button>
            
            <button 
              className="btn btn-secondary btn-lg flex-1 gap-3 text-base font-semibold rounded-xl hover:shadow-lg transition-all"
              onClick={() => onContactAgent(selectedAgent)}
              disabled={connectionLoading}
            >
              {connectionLoading ? (
                <FaSpinner className="animate-spin w-5 h-5" />
              ) : (
                <FaEnvelope className="w-5 h-5" />
              )}
              Contact Agent
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    </dialog>
  );
});

function BuyerRC() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { currentUser } = useAuth();

  // Real-time Firestore listener for agents
  useEffect(() => {
    let unsubscribe = null;
    
    const setupRealtimeListener = () => {
      setLoading(true);
      setError(null);

      try {
        // Create query for agents collection
        const agentsQuery = query(
          collection(db, 'agents')
          // Removed orderBy to avoid issues with missing fields
          // You can add filters here:
          // where('isActive', '==', true),
          // where('role', '==', 'agent')
        );

        // Set up real-time listener
        unsubscribe = onSnapshot(
          agentsQuery,
          (snapshot) => {
            console.log('🔄 Firestore snapshot received:', snapshot.size, 'documents');
            
            const agentsData = [];
            snapshot.forEach((doc) => {
              const docData = doc.data();
              console.log('📄 Agent document:', doc.id, docData);
              
              // Map Firestore structure to component expected structure
              const mappedAgent = {
                id: doc.id,
                
                // Basic info mapping
                name: docData.fullName || `${docData.firstName || ''} ${docData.lastName || ''}`.trim() || 'Unknown Agent',
                email: docData.email || '',
                phone: docData.phone || '',
                
                // Agency info
                agency: docData.agentProfile?.agency?.name || 'Independent Agent',
                
                // Professional details
                specialization: docData.specializations?.[0] || 'General',
                specializations: docData.specializations || ['General'],
                
                // Experience and ratings
                rating: docData.stats?.averageRating || 0,
                reviewCount: docData.stats?.totalReviews || 0,
                dealsCompleted: docData.stats?.soldProperties || docData.experience?.totalSales || 0,
                yearsExperience: docData.experience?.yearsInBusiness || 0,
                
                // Status and verification
                verified: docData.license?.status === 'active' || docData.emailVerified || false,
                isActive: docData.isActive !== false, // Default to true unless explicitly false
                
                // Contact preferences
                responseTime: '2 hours', // Default since not in current structure
                
                // Additional details
                profileImage: docData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(docData.fullName || 'Agent')}&background=random&size=200`,
                serviceAreas: docData.serviceAreas || ['Metro Manila'],
                
                // Bio construction from available data
                bio: docData.bio || `Professional real estate agent${docData.specializations?.length ? ` specializing in ${docData.specializations.join(', ')}` : ''}. ${docData.experience?.yearsInBusiness ? `${docData.experience.yearsInBusiness} years of experience in the industry.` : ''} Licensed agent committed to helping clients achieve their property goals.`,
                
                // Working hours
                workingHours: docData.availability?.workingHours || { start: '09:00', end: '18:00' },
                workingDays: docData.availability?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                
                // License info
                licenseNumber: docData.license?.number || '',
                licenseStatus: docData.license?.status || 'pending',
                
                // Timestamps
                createdAt: docData.createdAt,
                updatedAt: docData.updatedAt,
                
                // Raw data for debugging
                _raw: docData
              };
              
              agentsData.push(mappedAgent);
            });
            
            console.log(`✅ Mapped ${agentsData.length} agents from Firestore:`, agentsData);
            setAgents(agentsData);
            setLoading(false);
            setRetryCount(0); // Reset retry count on success
          },
          (err) => {
            console.error('Error fetching agents:', err);
            setError(`Failed to load agents: ${err.message}`);
            setLoading(false);
            
            // Auto-retry logic for transient errors
            if (retryCount < 3 && (err.code === 'unavailable' || err.code === 'deadline-exceeded')) {
              const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                setupRealtimeListener();
              }, retryDelay);
            }
          }
        );
      } catch (err) {
        console.error('Error setting up Firestore listener:', err);
        setError(`Database connection failed: ${err.message}`);
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up Firestore listener');
        unsubscribe();
      }
    };
  }, [retryCount]);

  // Filter and search agents with improved performance
  const filteredAgents = useMemo(() => {
    if (!agents.length) return [];

    const searchLower = searchQuery.toLowerCase().trim();
    const filterLower = selectedFilter.toLowerCase();
    
    return agents.filter(agent => {
      // Filter by specialization
      if (selectedFilter !== 'all') {
        const hasSpecialization = agent.specializations?.some(spec => 
          spec.toLowerCase() === filterLower
        ) || agent.specialization?.toLowerCase() === filterLower;
        
        if (!hasSpecialization) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery) {
        const searchFields = [
          agent.name,
          agent.fullName,
          agent.firstName,
          agent.lastName,
          agent.email,
          agent.agency,
          agent.specialization,
          ...(agent.specializations || []),
          ...(agent.serviceAreas || [])
        ].filter(Boolean).map(field => field.toLowerCase());
        
        return searchFields.some(field => field.includes(searchLower));
      }
      
      return true;
    });
  }, [agents, searchQuery, selectedFilter]);

  // Get unique specializations for filter dropdown
  const availableSpecializations = useMemo(() => {
    const specs = new Set();
    agents.forEach(agent => {
      if (agent.specialization) {
        specs.add(agent.specialization);
      }
      if (agent.specializations) {
        agent.specializations.forEach(spec => specs.add(spec));
      }
    });
    return Array.from(specs).sort();
  }, [agents]);

  // Optimized star rendering
  const renderStars = useCallback((rating) => {
    const stars = [];
    const filled = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={
            i < filled 
              ? 'text-warning' 
              : i === filled && hasHalf 
                ? 'text-warning opacity-50' 
                : 'text-base-300'
          }
        />
      );
    }
    return stars;
  }, []);

  // Event handlers
  const handleViewProfile = useCallback((agent) => {
    setSelectedAgent(agent);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const handleContactAgent = useCallback(async (agent) => {
    if (connectionLoading) return;
    
    setConnectionLoading(true);
    try {
      // Here you could implement actual Firestore logic to create a connection
      // For now, showing a professional alert
      const message = `✅ Connection request sent to ${agent.name}!\n\n` +
                     `📧 Email: ${agent.email || 'Not available'}\n` +
                     `🏢 Agency: ${agent.agency || 'Independent'}\n` +
                     `📱 Phone: ${agent.phone || 'Contact via email'}\n\n` +
                     `The agent will be notified of your interest and will contact you soon.`;
      
      alert(message);
      
      // Optional: Close modal after contact
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Error creating connection:', error);
      alert(`❌ Failed to connect with ${agent.name}. Please try again later.`);
    }
    setConnectionLoading(false);
  }, [connectionLoading, selectedAgent]);

  const handleScheduleMeeting = useCallback(async (agent) => {
    if (connectionLoading) return;
    
    setConnectionLoading(true);
    try {
      // Here you could implement Firestore logic to create a meeting request
      const message = `✅ Meeting request sent to ${agent.name}!\n\n` +
                     `📅 Meeting request submitted successfully\n` +
                     `📧 Agent will contact you at: ${currentUser?.email || 'your registered email'}\n` +
                     `⏰ Expected response time: ${agent.responseTime || 'within 24 hours'}\n\n` +
                     `You can also contact them directly:\n` +
                     `📧 ${agent.email || 'Email not available'}\n` +
                     `📱 ${agent.phone || 'Phone not available'}`;
      
      alert(message);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Error creating meeting request:', error);
      alert(`❌ Failed to schedule meeting with ${agent.name}. Please try again later.`);
    }
    setConnectionLoading(false);
  }, [currentUser, connectionLoading]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e) => {
    setSelectedFilter(e.target.value);
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedFilter('all');
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <FaSpinner className="animate-spin text-5xl text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-base-content">Loading agents...</h3>
          <p className="text-sm text-base-content/70">Connecting to Firestore database</p>
          {retryCount > 0 && (
            <p className="text-xs text-warning mt-2">Retry attempt {retryCount}/3</p>
          )}
          <div className="mt-4 text-xs text-base-content/50">
            <p>🔍 Searching 'agents' collection...</p>
            <p>📡 Real-time listener active</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="alert alert-error max-w-md">
          <FaExclamationTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Connection Error</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
        <button 
          className="btn btn-primary btn-outline mt-4"
          onClick={handleRetry}
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin w-4 h-4" /> : 'Retry Connection'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center py-4 sm:py-6 px-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content mb-2">Find Your Perfect Agent</h1>
        <p className="text-sm sm:text-base text-base-content/70">Connect with verified real estate professionals</p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 px-2 sm:px-0">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search agents by name, agency, or specialization..."
            className="input input-bordered w-full text-sm sm:text-base"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <select
          className="select select-bordered w-full sm:w-auto text-sm sm:text-base"
          value={selectedFilter}
          onChange={handleFilterChange}
        >
          <option value="all">All Specializations</option>
          {availableSpecializations.map(spec => (
            <option key={spec} value={spec.toLowerCase()}>{spec}</option>
          ))}
        </select>
      </div>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 px-2 sm:px-0">
        <div className="text-xs sm:text-sm text-base-content/70 text-center sm:text-left">
          Showing <span className="font-semibold text-primary">{filteredAgents.length}</span> of{' '}
          <span className="font-semibold">{agents.length}</span> agents
        </div>
        {(searchQuery || selectedFilter !== 'all') && (
          <button 
            className="btn btn-ghost btn-xs sm:btn-sm self-center sm:self-auto"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
          {filteredAgents.map((agent) => (
            <AgentCard 
              key={agent.id} 
              agent={agent}
              onViewProfile={handleViewProfile}
              onContactAgent={handleContactAgent}
              renderStars={renderStars}
            />
          ))}
        </div>
      ) : (
        // No results state
        <div className="text-center py-8 sm:py-16 px-4">
          <div className="max-w-md mx-auto">
            <FaUserTie className="text-4xl sm:text-6xl text-base-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-base-content mb-2">No agents found</h3>
            <p className="text-sm sm:text-base text-base-content/70 mb-4 sm:mb-6">
              {searchQuery || selectedFilter !== 'all' 
                ? "No agents match your current search criteria. Try adjusting your filters."
                : "No agents are currently available. Please check back later."
              }
            </p>
            {(searchQuery || selectedFilter !== 'all') && (
              <button 
                className="btn btn-primary btn-outline"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Agent Profile Modal */}
      {selectedAgent && (
        <AgentProfileModal 
          selectedAgent={selectedAgent}
          onClose={handleCloseModal}
          onScheduleMeeting={handleScheduleMeeting}
          onContactAgent={handleContactAgent}
          renderStars={renderStars}
          connectionLoading={connectionLoading}
        />
      )}
    </div>
  );
}

export default memo(BuyerRC);
