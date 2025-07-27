import React, { useState } from 'react';
import { 
  RiBuildingLine, 
  RiImageLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiEditLine,
  RiAddLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiCalendarLine,
  RiFileTextLine,
  RiCameraLine,
  RiUploadCloud2Line,
  RiFileWarningLine
} from 'react-icons/ri';

function DeveloperDevTrackr() {
  const [activeProject, setActiveProject] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const projects = [
    {
      id: 1,
      name: "Horizon Residences",
      location: "Makati City",
      progress: 76,
      totalUnits: 120,
      soldUnits: 98,
      startDate: "January 15, 2024",
      completionDate: "December 20, 2025",
      image: "https://pueblodeoro.com/wp-content/uploads/2017/12/Sakura-1.jpg",
      status: "On Schedule",
      budget: "₱2.4B",
      spent: "₱1.8B",
      pendingIssues: 2,
      projectPhotos: [],
      progressPhotos: [
        {
          date: "July 25, 2025",
          photos: ["https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Progress+Photo+1"],
          description: "Latest construction progress - Level 12 completion"
        }
      ],
      milestones: [
        { 
          title: "Foundation Work", 
          status: "completed", 
          date: "March 2024", 
          paymentTrigger: 25, 
          amount: "₱600M",
          paymentReleased: true,
          verificationPhotos: ["https://via.placeholder.com/800x600/10B981/FFFFFF?text=Foundation+Complete"],
          inspectionReport: "Completed as per specifications. Load-bearing capacity verified."
        },
        { 
          title: "Structural Framework", 
          status: "in-progress", 
          date: "July 2025", 
          paymentTrigger: 50, 
          amount: "₱600M",
          paymentReleased: false,
          verificationPhotos: [],
          inspectionReport: "In progress - Steel framework 80% complete"
        },
        { 
          title: "Interior Finishing", 
          status: "pending", 
          date: "October 2025", 
          paymentTrigger: 75, 
          amount: "₱600M",
          paymentReleased: false,
          verificationPhotos: [],
          inspectionReport: null
        },
        { 
          title: "Final Inspection", 
          status: "pending", 
          date: "December 2025", 
          paymentTrigger: 100, 
          amount: "₱600M",
          paymentReleased: false,
          verificationPhotos: [],
          inspectionReport: null
        }
      ],
      smartContract: {
        address: "0x1234...5678",
        totalAmount: "₱2.4B",
        releasedAmount: "₱600M",
        nextTrigger: 50,
        nextPayment: "₱600M"
      }
    }
  ];

  const flaggedIssues = [
    {
      id: 1,
      projectName: "Horizon Residences",
      reportedBy: "Unit 12A Owner - Maria Rodriguez",
      issue: "Delayed electrical installation in unit bathroom",
      severity: "Medium",
      status: "Under Review",
      aiDetected: false,
      requiresAction: true,
      date: "July 22, 2025",
      description: "Electrical outlets in master bathroom not installed according to timeline. Expected completion was July 15.",
      evidence: ["https://via.placeholder.com/200x150/EF4444/FFFFFF?text=Issue+Photo"],
      agentResponse: "Agent Maria Santos confirmed delay due to material shortage.",
      category: "Construction Delay"
    },
    {
      id: 2,
      projectName: "Horizon Residences", 
      reportedBy: "Site Inspector - AI Detection",
      issue: "Material quality concern - bathroom tiles batch mismatch",
      severity: "High",
      status: "Pending Response",
      date: "July 20, 2025",
      description: "AI quality check detected color variance in tile batch for units 12-15. Requires immediate inspection and potential replacement.",
      evidence: ["https://via.placeholder.com/200x150/EF4444/FFFFFF?text=AI+Detection"],
      agentResponse: null,
      category: "Quality Control"
    }
  ];

  const activeProjectData = projects.find(p => p.id === activeProject);

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`card w-80 bg-base-200 shadow-xl cursor-pointer transition-all ${
              activeProject === project.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveProject(project.id)}
          >
            <figure className="h-40">
              <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
            </figure>
            <div className="card-body p-4">
              <h3 className="card-title text-lg">{project.name}</h3>
              <p className="text-sm text-base-content/70">{project.location}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="badge badge-primary">{project.status}</span>
                <span className="text-sm font-medium">{project.progress}% Complete</span>
              </div>
              {project.pendingIssues > 0 && (
                <div className="badge badge-warning mt-2">
                  {project.pendingIssues} pending issue(s)
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Add New Project Card */}
        <div className="card w-80 bg-base-300 shadow-xl cursor-pointer hover:bg-base-200 transition-all border-2 border-dashed border-base-content/20">
          <div className="card-body p-4 flex items-center justify-center h-52">
            <div className="text-center">
              <RiAddLine className="w-12 h-12 mx-auto text-base-content/50 mb-2" />
              <p className="text-base-content/70">Create New Project</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <RiBuildingLine className="w-4 h-4 mr-2" />
          Project Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'smart-contracts' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('smart-contracts')}
        >
          <RiMoneyDollarCircleLine className="w-4 h-4 mr-2" />
          Smart Contracts
        </button>
        <button 
          className={`tab ${activeTab === 'issues' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          <RiErrorWarningLine className="w-4 h-4 mr-2" />
          Discrepancy Log ({flaggedIssues.length})
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Project Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Total Budget</div>
              <div className="stat-value text-primary">{activeProjectData.budget}</div>
              <div className="stat-desc">Spent: {activeProjectData.spent}</div>
            </div>
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Units</div>
              <div className="stat-value text-secondary">{activeProjectData.soldUnits}/{activeProjectData.totalUnits}</div>
              <div className="stat-desc">{((activeProjectData.soldUnits/activeProjectData.totalUnits)*100).toFixed(1)}% sold</div>
            </div>
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Progress</div>
              <div className="stat-value text-accent">{activeProjectData.progress}%</div>
              <div className="stat-desc">On track for completion</div>
            </div>
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Pending Issues</div>
              <div className="stat-value text-warning">{activeProjectData.pendingIssues}</div>
              <div className="stat-desc">Require attention</div>
            </div>
          </div>

          {/* Project Details Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{activeProjectData.name}</h2>
                  <p className="text-base-content/70 flex items-center gap-2">
                    <RiBuildingLine className="w-4 h-4" />
                    {activeProjectData.location}
                  </p>
                  <p className="text-sm text-base-content/70 mt-2 flex items-center gap-2">
                    <RiCalendarLine className="w-4 h-4" />
                    Started: {activeProjectData.startDate} | Expected: {activeProjectData.completionDate}
                  </p>
                </div>
                <div className="text-right">
                  <div className="badge badge-lg badge-primary">{activeProjectData.status}</div>
                  <p className="text-sm text-base-content/70 mt-2">Budget: {activeProjectData.budget}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{activeProjectData.progress}%</span>
                </div>
                <progress className="progress progress-primary w-full" value={activeProjectData.progress} max="100"></progress>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-base-100 p-3 rounded-lg">
                  <p className="text-xs text-base-content/70">Total Units</p>
                  <p className="text-lg font-bold">{activeProjectData.totalUnits}</p>
                </div>
                <div className="bg-base-100 p-3 rounded-lg">
                  <p className="text-xs text-base-content/70">Units Sold</p>
                  <p className="text-lg font-bold text-success">{activeProjectData.soldUnits}</p>
                </div>
                <div className="bg-base-100 p-3 rounded-lg">
                  <p className="text-xs text-base-content/70">Available</p>
                  <p className="text-lg font-bold text-info">{activeProjectData.totalUnits - activeProjectData.soldUnits}</p>
                </div>
                <div className="bg-base-100 p-3 rounded-lg">
                  <p className="text-xs text-base-content/70">Sales Rate</p>
                  <p className="text-lg font-bold text-accent">
                    {((activeProjectData.soldUnits/activeProjectData.totalUnits)*100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RiTimeLine className="w-5 h-5" />
                Project Milestones
              </h3>
              <ul className="timeline timeline-vertical">
                {activeProjectData.milestones.map((milestone, index) => (
                  <li key={index}>
                    <div className="timeline-middle">
                      <div className={`w-4 h-4 rounded-full ${
                        milestone.status === 'completed' 
                          ? 'bg-success' 
                          : milestone.status === 'in-progress' 
                          ? 'bg-warning' 
                          : 'bg-base-300'
                      }`}></div>
                    </div>
                    <div className={`${index % 2 === 0 ? 'timeline-start' : 'timeline-end'} mb-10`}>
                      <div className="card bg-base-100 shadow">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{milestone.title}</h4>
                              <p className="text-sm text-base-content/70">{milestone.date}</p>
                              <p className="text-xs text-primary">Payment trigger: {milestone.paymentTrigger}%</p>
                            </div>
                            <div className="text-right">
                              <div className={`badge badge-sm ${
                                milestone.status === 'completed' 
                                  ? 'badge-success' 
                                  : milestone.status === 'in-progress' 
                                  ? 'badge-warning' 
                                  : 'badge-ghost'
                              }`}>
                                {milestone.status}
                              </div>
                              <p className="text-sm font-medium mt-1">{milestone.amount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr className={milestone.status === 'completed' ? 'bg-success' : 'bg-base-300'} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'smart-contracts' && (
        <div className="space-y-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RiMoneyDollarCircleLine className="w-5 h-5" />
                Smart Contract Manager
              </h3>
              
              {/* Contract Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat bg-base-100 rounded-box">
                  <div className="stat-title">Total Contract Value</div>
                  <div className="stat-value text-primary">{activeProjectData.budget}</div>
                  <div className="stat-desc">Across all milestones</div>
                </div>
                <div className="stat bg-base-100 rounded-box">
                  <div className="stat-title">Released</div>
                  <div className="stat-value text-success">{activeProjectData.spent}</div>
                  <div className="stat-desc">
                    {((parseFloat(activeProjectData.spent.replace(/[₱,]/g, '')) / parseFloat(activeProjectData.budget.replace(/[₱,]/g, ''))) * 100).toFixed(1)}% of budget
                  </div>
                </div>
                <div className="stat bg-base-100 rounded-box">
                  <div className="stat-title">Remaining</div>
                  <div className="stat-value text-info">
                    ₱{((parseFloat(activeProjectData.budget.replace(/[₱,]/g, '')) - parseFloat(activeProjectData.spent.replace(/[₱,]/g, ''))) / 1000000000).toFixed(1)}B
                  </div>
                  <div className="stat-desc">Pending milestones</div>
                </div>
              </div>

              {/* Milestone Contracts */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Milestone Payment Contracts</h4>
                {activeProjectData.milestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-base-100 rounded-lg border-l-4 border-l-primary">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'completed' 
                            ? 'bg-success' 
                            : milestone.status === 'in-progress' 
                            ? 'bg-warning' 
                            : 'bg-base-300'
                        }`}></div>
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-base-content/70">
                            Payment Release Trigger: {milestone.paymentTrigger}% completion
                          </p>
                          <p className="text-xs text-base-content/70">Expected: {milestone.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{milestone.amount}</p>
                        <div className={`badge ${
                          milestone.status === 'completed' 
                            ? 'badge-success' 
                            : milestone.status === 'in-progress' 
                            ? 'badge-warning' 
                            : 'badge-ghost'
                        }`}>
                          {milestone.status === 'completed' ? 'Paid' : 
                           milestone.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </div>
                      </div>
                      {milestone.status === 'completed' && (
                        <RiCheckboxCircleLine className="w-6 h-6 text-success" />
                      )}
                      {milestone.status === 'in-progress' && (
                        <button className="btn btn-sm btn-primary">
                          Release Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contract Actions */}
              <div className="flex gap-2 mt-6">
                <button className="btn btn-primary">
                  <RiFileTextLine className="w-4 h-4" />
                  View Contract Details
                </button>
                <button className="btn btn-outline">
                  <RiCalendarLine className="w-4 h-4" />
                  Schedule Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Discrepancy Log</h3>
            <div className="flex gap-2">
              <select className="select select-sm select-bordered">
                <option>All Severities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select className="select select-sm select-bordered">
                <option>All Status</option>
                <option>Pending Response</option>
                <option>Under Review</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>

          {flaggedIssues.map((issue) => (
            <div key={issue.id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{issue.issue}</h3>
                      <div className={`badge ${
                        issue.severity === 'High' ? 'badge-error' : 
                        issue.severity === 'Medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {issue.severity} Priority
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-base-content/70">
                      <div>
                        <p><strong>Project:</strong> {issue.projectName}</p>
                        <p><strong>Reported by:</strong> {issue.reportedBy}</p>
                      </div>
                      <div>
                        <p><strong>Date:</strong> {issue.date}</p>
                        <p><strong>Category:</strong> {issue.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`badge badge-lg ${
                      issue.status === 'Pending Response' ? 'badge-warning' : 
                      issue.status === 'Under Review' ? 'badge-info' : 'badge-success'
                    }`}>
                      {issue.status}
                    </div>
                  </div>
                </div>

                <div className="bg-base-100 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{issue.description}</p>
                </div>

                {issue.evidence && issue.evidence.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Evidence</h4>
                    <div className="flex gap-2">
                      {issue.evidence.map((img, idx) => (
                        <img key={idx} src={img} alt="Evidence" className="w-24 h-24 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}

                {issue.agentResponse && (
                  <div className="bg-base-100 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Agent Response</h4>
                    <p className="text-sm">{issue.agentResponse}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="btn btn-sm btn-primary">
                    <RiEditLine className="w-4 h-4" />
                    Respond to Issue
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <RiCameraLine className="w-4 h-4" />
                    Add Documentation
                  </button>
                  <button className="btn btn-sm btn-ghost">
                    <RiFileTextLine className="w-4 h-4" />
                    Generate Report
                  </button>
                  {issue.status !== 'Resolved' && (
                    <button className="btn btn-sm btn-success">
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Issue Button */}
          <div className="card bg-base-300 shadow-xl cursor-pointer hover:bg-base-200 transition-all border-2 border-dashed border-base-content/20">
            <div className="card-body p-6 flex items-center justify-center">
              <div className="text-center">
                <RiAddLine className="w-8 h-8 mx-auto text-base-content/50 mb-2" />
                <p className="text-base-content/70">Report New Issue</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperDevTrackr;
