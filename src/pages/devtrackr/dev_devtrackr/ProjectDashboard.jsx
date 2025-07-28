import React, { useState } from 'react';
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
} from 'react-icons/ri';

function ProjectDashboard() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Green Residences Tower A",
      location: "Makati City",
      description: "Luxury residential tower with 30 floors",
      startDate: "2025-01-15",
      expectedCompletion: "2026-12-31",
      progress: 65,
      status: "in-progress",
      milestones: [
        { id: 1, name: 'Foundation', progressPercentage: 25, completed: true, completedDate: '2025-03-20' },
        { id: 2, name: 'Structure', progressPercentage: 50, completed: true, completedDate: '2025-06-15' },
        { id: 3, name: 'Finishing', progressPercentage: 75, completed: false, completedDate: null },
        { id: 4, name: 'Completion', progressPercentage: 100, completed: false, completedDate: null }
      ],
      updates: [
        {
          date: "2025-07-25",
          description: "Interior walls completion for floors 1-10",
          progress: 65,
          media: ["/sample/progress1.jpg", "/sample/progress2.jpg"]
        },
        {
          date: "2025-07-20",
          description: "Structural work completed for floors 11-15",
          progress: 60,
          media: ["/sample/structure1.jpg"]
        }
      ],
      comments: [
        {
          id: 1,
          user: "Buyer A",
          text: "Question about the window installations on floor 8",
          date: "2025-07-24",
          status: "pending"
        }
      ]
    },
    {
      id: 2,
      name: "Blue Ocean Condominiums",
      location: "Pasig City",
      description: "Seaside condominiums with premium amenities",
      startDate: "2025-03-01",
      expectedCompletion: "2026-08-31",
      progress: 30,
      status: "in-progress",
      milestones: [
        { id: 1, name: 'Foundation', progressPercentage: 25, completed: true, completedDate: '2025-05-15' },
        { id: 2, name: 'Structure', progressPercentage: 50, completed: false, completedDate: null },
        { id: 3, name: 'Finishing', progressPercentage: 75, completed: false, completedDate: null },
        { id: 4, name: 'Completion', progressPercentage: 100, completed: false, completedDate: null }
      ],
      updates: [
        {
          date: "2025-07-23",
          description: "Foundation work completed",
          progress: 30,
          media: ["/sample/foundation1.jpg"]
        }
      ],
      comments: []
    }
  ]);

  const [showNewProject, setShowNewProject] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  
  // Form states
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
    progressPercentage: ''
  });

  const [progressUpdate, setProgressUpdate] = useState({
    description: '',
    progress: '',
    media: []
  });

  const milestoneTemplates = [
    { id: 1, name: 'Foundation', progressPercentage: 25 },
    { id: 2, name: 'Structure', progressPercentage: 50 },
    { id: 3, name: 'Finishing', progressPercentage: 75 },
    { id: 4, name: 'Completion', progressPercentage: 100 }
  ];

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.location) {
      alert('Please fill in required fields');
      return;
    }

    const projectData = {
      id: Date.now(),
      ...newProject,
      progress: 0,
      status: "in-progress",
      milestones: newProject.milestones.map((milestone, index) => ({
        id: index + 1,
        ...milestone,
        completed: false,
        completedDate: null
      })),
      updates: [],
      comments: []
    };

    // Add new project at the beginning of the array instead of the end
    setProjects([projectData, ...projects]);
    setNewProject({
      name: '',
      location: '',
      description: '',
      startDate: '',
      expectedCompletion: '',
      milestones: []
    });
    setShowNewProject(false);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.progressPercentage) {
      alert('Please fill milestone details');
      return;
    }

    setNewProject({
      ...newProject,
      milestones: [...newProject.milestones, { ...newMilestone }]
    });
    setNewMilestone({ name: '', progressPercentage: '' });
  };

  const handleRemoveMilestone = (index) => {
    setNewProject({
      ...newProject,
      milestones: newProject.milestones.filter((_, i) => i !== index)
    });
  };

  const handleUseTemplate = () => {
    setNewProject({
      ...newProject,
      milestones: [...milestoneTemplates]
    });
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(projects.filter(project => project.id !== projectId));
    }
  };

  const handleProgressUpload = (e) => {
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

    setProjects(projects.map(project => {
      if (project.id === selectedProject.id) {
        return {
          ...project,
          updates: [update, ...project.updates], // Also add new updates at the top
          progress: parseInt(progressUpdate.progress)
        };
      }
      return project;
    }));

    setProgressUpdate({ description: '', progress: '', media: [] });
    setShowUploadModal(false);
    setSelectedProject(null);
  };

  const handleCommentAction = (projectId, commentId, action) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          comments: project.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, status: action };
            }
            return comment;
          })
        };
      }
      return project;
    }));
  };

  const handleEditProject = (project) => {
    setEditingProject({ ...project });
  };

  const handleSaveEdit = () => {
    setProjects(projects.map(project => 
      project.id === editingProject.id ? editingProject : project
    ));
    setEditingProject(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Dashboard</h1>
          <p className="text-base-content/70">Manage and track your real estate development projects</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="btn btn-primary gap-2"
        >
          <RiAddLine className="text-xl" />
          New Project
        </button>
      </div>

      {/* Project Stats */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
        <div className="stat">
          <div className="stat-title">Active Projects</div>
          <div className="stat-value text-primary">{projects.length}</div>
          <div className="stat-desc">Projects in development</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">On Schedule</div>
          <div className="stat-value text-success">
            {projects.filter(p => p.progress >= 30).length}
          </div>
          <div className="stat-desc">Projects meeting timeline</div>
        </div>
        
        <div className="stat">
          <div className="stat-title">Pending Reviews</div>
          <div className="stat-value text-warning">
            {projects.reduce((acc, proj) => acc + proj.comments.filter(c => c.status === 'pending').length, 0)}
          </div>
          <div className="stat-desc">Requiring attention</div>
        </div>
      </div>

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
              ></textarea>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
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
                value={newMilestone.progressPercentage}
                onChange={(e) => setNewMilestone({...newMilestone, progressPercentage: e.target.value})}
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
                    <span>{milestone.name} - {milestone.progressPercentage}%</span>
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
        <div className="modal-backdrop" onClick={() => setShowNewProject(false)}></div>
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
              ></textarea>
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
                <input type="file" className="file-input file-input-ghost w-full max-w-xs mt-2" multiple accept="image/*,video/*" />
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
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}></div>
      </dialog>

      {/* Projects List */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingProject && editingProject.id === project.id ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        className="input input-bordered w-full font-bold text-lg"
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                      />
                      <input 
                        type="text" 
                        className="input input-bordered w-full"
                        value={editingProject.location}
                        onChange={(e) => setEditingProject({...editingProject, location: e.target.value})}
                      />
                      <textarea 
                        className="textarea textarea-bordered w-full"
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                      ></textarea>
                    </div>
                  ) : (
                    <div>
                      <h2 className="card-title">
                        {project.name}
                        <div className="badge badge-primary">{project.status}</div>
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
                  {editingProject && editingProject.id === project.id ? (
                    <>
                      <button 
                        className="btn btn-circle btn-success btn-sm"
                        onClick={handleSaveEdit}
                      >
                        <RiSaveLine className="text-xl" />
                      </button>
                      <button 
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => setEditingProject(null)}
                      >
                        <RiCloseLine className="text-xl" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => handleEditProject(project)}
                      >
                        <RiEditLine className="text-xl" />
                      </button>
                      <button 
                        className="btn btn-circle btn-error btn-ghost btn-sm"
                        onClick={() => handleDeleteProject(project.id)}
                        title="Delete Project"
                      >
                        <RiDeleteBinLine className="text-xl" />
                      </button>
                      <button 
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowUploadModal(true);
                        }}
                      >
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
                ></progress>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {project.milestones.map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className={`card bg-base-200 ${
                      milestone.completed ? 'border-success' : ''
                    }`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center gap-2">
                        {milestone.completed ? (
                          <div className="badge badge-success gap-2">
                            <RiCheckboxCircleLine />
                            Completed
                          </div>
                        ) : (
                          <div className="badge badge-outline gap-2">
                            Pending
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium mt-2">{milestone.name}</h3>
                      <div className="text-xs text-base-content/70">Target: {milestone.progressPercentage}%</div>
                      {milestone.completedDate && (
                        <div className="text-xs text-success">Completed: {milestone.completedDate}</div>
                      )}
                      <progress 
                        className="progress progress-success w-full mt-2" 
                        value={milestone.completed ? milestone.progressPercentage : 0} 
                        max="100"
                      ></progress>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Updates */}
              <div className="collapse collapse-plus bg-base-200">
                <input type="checkbox" /> 
                <div className="collapse-title text-xl font-medium">
                  Recent Updates ({project.updates.length})
                </div>
                <div className="collapse-content">
                  <div className="space-y-4">
                    {project.updates.map((update, index) => (
                      <div key={index} className="card bg-base-100">
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
                    ))}
                  </div>
                </div>
              </div>

              {/* Buyer Comments Section */}
              {project.comments.length > 0 && (
                <>
                  <div className="divider"></div>
                  <div className="mt-6">
                    <h3 className="text-xl font-medium mb-3">Buyer Comments</h3>
                    {project.comments.map((comment) => (
                      <div key={comment.id} className={`alert shadow-lg mb-4 ${
                        comment.status === 'pending' ? 'alert-warning' : 
                        comment.status === 'approved' ? 'alert-success' : 'alert-error'
                      }`}>
                        <div className="flex-1">
                          <div>
                            <h3 className="font-bold">{comment.user}</h3>
                            <div className="text-xs opacity-70">{comment.date}</div>
                          </div>
                          <div className="py-2">{comment.text}</div>
                          {comment.status === 'pending' && (
                            <div className="flex gap-2">
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleCommentAction(project.id, comment.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-error"
                                onClick={() => handleCommentAction(project.id, comment.id, 'flagged')}
                              >
                                Flag Issue
                              </button>
                            </div>
                          )}
                          {comment.status !== 'pending' && (
                            <div className="badge badge-outline mt-2">
                              Status: {comment.status}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectDashboard;