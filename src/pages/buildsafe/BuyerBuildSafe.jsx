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

function BuyerBuildSafe() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, escrow, documents
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myProperties, setMyProperties] = useState([]);

  // Mock buyer ID - in real app, get from authentication
  const buyerId = 'buyer-001';

  // Load buyer's properties
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd get buyer's projects
        // For now, we'll use the static guidelines example
        const staticProperty = {
          id: STATIC_GUIDELINES.project.id,
          name: STATIC_GUIDELINES.project.name,
          unit: "Unit 12A - 2BR Deluxe (Guidelines Example)",
          developer: "Premier Development Corp (Guidelines)",
          developerLogo: "https://via.placeholder.com/60x40/3B82F6/FFFFFF?text=PDC",
          agent: "Maria Santos (Guidelines)",
          agentContact: "+63 917 123 4567",
          agentEmail: "maria.santos@premier.com",
          progress: STATIC_GUIDELINES.project.progress,
          expectedTurnover: "Q1 2025",
          lastUpdate: "July 25, 2025",
          image: "https://pueblodeoro.com/wp-content/uploads/2017/12/Sakura-1.jpg",
          status: STATIC_GUIDELINES.project.status,
          promisedLayout: "https://via.placeholder.com/400x300/E5E7EB/374151?text=Promised+Layout",
          actualPhotos: [
            "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Actual+Photo+1",
            "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Actual+Photo+2"
          ],
          milestones: STATIC_GUIDELINES.project.milestones.map(milestone => ({
            title: milestone.name,
            completed: milestone.completed,
            date: milestone.date,
            percentage: milestone.progressPercentage,
            paymentReleased: milestone.completed && milestone.verified,
            amount: milestone.paymentAmount,
            verification: { 
              verified: milestone.verified, 
              date: milestone.verified ? milestone.date : null, 
              by: milestone.verified ? "BuildSafe Inspector" : null 
            },
            media: milestone.completed ? [`https://via.placeholder.com/400x300/10B981/FFFFFF?text=${milestone.name.replace(/\s+/g, '+')}`] : []
          })),
          documents: [
            { name: "Reservation Agreement", status: "verified", date: "June 15, 2024", downloadUrl: "#" },
            { name: "Contract to Sell", status: "verified", date: "July 1, 2024", downloadUrl: "#" },
            { name: "Building Permits", status: "pending", date: "Processing", downloadUrl: null },
            { name: "Title Deeds", status: "pending", date: "Processing", downloadUrl: null }
          ],
          issues: ["Guidelines: Minor delay in electrical work documentation"],
          totalInvestment: STATIC_GUIDELINES.project.totalInvestment,
          paidSoFar: STATIC_GUIDELINES.project.escrowStatus.released,
          inEscrow: STATIC_GUIDELINES.project.escrowStatus.held,
          isStatic: true
        };

        // Try to get buyer's actual projects from Firebase
        try {
          const buyerProjects = await projectService.getBuyerProjects(buyerId);
          // Convert Firebase projects to buyer format if any exist
          const convertedProjects = buyerProjects.map(project => ({
            id: project.id,
            name: project.name,
            unit: `Unit ${project.unitNumber || 'TBD'} - ${project.unitType || '2BR'}`,
            developer: project.developerName || 'Developer Name',
            progress: project.progress,
            status: project.status,
            milestones: project.milestones || [],
            // Add other buyer-specific properties...
          }));
          
          setMyProperties([staticProperty, ...convertedProjects]);
        } catch (err) {
          console.error('Error loading buyer projects:', err);
          // Fallback to static data only
          setMyProperties([staticProperty]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to load properties. Please try again.');
        
        // Fallback static data
        setMyProperties([{
          id: 1,
          name: "Horizon Residences (Fallback)",
          unit: "Unit 12A - 2BR Deluxe",
          developer: "Premier Development Corp",
          progress: 76,
          status: "On Track",
          milestones: [
            { 
              title: "Land Development Complete", 
              completed: true, 
              date: "Jan 2024", 
              percentage: 15,
              paymentReleased: true,
              amount: "₱500,000",
              verification: { verified: true, date: "Jan 15, 2024", by: "BuildSafe Inspector" }
            },
            { 
              title: "Ready for Interior Designing", 
              completed: false, 
              date: "October 2025", 
              percentage: 75,
              paymentReleased: false,
              amount: "₱900,000",
              verification: { verified: false }
            },
            { 
              title: "Ready for Occupation", 
              completed: false, 
              date: "December 2025", 
              percentage: 100,
              paymentReleased: false,
              amount: "₱650,000",
              verification: { verified: false }
            }
          ]
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [buyerId]);

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
                  <div className="stat-title">Construction Progress</div>
                  <div className="stat-value text-primary">{project.progress}%</div>
                  <div className="stat-desc">Expected: {project.expectedTurnover}</div>
                </div>
                <progress 
                  className="progress progress-primary w-64" 
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
      {/* My Properties Dashboard */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Properties</h2>
          <div className="stats shadow bg-primary text-primary-content">
            <div className="stat">
              <div className="stat-title">Total Properties</div>
              <div className="stat-value">{myProperties.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((property) => (
            <div 
              key={property.id} 
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(property.id)}
            >
              <figure className="h-48">
                <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <h2 className="card-title">
                  {property.name}
                  <div className={`badge ${
                    property.status === 'On Track' ? 'badge-success' : 
                    property.status === 'Delayed' ? 'badge-warning' : 'badge-info'
                  } p-4 text-xs`}>
                    {property.status}
                  </div>
                </h2>
                <p>{property.unit}</p>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Construction Progress</span>
                    <span className="font-bold">{property.progress}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={property.progress} 
                    max="100"
                  ></progress>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm">Expected Turnover</p>
                    <p className="font-semibold">{property.expectedTurnover}</p>
                  </div>
                  <div>
                    <p className="text-sm">Total Investment</p>
                    <p className="font-semibold">{property.totalInvestment}</p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BuyerBuildSafe;