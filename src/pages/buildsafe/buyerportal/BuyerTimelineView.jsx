import React, { useState, useEffect } from 'react';
import {
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiNotificationLine,
  RiBuildingLine
} from 'react-icons/ri';

function BuyerTimelineView({ 
  propertyInfo,
  constructionMilestones, 
  mediaUploads,
  notifications,
  setNotifications 
}) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  // Calculate overall progress based on completed milestones
  const calculateOverallProgress = () => {
    if (!constructionMilestones || constructionMilestones.length === 0) return 0;
    const completedMilestones = constructionMilestones.filter(m => m.completed);
    return Math.round((completedMilestones.length / constructionMilestones.length) * 100);
  };

  // Get project status based on progress and timeline
  const getProjectStatus = () => {
    const progress = calculateOverallProgress();
    const currentDate = new Date();
    const expectedCompletion = new Date(propertyInfo?.expectedCompletion || '2025-12-31');
    const daysBehind = Math.ceil((currentDate - expectedCompletion) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) return { status: 'Completed', color: 'success', message: 'Construction completed!' };
    if (daysBehind > 0 && progress < 90) return { status: 'Delayed', color: 'error', message: `${daysBehind} days behind schedule` };
    if (progress >= 80) return { status: 'Nearly Complete', color: 'warning', message: 'Final stages of construction' };
    return { status: 'On Track', color: 'success', message: 'Construction progressing as planned' };
  };

  const projectStatus = getProjectStatus();

  // Handle milestone media viewing
  const handleViewMedia = (milestone) => {
    const milestoneMedia = mediaUploads.filter(upload => upload.milestoneId === milestone.id);
    setSelectedMedia(milestoneMedia);
    setSelectedMilestone(milestone);
    setShowMediaModal(true);
  };

  // Send real-time notification when milestone is updated
  const sendMilestoneNotification = (milestone, type = 'update') => {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'milestone',
      message: type === 'completed' 
        ? `Milestone "${milestone.name}" has been completed!`
        : `New update for milestone "${milestone.name}"`,
      timestamp: new Date().toISOString(),
      read: false,
      project: propertyInfo?.name,
      milestone: milestone.name
    };
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Property Overview Header */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="card-body">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <RiBuildingLine className="text-primary" />
                {propertyInfo?.name || 'Your Property'}
              </h2>
              <p className="text-base-content/70">{propertyInfo?.location}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span>📍 Unit: {propertyInfo?.unit}</span>
                <span>📅 Started: {propertyInfo?.startDate}</span>
                <span>🎯 Expected: {propertyInfo?.expectedCompletion}</span>
                <span>💰 Total Investment: {propertyInfo?.totalInvestment}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{calculateOverallProgress()}%</div>
              <div className={`badge badge-lg ${
                projectStatus.status === 'Completed' ? 'badge-success' :
                projectStatus.status === 'Delayed' ? 'badge-error' :
                projectStatus.status === 'Nearly Complete' ? 'badge-warning' : 'badge-success'
              }`}>
                {projectStatus.status}
              </div>
              <p className="text-xs mt-1 text-base-content/70">{projectStatus.message}</p>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Construction Progress</span>
              <span>{calculateOverallProgress()}% Complete</span>
            </div>
            <progress 
              className="progress progress-primary w-full h-4" 
              value={calculateOverallProgress()} 
              max="100"
            ></progress>
          </div>
        </div>
      </div>

      {/* Live Updates Alert */}
      {notifications.filter(n => !n.read && n.type === 'milestone').length > 0 && (
        <div className="alert alert-info">
          <RiNotificationLine />
          <div>
            <div className="font-semibold">New Construction Updates!</div>
            <div className="text-sm">You have {notifications.filter(n => !n.read && n.type === 'milestone').length} unread milestone updates.</div>
          </div>
          <button 
            className="btn btn-sm btn-info"
            onClick={() => setNotifications(prev => 
              prev.map(n => n.type === 'milestone' ? {...n, read: true} : n)
            )}
          >
            Mark All Read
          </button>
        </div>
      )}

      {/* Construction Timeline */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <RiTimeLine />
            Construction Timeline
          </h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-base-300"></div>
            
            {constructionMilestones?.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-start mb-8">
                {/* Timeline dot */}
                <div className={`relative z-10 w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                  milestone.completed 
                    ? milestone.verified 
                      ? 'bg-success border-success text-success-content' 
                      : 'bg-warning border-warning text-warning-content'
                    : 'bg-base-100 border-base-300'
                } mr-6`}>
                  {milestone.completed && <RiCheckboxCircleLine className="w-4 h-4" />}
                </div>
                
                {/* Milestone card */}
                <div className="flex-1 card bg-base-100 shadow-sm border-l-4 border-l-primary/20">
                  <div className="card-body p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{milestone.name}</h4>
                          {milestone.completed ? (
                            <div className={`badge gap-2 ${milestone.verified ? 'badge-success' : 'badge-warning'}`}>
                              <RiCheckboxCircleLine />
                              {milestone.verified ? 'Completed & Verified' : 'Completed - Pending Verification'}
                            </div>
                          ) : (
                            <div className="badge badge-outline gap-2">
                              <RiTimeLine />
                              In Progress
                            </div>
                          )}
                        </div>
                        
                        <p className="text-base-content/70 mb-3">{milestone.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <RiCalendarLine className="text-primary" />
                            <div>
                              <div className="font-medium">Target Date</div>
                              <div>{milestone.targetDate || milestone.date}</div>
                            </div>
                          </div>
                          {milestone.completedDate && (
                            <div className="flex items-center gap-2">
                              <RiCheckboxCircleLine className="text-success" />
                              <div>
                                <div className="font-medium">Completed</div>
                                <div>{milestone.completedDate}</div>
                              </div>
                            </div>
                          )}
                          {milestone.paymentAmount && (
                            <div className="flex items-center gap-2">
                              <RiMoneyDollarCircleLine className="text-warning" />
                              <div>
                                <div className="font-medium">Payment Release</div>
                                <div>{milestone.paymentAmount}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Media Preview and Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        {mediaUploads.filter(u => u.milestoneId === milestone.id).length > 0 && (
                          <button 
                            className="btn btn-sm btn-outline btn-primary"
                            onClick={() => handleViewMedia(milestone)}
                          >
                            <RiEyeLine className="w-4 h-4" />
                            View Updates ({mediaUploads.filter(u => u.milestoneId === milestone.id).length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Media Preview Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      {mediaUploads
                        .filter(upload => upload.milestoneId === milestone.id)
                        .slice(0, 4)
                        .map(upload => (
                          <div 
                            key={upload.id} 
                            className="relative group cursor-pointer"
                            onClick={() => handleViewMedia(milestone)}
                          >
                            {upload.fileType?.startsWith('image/') ? (
                              <img 
                                src={upload.url || upload.preview} 
                                alt={upload.fileName}
                                className="w-full h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                              />
                            ) : (
                              <div className="w-full h-20 bg-base-300 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
                                <RiVideoLine className="text-2xl text-base-content/60" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all">
                              <RiEyeLine className="text-white opacity-0 group-hover:opacity-100" />
                            </div>
                          </div>
                        ))
                      }
                      {mediaUploads.filter(u => u.milestoneId === milestone.id).length > 4 && (
                        <div 
                          className="w-full h-20 bg-base-300 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-80"
                          onClick={() => handleViewMedia(milestone)}
                        >
                          +{mediaUploads.filter(u => u.milestoneId === milestone.id).length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Progress indicator for this milestone */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Milestone Progress</span>
                        <span>{milestone.completed ? 100 : milestone.progressPercentage || 0}%</span>
                      </div>
                      <progress 
                        className={`progress w-full ${milestone.completed ? 'progress-success' : 'progress-primary'}`}
                        value={milestone.completed ? 100 : milestone.progressPercentage || 0} 
                        max="100"
                      ></progress>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* No milestones message */}
            {(!constructionMilestones || constructionMilestones.length === 0) && (
              <div className="text-center py-12 text-base-content/50">
                <RiTimeLine className="mx-auto text-6xl mb-4" />
                <h3 className="text-lg font-medium mb-2">No Timeline Available</h3>
                <p>Construction milestones will appear here once the developer uploads them.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Gallery Modal */}
      {showMediaModal && selectedMilestone && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">
                {selectedMilestone.name} - Progress Updates
              </h3>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => setShowMediaModal(false)}
              >
                ✕
              </button>
            </div>
            
            {selectedMedia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {selectedMedia.map(media => (
                  <div key={media.id} className="card bg-base-200">
                    <figure className="h-48">
                      {media.fileType?.startsWith('image/') ? (
                        <img 
                          src={media.url || media.preview} 
                          alt={media.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-base-300 flex items-center justify-center">
                          <RiVideoLine className="text-4xl text-base-content/60" />
                        </div>
                      )}
                    </figure>
                    <div className="card-body p-4">
                      <h4 className="font-medium">{media.fileName}</h4>
                      <p className="text-sm text-base-content/70">
                        Uploaded: {new Date(media.uploadDate).toLocaleDateString()}
                      </p>
                      {media.description && (
                        <p className="text-sm">{media.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/50">
                <RiImageLine className="mx-auto text-4xl mb-2" />
                <p>No media available for this milestone</p>
              </div>
            )}
            
            <div className="modal-action">
              <button className="btn" onClick={() => setShowMediaModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-primary">
            <RiCheckboxCircleLine className="text-2xl" />
          </div>
          <div className="stat-title text-xs">Completed</div>
          <div className="stat-value text-sm">
            {constructionMilestones?.filter(m => m.completed).length || 0} / {constructionMilestones?.length || 0}
          </div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-warning">
            <RiTimeLine className="text-2xl" />
          </div>
          <div className="stat-title text-xs">In Progress</div>
          <div className="stat-value text-sm">
            {constructionMilestones?.filter(m => !m.completed).length || 0}
          </div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-info">
            <RiImageLine className="text-2xl" />
          </div>
          <div className="stat-title text-xs">Media Updates</div>
          <div className="stat-value text-sm">{mediaUploads?.length || 0}</div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-figure text-success">
            <RiMoneyDollarCircleLine className="text-2xl" />
          </div>
          <div className="stat-title text-xs">Progress</div>
          <div className="stat-value text-sm">{calculateOverallProgress()}%</div>
        </div>
      </div>
    </div>
  );
}

export default BuyerTimelineView;
