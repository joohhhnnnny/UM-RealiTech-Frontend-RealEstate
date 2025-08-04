import React, { useState, useCallback, useMemo } from 'react';
import {
  RiBuildingLine,
  RiImageLine,
  RiAddLine,
  RiUploadCloud2Line,
  RiCheckboxCircleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiAlertLine
} from 'react-icons/ri';

// Memoized Stats Component
const ProjectStats = React.memo(({ projects }) => {
  const stats = useMemo(() => ({
    total: projects.length,
    onSchedule: projects.filter(p => p.status === 'On Track').length,
    pendingVerifications: projects.reduce((acc, proj) => 
      acc + proj.milestones.filter(m => m.completed && !m.verified).length, 0
    ),
    escrowFunds: projects.reduce((acc, proj) => 
      acc + parseFloat(proj.escrowStatus.held.replace(/[^\d.]/g, '')), 0
    ).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })
  }), [projects]);

  return (
    <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
      <div className="stat">
        <div className="stat-title">Active Projects</div>
        <div className="stat-value text-primary">{stats.total}</div>
        <div className="stat-desc">Projects in development</div>
      </div>
      
      <div className="stat">
        <div className="stat-title">On Schedule</div>
        <div className="stat-value text-success">{stats.onSchedule}</div>
        <div className="stat-desc">Projects meeting timeline</div>
      </div>
      
      <div className="stat">
        <div className="stat-title">Pending Verifications</div>
        <div className="stat-value text-warning">{stats.pendingVerifications}</div>
        <div className="stat-desc">Milestones needing review</div>
      </div>

      <div className="stat">
        <div className="stat-title">Escrow Funds</div>
        <div className="stat-value text-secondary">{stats.escrowFunds}</div>
        <div className="stat-desc">Held for milestones</div>
      </div>
    </div>
  );
});

// Memoized Milestone Component
const MilestoneCard = React.memo(({ milestone, onVerify }) => (
  <div className={`card bg-base-200 ${milestone.completed ? 'border-success' : ''}`}>
    <div className="card-body p-4">
      <div className="flex items-center justify-between">
        {milestone.completed ? (
          <div className={`badge gap-2 ${milestone.verified ? 'badge-success' : 'badge-warning'}`}>
            <RiCheckboxCircleLine />
            {milestone.verified ? 'Verified' : 'Pending Verification'}
          </div>
        ) : (
          <div className="badge badge-outline gap-2">
            Pending
          </div>
        )}
        {milestone.completed && !milestone.verified && (
          <button 
            className="btn btn-xs btn-primary"
            onClick={() => onVerify(milestone.id)}
          >
            Verify
          </button>
        )}
      </div>
      <h3 className="font-medium mt-2">{milestone.name}</h3>
      <div className="text-xs text-base-content/70">Target: {milestone.progressPercentage}%</div>
      {milestone.completedDate && (
        <div className="text-xs text-success">Completed: {milestone.completedDate}</div>
      )}
      {milestone.verifiedDate && (
        <div className="text-xs text-info">Verified: {milestone.verifiedDate}</div>
      )}
      <progress 
        className="progress progress-success w-full mt-2" 
        value={milestone.completed ? milestone.progressPercentage : 0} 
        max="100"
      />
      {milestone.paymentAmount && (
        <div className="text-xs mt-1">
          Payment: <span className="font-bold">{milestone.paymentAmount}</span>
        </div>
      )}
    </div>
  </div>
));

