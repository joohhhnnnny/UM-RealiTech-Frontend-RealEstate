import React, { useState } from 'react';
import { FaUpload, FaFileAlt, FaIdCard, FaBuilding, FaTimes } from 'react-icons/fa';
import VerificationService from '../services/verificationService';

const VerificationModal = ({ isOpen, onClose, userType, userId, onVerificationSubmitted }) => {
  const [formData, setFormData] = useState({
    prcLicense: '',
    expirationDate: '',
    businessPermit: '',
    fullName: '',
    contactNumber: '',
    email: '',
    yearsExperience: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const requiredDocuments = {
    agent: ['PRC License', 'Valid ID', 'Professional Photo'],
    developer: ['Business Permit', 'SEC Registration', 'Valid ID']
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if documents are uploaded
    if (documents.length < 1) {
      alert('Please upload at least 1 document for verification');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting verification with documents:', documents);
      console.log('Form data:', formData);
      
      // Pass the form data and documents to the parent handler
      onVerificationSubmitted(formData, documents);
      onClose();
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">
            {userType === 'agent' ? 'Agent' : 'Developer'} Verification
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="alert alert-info mb-6">
          <FaFileAlt />
          <div>
            <div className="font-semibold">Demo Mode - Quick Verification</div>
            <div className="text-sm mt-1">
              File upload simulation only. Documents won't be stored (Storage requires Firebase upgrade).
              Upload any file and complete the form for instant verification.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="input input-bordered w-full"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className="input input-bordered w-full"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsExperience"
                    className="input input-bordered w-full"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* License Information */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold mb-4">
                {userType === 'agent' ? 'PRC License Information' : 'Business Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    {userType === 'agent' ? 'PRC License Number' : 'Business Permit Number'}
                  </label>
                  <input
                    type="text"
                    name={userType === 'agent' ? 'prcLicense' : 'businessPermit'}
                    className="input input-bordered w-full"
                    value={userType === 'agent' ? formData.prcLicense : formData.businessPermit}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    className="input input-bordered w-full"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h4 className="font-semibold mb-4">Required Documents</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {requiredDocuments[userType].map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaFileAlt className="text-primary" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>

              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('file-input').click()}
              >
                <FaUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: JPEG, PNG, PDF (Max 10MB per file)
                </p>
              </div>

              <input
                id="file-input"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Uploaded Files */}
              {documents.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Uploaded Documents ({documents.length})</h5>
                  <div className="space-y-2">
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-base-100 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <FaFileAlt className="text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => removeDocument(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || documents.length < 1}
            >
              {isSubmitting ? 'Processing Demo...' : 'Submit Demo Verification'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
};

export default VerificationModal;
