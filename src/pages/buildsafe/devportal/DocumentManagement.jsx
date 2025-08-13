import React, { useState } from 'react';
import {
  RiFileTextLine,
  RiShieldCheckLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiUploadCloud2Line,
  RiAddLine,
  RiTimeLine,
  RiAlertLine,
  RiEyeLine,
  RiDownloadLine
} from 'react-icons/ri';

function DocumentManagement({ 
  projects,
  buyerDocuments,
  setBuyerDocuments,
  documentStatuses,
  setDocumentStatuses,
  notifications,
  setNotifications,
  handleDocumentUpload,
  handleDocumentStatusUpdate
}) {
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Document Upload & Delivery Tracker</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowDocumentModal(true)}
        >
          <RiAddLine className="w-4 h-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { name: 'Contracts', icon: RiFileTextLine, count: documentStatuses.contracts?.total || 0, color: 'text-blue-500' },
          { name: 'Permits', icon: RiShieldCheckLine, count: documentStatuses.permits?.total || 0, color: 'text-green-500' },
          { name: 'Titles', icon: RiUserLine, count: documentStatuses.titles?.total || 0, color: 'text-purple-500' },
          { name: 'Receipts', icon: RiMoneyDollarCircleLine, count: documentStatuses.receipts?.total || 0, color: 'text-orange-500' }
        ].map(category => (
          <div key={category.name} className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <category.icon className={`text-2xl ${category.color}`} />
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-base-content/70">{category.count} documents</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Status Overview */}
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <RiFileTextLine />
            Document Status Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(documentStatuses).map(([category, status]) => (
              <div key={category} className="bg-base-100 p-4 rounded-lg">
                <h4 className="font-medium capitalize mb-2">{category}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <span className="badge badge-info badge-sm">{status.submitted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="badge badge-warning badge-sm">{status.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="badge badge-success badge-sm">{status.delivered}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buyer Document Management */}
      <div className="space-y-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <RiUserLine />
              Buyer Documents by Project
            </h3>
            
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="collapse collapse-arrow bg-base-100">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                      <div className="flex justify-between items-center">
                        <span>{project.name}</span>
                        <div className="flex gap-2">
                          <div className="badge badge-outline">{project.unitsSold || 0} buyers</div>
                          <div className="badge badge-primary">
                            {Math.floor(Math.random() * 15) + 5} docs
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="collapse-content">
                      <div className="space-y-3 pt-4">
                        {/* Mock buyer documents */}
                        {buyerDocuments
                          .filter(buyer => buyer.project === project.name)
                          .map((buyer, index) => (
                            <div key={buyer.id} className="p-4 bg-base-200 rounded-lg">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium">{buyer.name}</h4>
                                  <p className="text-sm text-base-content/70">{buyer.email}</p>
                                  <p className="text-sm text-base-content/70">Unit: {buyer.unit}</p>
                                </div>
                                <div className="badge badge-info">
                                  {buyer.completionPercentage}% Complete
                                </div>
                              </div>
                              
                              {/* Document status grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {buyer.documents.map(doc => (
                                  <div key={doc.type} className="flex items-center gap-2 p-2 bg-base-100 rounded">
                                    <RiFileTextLine className="text-sm" />
                                    <span className="text-xs font-medium capitalize">{doc.type}</span>
                                    <div className={`badge badge-xs ${
                                      doc.status === 'delivered' ? 'badge-success' :
                                      doc.status === 'processing' ? 'badge-warning' :
                                      'badge-outline'
                                    }`}>
                                      {doc.status}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex gap-2 mt-3">
                                <button className="btn btn-xs btn-ghost">
                                  <RiEyeLine className="w-3 h-3" />
                                  View All
                                </button>
                                <button className="btn btn-xs btn-ghost">
                                  <RiUploadCloud2Line className="w-3 h-3" />
                                  Upload
                                </button>
                                <button 
                                  className="btn btn-xs btn-ghost"
                                  onClick={() => {
                                    // Update document status
                                    const randomDoc = buyer.documents[Math.floor(Math.random() * buyer.documents.length)];
                                    const newStatus = randomDoc.status === 'submitted' ? 'processing' : 
                                                     randomDoc.status === 'processing' ? 'delivered' : 'delivered';
                                    handleDocumentStatusUpdate(randomDoc.type, newStatus);
                                  }}
                                >
                                  Update Status
                                </button>
                              </div>
                            </div>
                          ))
                        }
                        
                        {/* Additional buyers for each project */}
                        {Array.from({ length: Math.max(0, (project.unitsSold || 3) - buyerDocuments.filter(b => b.project === project.name).length) }).map((_, index) => (
                          <div key={`additional-${index}`} className="p-4 bg-base-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">Buyer {buyerDocuments.filter(b => b.project === project.name).length + index + 1} - Unit {String.fromCharCode(65 + buyerDocuments.filter(b => b.project === project.name).length + index)}</h4>
                                <p className="text-sm text-base-content/70">
                                  buyer{buyerDocuments.filter(b => b.project === project.name).length + index + 1}@example.com
                                </p>
                              </div>
                              <div className="badge badge-info">
                                {Math.floor(Math.random() * 100)}% Complete
                              </div>
                            </div>
                            
                            {/* Document status grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[
                                { name: 'Contract', status: Math.random() > 0.5 ? 'delivered' : 'processing' },
                                { name: 'Receipt', status: Math.random() > 0.3 ? 'processing' : 'submitted' },
                                { name: 'Title', status: Math.random() > 0.7 ? 'delivered' : 'submitted' },
                                { name: 'Permit', status: Math.random() > 0.4 ? 'delivered' : 'processing' }
                              ].map(doc => (
                                <div key={doc.name} className="flex items-center gap-2 p-2 bg-base-100 rounded">
                                  <RiFileTextLine className="text-sm" />
                                  <span className="text-xs font-medium">{doc.name}</span>
                                  <div className={`badge badge-xs ${
                                    doc.status === 'delivered' ? 'badge-success' :
                                    doc.status === 'processing' ? 'badge-warning' :
                                    'badge-outline'
                                  }`}>
                                    {doc.status}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <button className="btn btn-xs btn-ghost">
                                <RiEyeLine className="w-3 h-3" />
                                View All
                              </button>
                              <button className="btn btn-xs btn-ghost">
                                <RiUploadCloud2Line className="w-3 h-3" />
                                Upload
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/50">
                <RiFileTextLine className="mx-auto text-4xl mb-2" />
                <p>No projects available</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Activity Timeline */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <RiTimeLine />
              Recent Document Activity
            </h3>
            
            <div className="space-y-3">
              {[
                { buyer: 'Juan Dela Cruz', document: 'Title Transfer', status: 'delivered', time: '2 hours ago', project: 'Horizon Residences' },
                { buyer: 'Maria Santos', document: 'Contract Amendment', status: 'processing', time: '4 hours ago', project: 'Vista Heights' },
                { buyer: 'Jose Rodriguez', document: 'Receipt of Payment', status: 'submitted', time: '1 day ago', project: 'Palm Gardens' },
                { buyer: 'Ana Garcia', document: 'Building Permit', status: 'delivered', time: '2 days ago', project: 'Horizon Residences' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-base-100 rounded">
                  <div className="flex items-center gap-3">
                    <RiFileTextLine className="text-lg text-base-content/70" />
                    <div>
                      <p className="font-medium">{activity.document}</p>
                      <p className="text-sm text-base-content/70">
                        {activity.buyer} • {activity.project}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${
                      activity.status === 'delivered' ? 'badge-success' :
                      activity.status === 'processing' ? 'badge-warning' :
                      'badge-outline'
                    }`}>
                      {activity.status}
                    </div>
                    <p className="text-xs text-base-content/50 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <RiAlertLine />
              Pending Actions
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { action: 'Review Contract Amendments', count: 3, priority: 'high' },
                { action: 'Upload Title Documents', count: 2, priority: 'medium' },
                { action: 'Process Permit Applications', count: 5, priority: 'medium' },
                { action: 'Send Delivery Confirmations', count: 1, priority: 'low' }
              ].map((item, index) => (
                <div key={index} className="p-4 bg-base-100 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{item.action}</h4>
                    <div className={`badge badge-sm ${
                      item.priority === 'high' ? 'badge-error' :
                      item.priority === 'medium' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {item.priority}
                    </div>
                  </div>
                  <p className="text-sm text-base-content/70 mb-3">
                    {item.count} items requiring attention
                  </p>
                  <button className="btn btn-xs btn-primary">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocumentModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Upload Buyer Document</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Document Category *</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    onChange={(e) => {
                      // Update form state for document category
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="contract">Contract</option>
                    <option value="permit">Building Permit</option>
                    <option value="title">Title Transfer</option>
                    <option value="receipt">Payment Receipt</option>
                    <option value="amendment">Contract Amendment</option>
                    <option value="clearance">Government Clearance</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Project *</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Buyer Name</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full" 
                    placeholder="Enter buyer's full name"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Unit Number</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered w-full" 
                    placeholder="e.g., A-101, B-203"
                  />
                </div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Document File *</span>
                </label>
                <input 
                  type="file" 
                  className="file-input file-input-bordered w-full"
                  accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        e.target.value = '';
                        return;
                      }
                      
                      // Display file info
                      const fileInfo = document.getElementById('file-info');
                      if (fileInfo) {
                        fileInfo.innerHTML = `
                          <div class="alert alert-info">
                            <div>
                              <div class="font-semibold">${file.name}</div>
                              <div class="text-sm">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                          </div>
                        `;
                      }
                    }
                  }}
                />
                <div id="file-info" className="mt-2"></div>
                <div className="text-sm text-base-content/60 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                </div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Document Status</span>
                </label>
                <select className="select select-bordered w-full">
                  <option value="submitted">Submitted</option>
                  <option value="processing">Under Processing</option>
                  <option value="delivered">Delivered to Buyer</option>
                  <option value="pending">Pending Requirements</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full" 
                  placeholder="Additional notes about this document..."
                  rows="3"
                ></textarea>
              </div>
              
              <div className="alert alert-warning">
                <RiAlertLine />
                <div>
                  <div className="font-semibold">Document Upload Guidelines:</div>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Ensure documents are clear and readable</li>
                    <li>• Use appropriate categories for better organization</li>
                    <li>• Update status regularly to keep buyers informed</li>
                    <li>• Sensitive documents will be encrypted automatically</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowDocumentModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // Simulate document upload
                  const notification = {
                    id: `notif-${Date.now()}`,
                    type: 'document',
                    message: 'Document uploaded successfully and submitted for processing',
                    timestamp: new Date().toISOString(),
                    read: false
                  };
                  setNotifications(prev => [notification, ...prev]);
                  setShowDocumentModal(false);
                  
                  // Update document counts
                  setDocumentStatuses(prev => ({
                    ...prev,
                    contracts: {
                      ...prev.contracts,
                      total: prev.contracts.total + 1,
                      submitted: prev.contracts.submitted + 1
                    }
                  }));
                }}
              >
                <RiUploadCloud2Line className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentManagement;
