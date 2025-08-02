import { useState } from 'react';
import { 
  RiStarFill,
  RiFlag2Line,
  RiImageLine,
  RiCheckboxCircleLine,
  RiContactsLine,
  RiEyeLine,
  RiShieldCheckLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiDownloadLine
} from 'react-icons/ri';

function BuyerDevTrackr() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('progress'); // progress, reviews
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const myProperties = [
    {
      id: 1,
      name: "Horizon Residences",
      unit: "Unit 12A - 2BR Deluxe",
      developer: "Premier Development Corp",
      developerLogo: "https://via.placeholder.com/60x40/3B82F6/FFFFFF?text=PDC",
      agent: "Maria Santos",
      agentContact: "+63 917 123 4567",
      agentEmail: "maria.santos@premier.com",
      progress: 76,
      expectedTurnover: "Q1 2025",
      lastUpdate: "July 25, 2025",
      image: "https://pueblodeoro.com/wp-content/uploads/2017/12/Sakura-1.jpg",
      promisedLayout: "https://via.placeholder.com/400x300/E5E7EB/374151?text=Promised+Layout",
      actualPhotos: [
        "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Actual+Photo+1",
        "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Actual+Photo+2"
      ],
      milestones: [
        { title: "Foundation Complete", completed: true, date: "March 2024", percentage: 25 },
        { title: "Structure Complete", completed: true, date: "September 2024", percentage: 50 },
        { title: "Electrical & Plumbing", completed: false, date: "October 2025", percentage: 75 },
        { title: "Interior Finishing", completed: false, date: "December 2025", percentage: 100 }
      ],
      issues: ["Minor delay in electrical work"]
    },
    {
      id: 2, 
      name: "Sky Gardens Tower",
      unit: "Unit 25B - 1BR Premium",
      developer: "Urban Living Inc",
      developerLogo: "https://via.placeholder.com/60x40/10B981/FFFFFF?text=ULI",
      agent: "John Cruz",
      agentContact: "+63 917 987 6543",
      agentEmail: "john.cruz@urbanliving.com",
      progress: 92,
      expectedTurnover: "Q3 2025",
      lastUpdate: "July 24, 2025",
      image: "https://abu-dhabi.realestate/wp-content/uploads/2021/08/Sky-Gardens-013.jpg",
      promisedLayout: "https://via.placeholder.com/400x300/E5E7EB/374151?text=Promised+Layout",
      actualPhotos: [
        "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Nearly+Complete+1",
        "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Nearly+Complete+2"
      ],
      milestones: [
        { title: "Foundation Complete", completed: true, date: "May 2024", percentage: 25 },
        { title: "Structure Complete", completed: true, date: "December 2024", percentage: 50 },
        { title: "Electrical & Plumbing", completed: true, date: "June 2025", percentage: 75 },
        { title: "Interior Finishing", completed: false, date: "August 2025", percentage: 100 }
      ],
      issues: []
    }
  ];

  const developerReviews = [
    {
      id: 1,
      developer: "Premier Development Corp",
      rating: 4.5,
      totalReviews: 128,
      reviewer: "Anonymous Buyer",
      comment: "Good progress updates and quality construction. Minor delays but communicated well.",
      date: "July 20, 2025",
      verified: true
    },
    {
      id: 2,
      developer: "Urban Living Inc", 
      rating: 5.0,
      totalReviews: 89,
      reviewer: "Verified Buyer",
      comment: "Excellent transparency and ahead of schedule. Highly recommended!",
      date: "July 18, 2025",
      verified: true
    }
  ];

  if (selectedProject) {
    const project = myProperties.find(p => p.id === selectedProject);
    return (
      <div className="space-y-6 text-base-content">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedProject(null)}
            className="btn btn-ghost btn-sm"
          >
            ← Back to My Properties
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('progress')}
              className={`btn btn-sm ${viewMode === 'progress' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Progress View
            </button>
            <button 
              onClick={() => setViewMode('comparison')}
              className={`btn btn-sm ${viewMode === 'comparison' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Layout Comparison
            </button>
          </div>
        </div>

        {viewMode === 'progress' && (
          <>
          
            {/* Property Overview */}
            <div className="card bg-base-200 shadow-xl">
              <figure className="h-64">
                <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <p className="text-lg text-primary font-semibold">{project.unit}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <img src={project.developerLogo} alt="Developer" className="h-10" />
                      <div>
                        <p className="font-medium">{project.developer}</p>
                        <p className="text-sm text-base-content/70">Developer</p>
                      </div>
                    </div>

                    <div className="divider"></div>

                    <div className="flex items-center gap-4">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span className="text-sm">MS</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{project.agent}</p>
                        <p className="text-sm text-base-content/70">Your Agent</p>
                        <p className="text-sm text-primary">{project.agentContact}</p>
                      </div>
                      <button className="btn btn-sm btn-primary ml-auto">
                        <RiContactsLine className="w-4 h-4" />
                        Contact Agent
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="stat">
                      <div className="stat-title">Construction Progress</div>
                      <div className="stat-value text-primary">{project.progress}%</div>
                      <div className="stat-desc">Expected: {project.expectedTurnover}</div>
                    </div>
                  </div>
                </div>
                
                <progress className="progress progress-primary w-full mt-6" value={project.progress} max="100"></progress>
                <p className="text-sm text-base-content/70 mt-2">Last updated: {project.lastUpdate}</p>
              </div>
            </div>

            {/* Timeline & Milestones */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Construction Timeline</h3>
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-base-100 rounded-lg">
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
                        <p className="text-sm text-base-content/70">{milestone.date}</p>
                      </div>
                      <div className={`badge ${milestone.completed ? 'badge-success' : 'badge-warning'}`}>
                        {milestone.completed ? 'Completed' : 'Upcoming'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              <button className="btn btn-warning">
                <RiFlag2Line className="w-4 h-4" />
                Report an Issue
              </button>
              <button className="btn btn-info">
                <RiImageLine className="w-4 h-4" />
                View Progress Photos
              </button>
              <button 
                onClick={() => setViewMode('comparison')}
                className="btn btn-warning"
              >
                <RiEyeLine className="w-4 h-4" />
                Compare Layouts
              </button>
              <button className="btn btn-ghost">
                <RiDownloadLine className="w-4 h-4" />
                Download Reports
              </button>
            </div>
          </>
        )}

        {viewMode === 'comparison' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Layout Comparison: Promised vs Actual</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Promised Layout */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h4 className="font-bold text-lg mb-4">Promised Layout</h4>
                  <figure className="rounded-lg overflow-hidden">
                    <img src={project.promisedLayout} alt="Promised Layout" className="w-full h-64 object-cover" />
                  </figure>
                  <div className="badge badge-info mt-4">Original Plans</div>
                </div>
              </div>

              {/* Actual Photos */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h4 className="font-bold text-lg mb-4">Current Progress Photos</h4>
                  <div className="space-y-4">
                    {project.actualPhotos.map((photo, index) => (
                      <figure key={index} className="rounded-lg overflow-hidden">
                        <img src={photo} alt={`Actual Progress ${index + 1}`} className="w-full h-32 object-cover" />
                      </figure>
                    ))}
                  </div>
                  <div className="badge badge-success mt-4">Latest Photos</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* My Properties Dashboard */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            My Properties
          </h2>
          <div 
            className="stats shadow"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            <div className="stat">
              <div className="stat-title" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Total Properties
              </div>
              <div className="stat-value" style={{ color: 'white' }}>
                {myProperties.length}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((property) => (
            <div 
              key={property.id} 
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border-color)',
                border: '1px solid'
              }}
              onClick={() => setSelectedProject(property.id)}
            >
              
              {/* Header with project name and status */}
              <div className="p-4 pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {property.name}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {property.unit}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {property.developer}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--section-bg)' }}
                    >
                      <div 
                        className="w-6 h-4 rounded-sm"
                        style={{ background: 'var(--color-primary)' }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                      <span 
                        className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-success/20 text-success"
                      >
                        on track
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RiStarFill className="w-3 h-3 text-warning" />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        4.{Math.floor(Math.random() * 3) + 5}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Construction Progress */}
              <div className="px-4 pb-3">
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Construction Progress
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {property.progress}% Complete
                    </span>
                  </div>
                  <div 
                    className="w-full rounded-full h-1.5"
                    style={{ backgroundColor: 'var(--border-color)' }}
                  >
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${property.progress}%`,
                        background: 'var(--color-primary)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="px-4 pb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Expected Turnover
                    </p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {property.expectedTurnover}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Total Investment
                    </p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      ₱{(Math.random() * 2 + 2).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>

              {/* Issues/Discrepancies Alert */}
              {property.issues && property.issues.length > 0 ? (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-warning bg-warning/20 p-2 rounded-lg">
                    <RiFlag2Line className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {property.issues.length} discrepancy flagged
                    </span>
                  </div>
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-success bg-success/20 p-2 rounded-lg">
                    <RiCheckboxCircleLine className="w-3 h-3" />
                    <span className="text-xs font-medium">No issues reported</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div 
                className="p-4 pt-3"
                style={{ borderTop: '1px solid var(--border-color)' }}
              >
                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: 'var(--section-bg)',
                      color: 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--section-bg)';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle contact agent
                    }}
                  >
                    Contact Agent
                  </button>
                  <button 
                    className="flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(property.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Reviews */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Developer Reviews
        </h2>
        <div className="space-y-4">
          {developerReviews.map((review) => (
            <div 
              key={review.id} 
              className="rounded-xl shadow-lg"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <div className="card-body p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {review.developer}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                    {/* Star Rating - Fixed Version */}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= review.rating;
                        const isHalfFilled = !isFilled && (star - 0.5) <= review.rating;
                        
                        return (
                          <div key={star} className="relative w-4 h-4">
                            {/* Star Outline (always shown) */}
                            <RiStarFill className="absolute w-4 h-4 text-gray-300" />
                            
                            {/* Filled portion (full or half) */}
                            {isFilled && (
                              <RiStarFill className="absolute w-4 h-4 text-yellow-400" />
                            )}
                            {isHalfFilled && (
                              <div className="absolute overflow-hidden w-2 h-4">
                                <RiStarFill className="w-4 h-4 text-yellow-400" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Rating Text */}
                    <span className="text-sm font-medium text-content">
                      {review.rating}/5
                    </span>

                    {/* Review Count */}
                    <span className="text-sm text-gray-500">
                      ({review.totalReviews} reviews)
                    </span>
                  </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {review.date}
                    </span>
                    {review.verified && (
                      <div className="badge badge-success badge-sm mt-1">
                        <RiShieldCheckLine className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
                  "{review.comment}"
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                  - {review.reviewer}
                </p>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <RiThumbUpLine className="w-4 h-4" />
                    Helpful (12)
                  </button>
                  <button 
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <RiThumbDownLine className="w-4 h-4" />
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

export default BuyerDevTrackr;