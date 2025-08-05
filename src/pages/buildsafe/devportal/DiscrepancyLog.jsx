import React, { useState, useEffect } from 'react';
import {
  RiFileWarningLine,
  RiUploadCloud2Line,
  RiCheckboxCircleLine,
  RiSearchLine,
  RiAlertLine,
  RiDownloadLine,
  RiTimeLine,
  RiUserLine,
  RiCalendarLine,
  RiFileTextLine,
  RiImageLine,
  RiFilePdfLine,
  RiDeleteBinLine,
  RiBuildingLine,
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiMoneyDollarCircleLine  // Added this import
} from 'react-icons/ri';
import { discrepancyService, STATIC_GUIDELINES } from '../../../services/buildsafeService.js';


function DiscrepancyLog({ projects, onIssueCountChange }) {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load discrepancies from Firebase
  useEffect(() => {
    const loadDiscrepancies = async () => {
      try {
        setLoading(true);
        const projectIds = projects.map(p => p.name); // Use project names as IDs for now
        const discrepanciesData = await discrepancyService.getDiscrepancies(projectIds);
        setDiscrepancies(discrepanciesData);
        setError(null);
      } catch (err) {
        console.error('Error loading discrepancies:', err);
        setError('Failed to load discrepancies');
        
        // Fallback to static data
        setDiscrepancies([
          {
            id: 1,
            issue: 'Foundation concrete strength below specification (Fallback)',
            description: 'Core test results show 28MPa strength vs required 35MPa for Block A foundation',
            source: 'Quality Control',
            category: 'Structural',
            priority: 'critical',
            date: new Date().toISOString().split('T')[0],
            reportedBy: 'Site Engineer',
            assignedTo: 'Concrete Supplier',
            status: 'pending',
            explanation: '',
            documents: [
              { name: 'core_test_results.pdf', type: 'pdf', size: '2.4 MB' },
              { name: 'foundation_photos.jpg', type: 'image', size: '3.2 MB' }
            ],
            relatedProject: 'Horizon Residences',
            location: 'Block A, Foundation Level',
            estimatedCost: '₱1,200,000',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            requiresEscrowHold: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (projects.length > 0) {
      loadDiscrepancies();
    }
  }, [projects]);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    project: 'all'
  });

  const [newIssue, setNewIssue] = useState({
    issue: '',
    description: '',
    category: 'Structural',
    priority: 'medium',
    location: '',
    estimatedCost: '',
    assignedTo: '',
    relatedProject: projects?.[0]?.name || '',
    requiresEscrowHold: false
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter discrepancies based on current filters
  const filteredDiscrepancies = discrepancies.filter(d => {
    return (
      (d.issue.toLowerCase().includes(filters.search.toLowerCase()) ||
       d.description.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.status === 'all' || d.status === filters.status) &&
      (filters.priority === 'all' || d.priority === filters.priority) &&
      (filters.category === 'all' || d.category === filters.category) &&
      (filters.project === 'all' || d.relatedProject === filters.project)
    );
  });

  // Update parent component with current issue counts
  useEffect(() => {
    if (onIssueCountChange) {
      const counts = {
        total: discrepancies.length,
        pending: discrepancies.filter(d => d.status === 'pending').length,
        critical: discrepancies.filter(d => d.priority === 'critical').length
      };
      onIssueCountChange(counts);
    }
  }, [discrepancies, onIssueCountChange]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await discrepancyService.updateDiscrepancyStatus(id, newStatus);
      // Update local state optimistically
      const updated = discrepancies.map(d => 
        d.id === id ? { ...d, status: newStatus } : d
      );
      setDiscrepancies(updated);
    } catch (error) {
      console.error('Error updating discrepancy status:', error);
      // You could show an error notification here
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const newDiscrepancyData = {
        ...newIssue,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        documents: [],
        reportedBy: 'Site Manager'
      };
      
      const newId = await discrepancyService.createDiscrepancy(newDiscrepancyData);
      
      // Add to local state with the new ID
      const newDiscrepancy = {
        ...newDiscrepancyData,
        id: newId
      };
      
      setDiscrepancies([newDiscrepancy, ...discrepancies]);
      setShowCreateModal(false);
      setNewIssue({
        issue: '',
        description: '',
        category: 'Structural',
        priority: 'medium',
        location: '',
        estimatedCost: '',
        assignedTo: '',
        relatedProject: projects?.[0]?.name || '',
        requiresEscrowHold: false
      });
    } catch (error) {
      console.error('Error creating discrepancy:', error);
      // You could show an error notification here
    }
  };

  const handleEscrowHoldToggle = (id) => {
    setDiscrepancies(discrepancies.map(d => 
      d.id === id ? { ...d, requiresEscrowHold: !d.requiresEscrowHold } : d
    ));
  };

  const priorityOptions = [
    { value: 'critical', label: 'Critical', color: 'error', icon: <RiErrorWarningLine /> },
    { value: 'high', label: 'High', color: 'warning', icon: <RiAlertLine /> },
    { value: 'medium', label: 'Medium', color: 'info', icon: <RiFileWarningLine /> },
    { value: 'low', label: 'Low', color: 'success', icon: <RiCheckLine /> }
  ];

  const categoryOptions = [
    { value: 'Structural', label: 'Structural', icon: <RiBuildingLine /> },
    { value: 'Electrical', label: 'Electrical', icon: <RiAlertLine /> },
    { value: 'Plumbing', label: 'Plumbing', icon: <RiFileTextLine /> },
    { value: 'Finishing', label: 'Finishing', icon: <RiImageLine /> },
    { value: 'Safety', label: 'Safety', icon: <RiErrorWarningLine /> }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="p-4 bg-base-100 rounded-lg">
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading discrepancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-base-100 rounded-lg">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-warning mb-4">
          <div>
            <strong>Warning:</strong> {error}. Showing fallback data.
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RiFileWarningLine className="text-primary" />
            Construction Issues Log
          </h2>
          <p className="text-sm text-gray-500">
            Track and resolve construction discrepancies affecting project milestones
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm md:btn-md"
          >
            + Report New Issue
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search issues..."
              className="input input-bordered w-full pl-10"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
            <RiSearchLine className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <select
          className="select select-bordered"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          className="select select-bordered"
          value={filters.priority}
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
        >
          <option value="all">All Priorities</option>
          {priorityOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {projects && projects.length > 0 && (
          <select
            className="select select-bordered"
            value={filters.project}
            onChange={(e) => setFilters({...filters, project: e.target.value})}
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.name}>{project.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Total Issues</div>
          <div className="stat-value text-primary">{discrepancies.length}</div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Pending Resolution</div>
          <div className="stat-value text-warning">
            {discrepancies.filter(d => d.status === 'pending').length}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Critical Issues</div>
          <div className="stat-value text-error">
            {discrepancies.filter(d => d.priority === 'critical').length}
          </div>
        </div>
        <div className="stat bg-base-200 rounded-lg p-4">
          <div className="stat-title">Affecting Escrow</div>
          <div className="stat-value text-secondary">
            {discrepancies.filter(d => d.requiresEscrowHold).length}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredDiscrepancies.length > 0 ? (
          filteredDiscrepancies.map(issue => (
            <div key={issue.id} className={`card shadow-lg border-l-4 ${
              issue.priority === 'critical' ? 'border-error' :
              issue.priority === 'high' ? 'border-warning' :
              issue.priority === 'medium' ? 'border-info' : 'border-success'
            }`}>
              <div className="card-body p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Issue Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${
                        issue.priority === 'critical' ? 'text-error' :
                        issue.priority === 'high' ? 'text-warning' :
                        issue.priority === 'medium' ? 'text-info' : 'text-success'
                      }`}>
                        {categoryOptions.find(c => c.value === issue.category)?.icon || <RiFileWarningLine />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{issue.issue}</h3>
                        <p className="text-sm text-gray-500 mt-1">{issue.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className={`badge badge-${
                            priorityOptions.find(p => p.value === issue.priority)?.color || 'neutral'
                          } gap-1`}>
                            {priorityOptions.find(p => p.value === issue.priority)?.icon}
                            {priorityOptions.find(p => p.value === issue.priority)?.label}
                          </div>
                          <div className={`badge badge-${
                            issue.status === 'pending' ? 'error' :
                            issue.status === 'in-progress' ? 'warning' : 'success'
                          }`}>
                            {issue.status}
                          </div>
                          {issue.requiresEscrowHold && (
                            <div className="badge badge-secondary gap-1">
                              <RiMoneyDollarCircleLine />
                              Escrow Hold
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {issue.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleStatusChange(issue.id, 'in-progress')}
                        >
                          <RiTimeLine />
                          Start Work
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleEscrowHoldToggle(issue.id)}
                        >
                          {issue.requiresEscrowHold ? 'Release Escrow Hold' : 'Place Escrow Hold'}
                        </button>
                      </>
                    )}
                    {issue.status === 'in-progress' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleStatusChange(issue.id, 'resolved')}
                      >
                        <RiCheckboxCircleLine />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <RiBuildingLine />
                    <span className="font-medium">Project:</span>
                    <span>{issue.relatedProject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiUserLine />
                    <span className="font-medium">Assigned:</span>
                    <span>{issue.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiCalendarLine />
                    <span className="font-medium">Deadline:</span>
                    <span>{issue.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiMoneyDollarCircleLine />
                    <span className="font-medium">Est. Cost:</span>
                    <span className="font-bold">{issue.estimatedCost}</span>
                  </div>
                </div>

                {/* Documents */}
                {issue.documents && issue.documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Attachments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {issue.documents.map((doc, idx) => (
                        <div key={idx} className="badge badge-outline gap-1">
                          {doc.type === 'pdf' ? <RiFilePdfLine /> : <RiImageLine />}
                          {doc.name}
                          <button className="text-primary">
                            <RiDownloadLine />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Section */}
                {issue.status === 'resolved' && issue.explanation && (
                  <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                      <RiCheckboxCircleLine />
                      <h4 className="font-medium">Resolution</h4>
                    </div>
                    <p className="mt-1 text-sm">{issue.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body text-center py-12">
              <RiFileWarningLine className="text-4xl mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">No issues found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {filters.search ? 'Try adjusting your search' : 'No issues reported for current filters'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Issue Modal */}
      <dialog className={`modal ${showCreateModal ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Report Construction Issue</h3>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="btn btn-ghost btn-circle"
            >
              <RiCloseLine />
            </button>
          </div>
          
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Issue Title*</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newIssue.issue}
                  onChange={(e) => setNewIssue({...newIssue, issue: e.target.value})}
                  required
                />
              </div>

              {projects && projects.length > 0 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Project*</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={newIssue.relatedProject}
                    onChange={(e) => setNewIssue({...newIssue, relatedProject: e.target.value})}
                    required
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.name}>{project.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description*</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={newIssue.description}
                onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category*</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newIssue.category}
                  onChange={(e) => setNewIssue({...newIssue, category: e.target.value})}
                  required
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Priority*</span>
                </label>
                <select
                  className="select select-bordered"
                  value={newIssue.priority}
                  onChange={(e) => setNewIssue({...newIssue, priority: e.target.value})}
                  required
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location*</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newIssue.location}
                  onChange={(e) => setNewIssue({...newIssue, location: e.target.value})}
                  placeholder="e.g., Block A, Floor 15"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Assigned To</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newIssue.assignedTo}
                  onChange={(e) => setNewIssue({...newIssue, assignedTo: e.target.value})}
                  placeholder="Contractor or team responsible"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Estimated Cost Impact</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newIssue.estimatedCost}
                  onChange={(e) => setNewIssue({...newIssue, estimatedCost: e.target.value})}
                  placeholder="₱0.00"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={newIssue.requiresEscrowHold}
                  onChange={(e) => setNewIssue({...newIssue, requiresEscrowHold: e.target.checked})}
                />
                <span className="label-text">Hold escrow payments until resolved</span>
              </label>
            </div>

            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Submit Issue
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}></div>
      </dialog>
    </div>
  );
}

export default DiscrepancyLog;