import React, { useState } from 'react';
import {
  RiFileWarningLine,
  RiUploadCloud2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiSearchLine,
  RiFilterLine,
  RiAlertLine,
  RiEyeLine,
  RiDownloadLine,
  RiTimeLine,
  RiUserLine,
  RiCalendarLine,
  RiFileTextLine,
  RiImageLine,
  RiFilePdfLine,
  RiDeleteBinLine
} from 'react-icons/ri';

function DiscrepancyLog() {
  const [discrepancies, setDiscrepancies] = useState([
    {
      id: 1,
      issue: 'Structural integrity concern in Block A - Foundation Level',
      description: 'AI analysis detected potential concrete density irregularities in foundation pour section 3A-7. Density readings below specified 2400 kg/m³ standard.',
      source: 'AI Detection',
      category: 'Structural',
      priority: 'high',
      date: '2025-07-25',
      reportedBy: 'AutoScan System',
      assignedTo: 'John Martinez - Site Engineer',
      status: 'pending',
      explanation: '',
      documents: [],
      relatedProject: 'Green Residences Tower A',
      location: 'Block A, Foundation Level 3',
      estimatedCost: '₱450,000',
      deadline: '2025-08-01'
    },
    {
      id: 2,
      issue: 'Window installation misalignment - Units 15A to 15E',
      description: 'Multiple window units show 2-3cm misalignment from architectural plans. May affect weather sealing and aesthetic standards.',
      source: 'Quality Inspector',
      category: 'Installation',
      priority: 'medium',
      date: '2025-07-23',
      reportedBy: 'Maria Santos - QA Inspector',
      assignedTo: 'Carlos Rivera - Installation Team Lead',
      status: 'in-progress',
      explanation: 'Realignment in progress. Window frames being adjusted to match architectural specifications.',
      documents: [
        { name: 'window_inspection_report.pdf', type: 'pdf', size: '2.1 MB' },
        { name: 'alignment_photos.jpg', type: 'image', size: '5.8 MB' }
      ],
      relatedProject: 'Green Residences Tower A',
      location: 'Floor 15, Units A-E',
      estimatedCost: '₱85,000',
      deadline: '2025-07-30'
    },
    {
      id: 3,
      issue: 'Electrical wiring non-compliance in parking garage',
      description: 'Junction boxes installed 30cm below required height as per electrical code. Fire safety compliance at risk.',
      source: 'Safety Audit',
      category: 'Electrical',
      priority: 'high',
      date: '2025-07-22',
      reportedBy: 'Robert Kim - Safety Officer',
      assignedTo: 'Lightning Electric Co.',
      status: 'resolved',
      explanation: 'All junction boxes have been relocated to comply with electrical code requirements. Rewiring completed and passed re-inspection on July 26, 2025.',
      documents: [
        { name: 'electrical_compliance_report.pdf', type: 'pdf', size: '1.7 MB' },
        { name: 'before_after_photos.jpg', type: 'image', size: '4.2 MB' },
        { name: 'inspection_certificate.pdf', type: 'pdf', size: '0.8 MB' }
      ],
      relatedProject: 'Blue Ocean Condominiums',
      location: 'Basement Parking Level B1',
      estimatedCost: '₱120,000',
      deadline: '2025-07-28'
    },
    {
      id: 4,
      issue: 'Plumbing leak detected in utility room',
      description: 'Water damage observed around main water supply junction. Potential pipe joint failure requiring immediate attention.',
      source: 'Maintenance Report',
      category: 'Plumbing',
      priority: 'critical',
      date: '2025-07-26',
      reportedBy: 'Tech Maintenance Crew',
      assignedTo: 'AquaFix Solutions',
      status: 'pending',
      explanation: '',
      documents: [],
      relatedProject: 'Green Residences Tower A',
      location: 'Ground Floor, Utility Room 01',
      estimatedCost: '₱25,000',
      deadline: '2025-07-27'
    },
    {
      id: 5,
      issue: 'Paint quality inconsistency in lobby area',
      description: 'Color variation and texture differences observed in main lobby walls. Does not meet aesthetic standards specified in design requirements.',
      source: 'Quality Inspector',
      category: 'Finishing',
      priority: 'low',
      date: '2025-07-21',
      reportedBy: 'Ana Rodriguez - Interior QA',
      assignedTo: 'Premium Paint Services',
      status: 'resolved',
      explanation: 'Lobby walls have been sanded and repainted with premium grade paint. Color matching verified and approved by design team.',
      documents: [
        { name: 'lobby_before_after.jpg', type: 'image', size: '8.1 MB' },
        { name: 'paint_quality_report.pdf', type: 'pdf', size: '1.2 MB' }
      ],
      relatedProject: 'Blue Ocean Condominiums',
      location: 'Ground Floor, Main Lobby',
      estimatedCost: '₱35,000',
      deadline: '2025-07-25'
    }
  ]);

  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDiscrepancy, setNewDiscrepancy] = useState({
    issue: '',
    description: '',
    category: 'Structural',
    priority: 'medium',
    location: '',
    estimatedCost: '',
    assignedTo: ''
  });

  // Filter and search logic
  const filteredDiscrepancies = discrepancies.filter(disc => {
    const matchesSearch = disc.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disc.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || disc.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || disc.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || disc.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleExplanationSubmit = (id, explanation, documents) => {
    setDiscrepancies(discrepancies.map(disc => {
      if (disc.id === id) {
        return {
          ...disc,
          explanation,
          documents,
          status: 'resolved'
        };
      }
      return disc;
    }));
    setSelectedDiscrepancy(null);
  };

  const handleCreateDiscrepancy = () => {
    const id = Math.max(...discrepancies.map(d => d.id)) + 1;
    const newDisc = {
      ...newDiscrepancy,
      id,
      date: new Date().toISOString().split('T')[0],
      source: 'Manual Report',
      reportedBy: 'Current User',
      status: 'pending',
      explanation: '',
      documents: [],
      relatedProject: 'Green Residences Tower A' // Default project
    };
    
    setDiscrepancies([newDisc, ...discrepancies]);
    setShowCreateForm(false);
    setNewDiscrepancy({
      issue: '',
      description: '',
      category: 'Structural',
      priority: 'medium',
      location: '',
      estimatedCost: '',
      assignedTo: ''
    });
  };

  const handleDeleteDiscrepancy = (id) => {
    setDiscrepancies(discrepancies.filter(disc => disc.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'badge-error';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      case 'low': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-error';
      case 'in-progress': return 'badge-warning';
      case 'resolved': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Structural': return RiFileWarningLine;
      case 'Electrical': return RiAlertLine;
      case 'Plumbing': return RiFileTextLine;
      case 'Installation': return RiFileWarningLine;
      case 'Finishing': return RiImageLine;
      default: return RiFileWarningLine;
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return RiFilePdfLine;
      case 'image': return RiImageLine;
      default: return RiFileTextLine;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Discrepancy Log
          </h1>
          <p className="text-base-content/70 mt-2">Track and manage project quality issues</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary gap-2"
        >
          <RiFileWarningLine className="text-xl" />
          Report Issue
        </button>
      </div>

      {/* Stats */}
      <div className="stats shadow w-full mb-8">
        <div className="stat">
          <div className="stat-title">Total Issues</div>
          <div className="stat-value text-primary">{discrepancies.length}</div>
          <div className="stat-desc">All discrepancies</div>
        </div>
        <div className="stat">
          <div className="stat-title">Pending</div>
          <div className="stat-value text-error">
            {discrepancies.filter(d => d.status === 'pending').length}
          </div>
          <div className="stat-desc">Awaiting resolution</div>
        </div>
        <div className="stat">
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-warning">
            {discrepancies.filter(d => d.status === 'in-progress').length}
          </div>
          <div className="stat-desc">Being addressed</div>
        </div>
        <div className="stat">
          <div className="stat-title">Resolved</div>
          <div className="stat-value text-success">
            {discrepancies.filter(d => d.status === 'resolved').length}
          </div>
          <div className="stat-desc">Completed fixes</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="form-control flex-1 min-w-64">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search issues..."
                  className="input input-bordered flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-square">
                  <RiSearchLine className="text-xl" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <select
              className="select select-bordered"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="select select-bordered"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="select select-bordered"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Structural">Structural</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Installation">Installation</option>
              <option value="Finishing">Finishing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Discrepancy Modal */}
      <dialog className={`modal ${showCreateForm ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl bg-white/95 backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Report New Issue
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateDiscrepancy();
            }}
            className="space-y-6"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Issue Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-white/70 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                value={newDiscrepancy.issue}
                onChange={(e) => setNewDiscrepancy({...newDiscrepancy, issue: e.target.value})}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 bg-white/70 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                value={newDiscrepancy.description}
                onChange={(e) => setNewDiscrepancy({...newDiscrepancy, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newDiscrepancy.category}
                  onChange={(e) => setNewDiscrepancy({...newDiscrepancy, category: e.target.value})}
                >
                  <option value="Structural">Structural</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Installation">Installation</option>
                  <option value="Finishing">Finishing</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Priority</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newDiscrepancy.priority}
                  onChange={(e) => setNewDiscrepancy({...newDiscrepancy, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={newDiscrepancy.location}
                onChange={(e) => setNewDiscrepancy({...newDiscrepancy, location: e.target.value})}
                placeholder="e.g., Block A, Floor 15, Unit 01"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Estimated Cost</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={newDiscrepancy.estimatedCost}
                onChange={(e) => setNewDiscrepancy({...newDiscrepancy, estimatedCost: e.target.value})}
                placeholder="₱0"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Assign To</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={newDiscrepancy.assignedTo}
                onChange={(e) => setNewDiscrepancy({...newDiscrepancy, assignedTo: e.target.value})}
                placeholder="Enter responsible person/team"
              />
            </div>

            <div className="modal-action">
              <button 
                type="submit" 
                className="btn btn-primary hover:scale-105 transition-transform duration-200 shadow-lg"
              >
                Create Issue
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-ghost hover:bg-base-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setShowCreateForm(false)}></div>
      </dialog>

      {/* Discrepancies List */}
      <div className="grid gap-6">
        {filteredDiscrepancies.map((discrepancy) => {
          const CategoryIcon = getCategoryIcon(discrepancy.category);
          
          return (
            <div
              key={discrepancy.id}
              className="card bg-base-100 shadow-lg border-l-4"
              style={{
                borderLeftColor: 
                  discrepancy.priority === 'critical' ? '#ef4444' :
                  discrepancy.priority === 'high' ? '#f97316' :
                  discrepancy.priority === 'medium' ? '#3b82f6' : '#10b981'
              }}
            >
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <CategoryIcon className="text-2xl text-warning mt-1" />
                    <div>
                      <h3 className="font-bold text-lg">{discrepancy.issue}</h3>
                      <p className="text-base-content/70 text-sm mt-1">
                        {discrepancy.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className={`badge ${getPriorityColor(discrepancy.priority)}`}>
                      {discrepancy.priority}
                    </div>
                    <div className={`badge ${getStatusColor(discrepancy.status)}`}>
                      {discrepancy.status}
                    </div>
                    <button
                      onClick={() => handleDeleteDiscrepancy(discrepancy.id)}
                      className="btn btn-ghost btn-sm btn-circle text-error"
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <RiCalendarLine className="text-base-content/50" />
                    <span className="text-base-content/70">Reported:</span>
                    <span>{discrepancy.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <RiUserLine className="text-base-content/50" />
                    <span className="text-base-content/70">Reporter:</span>
                    <span>{discrepancy.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <RiTimeLine className="text-base-content/50" />
                    <span className="text-base-content/70">Deadline:</span>
                    <span>{discrepancy.deadline}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-base-content/70">Project:</span>
                    <span className="ml-2">{discrepancy.relatedProject}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-base-content/70">Location:</span>
                    <span className="ml-2">{discrepancy.location}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-base-content/70">Est. Cost:</span>
                    <span className="ml-2 font-semibold text-primary">{discrepancy.estimatedCost}</span>
                  </div>
                </div>

                {discrepancy.assignedTo && (
                  <div className="text-sm mb-4">
                    <span className="text-base-content/70">Assigned to:</span>
                    <span className="ml-2 badge badge-outline">{discrepancy.assignedTo}</span>
                  </div>
                )}

                {/* Documents */}
                {discrepancy.documents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Attached Documents:</h4>
                    <div className="flex flex-wrap gap-2">
                      {discrepancy.documents.map((doc, idx) => {
                        const FileIcon = getFileIcon(doc.type);
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-base-200 rounded-lg p-2">
                            <FileIcon className="text-primary" />
                            <span className="text-sm">{doc.name}</span>
                            <span className="text-xs text-base-content/50">({doc.size})</span>
                            <button className="btn btn-ghost btn-xs">
                              <RiDownloadLine />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Section */}
                {discrepancy.status === 'pending' && (
                  <div className="bg-base-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Provide Resolution:</h4>
                    <textarea
                      className="textarea textarea-bordered w-full mb-3"
                      placeholder="Explain the resolution or corrective action taken..."
                      value={selectedDiscrepancy?.id === discrepancy.id ? selectedDiscrepancy.explanation : ''}
                      onChange={(e) => setSelectedDiscrepancy({
                        ...discrepancy,
                        explanation: e.target.value
                      })}
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-outline btn-sm gap-2">
                        <RiUploadCloud2Line />
                        Upload Documentation
                      </button>
                      <button
                        className="btn btn-success btn-sm gap-2"
                        onClick={() => handleExplanationSubmit(
                          discrepancy.id,
                          selectedDiscrepancy?.explanation || '',
                          selectedDiscrepancy?.documents || []
                        )}
                        disabled={!selectedDiscrepancy?.explanation}
                      >
                        <RiCheckboxCircleLine />
                        Submit Resolution
                      </button>
                      <button
                        className="btn btn-warning btn-sm gap-2"
                        onClick={() => {
                          setDiscrepancies(discrepancies.map(d =>
                            d.id === discrepancy.id ? {...d, status: 'in-progress'} : d
                          ));
                        }}
                      >
                        <RiTimeLine />
                        Mark In Progress
                      </button>
                    </div>
                  </div>
                )}

                {discrepancy.status === 'in-progress' && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RiTimeLine className="text-warning" />
                      <span className="font-semibold text-warning">Resolution in Progress</span>
                    </div>
                    {discrepancy.explanation && (
                      <p className="text-sm">{discrepancy.explanation}</p>
                    )}
                    <button
                      className="btn btn-success btn-sm mt-2 gap-2"
                      onClick={() => {
                        setDiscrepancies(discrepancies.map(d =>
                          d.id === discrepancy.id ? {...d, status: 'resolved'} : d
                        ));
                      }}
                    >
                      <RiCheckboxCircleLine />
                      Mark as Resolved
                    </button>
                  </div>
                )}

                {discrepancy.status === 'resolved' && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RiCheckboxCircleLine className="text-success" />
                      <span className="font-semibold text-success">Resolution Completed</span>
                    </div>
                    <p className="text-sm">{discrepancy.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredDiscrepancies.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-12">
              <RiFileWarningLine className="text-6xl text-base-content/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content/50">No discrepancies found</h3>
              <p className="text-base-content/40">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'All projects are running smoothly!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscrepancyLog;