import React, { useState, useRef } from 'react';
import {
  RiBuildingLine,
  RiTimeLine,
  RiAddLine,
  RiImageLine,
  RiVideoLine,
  RiUploadCloud2Line,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiAlertLine
} from 'react-icons/ri';

function TimelineTracker({ 
  projects, 
  selectedProject, 
  setSelectedProject,
  constructionMilestones,
  setConstructionMilestones,
  mediaUploads,
  setMediaUploads,
  notifications,
  setNotifications,
  uploadProgress,
  handleUploadMedia,
  handleMilestoneComplete
}) {
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ 
    name: '', 
    description: '', 
    percentage: 0, 
    paymentAmount: '' 
  });
  const mediaInputRef = useRef(null);

  const handleAddMilestone = async () => {
    if (!selectedProject || !newMilestone.name) return;
    
    try {
      const milestone = {
        id: `milestone-${Date.now()}`,
        ...newMilestone,
        projectId: selectedProject.id,
        completed: false,
        verified: false,
        createdDate: new Date().toLocaleDateString(),
        mediaFiles: [],
        paymentAmount: `₱${parseInt(newMilestone.paymentAmount).toLocaleString()}`
      };
      
      // Add to local state
      setConstructionMilestones(prev => [...prev, milestone]);
      
      // Send notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'milestone',
        message: `New milestone "${newMilestone.name}" added to ${selectedProject.name}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
      
      // Reset form
      setNewMilestone({ name: '', description: '', percentage: 0, paymentAmount: '' });
      setShowMilestoneModal(false);
      
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Project Timeline Tracker</h2>
        <div className="flex gap-2">
          <select 
            className="select select-bordered"
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === e.target.value);
              setSelectedProject(project);
            }}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => setShowMilestoneModal(true)}
            disabled={!selectedProject}
          >
            <RiAddLine className="w-4 h-4 mr-2" />
            Add Milestone
          </button>
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          {/* Project Overview */}
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{selectedProject.name}</h3>
                  <p className="text-base-content/70">{selectedProject.location}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>📅 Start: {selectedProject.startDate}</span>
                    <span>🎯 Expected: {selectedProject.expectedCompletion}</span>
                    <span>💰 Investment: {selectedProject.totalInvestment}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-2">{selectedProject.progress}%</div>
                  <div className={`badge ${
                    selectedProject.status === 'On Track' ? 'badge-success' :
                    selectedProject.status === 'Delayed' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {selectedProject.status}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{selectedProject.progress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full h-3" 
                  value={selectedProject.progress} 
                  max="100"
                ></progress>
              </div>
            </div>
          </div>

          {/* Construction Milestones Timeline */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <RiTimeLine />
                Construction Milestones Timeline
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-base-300"></div>
                
                {/* Default milestones from selected project */}
                {selectedProject.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="relative flex items-start mb-8">
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${
                      milestone.completed 
                        ? milestone.verified 
                          ? 'bg-success border-success' 
                          : 'bg-warning border-warning'
                        : 'bg-base-100 border-base-300'
                    } mr-6`}></div>
                    
                    {/* Milestone card */}
                    <div className="flex-1 card bg-base-100 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{milestone.name}</h4>
                              {milestone.completed ? (
                                <div className={`badge gap-2 ${milestone.verified ? 'badge-success' : 'badge-warning'}`}>
                                  <RiCheckboxCircleLine />
                                  {milestone.verified ? 'Verified' : 'Pending Verification'}
                                </div>
                              ) : (
                                <div className="badge badge-outline gap-2">
                                  <RiTimeLine />
                                  Pending
                                </div>
                              )}
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-base-content/70 mb-3">
                              <div>📊 Progress Target: {milestone.progressPercentage}%</div>
                              <div>💰 Payment: {milestone.paymentAmount}</div>
                              <div>📅 Due: {milestone.date}</div>
                            </div>
                          </div>
                          
                          <div className="dropdown dropdown-end">
                            <button className="btn btn-ghost btn-sm">
                              <RiImageLine />
                              Media
                            </button>
                            <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56">
                              <li>
                                <a onClick={() => {
                                  setSelectedProject({...selectedProject, currentMilestone: milestone.id});
                                  mediaInputRef.current?.click();
                                }}>
                                  <RiUploadCloud2Line />
                                  Upload Photos/Videos
                                </a>
                              </li>
                              <li>
                                <a onClick={() => {
                                  const mediaCount = mediaUploads.filter(u => u.milestoneId === milestone.id).length;
                                  alert(`${mediaCount} media files uploaded for this milestone`);
                                }}>
                                  <RiEyeLine />
                                  View Media ({mediaUploads.filter(u => u.milestoneId === milestone.id).length})
                                </a>
                              </li>
                              {!milestone.completed && (
                                <li>
                                  <a onClick={() => handleMilestoneComplete(milestone.id)}>
                                    <RiCheckboxCircleLine />
                                    Mark Complete
                                  </a>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Media preview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {mediaUploads
                            .filter(upload => upload.milestoneId === milestone.id)
                            .slice(0, 4)
                            .map(upload => (
                              <div key={upload.id} className="relative group">
                                {upload.fileType.startsWith('image/') ? (
                                  <img 
                                    src={upload.url} 
                                    alt={upload.fileName}
                                    className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                    onClick={() => window.open(upload.url, '_blank')}
                                  />
                                ) : (
                                  <div className="w-full h-16 bg-base-300 rounded flex items-center justify-center cursor-pointer hover:opacity-80">
                                    <RiVideoLine className="text-xl" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                                  <RiEyeLine className="text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                            ))
                          }
                          {mediaUploads.filter(u => u.milestoneId === milestone.id).length > 4 && (
                            <div className="w-full h-16 bg-base-300 rounded flex items-center justify-center text-sm">
                              +{mediaUploads.filter(u => u.milestoneId === milestone.id).length - 4} more
                            </div>
                          )}
                        </div>

                        {/* Completion info */}
                        {milestone.completed && (
                          <div className="mt-3 p-3 bg-success/10 rounded-lg">
                            <div className="flex items-center gap-2 text-success text-sm">
                              <RiCheckboxCircleLine />
                              Completed on {milestone.date}
                              {milestone.completedTime && ` at ${milestone.completedTime}`}
                            </div>
                            {milestone.verified && (
                              <div className="text-xs text-success/80 mt-1">
                                ✅ Verified and approved for payment release
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom milestones */}
                {constructionMilestones
                  .filter(milestone => milestone.projectId === selectedProject.id)
                  .map((milestone, index) => (
                    <div key={milestone.id} className="relative flex items-start mb-8">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${
                        milestone.completed 
                          ? milestone.verified 
                            ? 'bg-success border-success' 
                            : 'bg-warning border-warning'
                          : 'bg-info border-info'
                      } mr-6`}></div>
                      
                      {/* Custom milestone card */}
                      <div className="flex-1 card bg-info/5 border border-info/20">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{milestone.name}</h4>
                                <div className="badge badge-info badge-sm">Custom</div>
                                {milestone.completed ? (
                                  <div className={`badge gap-2 ${milestone.verified ? 'badge-success' : 'badge-warning'}`}>
                                    <RiCheckboxCircleLine />
                                    {milestone.verified ? 'Verified' : 'Pending'}
                                  </div>
                                ) : (
                                  <div className="badge badge-outline gap-2">
                                    <RiTimeLine />
                                    In Progress
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-base-content/70 mb-2">{milestone.description}</p>
                              <div className="grid md:grid-cols-3 gap-4 text-sm text-base-content/70">
                                <div>📊 Progress: {milestone.percentage}%</div>
                                <div>💰 Payment: {milestone.paymentAmount}</div>
                                <div>📅 Created: {milestone.createdDate}</div>
                              </div>
                            </div>
                            
                            <div className="dropdown dropdown-end">
                              <button className="btn btn-ghost btn-sm">
                                <RiImageLine />
                              </button>
                              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                  <a onClick={() => {
                                    setSelectedProject({...selectedProject, currentMilestone: milestone.id});
                                    mediaInputRef.current?.click();
                                  }}>
                                    <RiUploadCloud2Line />
                                    Upload Media
                                  </a>
                                </li>
                                {!milestone.completed && (
                                  <li>
                                    <a onClick={() => handleMilestoneComplete(milestone.id)}>
                                      <RiCheckboxCircleLine />
                                      Mark Complete
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <a onClick={() => {
                                    if (confirm('Delete this custom milestone?')) {
                                      setConstructionMilestones(prev => prev.filter(m => m.id !== milestone.id));
                                    }
                                  }}>
                                    <RiDeleteBinLine />
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {/* Media uploads for custom milestone */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                            {mediaUploads
                              .filter(upload => upload.milestoneId === milestone.id)
                              .slice(0, 4)
                              .map(upload => (
                                <div key={upload.id} className="relative group">
                                  {upload.fileType.startsWith('image/') ? (
                                    <img 
                                      src={upload.url} 
                                      alt={upload.fileName}
                                      className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80"
                                    />
                                  ) : (
                                    <div className="w-full h-16 bg-base-300 rounded flex items-center justify-center">
                                      <RiVideoLine className="text-xl" />
                                    </div>
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Media Upload Progress */}
          {uploadProgress > 0 && (
            <div className="card bg-base-200 border border-info">
              <div className="card-body p-4">
                <div className="flex items-center gap-3 mb-3">
                  <RiUploadCloud2Line className="animate-pulse text-info text-xl" />
                  <span className="font-medium">Uploading Construction Media...</span>
                </div>
                <progress className="progress progress-info w-full h-3" value={uploadProgress} max="100"></progress>
                <div className="text-sm text-base-content/70 mt-2">{uploadProgress}% completed</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="btn btn-outline" onClick={() => mediaInputRef.current?.click()}>
                  <RiUploadCloud2Line className="w-4 h-4 mr-2" />
                  Bulk Upload Media
                </button>
                <button className="btn btn-outline" onClick={() => setShowMilestoneModal(true)}>
                  <RiAddLine className="w-4 h-4 mr-2" />
                  Add Custom Milestone
                </button>
                <button className="btn btn-outline" onClick={() => {
                  const completedMilestones = [...(selectedProject.milestones?.filter(m => m.completed) || []), ...constructionMilestones.filter(m => m.completed)];
                  alert(`${completedMilestones.length} milestones completed and ready for verification`);
                }}>
                  <RiCheckboxCircleLine className="w-4 h-4 mr-2" />
                  Review Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <RiBuildingLine className="mx-auto text-6xl text-base-content/30 mb-6" />
          <h3 className="text-xl font-semibold mb-2">Select a Project</h3>
          <p className="text-base-content/70 mb-6">Choose a project to view and manage its construction timeline</p>
          {projects.length === 0 && (
            <div className="alert alert-info">
              <RiAlertLine />
              <span>No projects found. Create your first project to start tracking construction progress.</span>
            </div>
          )}
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Add Construction Milestone</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Milestone Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                    placeholder="e.g., Foundation Complete"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Progress Percentage *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={newMilestone.percentage}
                    onChange={(e) => setNewMilestone({ ...newMilestone, percentage: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    placeholder="0-100"
                  />
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="Detailed description of this milestone..."
                  rows="3"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Payment Amount (Optional)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={newMilestone.paymentAmount}
                  onChange={(e) => setNewMilestone({ ...newMilestone, paymentAmount: e.target.value })}
                  placeholder="Enter amount without ₱ symbol"
                />
              </div>
              <div className="alert alert-info">
                <RiAlertLine />
                <div>
                  <div className="font-semibold">Milestone Guidelines:</div>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Milestone names should be descriptive and specific</li>
                    <li>• Progress percentages help track overall project completion</li>
                    <li>• Payment amounts will be held in escrow until milestone verification</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowMilestoneModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddMilestone}
                disabled={!newMilestone.name || newMilestone.percentage < 0}
              >
                <RiSaveLine className="w-4 h-4 mr-2" />
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={mediaInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            const milestoneId = selectedProject?.currentMilestone || selectedProject?.id || 'default';
            handleUploadMedia(milestoneId, e.target.files);
            e.target.value = ''; // Reset file input
          }
        }}
      />
    </div>
  );
}

export default TimelineTracker;
