import { motion } from "framer-motion";
import { useState } from "react";
import { 
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine
} from 'react-icons/ri';

function DocumentSubmission() {
  const [activeDocTab, setActiveDocTab] = useState('personal');
  const [uploadStatus, setUploadStatus] = useState({});

  // Document status data
  const [docStatus, setDocStatus] = useState({
    personal: {
      verified: 4,
      total: 5,
      score: 85
    },
    financial: {
      verified: 2,
      total: 4,
      score: 60
    },
    property: {
      verified: 0,
      total: 3,
      score: 0
    },
    legal: {
      verified: 3,
      total: 3,
      score: 100
    }
  });

  const documentSections = {
    personal: [
      { 
        id: 'validId', 
        label: 'Valid ID (Primary)', 
        description: 'Passport or Driver\'s License',
        status: 'verified',
        score: 98,
        feedback: ['✓ High clarity scan', '✓ All details visible', '✓ No glare or shadows']
      },
      { 
        id: 'birthCertificate', 
        label: 'Birth Certificate', 
        description: 'PSA-authenticated copy',
        status: 'verified',
        score: 92,
        feedback: ['✓ Clear text', '✓ Complete details']
      },
      { 
        id: 'marriageCertificate', 
        label: 'Marriage Certificate', 
        description: 'If applicable',
        status: 'pending',
        score: 0
      },
      { 
        id: 'taxReturns', 
        label: 'Income Tax Returns', 
        description: 'Latest 2 years',
        status: 'processing',
        score: 75
      }
    ],
    financial: [
      { 
        id: 'employmentCertificate', 
        label: 'Certificate of Employment', 
        description: 'With compensation details',
        status: 'verified',
        score: 95
      },
      { 
        id: 'payslips', 
        label: 'Latest Pay Slips', 
        description: 'Last 3 months',
        status: 'processing',
        score: 65
      },
      { 
        id: 'bankStatements', 
        label: 'Bank Statements', 
        description: 'Last 6 months',
        status: 'pending',
        score: 0
      },
      { 
        id: 'creditReport', 
        label: 'Credit Report', 
        description: 'From accredited bureau',
        status: 'pending',
        score: 0
      }
    ],
    property: [
      { 
        id: 'titleDeed', 
        label: 'Property Title/Deed', 
        description: 'Certified true copy',
        status: 'pending',
        score: 0
      },
      { 
        id: 'propertyPhotos', 
        label: 'Property Photos', 
        description: 'All angles and features',
        status: 'pending',
        score: 0
      },
      { 
        id: 'locationMap', 
        label: 'Location Map', 
        description: 'With property marked',
        status: 'pending',
        score: 0
      }
    ],
    legal: [
      { 
        id: 'contract', 
        label: 'Sales Contract', 
        description: 'Draft or executed',
        status: 'verified',
        score: 100
      },
      { 
        id: 'disclosure', 
        label: 'Disclosure Forms', 
        description: 'Completed and signed',
        status: 'verified',
        score: 100
      },
      { 
        id: 'authorization', 
        label: 'Authorization Letter', 
        description: 'If applicable',
        status: 'verified',
        score: 100
      }
    ]
  };

  const handleFileUpload = (category, docType) => (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload the file and update status
      setUploadStatus({
        type: 'success',
        message: `${file.name} uploaded successfully! Verification in progress.`
      });
      
      // Simulate status update
      setTimeout(() => {
        setDocStatus(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            verified: Math.min(prev[category].verified + 1, prev[category].total),
            score: Math.min(prev[category].score + 25, 100)
          }
        }));
      }, 1500);
    }
  };

  const getStatusBadge = (status, score) => {
    switch(status) {
      case 'verified':
        return (
          <div className="badge badge-success gap-1">
            <span className="w-2 h-2 bg-success rounded-full"></span>
            Verified
          </div>
        );
      case 'processing':
        return (
          <div className="badge badge-warning gap-1">
            <span className="w-2 h-2 bg-warning rounded-full"></span>
            Processing
          </div>
        );
      case 'pending':
        return (
          <div className="badge badge-error gap-1">
            <span className="w-2 h-2 bg-error rounded-full"></span>
            Pending
          </div>
        );
      default:
        return null;
    }
  };

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
          <div className="badge badge-primary">Processing</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-primary/20 hover:border-primary/30 transition-colors">
            <div className="stat-title font-medium text-primary/70">Personal Docs</div>
            <div className="stat-value text-2xl text-primary">{docStatus.personal.score}%</div>
            <div className="stat-desc text-primary/60">{docStatus.personal.verified}/{docStatus.personal.total} Verified</div>
          </div>
          <div className="stat bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-warning/20 hover:border-warning/30 transition-colors">
            <div className="stat-title font-medium text-warning/70">Financial Docs</div>
            <div className="stat-value text-2xl text-warning">{docStatus.financial.score}%</div>
            <div className="stat-desc text-warning/60">{docStatus.financial.verified}/{docStatus.financial.total} Verified</div>
          </div>
          <div className="stat bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-error/20 hover:border-error/30 transition-colors">
            <div className="stat-title font-medium text-error/70">Property Docs</div>
            <div className="stat-value text-2xl text-error">{docStatus.property.score}%</div>
            <div className="stat-desc text-error/60">{docStatus.property.verified}/{docStatus.property.total} Verified</div>
          </div>
          <div className="stat bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-success/20 hover:border-success/30 transition-colors">
            <div className="stat-title font-medium text-success/70">Legal Docs</div>
            <div className="stat-value text-2xl text-success">{docStatus.legal.score}%</div>
            <div className="stat-desc text-success/60">{docStatus.legal.verified}/{docStatus.legal.total} Verified</div>
          </div>
        </div>
      </div>

      {/* Document Categories Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a 
          className={`tab ${activeDocTab === 'personal' ? 'tab-active' : ''}`}
          onClick={() => setActiveDocTab('personal')}
        >
          Personal
        </a>
        <a 
          className={`tab ${activeDocTab === 'financial' ? 'tab-active' : ''}`}
          onClick={() => setActiveDocTab('financial')}
        >
          Financial
        </a>
        <a 
          className={`tab ${activeDocTab === 'property' ? 'tab-active' : ''}`}
          onClick={() => setActiveDocTab('property')}
        >
          Property
        </a>
        <a 
          className={`tab ${activeDocTab === 'legal' ? 'tab-active' : ''}`}
          onClick={() => setActiveDocTab('legal')}
        >
          Legal
        </a>
      </div>

      {/* Upload Status Alert */}
      {uploadStatus.message && (
        <motion.div 
          className={`alert ${uploadStatus.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {uploadStatus.type === 'success' ? (
            <RiCheckboxCircleLine className="w-5 h-5" />
          ) : (
            <RiErrorWarningLine className="w-5 h-5" />
          )}
          <span>{uploadStatus.message}</span>
        </motion.div>
      )}

      {/* Quality Upload Alert */}
      <div className="alert alert-info mb-4">
        <RiInformationLine className="w-5 h-5" />
        <div>
          <span>Upload clear, high-quality scans for better AI verification scores</span>
        </div>
      </div>

      {/* Document Upload Section */}
      <motion.div 
        className="space-y-6"
        key={activeDocTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {documentSections[activeDocTab].map((doc) => (
          <div key={doc.id} className="card bg-base-200/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">{doc.label}</h4>
                <p className="text-sm text-base-content/70">{doc.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(doc.status)}
                {doc.score > 0 && (
                  <span className={`font-semibold ${
                    doc.status === 'verified' ? 'text-success' : 
                    doc.status === 'processing' ? 'text-warning' : 'text-error'
                  }`}>
                    {doc.score}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <input 
                type="file" 
                className="file-input file-input-bordered file-input-sm w-full" 
                onChange={handleFileUpload(activeDocTab, doc.id)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <button className="btn btn-square btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {doc.feedback && (
              <div className="mt-2 text-sm text-success">
                {doc.feedback.map((item, index) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Submit Button */}
      <div className="flex gap-4 mt-6">
        <button className="btn btn-primary flex-1">
          <RiCheckboxCircleLine className="w-5 h-5 mr-2" />
          Submit All Documents
        </button>
        <button className="btn btn-outline">Save Progress</button>
      </div>
    </div>
  );
}

export default DocumentSubmission;