// Memoized Update Component
const UpdateCard = React.memo(({ update, index }) => (
  <div className="card bg-base-100">
    <div className="card-body p-4">
      <div className="flex justify-between">
        <div className="badge badge-neutral">{update.date}</div>
        <div className="badge badge-primary">{update.progress}%</div>
      </div>
      <p className="py-2">{update.description}</p>
      {update.media && (
        <div className="grid grid-cols-4 gap-2">
          {update.media.map((media, idx) => (
            <div key={idx} className="relative aspect-video">
              <img
                src={media}
                alt="Progress"
                className="w-full h-full object-cover rounded-box hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));

// Memoized Escrow Status Component
const EscrowStatus = React.memo(({ project }) => (
  <div className="card bg-base-200 mt-4">
    <div className="card-body p-4">
      <h3 className="font-bold flex items-center gap-2">
        <RiMoneyDollarCircleLine className="text-primary" />
        Escrow Status
      </h3>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <p className="text-sm">Funds Released</p>
          <p className="font-bold text-success">{project.escrowStatus.released}</p>
        </div>
        <div>
          <p className="text-sm">Held in Escrow</p>
          <p className="font-bold text-info">{project.escrowStatus.held}</p>
        </div>
        <div>
          <p className="text-sm">Next Release</p>
          <p className="font-bold text-warning">{project.escrowStatus.nextRelease}</p>
        </div>
        <div>
          <p className="text-sm">Total Investment</p>
          <p className="font-bold">{project.totalInvestment}</p>
        </div>
      </div>
    </div>
  </div>
));

// Memoized Document Status Component
const DocumentStatus = React.memo(({ documents }) => (
  <div className="card bg-base-200 mt-4">
    <div className="card-body p-4">
      <h3 className="font-bold flex items-center gap-2">
        <RiFileTextLine className="text-primary" />
        Document Status
      </h3>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, idx) => (
              <tr key={idx}>
                <td>{doc.name}</td>
                <td>
                  <span className={`badge ${
                    doc.status === 'verified' ? 'badge-success' : 
                    doc.status === 'pending' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  {doc.status === 'pending' && (
                    <button className="btn btn-xs btn-primary">Upload</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

// Memoized Project Card Component
const ProjectCard = React.memo(({ 
  project, 
  editingProject, 
  onEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onDelete, 
  onUpload, 
  onVerifyMilestone,
  onEditChange 
}) => {
  const isEditing = editingProject && editingProject.id === project.id;

  const handleEdit = useCallback(() => {
    onEdit(project);
  }, [project, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(project.id);
  }, [project.id, onDelete]);

  const handleUpload = useCallback(() => {
    onUpload(project);
  }, [project, onUpload]);

  const handleVerifyMilestone = useCallback((milestoneId) => {
    onVerifyMilestone(project.id, milestoneId);
  }, [project.id, onVerifyMilestone]);

  const handleNameChange = useCallback((e) => {
    onEditChange({ ...editingProject, name: e.target.value });
  }, [editingProject, onEditChange]);

  const handleLocationChange = useCallback((e) => {
    onEditChange({ ...editingProject, location: e.target.value });
  }, [editingProject, onEditChange]);

  const handleDescriptionChange = useCallback((e) => {
    onEditChange({ ...editingProject, description: e.target.value });
  }, [editingProject, onEditChange]);

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  className="input input-bordered w-full font-bold text-lg"
                  value={editingProject.name}
                  onChange={handleNameChange}
                />
                <input 
                  type="text" 
                  className="input input-bordered w-full"
                  value={editingProject.location}
                  onChange={handleLocationChange}
                />
                <textarea 
                  className="textarea textarea-bordered w-full"
                  value={editingProject.description}
                  onChange={handleDescriptionChange}
                />
              </div>
            ) : (
              <div>
                <h2 className="card-title">
                  {project.name}
                  <div className={`badge ${
                    project.status === 'On Track' ? 'badge-success' : 
                    project.status === 'Delayed' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {project.status}
                  </div>
                </h2>
                <p className="flex items-center gap-2 text-base-content/70">
                  <RiBuildingLine />
                  {project.location}
                </p>
                {project.description && (
                  <p className="text-base-content/70 mt-1">{project.description}</p>
                )}
                {project.startDate && (
                  <p className="text-sm text-base-content/50 mt-1">
                    Started: {project.startDate} | Expected: {project.expectedCompletion}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button className="btn btn-circle btn-success btn-sm" onClick={onSaveEdit}>
                  <RiSaveLine className="text-xl" />
                </button>
                <button className="btn btn-circle btn-ghost btn-sm" onClick={onCancelEdit}>
                  <RiCloseLine className="text-xl" />
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-circle btn-ghost btn-sm" onClick={handleEdit}>
                  <RiEditLine className="text-xl" />
                </button>
                <button 
                  className="btn btn-circle btn-error btn-ghost btn-sm"
                  onClick={handleDelete}
                  title="Delete Project"
                >
                  <RiDeleteBinLine className="text-xl" />
                </button>
                <button className="btn btn-circle btn-ghost btn-sm" onClick={handleUpload}>
                  <RiUploadCloud2Line className="text-xl" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="my-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Progress</span>
            <span className="font-semibold text-primary">{project.progress}%</span>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={project.progress} 
            max="100"
          />
        </div>

        <EscrowStatus project={project} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {project.milestones.map((milestone) => (
            <MilestoneCard 
              key={milestone.id} 
              milestone={milestone}
              onVerify={handleVerifyMilestone}
            />
          ))}
        </div>

        <DocumentStatus documents={project.documents} />

        <div className="collapse collapse-plus bg-base-200 mt-4">
          <input type="checkbox" /> 
          <div className="collapse-title text-xl font-medium">
            Recent Updates ({project.updates.length})
          </div>
          <div className="collapse-content">
            <div className="space-y-4">
              {project.updates.map((update, index) => (
                <UpdateCard key={index} update={update} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function ProjectDashboard() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Horizon Residences",
      location: "Makati City",
      description: "Luxury residential tower with 30 floors",
      startDate: "2025-01-15",
      expectedCompletion: "2026-12-31",
      progress: 65,
      status: "On Track",
      milestones: [
        { 
          id: 1, 
          name: 'Land Development', 
          progressPercentage: 15, 
          completed: true, 
          completedDate: '2025-01-30',
          verified: true,
          verifiedDate: '2025-02-05',
          paymentAmount: '₱500,000'
        },
        { 
          id: 2, 
          name: 'Foundation', 
          progressPercentage: 25, 
          completed: true, 
          completedDate: '2025-03-20',
          verified: true,
          verifiedDate: '2025-03-25',
          paymentAmount: '₱750,000'
        },
        { 
          id: 3, 
          name: 'Structure', 
          progressPercentage: 50, 
          completed: true, 
          completedDate: '2025-06-15',
          verified: false,
          paymentAmount: '₱1,200,000'
        },
        { 
          id: 4, 
          name: 'Electrical & Plumbing', 
          progressPercentage: 75, 
          completed: false, 
          paymentAmount: '₱900,000'
        },
        { 
          id: 5, 
          name: 'Interior Finishing', 
          progressPercentage: 100, 
          completed: false, 
          paymentAmount: '₱650,000'
        }
      ],
      updates: [
        {
          date: "2025-07-25",
          description: "Interior walls completion for floors 1-10",
          progress: 65,
          media: [
            "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29uc3RydWN0aW9uJTIwcHJvZ3Jlc3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1590644365607-4cf4ce0034a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29uc3RydWN0aW9uJTIwcHJvZ3Jlc3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
          ]
        }
      ],
      documents: [
        { name: "Building Permit", status: "verified" },
        { name: "Environmental Clearance", status: "verified" },
        { name: "Fire Safety Certificate", status: "pending" },
        { name: "Occupancy Permit", status: "pending" }
      ],
      escrowStatus: {
        released: "₱1,250,000",
        held: "₱2,750,000",
        nextRelease: "₱1,200,000"
      },
      totalInvestment: "₱4,000,000"
    }
  ]);

  const [showNewProject, setShowNewProject] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    description: '',
    startDate: '',
    expectedCompletion: '',
    milestones: []
  });
  
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    progressPercentage: '',
    paymentAmount: ''
  });

  const [progressUpdate, setProgressUpdate] = useState({
    description: '',
    progress: '',
    media: []
  });

  const milestoneTemplates = useMemo(() => [
    { id: 1, name: 'Land Development', progressPercentage: 15, paymentAmount: '₱500,000' },
    { id: 2, name: 'Foundation', progressPercentage: 25, paymentAmount: '₱750,000' },
    { id: 3, name: 'Structure', progressPercentage: 50, paymentAmount: '₱1,200,000' },
    { id: 4, name: 'Electrical & Plumbing', progressPercentage: 75, paymentAmount: '₱900,000' },
    { id: 5, name: 'Interior Finishing', progressPercentage: 100, paymentAmount: '₱650,000' }
  ], []);

  // Memoized handlers
  const handleCreateProject = useCallback((e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.location) {
      alert('Please fill in required fields');
      return;
    }

    const projectData = {
      id: Date.now(),
      ...newProject,
      progress: 0,
      status: "On Track",
      milestones: newProject.milestones.map((milestone, index) => ({
        id: index + 1,
        ...milestone,
        completed: false,
        completedDate: null,
        verified: false,
        verifiedDate: null
      })),
      updates: [],
      documents: [
        { name: "Building Permit", status: "pending" },
        { name: "Environmental Clearance", status: "pending" }
      ],
      escrowStatus: {
        released: "₱0",
        held: newProject.milestones.reduce((sum, m) => 
          sum + parseFloat(m.paymentAmount.replace(/[^\d.]/g, '')), 0
        ).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
        nextRelease: newProject.milestones[0]?.paymentAmount || "₱0"
      },
      totalInvestment: newProject.milestones.reduce((sum, m) => 
        sum + parseFloat(m.paymentAmount.replace(/[^\d.]/g, '')), 0
      ).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })
    };

    setProjects(prev => [projectData, ...prev]);
    setNewProject({
      name: '',
      location: '',
      description: '',
      startDate: '',
      expectedCompletion: '',
      milestones: []
    });
    setShowNewProject(false);
  }, [newProject]);

  const handleAddMilestone = useCallback(() => {
    if (!newMilestone.name || !newMilestone.progressPercentage || !newMilestone.paymentAmount) {
      alert('Please fill all milestone details');
      return;
    }

    setNewProject(prev => ({
      ...prev,
      milestones: [...prev.milestones, { ...newMilestone }]
    }));
    setNewMilestone({ name: '', progressPercentage: '', paymentAmount: '' });
  }, [newMilestone]);

  const handleRemoveMilestone = useCallback((index) => {
    setNewProject(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  }, []);

  const handleUseTemplate = useCallback(() => {
    setNewProject(prev => ({
      ...prev,
      milestones: [...milestoneTemplates]
    }));
  }, [milestoneTemplates]);

  const handleDeleteProject = useCallback((projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
    }
  }, []);

  const handleProgressUpload = useCallback((e) => {
    e.preventDefault();
    if (!progressUpdate.description || !progressUpdate.progress || !selectedProject) {
      alert('Please fill in all fields');
      return;
    }

    const update = {
      ...progressUpdate,
      date: new Date().toISOString().split('T')[0],
      progress: parseInt(progressUpdate.progress)
    };

    setProjects(prev => prev.map(project => {
      if (project.id === selectedProject.id) {
        return {
          ...project,
          updates: [update, ...project.updates],
          progress: parseInt(progressUpdate.progress)
        };
      }
      return project;
    }));

    setProgressUpdate({ description: '', progress: '', media: [] });
    setShowUploadModal(false);
    setSelectedProject(null);
  }, [progressUpdate, selectedProject]);

  const handleVerifyMilestone = useCallback((projectId, milestoneId) => {
  setProjects(prev => prev.map(project => {
    if (project.id === projectId) {
      const updatedMilestones = project.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return { 
            ...milestone, 
            verified: true,
            verifiedDate: new Date().toISOString().split('T')[0]
          };
        }
        return milestone;
      });

      // Find the next milestone to release funds for
      const nextMilestone = updatedMilestones.find(m => !m.verified && !m.completed);
      
      // Get the payment amount for the verified milestone
      const paymentAmount = parseFloat(
        project.milestones.find(m => m.id === milestoneId)?.paymentAmount.replace(/[^\d.]/g, '') || 0
      );
      
      // Calculate new escrow values
      const currentReleased = parseFloat(project.escrowStatus.released.replace(/[^\d.]/g, ''));
      const currentHeld = parseFloat(project.escrowStatus.held.replace(/[^\d.]/g, ''));
      
      return {
        ...project,
        milestones: updatedMilestones,
        escrowStatus: {
          released: (currentReleased + paymentAmount)
                    .toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
          held: (currentHeld - paymentAmount)
                .toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
          nextRelease: nextMilestone?.paymentAmount || "₱0"
        }
      };
    }
    return project;
  }));
}, []);

  const handleEditProject = useCallback((project) => {
    setEditingProject({ ...project });
  }, []);

  const handleSaveEdit = useCallback(() => {
    setProjects(prev => prev.map(project => 
      project.id === editingProject.id ? editingProject : project
    ));
    setEditingProject(null);
  }, [editingProject]);

  const handleCancelEdit = useCallback(() => {
    setEditingProject(null);
  }, []);

  const handleUploadProject = useCallback((project) => {
    setSelectedProject(project);
    setShowUploadModal(true);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">BuildSafe Developer Portal</h1>
          <p className="text-base-content/70">Manage projects with transparent tracking and escrow management</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="btn btn-primary gap-2"
        >
          <RiAddLine className="text-xl" />
          New Project
        </button>
      </div>

      <ProjectStats projects={projects} />

      {/* New Project Modal */}
      <dialog className={`modal ${showNewProject ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-4xl">
          <h2 className="text-xl font-bold mb-4">Create New Project</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Name *</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location *</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="Enter location"
                  value={newProject.location}
                  onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea 
                className="textarea textarea-bordered w-full" 
                placeholder="Project description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Start Date</span>
                </label>
                <input 
                  type="date" 
                  className="input input-bordered w-full"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Expected Completion</span>
                </label>
                <input 
                  type="date" 
                  className="input input-bordered w-full"
                  value={newProject.expectedCompletion}
                  onChange={(e) => setNewProject({...newProject, expectedCompletion: e.target.value})}
                />
              </div>
            </div>
            
            <div className="divider">Project Milestones</div>
            
            <div className="flex gap-2 mb-4">
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={handleUseTemplate}
              >
                Use Default Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <input 
                type="text" 
                className="input input-bordered" 
                placeholder="Milestone name"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
              />
              <input 
                type="number" 
                className="input input-bordered" 
                placeholder="Progress %"
                min="0"
                max="100"
                value={newMilestone.progressPercentage}
                onChange={(e) => setNewMilestone({...newMilestone, progressPercentage: e.target.value})}
              />
              <input 
                type="text" 
                className="input input-bordered" 
                placeholder="Payment Amount"
                value={newMilestone.paymentAmount}
                onChange={(e) => setNewMilestone({...newMilestone, paymentAmount: e.target.value})}
              />
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleAddMilestone}
              >
                <RiAddLine /> Add
              </button>
            </div>

            {newProject.milestones.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Added Milestones:</h4>
                {newProject.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded">
                    <span>{milestone.name} - {milestone.progressPercentage}% ({milestone.paymentAmount})</span>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRemoveMilestone(index)}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button 
                onClick={handleCreateProject}
                className="btn btn-primary"
              >
                <RiSaveLine /> Create Project
              </button>
              <button 
                type="button" 
                onClick={() => setShowNewProject(false)} 
                className="btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setShowNewProject(false)} />
      </dialog>

      {/* Progress Upload Modal */}
      <dialog className={`modal ${showUploadModal ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">Upload Progress Update</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Progress Description</span>
              </label>
              <textarea 
                className="textarea textarea-bordered w-full" 
                placeholder="Describe the progress made..."
                value={progressUpdate.description}
                onChange={(e) => setProgressUpdate({...progressUpdate, description: e.target.value})}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Progress Percentage</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered w-full" 
                placeholder="Enter progress percentage"
                min="0" 
                max="100"
                value={progressUpdate.progress}
                onChange={(e) => setProgressUpdate({...progressUpdate, progress: e.target.value})}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Upload Media</span>
              </label>
              <div className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center">
                <RiUploadCloud2Line className="text-4xl mx-auto mb-2 text-base-content/50" />
                <p className="text-base-content/70">Click to upload photos/videos</p>
                <input 
                  type="file" 
                  className="file-input file-input-ghost w-full max-w-xs mt-2" 
                  multiple 
                  accept="image/*,video/*" 
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const mediaUrls = files.map(file => URL.createObjectURL(file));
                    setProgressUpdate(prev => ({
                      ...prev,
                      media: [...prev.media, ...mediaUrls]
                    }));
                  }}
                />
              </div>
            </div>

            <div className="modal-action">
              <button 
                onClick={handleProgressUpload}
                className="btn btn-primary"
              >
                <RiUploadCloud2Line /> Upload Update
              </button>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)} 
                className="btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)} />
      </dialog>

      {/* Projects List */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            editingProject={editingProject}
            onEdit={handleEditProject}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onDelete={handleDeleteProject}
            onUpload={handleUploadProject}
            onVerifyMilestone={handleVerifyMilestone}
            onEditChange={setEditingProject}
          />
        ))}
      </div>
    </div>
  );
}

export default ProjectDashboard;