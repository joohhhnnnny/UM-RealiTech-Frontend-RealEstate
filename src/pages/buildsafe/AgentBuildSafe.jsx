import { useState, useEffect } from 'react';
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
  RiAlertLine
} from 'react-icons/ri';
import { projectService, STATIC_GUIDELINES } from '../../services/buildsafeService.js';

/**
 * AgentBuildSafe Component
 * Purpose: Shows construction progress for properties sold by this agent to their clients
 * Features: 
 * - View all client properties with BuildSafe protection
 * - Monitor construction progress for client satisfaction
 * - Track escrow releases and milestone completion
 * - Access client documents and provide support
 */
function AgentBuildSafe() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, escrow, documents
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientProperties, setClientProperties] = useState([]);

  // Mock agent ID - in real app, get from authentication
  const agentId = 'agent-001';

  // Load agent's client properties
  useEffect(() => {
    const loadClientProperties = async () => {
      try {
        setLoading(true);
        
        // Mock client properties sold by this agent with BuildSafe protection
        const mockClientProperties = [
          {
            id: 'client-prop-001',
            name: "Horizon Residences",
            unit: "Unit 12A - 2BR Deluxe",
            developer: "Premium Developers Inc.",
            developerLogo: "https://via.placeholder.com/60x40/3B82F6/FFFFFF?text=PDI",
            
            // Client Information
            clientName: "Juan & Maria Dela Cruz",
            clientEmail: "juan.delacruz@email.com",
            clientPhone: "+63 917 123 4567",
            purchaseDate: "December 15, 2024",
            clientId: "buyer-001",
            
            // Agent tracking
            agentId: agentId,
            agentName: "Sarah Johnson",
            commissionStatus: "Earned",
            
            // Construction & BuildSafe data
            constructionProgress: 55,
            status: "On Track",
            lastUpdate: "August 21, 2025",
            expectedTurnover: "December 20, 2025",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
            
            // BuildSafe Protection Details
            buildsafeProtection: {
              enabled: true,
              protectionLevel: "Premium",
              escrowAgent: "SecureEscrow Philippines Inc.",
              totalInvestment: "₱1,650,000",
              paidSoFar: "₱660,000",
              inEscrow: "₱990,000",
              nextRelease: "₱330,000"
            },

            // Milestone tracking for agent monitoring
            milestones: [
              {
                id: 1,
                title: "Land Development & Foundation",
                description: "Site preparation, excavation, foundation work completed",
                percentage: 15,
                completed: true,
                completedDate: "January 20, 2025",
                paymentAmount: "₱247,500",
                paymentReleased: true,
                verification: { 
                  verified: true, 
                  date: "January 22, 2025", 
                  by: "Municipal Engineer - Engr. Roberto Cruz" 
                },
                clientSatisfaction: "Excellent",
                media: [
                  "https://images.unsplash.com/photo-1541976590-713941681591?w=400&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop"
                ]
              },
              {
                id: 2,
                title: "Structural Framework & Columns",
                description: "Main building frame, reinforced columns, beams completed",
                percentage: 35,
                completed: true,
                completedDate: "March 15, 2025",
                paymentAmount: "₱412,500",
                paymentReleased: true,
                verification: { 
                  verified: true, 
                  date: "March 18, 2025", 
                  by: "Structural Engineer - Engr. Maria Santos" 
                },
                clientSatisfaction: "Very Good",
                media: [
                  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=300&fit=crop"
                ]
              },
              {
                id: 3,
                title: "Roofing & Exterior Walls",
                description: "Roof installation, exterior walls, weatherproofing",
                percentage: 55,
                completed: true,
                completedDate: "June 10, 2025",
                paymentAmount: "₱330,000",
                paymentReleased: false,
                verification: { 
                  verified: false, 
                  date: null, 
                  by: null 
                },
                clientSatisfaction: "Pending",
                status: "Awaiting Verification",
                media: [
                  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop"
                ]
              },
              {
                id: 4,
                title: "Interior Systems & MEP",
                description: "Electrical, plumbing, HVAC installation in progress",
                percentage: 75,
                completed: false,
                expectedDate: "September 15, 2025",
                paymentAmount: "₱412,500",
                paymentReleased: false,
                verification: { verified: false },
                clientSatisfaction: "Monitoring",
                status: "85% Complete - In Progress",
                media: []
              },
              {
                id: 5,
                title: "Finishing & Fixtures",
                description: "Interior finishing, painting, flooring, fixtures",
                percentage: 90,
                completed: false,
                expectedDate: "November 30, 2025",
                paymentAmount: "₱165,000",
                paymentReleased: false,
                verification: { verified: false },
                clientSatisfaction: "Pending",
                status: "Scheduled",
                media: []
              },
              {
                id: 6,
                title: "Final Inspection & Turnover",
                description: "Final quality inspection and property handover",
                percentage: 100,
                completed: false,
                expectedDate: "December 20, 2025",
                paymentAmount: "₱82,500",
                paymentReleased: false,
                verification: { verified: false },
                clientSatisfaction: "Pending",
                status: "Scheduled",
                media: []
              }
            ],

            // Document tracking for client support
            documents: [
              { 
                name: "Contract to Sell", 
                status: "delivered", 
                date: "January 8, 2025", 
                downloadUrl: "#",
                clientReceived: true,
                category: "Contract"
              },
              { 
                name: "Building Permits", 
                status: "delivered", 
                date: "January 15, 2025", 
                downloadUrl: "#",
                clientReceived: true,
                category: "Legal"
              },
              { 
                name: "Architectural Plans", 
                status: "delivered", 
                date: "January 18, 2025", 
                downloadUrl: "#",
                clientReceived: true,
                category: "Construction"
              },
              { 
                name: "Property Title Transfer", 
                status: "processing", 
                date: "Processing", 
                downloadUrl: null,
                clientReceived: false,
                category: "Ownership",
                estimatedDelivery: "August 30, 2025"
              },
              { 
                name: "Quality Certificates", 
                status: "processing", 
                date: "Processing", 
                downloadUrl: null,
                clientReceived: false,
                category: "Quality",
                estimatedDelivery: "September 15, 2025"
              }
            ],

            // Client communication & issues
            issues: [],
            clientInquiries: [
              {
                date: "August 15, 2025",
                inquiry: "When will the roofing payment be released?",
                response: "Pending third-party verification, expected within 5-7 days",
                status: "Responded"
              }
            ],
            lastClientContact: "August 18, 2025"
          },
          
          // Second client property
          {
            id: 'client-prop-002',
            name: "Vista Grande Townhomes",
            unit: "Unit 8B - 3BR Premium",
            developer: "Elite Development Group",
            developerLogo: "https://via.placeholder.com/60x40/10B981/FFFFFF?text=EDG",
            
            // Client Information
            clientName: "Robert & Anna Santos",
            clientEmail: "robert.santos@email.com",
            clientPhone: "+63 918 765 4321",
            purchaseDate: "February 10, 2025",
            clientId: "buyer-002",
            
            // Agent tracking
            agentId: agentId,
            agentName: "Sarah Johnson",
            commissionStatus: "Earned",
            
            // Construction & BuildSafe data
            constructionProgress: 30,
            status: "On Track",
            lastUpdate: "August 20, 2025",
            expectedTurnover: "June 15, 2026",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
            
            // BuildSafe Protection Details
            buildsafeProtection: {
              enabled: true,
              protectionLevel: "Standard",
              escrowAgent: "SecureEscrow Philippines Inc.",
              totalInvestment: "₱2,100,000",
              paidSoFar: "₱420,000",
              inEscrow: "₱1,680,000",
              nextRelease: "₱315,000"
            },

            // Early stage milestones
            milestones: [
              {
                id: 1,
                title: "Land Development & Foundation",
                description: "Site preparation and foundation work",
                percentage: 15,
                completed: true,
                completedDate: "June 30, 2025",
                paymentAmount: "₱315,000",
                paymentReleased: true,
                verification: { 
                  verified: true, 
                  date: "July 2, 2025", 
                  by: "Municipal Engineer" 
                },
                clientSatisfaction: "Good",
                media: [
                  "https://images.unsplash.com/photo-1590320515004-8f17b1e14c6c?w=400&h=300&fit=crop"
                ]
              },
              {
                id: 2,
                title: "Structural Framework",
                description: "Building frame and structural elements",
                percentage: 30,
                completed: false,
                expectedDate: "October 30, 2025",
                paymentAmount: "₱420,000",
                paymentReleased: false,
                verification: { verified: false },
                clientSatisfaction: "Monitoring",
                status: "In Progress - 60% Complete",
                media: []
              }
            ],

            documents: [
              { 
                name: "Contract to Sell", 
                status: "delivered", 
                date: "February 15, 2025", 
                downloadUrl: "#",
                clientReceived: true,
                category: "Contract"
              },
              { 
                name: "Building Permits", 
                status: "pending", 
                date: "Processing", 
                downloadUrl: null,
                clientReceived: false,
                category: "Legal",
                estimatedDelivery: "September 30, 2025"
              }
            ],

            issues: ["Minor delay in permit approval"],
            clientInquiries: [],
            lastClientContact: "August 10, 2025"
          }
        ];

        setClientProperties(mockClientProperties);
        setError(null);
      } catch (err) {
        console.error('Error loading client properties:', err);
        setError('Failed to load client properties. Please try again.');
        setClientProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadClientProperties();
  }, [agentId]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading your clients' properties...</p>
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
    const project = clientProperties.find(p => p.id === selectedProject);
    
    return (
      <div className="space-y-6">
        {/* Back button and view mode selector */}
        <div className="flex justify-between items-center sticky top-0 text-base-content bg-base-100 p-2 z-10">
          <button 
            onClick={() => setSelectedProject(null)}
            className="btn btn-ghost btn-sm"
          >
            ← Back to Client Properties
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

        {/* Project Header with Client Information */}
        <div className="card bg-base-200 shadow-xl">
          <figure className="h-64">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
          </figure>
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-lg text-primary font-semibold">{project.unit}</p>
                
                {/* Client Information */}
                <div className="bg-info/10 p-3 rounded-lg mt-3 mb-3">
                  <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
                    <RiContactsLine className="w-4 h-4" />
                    Client Information
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Client:</strong> {project.clientName}</p>
                    <p><strong>Email:</strong> {project.clientEmail}</p>
                    <p><strong>Phone:</strong> {project.clientPhone}</p>
                    <p><strong>Purchase Date:</strong> {project.purchaseDate}</p>
                    <p><strong>Last Contact:</strong> {project.lastClientContact}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className={`badge badge-lg ${
                    project.status === 'On Track' ? 'badge-success' : 
                    project.status === 'Delayed' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {project.status}
                  </div>
                  <div className="badge badge-outline">
                    BuildSafe {project.buildsafeProtection.protectionLevel}
                  </div>
                  <span className="text-sm">Last update: {project.lastUpdate}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
                  <span>Developer: {project.developer}</span>
                  <span>Expected: {project.expectedTurnover}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="stat p-0 text-right">
                  <div className="stat-title">Construction Progress</div>
                  <div className="stat-value text-primary">{project.constructionProgress}%</div>
                  <div className="stat-desc">Client Satisfaction: Good</div>
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
                
                {/* BuildSafe Protection Info */}
                <div className="mt-3 text-right">
                  <div className="text-xs text-base-content/60">BuildSafe Protection</div>
                  <div className="text-sm font-semibold">{project.buildsafeProtection.totalInvestment}</div>
                  <div className="text-xs">
                    Secured: {project.buildsafeProtection.inEscrow}
                  </div>
                </div>
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
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Property Documents</h3>
                
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
      {/* Client Properties Dashboard */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Client Properties with BuildSafe Protection</h2>
            <p className="text-base-content/60">Monitor construction progress for your clients' peace of mind</p>
          </div>
          <div className="stats shadow bg-primary text-primary-content">
            <div className="stat">
              <div className="stat-title">Active Client Properties</div>
              <div className="stat-value">{clientProperties.length}</div>
              <div className="stat-desc">BuildSafe Protected</div>
            </div>
          </div>
        </div>

        {/* Client Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientProperties.map((property) => (
            <div 
              key={property.id} 
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(property.id)}
            >
              <figure className="h-48">
                <img 
                  src={property.image} 
                  alt={property.name} 
                  className="w-full h-full object-cover" 
                />
              </figure>
              <div className="card-body">
                {/* Property Title */}
                <h2 className="card-title text-base">
                  {property.name}
                  <div className={`badge badge-sm ${
                    property.status === 'On Track' ? 'badge-success' : 
                    property.status === 'Delayed' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {property.status}
                  </div>
                </h2>
                <p className="text-sm text-base-content/70">{property.unit}</p>
                
                {/* Client Information */}
                <div className="bg-info/10 p-2 rounded-lg mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <RiContactsLine className="w-3 h-3 text-info" />
                    <span className="text-xs font-semibold text-info">Client</span>
                  </div>
                  <p className="text-sm font-semibold">{property.clientName}</p>
                  <p className="text-xs text-base-content/60">Purchased: {property.purchaseDate}</p>
                  <p className="text-xs text-base-content/60">Last Contact: {property.lastClientContact}</p>
                </div>

                {/* Construction Progress */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Construction Progress</span>
                    <span className="font-bold">{property.constructionProgress}%</span>
                  </div>
                  <progress 
                    className={`progress w-full ${
                      property.constructionProgress === 100 ? 'progress-success' : 
                      property.constructionProgress >= 70 ? 'progress-primary' : 
                      property.constructionProgress >= 40 ? 'progress-warning' : 
                      'progress-info'
                    }`}
                    value={property.constructionProgress} 
                    max="100"
                  ></progress>
                </div>

                {/* BuildSafe Protection & Financial Summary */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-base-content/60">Investment</p>
                    <p className="font-semibold">{property.buildsafeProtection.totalInvestment}</p>
                  </div>
                  <div>
                    <p className="text-base-content/60">In Escrow</p>
                    <p className="font-semibold text-info">{property.buildsafeProtection.inEscrow}</p>
                  </div>
                  <div>
                    <p className="text-base-content/60">Expected Turnover</p>
                    <p className="font-semibold">{property.expectedTurnover}</p>
                  </div>
                  <div>
                    <p className="text-base-content/60">Protection Level</p>
                    <p className="font-semibold text-success">{property.buildsafeProtection.protectionLevel}</p>
                  </div>
                </div>

                {/* Client Issues & Inquiries */}
                {(property.issues.length > 0 || property.clientInquiries.length > 0) && (
                  <div className="mt-2 p-2 bg-warning/10 rounded-lg">
                    <div className="text-xs">
                      {property.issues.length > 0 && (
                        <p className="text-warning">⚠️ {property.issues.length} issue(s)</p>
                      )}
                      {property.clientInquiries.length > 0 && (
                        <p className="text-info">💬 {property.clientInquiries.length} inquiry(ies)</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="card-actions justify-between mt-4">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`mailto:${property.clientEmail}`, '_blank');
                    }}
                  >
                    <RiContactsLine className="w-3 h-3" />
                    Contact Client
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <RiEyeLine className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-success/10 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-success">BuildSafe Protection</h3>
              <div className="stat">
                <div className="stat-value text-success">
                  {clientProperties.filter(p => p.buildsafeProtection.enabled).length}
                </div>
                <div className="stat-desc">Properties protected by BuildSafe escrow system</div>
              </div>
            </div>
          </div>
          
          <div className="card bg-info/10 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-info">Client Satisfaction</h3>
              <div className="stat">
                <div className="stat-value text-info">Good</div>
                <div className="stat-desc">Average client satisfaction with construction progress</div>
              </div>
            </div>
          </div>
          
          <div className="card bg-warning/10 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-warning">Pending Actions</h3>
              <div className="stat">
                <div className="stat-value text-warning">
                  {clientProperties.reduce((total, p) => total + p.clientInquiries.length + p.issues.length, 0)}
                </div>
                <div className="stat-desc">Client inquiries and issues requiring attention</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentBuildSafe;
