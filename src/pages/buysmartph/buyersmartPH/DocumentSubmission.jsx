import { useState, useEffect } from "react";
import { 
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiUploadLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiLoader4Line
} from 'react-icons/ri';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../config/Firebase';
import { 
  DOCUMENT_CATEGORIES, 
  DOCUMENT_TYPES,
  uploadDocument,
  saveDocumentRecord,
  getUserDocuments,
  deleteDocument,
  calculateDocumentStats
} from '../../../utils/FileHandler';

function DocumentSubmission() {
  const [activeDocTab, setActiveDocTab] = useState('personal');
  const [uploadStatus, setUploadStatus] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [docStats, setDocStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});

  // Get current user from Firebase Auth or localStorage
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!mounted) return;
      
      if (firebaseUser) {
        console.log('Firebase Auth: User authenticated:', firebaseUser.uid);
        setCurrentUser(firebaseUser);
      } else {
        console.log('Firebase Auth: No user, checking localStorage...');
        // Fallback to localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            const userObj = {
              uid: parsedData.uid || parsedData.userNumber || parsedData.id,
              email: parsedData.email,
              fullName: parsedData.fullName || `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim(),
              firstName: parsedData.firstName,
              lastName: parsedData.lastName,
              phone: parsedData.phone,
              role: parsedData.role
            };
            console.log('localStorage: User found:', userObj.uid);
            setCurrentUser(userObj);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setCurrentUser(null);
          }
        } else {
          console.log('No user data found');
          setCurrentUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Fetch user documents when user is available
  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!currentUser?.uid) {
        console.log('No user available, skipping document fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching documents for user:', currentUser.uid);
        
        // Add a small delay to ensure Firebase Auth is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const documents = await getUserDocuments(currentUser.uid);
        console.log('Documents fetched successfully:', documents);
        setUserDocuments(documents);
        
        // Calculate stats for each category
        const stats = {};
        Object.keys(DOCUMENT_TYPES).forEach(category => {
          stats[category] = calculateDocumentStats(documents, category);
        });
        setDocStats(stats);
      } catch (error) {
        console.error('Error fetching documents:', error);
        
        // Handle specific Firebase errors
        if (error.code === 'permission-denied') {
          setUploadStatus({
            type: 'error',
            message: 'Permission denied. Please ensure you are logged in with proper access rights.'
          });
        } else if (error.code === 'unauthenticated') {
          setUploadStatus({
            type: 'error',
            message: 'User not authenticated. Please log in and try again.'
          });
        } else {
          setUploadStatus({
            type: 'error',
            message: 'Error loading documents. Please refresh the page and try again.'
          });
        }
        
        // Set empty state to avoid undefined errors
        setUserDocuments([]);
        setDocStats({
          personal: { completionPercentage: 0, verified: 0, totalRequired: 0, processing: 0 },
          financial: { completionPercentage: 0, verified: 0, totalRequired: 0, processing: 0 },
          property: { completionPercentage: 0, verified: 0, totalRequired: 0, processing: 0 },
          legal: { completionPercentage: 0, verified: 0, totalRequired: 0, processing: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch documents if we have a user
    if (currentUser) {
      fetchUserDocuments();
    }
  }, [currentUser]); // Remove loading from dependencies

  // Handle file upload with progress tracking
  const handleFileUpload = async (category, docType, file) => {
    if (!currentUser?.uid || !file) return;

    const uploadKey = `${category}-${docType}`;
    setUploading(prev => ({ ...prev, [uploadKey]: 0 }));

    try {
      // Upload file to Firebase Storage with progress tracking
      const fileData = await uploadDocument(
        file,
        currentUser.uid,
        category,
        docType,
        (progress) => {
          setUploading(prev => ({ ...prev, [uploadKey]: progress }));
        }
      );

      // Save document record to Firestore
      const docRecord = await saveDocumentRecord(
        currentUser.uid,
        category,
        docType,
        fileData,
        {
          userEmail: currentUser.email,
          userName: currentUser.fullName || 'User'
        }
      );

      // Update local state
      setUserDocuments(prev => {
        const filtered = prev.filter(doc => !(doc.category === category && doc.docType === docType));
        return [...filtered, docRecord];
      });

      // Update stats
      const updatedDocuments = userDocuments.filter(doc => !(doc.category === category && doc.docType === docType));
      updatedDocuments.push(docRecord);
      
      const stats = {};
      Object.keys(DOCUMENT_TYPES).forEach(cat => {
        stats[cat] = calculateDocumentStats(updatedDocuments, cat);
      });
      setDocStats(stats);

      setUploadStatus({
        type: 'success',
        message: `${file.name} uploaded successfully! Document verification in progress.`
      });

      // Clear status after 5 seconds
      setTimeout(() => setUploadStatus({}), 5000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: `Upload failed: ${error.message}`
      });
      setTimeout(() => setUploadStatus({}), 5000);
    } finally {
      setUploading(prev => {
        const newUploading = { ...prev };
        delete newUploading[uploadKey];
        return newUploading;
      });
    }
  };

  // Handle file input change
  const onFileInputChange = (category, docType) => (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(category, docType, file);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (document) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(document.id, document.filePath);
      
      // Update local state
      const updatedDocuments = userDocuments.filter(doc => doc.id !== document.id);
      setUserDocuments(updatedDocuments);
      
      // Update stats
      const stats = {};
      Object.keys(DOCUMENT_TYPES).forEach(category => {
        stats[category] = calculateDocumentStats(updatedDocuments, category);
      });
      setDocStats(stats);

      setUploadStatus({
        type: 'success',
        message: 'Document deleted successfully.'
      });
      setTimeout(() => setUploadStatus({}), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error deleting document. Please try again.'
      });
      setTimeout(() => setUploadStatus({}), 3000);
    }
  };

  // Get document by category and type
  const getDocumentByType = (category, docType) => {
    return userDocuments.find(doc => doc.category === category && doc.docType === docType);
  };

  // Get status badge component
  const getStatusBadge = (status, score = 0) => {
    switch(status) {
      case 'verified':
        return (
          <div className="badge badge-success gap-1">
            <span className="w-2 h-2 bg-success rounded-full"></span>
            Verified {score > 0 && `(${score}%)`}
          </div>
        );
      case 'processing':
        return (
          <div className="badge badge-warning gap-1">
            <span className="w-2 h-2 bg-warning rounded-full animate-pulse"></span>
            Processing
          </div>
        );
      case 'rejected':
        return (
          <div className="badge badge-error gap-1">
            <span className="w-2 h-2 bg-error rounded-full"></span>
            Rejected
          </div>
        );
      case 'pending':
        return (
          <div className="badge badge-info gap-1">
            <span className="w-2 h-2 bg-info rounded-full"></span>
            Pending Review
          </div>
        );
      default:
        return (
          <div className="badge badge-ghost gap-1">
            <span className="w-2 h-2 bg-base-300 rounded-full"></span>
            Not Uploaded
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <RiLoader4Line className="w-8 h-8 animate-spin text-primary" />
            <p className="text-base-content/70">Loading your documents...</p>
          </div>
        </div>
      </div>
    );
  }

  // User not logged in
  if (!currentUser) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <div className="text-center py-12">
          <RiFileList3Line className="w-16 h-16 text-base-content/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-base-content mb-2">Please log in</h3>
          <p className="text-base-content/60 text-sm">You need to be logged in to upload and manage your documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <RiFileList3Line className="w-8 h-8 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-amber-500">Document Submission</h3>
          <p className="text-base-content/70 text-sm mt-2">
            Streamlined document upload and verification process
          </p>
        </div>
      </div>

      {/* AI Verification Status Overview */}
      <div className="bg-base-200/50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Verification Status</h3>
          <div className="badge badge-primary">
            {Object.values(docStats).some(stat => stat.processing > 0) ? 'Processing' : 'Ready'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-primary/20 hover:border-primary/30 transition-colors">
            <div className="stat-title font-medium text-primary/70">Personal Docs</div>
            <div className="stat-value text-2xl text-primary">{docStats.personal?.completionPercentage || 0}%</div>
            <div className="stat-desc text-primary/60">{docStats.personal?.verified || 0}/{docStats.personal?.totalRequired || 0} Required</div>
          </div>
          <div className="stat bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-warning/20 hover:border-warning/30 transition-colors">
            <div className="stat-title font-medium text-warning/70">Financial Docs</div>
            <div className="stat-value text-2xl text-warning">{docStats.financial?.completionPercentage || 0}%</div>
            <div className="stat-desc text-warning/60">{docStats.financial?.verified || 0}/{docStats.financial?.totalRequired || 0} Required</div>
          </div>
          <div className="stat bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-error/20 hover:border-error/30 transition-colors">
            <div className="stat-title font-medium text-error/70">Property Docs</div>
            <div className="stat-value text-2xl text-error">{docStats.property?.completionPercentage || 0}%</div>
            <div className="stat-desc text-error/60">{docStats.property?.verified || 0}/{docStats.property?.totalRequired || 0} Required</div>
          </div>
          <div className="stat bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-success/20 hover:border-success/30 transition-colors">
            <div className="stat-title font-medium text-success/70">Legal Docs</div>
            <div className="stat-value text-2xl text-success">{docStats.legal?.completionPercentage || 0}%</div>
            <div className="stat-desc text-success/60">{docStats.legal?.verified || 0}/{docStats.legal?.totalRequired || 0} Required</div>
          </div>
        </div>
      </div>

      {/* Document Categories Tabs */}
      <div className="tabs tabs-boxed mb-6">
        {Object.keys(DOCUMENT_TYPES).map((category) => (
          <a 
            key={category}
            className={`tab ${activeDocTab === category ? 'tab-active' : ''}`}
            onClick={() => setActiveDocTab(category)}
          >
            {DOCUMENT_CATEGORIES[category]?.split(' ')[0] || category}
          </a>
        ))}
      </div>

      {/* Upload Status Alert */}
      {uploadStatus.message && (
        <div 
          className={`alert ${uploadStatus.type === 'success' ? 'alert-success' : 'alert-error'} mb-4 animate-fade-in`}
        >
          {uploadStatus.type === 'success' ? (
            <RiCheckboxCircleLine className="w-5 h-5" />
          ) : (
            <RiErrorWarningLine className="w-5 h-5" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Quality Upload Alert */}
      <div className="alert alert-info mb-4">
        <RiInformationLine className="w-5 h-5" />
        <div>
          <span>Upload clear, high-quality scans for better AI verification scores. Supported formats: PDF, JPG, PNG (Max: 10MB)</span>
        </div>
      </div>

      {/* Document Upload Section */}
      <div 
        className="space-y-6 animate-slide-in"
        key={activeDocTab}
      >
        {DOCUMENT_TYPES[activeDocTab]?.map((docType) => {
          const existingDoc = getDocumentByType(activeDocTab, docType.id);
          const uploadKey = `${activeDocTab}-${docType.id}`;
          const isUploading = uploading[uploadKey] !== undefined;
          
          return (
            <div key={docType.id} className="card bg-base-200/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{docType.label}</h4>
                    {docType.required && (
                      <span className="badge badge-error badge-xs">Required</span>
                    )}
                  </div>
                  <p className="text-sm text-base-content/70">{docType.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(existingDoc?.status, existingDoc?.score)}
                </div>
              </div>
              
              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RiUploadLine className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm">Uploading... {Math.round(uploading[uploadKey])}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={uploading[uploadKey]} 
                    max="100"
                  ></progress>
                </div>
              )}

              {/* Document Actions */}
              <div className="flex items-center gap-4 mt-4">
                {!existingDoc && !isUploading && (
                  <>
                    <input 
                      type="file" 
                      className="file-input file-input-bordered file-input-sm flex-1" 
                      onChange={onFileInputChange(activeDocTab, docType.id)}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isUploading}
                    />
                    <button className="btn btn-primary btn-sm">
                      <RiUploadLine className="w-4 h-4" />
                      Upload
                    </button>
                  </>
                )}
                
                {existingDoc && !isUploading && (
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 bg-base-100 p-2 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{existingDoc.fileName}</span>
                        <div className="flex items-center gap-2">
                          {existingDoc.fileUrl && (
                            <button 
                              className="btn btn-ghost btn-xs"
                              onClick={() => window.open(existingDoc.fileUrl, '_blank')}
                            >
                              <RiEyeLine className="w-3 h-3" />
                            </button>
                          )}
                          <button 
                            className="btn btn-error btn-xs"
                            onClick={() => handleDeleteDocument(existingDoc)}
                          >
                            <RiDeleteBinLine className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-1">
                        Uploaded: {existingDoc.uploadedAt?.toDate ? 
                          existingDoc.uploadedAt.toDate().toLocaleDateString() : 
                          'Recently'
                        }
                      </div>
                    </div>
                    <input 
                      type="file" 
                      className="file-input file-input-bordered file-input-sm w-32" 
                      onChange={onFileInputChange(activeDocTab, docType.id)}
                      accept=".pdf,.jpg,.jpeg,.png"
                      title="Replace document"
                    />
                  </div>
                )}
              </div>

              {/* Document Feedback */}
              {existingDoc?.feedback && existingDoc.feedback.length > 0 && (
                <div className={`mt-3 text-sm ${
                  existingDoc.status === 'verified' ? 'text-success' : 
                  existingDoc.status === 'rejected' ? 'text-error' : 
                  'text-warning'
                }`}>
                  {existingDoc.feedback.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="text-xs">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary and Actions */}
      <div className="flex flex-col gap-4 mt-8">
        {/* Overall Progress */}
        <div className="bg-base-200/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Overall Progress</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-base-content/60">Total Documents:</span>
              <span className="font-semibold ml-2">{userDocuments.length}</span>
            </div>
            <div>
              <span className="text-base-content/60">Verified:</span>
              <span className="font-semibold ml-2 text-success">
                {userDocuments.filter(doc => doc.status === 'verified').length}
              </span>
            </div>
            <div>
              <span className="text-base-content/60">Processing:</span>
              <span className="font-semibold ml-2 text-warning">
                {userDocuments.filter(doc => doc.status === 'processing').length}
              </span>
            </div>
            <div>
              <span className="text-base-content/60">Pending:</span>
              <span className="font-semibold ml-2 text-error">
                {userDocuments.filter(doc => doc.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            className="btn btn-primary flex-1"
            disabled={userDocuments.length === 0}
          >
            <RiCheckboxCircleLine className="w-5 h-5 mr-2" />
            Submit for Final Review
          </button>
          <button className="btn btn-outline">
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentSubmission;