import { useState } from 'react';
import { 
  RiContactsLine,
  RiEyeLine,
  RiMoneyDollarCircleLine,
  RiFlag2Line,
  RiCheckboxCircleLine,
  RiImageLine,
  RiDownloadLine,
  RiAlertLine
} from 'react-icons/ri';

function AgentBuildSafe() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, timeline, documents

  const clientProjects = [
    {
      id: 1,
      clientName: "Maria Rodriguez",
      clientEmail: "maria.r@email.com",
      clientPhone: "+63 917 123 4567",
      projectName: "Horizon Residences",
      unit: "Unit 12A",
      developer: "Premier Development Corp",
      developerLogo: "https://via.placeholder.com/60x40/3B82F6/FFFFFF?text=PDC",
      progress: 76,
      status: "On Track",
      lastUpdate: "July 25, 2025",
      lastContact: "July 24, 2025",
      concerns: 1,
      priority: "medium",
      image: "https://pueblodeoro.com/wp-content/uploads/2017/12/Sakura-1.jpg",
      nextAction: "Schedule site visit",
      commission: "₱480,000",
      commissionStatus: "50% paid",
      milestones: [
        { 
          title: "Land Development", 
          completed: true, 
          date: "Jan 2024", 
          percentage: 15,
          paymentReleased: true
        },
        { 
          title: "Foundation Complete", 
          completed: true, 
          date: "March 2024", 
          percentage: 25,
          paymentReleased: true
        },
        { 
          title: "Structure Complete", 
          completed: true, 
          date: "Sep 2024", 
          percentage: 50,
          paymentReleased: true
        },
        { 
          title: "Electrical & Plumbing", 
          completed: false, 
          date: "Oct 2025", 
          percentage: 75,
          paymentReleased: false
        },
        { 
          title: "Interior Finishing", 
          completed: false, 
          date: "Dec 2025", 
          percentage: 100,
          paymentReleased: false
        }
      ],
      documents: [
        { name: "Reservation Agreement", status: "verified" },
        { name: "Contract to Sell", status: "verified" },
        { name: "Bank Loan Approval", status: "pending" },
        { name: "Title Transfer", status: "pending" }
      ],
      recentUpdates: [
        {
          date: "July 25, 2025",
          type: "construction",
          message: "Building facade completion at 85%",
          impact: "On schedule"
        },
        {
          date: "July 23, 2025",
          type: "amenity",
          message: "Swimming pool tiling completed",
          impact: "Ahead of schedule"
        }
      ]
    },
    {
      id: 2,
      clientName: "John Smith",
      clientEmail: "john.smith@email.com",
      clientPhone: "+63 917 987 6543",
      projectName: "Sky Gardens Tower",
      unit: "Unit 25B",
      developer: "Urban Living Inc",
      developerLogo: "https://via.placeholder.com/60x40/10B981/FFFFFF?text=ULI",
      progress: 92,
      status: "Ahead of Schedule",
      lastUpdate: "July 24, 2025",
      lastContact: "July 23, 2025",
      concerns: 0,
      priority: "low",
      image: "https://abu-dhabi.realestate/wp-content/uploads/2021/08/Sky-Gardens-013.jpg",
      nextAction: "Prepare turnover docs",
      commission: "₱320,000",
      commissionStatus: "75% paid",
      // Similar milestone and document data
    }
  ];

  if (selectedProject) {
    const project = clientProjects.find(p => p.id === selectedProject);
    
    return (
      <div className="space-y-6">
        {/* Back button and view mode selector */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedProject(null)}
            className="btn btn-ghost btn-sm"
          >
            ← Back to Client Portfolio
          </button>
          <div className="tabs">
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </a> 
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'timeline' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </a> 
            <a 
              className={`tab tab-lg tab-bordered ${viewMode === 'documents' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('documents')}
            >
              Documents
            </a>
          </div>
        </div>

        {/* Project Header */}
        <div className="card bg-base-200 shadow-xl">
          <figure className="h-64">
            <img src={project.image} alt={project.projectName} className="w-full h-full object-cover" />
          </figure>
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{project.clientName}</h2>
                <p className="text-primary">{project.clientEmail}</p>
                <p className="text-lg font-semibold mt-2">{project.projectName} - {project.unit}</p>
                
                <div className="flex items-center gap-4 mt-4">
                  <img src={project.developerLogo} alt="Developer" className="h-10" />
                  <div>
                    <p className="font-medium">{project.developer}</p>
                    <p className="text-sm text-base-content/70">Developer</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Last Contact:</span>
                    <span className="font-medium">{project.lastContact}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">Next Action:</span>
                    <span className="font-medium text-primary">{project.nextAction}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <div className="stat p-0">
                    <div className="stat-title">Construction Progress</div>
                    <div className="stat-value text-primary">{project.progress}%</div>
                    <div className={`stat-desc ${
                      project.status === 'On Track' ? 'text-success' : 
                      project.status === 'Delayed' ? 'text-warning' : 'text-info'
                    }`}>
                      {project.status}
                    </div>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={project.progress} 
                    max="100"
                  ></progress>
                </div>
                
                <div className="stat p-0 text-right">
                  <div className="stat-title">Commission</div>
                  <div className="stat-value text-secondary">{project.commission}</div>
                  <div className="stat-desc">{project.commissionStatus}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview View */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Recent Updates */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4">Recent Updates</h3>
                <div className="space-y-4">
                  {project.recentUpdates.map((update, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-base-100 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          update.impact === 'Ahead of schedule' ? 'bg-success' : 
                          update.impact === 'On schedule' ? 'bg-info' : 'bg-warning'
                        } text-white`}>
                          {update.type === 'construction' ? (
                            <RiFlag2Line className="w-5 h-5" />
                          ) : (
                            <RiImageLine className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{update.message}</p>
                        <p className="text-sm text-base-content/70">{update.date}</p>
                        <div className={`badge badge-sm mt-1 ${
                          update.impact === 'Ahead of schedule' ? 'badge-success' : 
                          update.impact === 'On schedule' ? 'badge-info' : 'badge-warning'
                        }`}>
                          {update.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 flex-wrap">
              <button className="btn btn-primary">
                <RiContactsLine className="w-4 h-4" />
                Contact Client
              </button>
              <button className="btn btn-secondary">
                <RiMoneyDollarCircleLine className="w-4 h-4" />
                Update Payment Status
              </button>
              <button className="btn btn-warning">
                <RiFlag2Line className="w-4 h-4" />
                Report Issue
              </button>
              <button className="btn btn-ghost">
                <RiDownloadLine className="w-4 h-4" />
                Export Details
              </button>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4">Project Timeline</h3>
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg border border-base-300">
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
                        <p className="font-semibold">{milestone.title}</p>
                        <p className="text-sm text-base-content/70">Scheduled: {milestone.date}</p>
                        {milestone.paymentReleased && (
                          <p className="text-xs mt-1 text-success">Payment released</p>
                        )}
                      </div>
                      <div className={`badge ${
                        milestone.completed ? 'badge-success' : 'badge-warning'
                      }`}>
                        {milestone.completed ? 'Completed' : 'Upcoming'}
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
          <div className="space-y-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-4">Document Tracker</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Status</th>
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
                          <td>
                            <button className="btn btn-xs btn-primary">
                              <RiEyeLine className="w-3 h-3" />
                              View
                            </button>
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
                <h3 className="font-bold">Document Follow-ups</h3>
                <div className="text-xs">
                  {project.documents.filter(d => d.status === 'pending').length} pending documents require follow-up
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Dashboard Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Dashboard</h2>
        <div className="stats bg-base-200 shadow">
          <div className="stat">
            <div className="stat-title">Active Clients</div>
            <div className="stat-value text-primary">{clientProjects.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">This Month Sales</div>
            <div className="stat-value text-secondary">₱12.4M</div>
          </div>
          <div className="stat">
            <div className="stat-title">Pending Issues</div>
            <div className="stat-value text-warning">
              {clientProjects.reduce((sum, p) => sum + p.concerns, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Client Projects */}
      <div>
        <h3 className="text-xl font-bold mb-4">Client Portfolio</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientProjects.map((project) => (
            <div 
              key={project.id} 
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project.id)}
            >
              <figure className="h-48">
                <img src={project.image} alt={project.projectName} className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{project.clientName}</h3>
                    <p className="text-sm text-base-content/70">{project.clientEmail}</p>
                    <p className="text-primary font-medium">{project.projectName} - {project.unit}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`badge ${
                      project.priority === 'high' ? 'badge-error' : 
                      project.priority === 'medium' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {project.priority} priority
                    </div>
                    {project.concerns > 0 && (
                      <div className="badge badge-warning badge-sm">{project.concerns} concern(s)</div>
                    )}
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Progress:</span>
                    <span className="font-bold">{project.progress}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={project.progress} 
                    max="100"
                  ></progress>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span>Commission:</span>
                    <span className="font-bold text-secondary">{project.commission}</span>
                  </div>
                  <div className="text-xs text-base-content/70">{project.commissionStatus}</div>
                </div>

                <div className="bg-base-100 p-3 rounded-lg mt-4">
                  <p className="text-sm"><strong>Next Action:</strong> {project.nextAction}</p>
                  <p className="text-xs text-base-content/70 mt-1">Last Contact: {project.lastContact}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn btn-sm btn-primary flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle contact
                    }}
                  >
                    <RiContactsLine className="w-4 h-4" />
                    Contact
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project.id);
                    }}
                  >
                    <RiEyeLine className="w-4 h-4" />
                    Details
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

export default AgentBuildSafe;