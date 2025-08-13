import React, { useState, useEffect } from 'react';
import {
  RiFileTextLine,
  RiDownloadLine,
  RiEyeLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiImageLine,
  RiShieldCheckLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiNotificationLine,
  RiSearchLine
} from 'react-icons/ri';

function BuyerDocumentViewer({ 
  propertyInfo,
  buyerDocuments,
  documentStatuses,
  notifications,
  setNotifications 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Get document icon based on file type
  const getDocumentIcon = (type, fileName) => {
    if (fileName?.toLowerCase().includes('.pdf')) return RiFilePdfLine;
    if (fileName?.toLowerCase().includes('.doc') || fileName?.toLowerCase().includes('.docx')) return RiFileWordLine;
    if (fileName?.toLowerCase().includes('.jpg') || fileName?.toLowerCase().includes('.png') || fileName?.toLowerCase().includes('.jpeg')) return RiImageLine;
    
    switch(type?.toLowerCase()) {
      case 'contract': return RiFileTextLine;
      case 'permit': return RiShieldCheckLine;
      case 'title': return RiUserLine;
      case 'receipt': return RiMoneyDollarCircleLine;
      default: return RiFileTextLine;
    }
  };

  // Get status badge styling
  const getStatusStyling = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return { class: 'badge-success', text: 'Delivered' };
      case 'processing': return { class: 'badge-warning', text: 'Processing' };
      case 'submitted': return { class: 'badge-info', text: 'Submitted' };
      case 'pending': return { class: 'badge-error', text: 'Pending Requirements' };
      default: return { class: 'badge-outline', text: status || 'Unknown' };
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const totalDocuments = Object.values(documentStatuses).reduce((sum, status) => sum + status.total, 0);
    const deliveredDocuments = Object.values(documentStatuses).reduce((sum, status) => sum + status.delivered, 0);
    return totalDocuments > 0 ? Math.round((deliveredDocuments / totalDocuments) * 100) : 0;
  };

  // Get all documents for current buyer/property
  const getAllDocuments = () => {
    const buyerDoc = buyerDocuments?.find(buyer => 
      buyer.project === propertyInfo?.name || buyer.unit === propertyInfo?.unit
    );
    
    if (!buyerDoc) {
      // Generate mock documents based on document statuses
      const mockDocuments = [];
      Object.entries(documentStatuses).forEach(([category, status]) => {
        for (let i = 0; i < status.total; i++) {
          const docStatus = i < status.delivered ? 'delivered' : 
                           i < (status.delivered + status.processing) ? 'processing' : 'submitted';
          mockDocuments.push({
            id: `${category}-${i + 1}`,
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Document ${i + 1}`,
            type: category,
            status: docStatus,
            uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fileName: `${category}_document_${i + 1}.pdf`,
            fileSize: Math.floor(Math.random() * 5000) + 500 + ' KB'
          });
        }
      });
      return mockDocuments;
    }
    
    return buyerDoc.documents.map(doc => ({
      ...doc,
      name: `${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} Document`,
      fileName: `${doc.type}_document.pdf`,
      fileSize: Math.floor(Math.random() * 5000) + 500 + ' KB'
    }));
  };

  // Filter documents based on search and filters
  const filteredDocuments = getAllDocuments().filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || doc.type === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle document download simulation
  const handleDownload = (document) => {
    // In a real app, this would trigger actual file download
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'document',
      message: `Document "${document.name}" downloaded successfully`,
      timestamp: new Date().toISOString(),
      read: false,
      project: propertyInfo?.name
    };
    setNotifications(prev => [notification, ...prev]);
    
    // Simulate download
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the actual file URL
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle document view
  const handleView = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  // Send notification when document status changes
  const sendDocumentNotification = (document, newStatus) => {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'document',
      message: `Document "${document.name}" status updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
      read: false,
      project: propertyInfo?.name
    };
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Document Overview Header */}
      <div className="card bg-gradient-to-r from-info/10 to-primary/10 border border-info/20">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <RiFileTextLine className="text-primary" />
                Property Documents
              </h2>
              <p className="text-base-content/70">
                Track and download your property-related documents
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{getCompletionPercentage()}%</div>
              <div className="badge badge-info">Document Completion</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Document Progress</span>
              <span>{getCompletionPercentage()}% Complete</span>
            </div>
            <progress 
              className="progress progress-primary w-full h-3" 
              value={getCompletionPercentage()} 
              max="100"
            ></progress>
          </div>
        </div>
      </div>

      {/* Document Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(documentStatuses).map(([category, status]) => {
          const IconComponent = getDocumentIcon(category);
          return (
            <div key={category} className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center gap-3 mb-3">
                  <IconComponent className="text-2xl text-primary" />
                  <div>
                    <h3 className="font-semibold capitalize">{category}</h3>
                    <p className="text-xs text-base-content/70">{status.total} documents</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="badge badge-success badge-xs">{status.delivered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="badge badge-warning badge-xs">{status.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <span className="badge badge-info badge-xs">{status.submitted}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="input input-bordered flex items-center gap-2">
                <RiSearchLine />
                <input 
                  type="text" 
                  className="grow" 
                  placeholder="Search documents..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
            <select 
              className="select select-bordered"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="processing">Processing</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
            </select>
            <select 
              className="select select-bordered"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="contract">Contracts</option>
              <option value="permit">Permits</option>
              <option value="title">Titles</option>
              <option value="receipt">Receipts</option>
            </select>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map(document => {
                const IconComponent = getDocumentIcon(document.type, document.fileName);
                const statusStyling = getStatusStyling(document.status);
                
                return (
                  <div key={document.id} className="flex items-center justify-between p-4 bg-base-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <IconComponent className="text-2xl text-primary" />
                      <div>
                        <h4 className="font-medium">{document.name}</h4>
                        <p className="text-sm text-base-content/70">
                          {document.fileName} • {document.fileSize} • Uploaded: {document.uploadDate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`badge ${statusStyling.class}`}>
                        {statusStyling.text}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleView(document)}
                          disabled={document.status === 'submitted' || document.status === 'processing'}
                        >
                          <RiEyeLine className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(document)}
                          disabled={document.status !== 'delivered'}
                        >
                          <RiDownloadLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-base-content/50">
                <RiFileTextLine className="mx-auto text-4xl mb-2" />
                <p>No documents found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Timeline */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <RiTimeLine />
            Recent Document Activity
          </h3>
          
          <div className="space-y-3">
            {[
              { document: 'Contract Amendment', status: 'delivered', time: '2 hours ago', action: 'Document delivered and available for download' },
              { document: 'Title Transfer', status: 'processing', time: '1 day ago', action: 'Document submitted for government processing' },
              { document: 'Building Permit', status: 'submitted', time: '3 days ago', action: 'Document uploaded by developer' },
              { document: 'Payment Receipt', status: 'delivered', time: '1 week ago', action: 'Receipt processed and delivered' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 bg-base-100 rounded-lg">
                <div className={`badge ${getStatusStyling(activity.status).class} badge-sm mt-1`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{activity.document}</h4>
                    <span className="text-xs text-base-content/50">{activity.time}</span>
                  </div>
                  <p className="text-sm text-base-content/70">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Document Status Alerts */}
      {filteredDocuments.some(doc => doc.status === 'pending') && (
        <div className="alert alert-warning">
          <RiAlertLine />
          <div>
            <div className="font-semibold">Action Required</div>
            <div className="text-sm">
              Some documents require additional information or signatures. 
              Please contact your developer for assistance.
            </div>
          </div>
        </div>
      )}

      {/* Unread document notifications */}
      {notifications.filter(n => !n.read && n.type === 'document').length > 0 && (
        <div className="alert alert-info">
          <RiNotificationLine />
          <div>
            <div className="font-semibold">New Document Updates!</div>
            <div className="text-sm">You have {notifications.filter(n => !n.read && n.type === 'document').length} unread document notifications.</div>
          </div>
          <button 
            className="btn btn-sm btn-info"
            onClick={() => setNotifications(prev => 
              prev.map(n => n.type === 'document' ? {...n, read: true} : n)
            )}
          >
            Mark All Read
          </button>
        </div>
      )}

      {/* Document View Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {selectedDocument.name}
              </h3>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => setShowDocumentModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">File Name:</label>
                  <p>{selectedDocument.fileName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">File Size:</label>
                  <p>{selectedDocument.fileSize}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Upload Date:</label>
                  <p>{selectedDocument.uploadDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <div className={`badge ${getStatusStyling(selectedDocument.status).class}`}>
                    {getStatusStyling(selectedDocument.status).text}
                  </div>
                </div>
              </div>
              
              {selectedDocument.status === 'delivered' ? (
                <div className="bg-base-200 p-4 rounded-lg text-center">
                  <RiFilePdfLine className="mx-auto text-6xl text-primary mb-4" />
                  <p className="font-medium mb-2">Document Ready for Download</p>
                  <p className="text-sm text-base-content/70 mb-4">
                    This document has been processed and is ready for download.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    <RiDownloadLine className="w-4 h-4 mr-2" />
                    Download Document
                  </button>
                </div>
              ) : (
                <div className="bg-base-200 p-4 rounded-lg text-center">
                  <RiTimeLine className="mx-auto text-6xl text-warning mb-4" />
                  <p className="font-medium mb-2">Document Processing</p>
                  <p className="text-sm text-base-content/70">
                    This document is currently being processed. You'll be notified when it's ready for download.
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDocumentModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDocumentViewer;
