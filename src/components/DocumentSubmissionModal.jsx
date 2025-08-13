import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiCloseLine, 
  RiFileTextLine, 
  RiUserLine, 
  RiHeartLine, 
  RiMoneyDollarBoxLine,
  RiCheckboxCircleLine,
  RiUploadCloudLine,
  RiFileAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiSendPlaneLine,
  RiSaveLine,
  RiDownloadLine
} from 'react-icons/ri';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/Firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  collection,
  addDoc
} from 'firebase/firestore';
import { DocumentUploadService } from '../services/DocumentUploadService';
import Toast from './Toast';

const DocumentSubmissionModal = ({ isOpen, onClose, selectedProperty }) => {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  
  // Professional close confirmation modal states
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Show toast helper function
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);
  
  // Debug user authentication
  useEffect(() => {
    console.log('User auth state:', { 
      user: !!user, 
      loading, 
      uid: user?.uid, 
      email: user?.email,
      isAnonymous: user?.isAnonymous 
    });
  }, [user, loading]);
  
  // Form data states
  const [formData, setFormData] = useState({
    // Personal Identification
    governmentId: null,
    governmentIdPath: '',
    tinNumber: '',
    
    // Civil Status
    civilStatus: '', // 'single' or 'married'
    birthCertificate: null,
    birthCertificatePath: '',
    marriageCertificate: null,
    marriageCertificatePath: '',
    
    // Proof of Income
    employmentType: '', // 'employed', 'self-employed', 'ofw'
    // Employed documents
    payslips: [], // max 3
    payslipsPaths: [],
    employmentCertificate: null,
    employmentCertificatePath: '',
    itr: null,
    itrPath: '',
    // Self-employed documents
    businessRegistration: null, // DTI/SEC
    businessRegistrationPath: '',
    auditedFinancialStatement: null,
    auditedFinancialStatementPath: '',
    bankStatements: [], // max 6
    bankStatementsPaths: [],
    // OFW documents
    employmentContract: null,
    employmentContractPath: '',
    remittanceProof: [], // max 6
    remittanceProofPaths: [],
    
    // Metadata
    propertyId: selectedProperty?.id || null,
    propertyTitle: selectedProperty?.title || '',
    status: 'draft', // 'draft', 'submitted', 'approved', 'rejected'
    submittedAt: null,
    createdAt: null,
    updatedAt: null
  });

  const [errors, setErrors] = useState({});

  // Upload file to local filesystem using DocumentUploadService
  const uploadFile = useCallback(async (file, documentType) => {
    if (!file || !user) {
      console.log('Upload failed - missing file or user:', { file: !!file, user: !!user, userId: user?.uid });
      return null;
    }
    
    console.log('Starting upload with user:', { userId: user.uid, email: user.email, documentType });
    
    try {
      // Validate file before upload
      if (!DocumentUploadService.validateFileType(file)) {
        throw new Error('Invalid file type. Only PDF and image files are allowed.');
      }
      
      if (!DocumentUploadService.validateFileSize(file, 5)) {
        throw new Error('File too large. Maximum size is 5MB.');
      }
      
      // Upload using the service
      const filePath = await DocumentUploadService.uploadFile(file, user.uid, documentType);
      
      console.log(`File uploaded successfully: ${filePath}`);
      return filePath;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, [user]);

  // Load saved document from Firestore
  const loadSavedDocument = useCallback(async () => {
    if (!user || !selectedProperty) return;

    setIsLoading(true);
    try {
      const docRef = doc(db, 'documentSubmissions', `${user.uid}_${selectedProperty.id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Create file metadata objects from saved paths for UI display
        const createFileMetadata = (path) => {
          if (!path) return null;
          
          // Extract filename from path
          const filename = path.split('/').pop() || 'uploaded_file';
          const extension = filename.split('.').pop()?.toLowerCase();
          
          // Create a mock file object for display purposes
          return {
            name: filename,
            size: 0, // We don't store file size, so display as unknown
            type: extension === 'pdf' ? 'application/pdf' : `image/${extension}`,
            path: path, // Store the actual path for reference
            isRestored: true // Flag to identify restored files
          };
        };
        
        const createMultipleFileMetadata = (paths) => {
          if (!paths || !Array.isArray(paths)) return [];
          return paths.map(path => createFileMetadata(path)).filter(Boolean);
        };
        
        setFormData(prevData => ({
          ...prevData,
          ...data,
          // Create file metadata objects from stored paths
          governmentId: createFileMetadata(data.governmentIdPath, 'governmentId'),
          birthCertificate: createFileMetadata(data.birthCertificatePath, 'birthCertificate'),
          marriageCertificate: createFileMetadata(data.marriageCertificatePath, 'marriageCertificate'),
          payslips: createMultipleFileMetadata(data.payslipsPaths),
          employmentCertificate: createFileMetadata(data.employmentCertificatePath, 'employmentCertificate'),
          itr: createFileMetadata(data.itrPath, 'itr'),
          businessRegistration: createFileMetadata(data.businessRegistrationPath, 'businessRegistration'),
          auditedFinancialStatement: createFileMetadata(data.auditedFinancialStatementPath, 'auditedFinancialStatement'),
          bankStatements: createMultipleFileMetadata(data.bankStatementsPaths),
          employmentContract: createFileMetadata(data.employmentContractPath, 'employmentContract'),
          remittanceProof: createMultipleFileMetadata(data.remittanceProofPaths)
        }));
        setDocumentId(docSnap.id);
        
        // Set last saved time from Firestore timestamp (converted to Date) or current time as fallback
        const firestoreDate = data.updatedAt?.toDate();
        if (firestoreDate) {
          setLastSaved(firestoreDate);
        }
        
        console.log('Loaded saved document with file metadata:', {
          governmentId: !!data.governmentIdPath,
          birthCertificate: !!data.birthCertificatePath,
          marriageCertificate: !!data.marriageCertificatePath,
          payslips: data.payslipsPaths?.length || 0,
          totalPaths: Object.keys(data).filter(key => key.endsWith('Path') || key.endsWith('Paths')).length
        });
      }
    } catch (error) {
      console.error('Error loading saved document:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedProperty]);

  // Save progress to Firestore
  const saveProgress = useCallback(async (autoSave = true) => {
    if (!user || !selectedProperty) {
      console.log('Save failed - missing requirements:', { 
        user: !!user, 
        userId: user?.uid, 
        selectedProperty: !!selectedProperty,
        propertyId: selectedProperty?.id 
      });
      return;
    }

    console.log('Starting save with user:', { userId: user.uid, email: user.email, propertyId: selectedProperty.id });

    if (autoSave) setIsSaving(true);
    
    try {
      const docId = documentId || `${user.uid}_${selectedProperty.id}`;
      const docRef = doc(db, 'documentSubmissions', docId);
      
      console.log('Saving to document ID:', docId);
      
      const saveData = {
        ...formData,
        // Remove file objects before saving
        governmentId: null,
        birthCertificate: null,
        marriageCertificate: null,
        payslips: [],
        employmentCertificate: null,
        itr: null,
        businessRegistration: null,
        auditedFinancialStatement: null,
        bankStatements: [],
        employmentContract: null,
        remittanceProof: [],
        
        // Metadata
        userId: user.uid,
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.title,
        updatedAt: serverTimestamp(),
        ...(formData.createdAt ? {} : { createdAt: serverTimestamp() })
      };

      console.log('Save data:', { ...saveData, updatedAt: 'serverTimestamp()', createdAt: formData.createdAt ? 'existing' : 'new' });

      await setDoc(docRef, saveData, { merge: true });
      
      if (!documentId) setDocumentId(docId);
      
      // Set the exact time when the save was completed
      const saveTime = new Date();
      setLastSaved(saveTime);
      
      console.log('Save successful at:', saveTime.toLocaleTimeString());
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    } finally {
      if (autoSave) setIsSaving(false);
    }
  }, [user, selectedProperty, formData, documentId]);

  // Auto-save when form data changes (only when there's meaningful data)
  useEffect(() => {
    if (!user || !selectedProperty) return;
    
    // Check if there's meaningful data worth saving
    const hasMeaningfulData = !!(
      formData.tinNumber?.trim() || 
      formData.civilStatus || 
      formData.employmentType ||
      formData.governmentId ||
      formData.birthCertificate ||
      formData.marriageCertificate ||
      (formData.payslips && formData.payslips.length > 0) ||
      formData.employmentCertificate ||
      formData.itr ||
      formData.businessRegistration ||
      formData.auditedFinancialStatement ||
      (formData.bankStatements && formData.bankStatements.length > 0) ||
      formData.employmentContract ||
      (formData.remittanceProof && formData.remittanceProof.length > 0)
    );
    
    if (!hasMeaningfulData) return;

    const autoSaveTimer = setTimeout(() => {
      saveProgress(true);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, user, selectedProperty, saveProgress]);

  // Load saved data when modal opens
  useEffect(() => {
    if (isOpen && user && selectedProperty) {
      loadSavedDocument();
    }
  }, [isOpen, user, selectedProperty, loadSavedDocument]);

  const tabs = [
    {
      id: 0,
      title: 'Personal ID',
      icon: RiUserLine,
      description: 'Government-issued identification'
    },
    {
      id: 1,
      title: 'Civil Status',
      icon: RiHeartLine,
      description: 'Marital and personal status'
    },
    {
      id: 2,
      title: 'Proof of Income',
      icon: RiMoneyDollarBoxLine,
      description: 'Income verification documents'
    }
  ];

  // Handle file upload
  const handleFileUpload = useCallback(async (fieldName, files, isMultiple = false) => {
    if (!user) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Please login to upload files' }));
      return;
    }

    // Set loading state for this field
    setErrors(prev => ({ ...prev, [fieldName]: 'Uploading...' }));

    try {
      if (isMultiple) {
        const fileArray = Array.from(files);
        const uploadPromises = fileArray.map(async (file) => {
          try {
            const path = await uploadFile(file, fieldName);
            return { file, path };
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            throw new Error(`Failed to upload ${file.name}: ${error.message}`);
          }
        });
        
        const results = await Promise.all(uploadPromises);
        
        setFormData(prev => ({
          ...prev,
          [fieldName]: [...(prev[fieldName] || []), ...results.map(r => r.file)],
          [`${fieldName}Paths`]: [...(prev[`${fieldName}Paths`] || []), ...results.map(r => r.path)]
        }));
      } else {
        const file = files[0];
        const path = await uploadFile(file, fieldName);
        
        setFormData(prev => ({
          ...prev,
          [fieldName]: file,
          [`${fieldName}Path`]: path
        }));
      }
      
      // Clear any existing errors for this field
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({
        ...prev,
        [fieldName]: `Upload failed: ${error.message}`
      }));
    }
  }, [user, uploadFile]);

  // Replace/update an existing file
  const handleFileReplace = useCallback(async (fieldName, index, newFile, isMultiple = false) => {
    if (!user) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Please login to replace files' }));
      return;
    }

    // Set loading state for this field
    setErrors(prev => ({ ...prev, [fieldName]: 'Replacing file...' }));

    try {
      // Validate new file before upload
      if (!DocumentUploadService.validateFileType(newFile)) {
        throw new Error('Invalid file type. Only PDF and image files are allowed.');
      }
      
      if (!DocumentUploadService.validateFileSize(newFile, 5)) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      if (isMultiple) {
        const pathsFieldName = `${fieldName}Paths`;
        const currentFiles = formData[fieldName] || [];
        const currentPaths = formData[pathsFieldName] || [];
        const oldPath = currentPaths[index];

        // Delete old file from server
        if (oldPath && user) {
          try {
            await DocumentUploadService.deleteFile(oldPath, user.uid);
            console.log(`Old file deleted successfully: ${oldPath}`);
          } catch (deleteError) {
            console.warn('Error deleting old file:', deleteError);
          }
        }

        // Upload new file
        const newPath = await uploadFile(newFile, fieldName);

        // Update arrays at the specific index
        const updatedFiles = [...currentFiles];
        const updatedPaths = [...currentPaths];
        updatedFiles[index] = newFile;
        updatedPaths[index] = newPath;

        setFormData(prev => ({
          ...prev,
          [fieldName]: updatedFiles,
          [pathsFieldName]: updatedPaths
        }));

      } else {
        const pathFieldName = `${fieldName}Path`;
        const oldPath = formData[pathFieldName];

        // Delete old file from server
        if (oldPath && user) {
          try {
            await DocumentUploadService.deleteFile(oldPath, user.uid);
            console.log(`Old file deleted successfully: ${oldPath}`);
          } catch (deleteError) {
            console.warn('Error deleting old file:', deleteError);
          }
        }

        // Upload new file
        const newPath = await uploadFile(newFile, fieldName);

        setFormData(prev => ({
          ...prev,
          [fieldName]: newFile,
          [pathFieldName]: newPath
        }));
      }

      // Clear any existing errors for this field
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));

      console.log(`File replaced successfully: ${newFile.name}`);

    } catch (error) {
      console.error('Error replacing file:', error);
      setErrors(prev => ({
        ...prev,
        [fieldName]: `Replace failed: ${error.message}`
      }));
    }
  }, [user, uploadFile, formData]);

  // Remove file using DocumentUploadService
  const removeFile = useCallback(async (fieldName, index = null) => {
    try {
      if (index !== null) {
        const pathsFieldName = `${fieldName}Paths`;
        const paths = formData[pathsFieldName] || [];
        const pathToDelete = paths[index];
        
        // Delete using the service
        if (pathToDelete && user) {
          try {
            await DocumentUploadService.deleteFile(pathToDelete, user.uid);
            console.log(`File deleted successfully: ${pathToDelete}`);
          } catch (deleteError) {
            console.warn('Error deleting file:', deleteError);
          }
        }
        
        setFormData(prev => ({
          ...prev,
          [fieldName]: prev[fieldName].filter((_, i) => i !== index),
          [pathsFieldName]: prev[pathsFieldName].filter((_, i) => i !== index)
        }));
      } else {
        const pathFieldName = `${fieldName}Path`;
        const pathToDelete = formData[pathFieldName];
        
        // Delete using the service
        if (pathToDelete && user) {
          try {
            await DocumentUploadService.deleteFile(pathToDelete, user.uid);
            console.log(`File deleted successfully: ${pathToDelete}`);
          } catch (deleteError) {
            console.warn('Error deleting file:', deleteError);
          }
        }
        
        setFormData(prev => ({
          ...prev,
          [fieldName]: null,
          [pathFieldName]: ''
        }));
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  }, [formData, user]);

  // Handle input changes
  const handleInputChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear errors for this field
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  // Validation functions
  const validateCurrentTab = () => {
    const newErrors = {};
    
    switch (activeTab) {
      case 0: // Personal Identification
        if (!formData.governmentId) {
          newErrors.governmentId = 'Valid Government ID is required';
        }
        if (!formData.tinNumber.trim()) {
          newErrors.tinNumber = 'TIN number is required';
        } else if (!/^\d{3}-\d{3}-\d{3}-\d{3}$/.test(formData.tinNumber)) {
          newErrors.tinNumber = 'TIN format should be XXX-XXX-XXX-XXX';
        }
        break;
        
      case 1: // Civil Status
        if (!formData.civilStatus) {
          newErrors.civilStatus = 'Please select your civil status';
        }
        if (!formData.birthCertificate) {
          newErrors.birthCertificate = 'Birth Certificate is required';
        }
        if (formData.civilStatus === 'married' && !formData.marriageCertificate) {
          newErrors.marriageCertificate = 'Marriage Certificate is required for married applicants';
        }
        break;
        
      case 2: // Proof of Income
        if (!formData.employmentType) {
          newErrors.employmentType = 'Please select your employment type';
        } else {
          switch (formData.employmentType) {
            case 'employed':
              if (!formData.payslips || formData.payslips.length < 3) {
                newErrors.payslips = 'Please upload 3 months of payslips';
              }
              if (!formData.employmentCertificate) {
                newErrors.employmentCertificate = 'Certificate of Employment is required';
              }
              if (!formData.itr) {
                newErrors.itr = 'Latest Income Tax Return is required';
              }
              break;
              
            case 'self-employed':
              if (!formData.businessRegistration) {
                newErrors.businessRegistration = 'DTI/SEC registration is required';
              }
              if (!formData.auditedFinancialStatement) {
                newErrors.auditedFinancialStatement = 'Audited financial statement is required';
              }
              if (!formData.bankStatements || formData.bankStatements.length < 6) {
                newErrors.bankStatements = 'Please upload 6 months of bank statements';
              }
              break;
              
            case 'ofw':
              if (!formData.employmentContract) {
                newErrors.employmentContract = 'Employment contract abroad is required';
              }
              if (!formData.remittanceProof || formData.remittanceProof.length < 3) {
                newErrors.remittanceProof = 'Please upload at least 3 months of remittance proof';
              }
              break;
          }
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const goToNextTab = () => {
    if (validateCurrentTab() && activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const goToPrevTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateCurrentTab()) return;
    if (!user) {
      setErrors({ general: 'Please login to submit documents' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Final save with submitted status
      const docId = documentId || `${user.uid}_${selectedProperty.id}`;
      const docRef = doc(db, 'documentSubmissions', docId);
      
      const finalData = {
        ...formData,
        // Remove file objects before saving
        governmentId: null,
        birthCertificate: null,
        marriageCertificate: null,
        payslips: [],
        employmentCertificate: null,
        itr: null,
        businessRegistration: null,
        auditedFinancialStatement: null,
        bankStatements: [],
        employmentContract: null,
        remittanceProof: [],
        
        // Final submission metadata
        status: 'submitted',
        submittedAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.title,
        updatedAt: serverTimestamp(),
        ...(formData.createdAt ? {} : { createdAt: serverTimestamp() })
      };

      await setDoc(docRef, finalData, { merge: true });
      
      // Also create a submission record in a separate collection for admin tracking
      const submissionRef = collection(db, 'propertyApplications');
      await addDoc(submissionRef, {
        documentSubmissionId: docId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.title,
        propertyLocation: selectedProperty.location,
        propertyPrice: selectedProperty.price,
        status: 'pending_review',
        submittedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      setSubmitSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        // Reset form for next use
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting documents:', error);
      setErrors({ general: 'Failed to submit documents. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form function
  const resetForm = useCallback(() => {
    setFormData({
      governmentId: null,
      governmentIdPath: '',
      tinNumber: '',
      civilStatus: '',
      birthCertificate: null,
      birthCertificatePath: '',
      marriageCertificate: null,
      marriageCertificatePath: '',
      employmentType: '',
      payslips: [],
      payslipsPaths: [],
      employmentCertificate: null,
      employmentCertificatePath: '',
      itr: null,
      itrPath: '',
      businessRegistration: null,
      businessRegistrationPath: '',
      auditedFinancialStatement: null,
      auditedFinancialStatementPath: '',
      bankStatements: [],
      bankStatementsPaths: [],
      employmentContract: null,
      employmentContractPath: '',
      remittanceProof: [],
      remittanceProofPaths: [],
      propertyId: null,
      propertyTitle: '',
      status: 'draft',
      submittedAt: null,
      createdAt: null,
      updatedAt: null
    });
    setActiveTab(0);
    setErrors({});
    setDocumentId(null);
    setLastSaved(null);
  }, []);

  // Handle modal close with professional confirmation
  const handleClose = useCallback(async () => {
    // Check for actual unsaved data with more precise logic
    const hasActualData = !!(
      formData.tinNumber?.trim() || 
      formData.civilStatus || 
      formData.employmentType ||
      formData.governmentId ||
      formData.birthCertificate ||
      formData.marriageCertificate ||
      (formData.payslips && formData.payslips.length > 0) ||
      formData.employmentCertificate ||
      formData.itr ||
      formData.businessRegistration ||
      formData.auditedFinancialStatement ||
      (formData.bankStatements && formData.bankStatements.length > 0) ||
      formData.employmentContract ||
      (formData.remittanceProof && formData.remittanceProof.length > 0)
    );
    
    // Only show confirmation if there's actual data AND it's not already submitted
    if (hasActualData && formData.status !== 'submitted' && !lastSaved) {
      // Show professional confirmation modal instead of default alert
      setShowCloseConfirmation(true);
      return;
    }
    
    // Close directly if no actual data or already saved/submitted
    onClose();
  }, [formData, lastSaved, onClose]);

  // Handle save and close action
  const handleSaveAndClose = useCallback(async () => {
    setIsClosing(true);
    try {
      const saveResult = await saveProgress(false);
      if (saveResult) {
        showToast('Progress saved successfully!', 'success');
        setTimeout(() => {
          onClose();
          setShowCloseConfirmation(false);
        }, 1000);
      } else {
        showToast('Failed to save progress', 'error');
      }
    } catch (error) {
      console.error('Error saving before close:', error);
      showToast('Error saving progress', 'error');
    } finally {
      setIsClosing(false);
    }
  }, [saveProgress, onClose, showToast]);

  // Handle close without saving
  const handleCloseWithoutSaving = useCallback(() => {
    showToast('Closing without saving changes', 'info');
    setTimeout(() => {
      onClose();
      setShowCloseConfirmation(false);
    }, 800);
  }, [onClose, showToast]);

  // File upload component
  const FileUploadField = ({ 
    fieldName, 
    label, 
    accept = ".pdf,.jpg,.jpeg,.png", 
    multiple = false,
    maxFiles = 1,
    description = "",
    required = false 
  }) => {
    const files = multiple ? (formData[fieldName] || []) : (formData[fieldName] ? [formData[fieldName]] : []);
    const hasError = errors[fieldName];
    const isUploading = hasError === 'Uploading...' || hasError === 'Replacing file...';
    const isReplacing = hasError === 'Replacing file...';
    
    return (
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">
            {label} {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
        
        {description && (
          <p className="text-xs text-base-content/60 mb-3 leading-relaxed">{description}</p>
        )}
        
        <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          hasError && !isUploading ? 'border-error bg-error/5' : 
          isUploading ? 'border-primary bg-primary/5' :
          'border-base-300 hover:border-primary bg-base-200/30'
        }`}>
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <span className="loading loading-spinner loading-md text-primary mb-2"></span>
              <p className="text-sm text-primary">
                {isReplacing ? 'Replacing file...' : 'Uploading files...'}
              </p>
            </div>
          ) : files.length === 0 ? (
            <label className="cursor-pointer flex flex-col items-center justify-center py-4">
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(e) => handleFileUpload(fieldName, e.target.files, multiple)}
                className="hidden"
                disabled={isUploading}
              />
              <RiUploadCloudLine className="w-8 h-8 text-base-content/50 mb-2" />
              <p className="text-sm text-base-content/70">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-base-content/50">
                {accept.includes('.pdf') ? 'PDF, JPG, PNG' : 'JPG, PNG'} files (Max {DocumentUploadService.formatFileSize(5 * 1024 * 1024)})
              </p>
            </label>
          ) : (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-base-100 p-3 rounded border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <RiFileAddLine className="w-4 h-4 text-success" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate max-w-48" title={file.name}>
                          {file.name}
                        </span>
                        {file.isRestored ? (
                          <div className="badge badge-info badge-xs">Previously Uploaded</div>
                        ) : (
                          <div className="badge badge-success badge-xs">Uploaded</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {!file.isRestored && file.size > 0 && (
                          <span className="text-xs text-base-content/50">
                            ({DocumentUploadService.formatFileSize(file.size)})
                          </span>
                        )}
                        {file.isRestored && (
                          <span className="text-xs text-success">
                            ✓ File saved from previous session
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Replace/Update button for single files or individual files in arrays */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept={accept}
                        onChange={(e) => {
                          if (e.target.files?.length > 0) {
                            // Replace the specific file
                            handleFileReplace(fieldName, index, e.target.files[0], multiple);
                          }
                        }}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                        title={file.isRestored ? "Replace uploaded file" : "Update file"}
                        disabled={isUploading}
                        onClick={(e) => {
                          e.preventDefault();
                          e.currentTarget.previousElementSibling.click();
                        }}
                      >
                        <RiUploadCloudLine className="w-3 h-3" />
                      </button>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFile(fieldName, multiple ? index : null)}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      title="Remove file"
                      disabled={isUploading}
                    >
                      <RiDeleteBinLine className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              {multiple && files.length < maxFiles && !isUploading && (
                <label className="cursor-pointer flex items-center gap-2 text-primary hover:text-primary-focus p-2 rounded border border-dashed border-primary/30 hover:bg-primary/5">
                  <input
                    type="file"
                    accept={accept}
                    multiple
                    onChange={(e) => handleFileUpload(fieldName, e.target.files, multiple)}
                    className="hidden"
                  />
                  <RiFileAddLine className="w-4 h-4" />
                  <span className="text-sm">Add more files ({files.length}/{maxFiles})</span>
                </label>
              )}
            </div>
          )}
        </div>
        
        {hasError && !isUploading && (
          <label className="label">
            <span className="label-text-alt text-error">{hasError}</span>
          </label>
        )}
        
        {isUploading && (
          <label className="label">
            <span className="label-text-alt text-primary">
              {isReplacing ? 'Please wait while the file is being replaced...' : 'Please wait while files are being uploaded...'}
            </span>
          </label>
        )}
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Personal Identification
        return (
          <motion.div
            key="personal-id"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <RiUserLine className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Personal Identification</h3>
              <p className="text-sm text-base-content/60">
                Please provide your government-issued identification
              </p>
            </div>

            <FileUploadField
              fieldName="governmentId"
              label="Valid Government ID"
              description="Upload a clear photo of your driver's license, passport, or national ID"
              required
            />

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  TIN Number <span className="text-error ml-1">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="XXX-XXX-XXX-XXX"
                className={`input input-bordered ml-2 ${errors.tinNumber ? 'input-error' : ''}`}
                value={formData.tinNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 0) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1-$2-$3-$4');
                  }
                  handleInputChange('tinNumber', value);
                }}
                maxLength={15}
              />
              {errors.tinNumber && (
                <label className="label ml-2">
                  <span className="label-text-alt text-error">{errors.tinNumber}</span>
                </label>
              )}
            </div>
          </motion.div>
        );

      case 1: // Civil Status
        return (
          <motion.div
            key="civil-status"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <RiHeartLine className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Civil Status</h3>
              <p className="text-sm text-base-content/60">
                Please provide your marital status and supporting documents
              </p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Marital Status <span className="text-error ml-1">*</span>
                </span>
              </label>
              <div className="flex gap-6 mt-2">
                <label className="cursor-pointer flex items-center gap-3">
                  <input
                    type="radio"
                    name="civilStatus"
                    value="single"
                    className="radio radio-primary"
                    checked={formData.civilStatus === 'single'}
                    onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                  />
                  <span className="label-text">Single</span>
                </label>
                <label className="cursor-pointer flex items-center gap-3">
                  <input
                    type="radio"
                    name="civilStatus"
                    value="married"
                    className="radio radio-primary"
                    checked={formData.civilStatus === 'married'}
                    onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                  />
                  <span className="label-text">Married</span>
                </label>
              </div>
              {errors.civilStatus && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.civilStatus}</span>
                </label>
              )}
            </div>

            <FileUploadField
              fieldName="birthCertificate"
              label="Birth Certificate"
              description="NSO/PSA issued birth certificate"
              required
            />

            {formData.civilStatus === 'married' && (
              <FileUploadField
                fieldName="marriageCertificate"
                label="Marriage Certificate"
                description="NSO/PSA issued marriage certificate"
                required
              />
            )}
          </motion.div>
        );

      case 2: // Proof of Income
        return (
          <motion.div
            key="proof-of-income"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <RiMoneyDollarBoxLine className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Proof of Income</h3>
              <p className="text-sm text-base-content/60">
                Please provide documents that verify your income source
              </p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Employment Type <span className="text-error ml-1">*</span>
                </span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {[
                  { value: 'employed', label: 'Employed', desc: 'Regular employee' },
                  { value: 'self-employed', label: 'Self-Employed', desc: 'Business owner' },
                  { value: 'ofw', label: 'OFW', desc: 'Overseas worker' }
                ].map(({ value, label, desc }) => (
                  <label key={value} className="cursor-pointer">
                    <div className={`border-2 rounded-lg p-4 transition-colors ${
                      formData.employmentType === value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-base-300 hover:border-primary/50'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="radio"
                          name="employmentType"
                          value={value}
                          className="radio radio-primary"
                          checked={formData.employmentType === value}
                          onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        />
                        <div className="font-medium">{label}</div>
                      </div>
                      <div className="text-xs text-base-content/60 ml-7">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.employmentType && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.employmentType}</span>
                </label>
              )}
            </div>

            {/* Employed Documents */}
            {formData.employmentType === 'employed' && (
              <div className="space-y-4">
                <FileUploadField
                  fieldName="payslips"
                  label="Latest 3 Months Payslips"
                  description="Upload your most recent 3 monthly payslips"
                  multiple
                  maxFiles={3}
                  required
                />

                <FileUploadField
                  fieldName="employmentCertificate"
                  label="Certificate of Employment with Salary Details"
                  description="Certificate from HR with salary information"
                  required
                />

                <FileUploadField
                  fieldName="itr"
                  label="Latest Income Tax Return (ITR)"
                  description="Most recent ITR filed with BIR"
                  required
                />
              </div>
            )}

            {/* Self-Employed Documents */}
            {formData.employmentType === 'self-employed' && (
              <div className="space-y-4">
                <FileUploadField
                  fieldName="businessRegistration"
                  label="DTI / SEC Registration"
                  description="Business registration certificate"
                  required
                />

                <FileUploadField
                  fieldName="auditedFinancialStatement"
                  label="Latest ITR with Audited Financial Statement"
                  description="ITR with audited financial statement"
                  required
                />

                <FileUploadField
                  fieldName="bankStatements"
                  label="Latest 6 Months Bank Statements"
                  description="Bank statements showing business transactions"
                  multiple
                  maxFiles={6}
                  required
                />
              </div>
            )}

            {/* OFW Documents */}
            {formData.employmentType === 'ofw' && (
              <div className="space-y-4">
                <FileUploadField
                  fieldName="employmentContract"
                  label="Employment Contract Abroad"
                  description="Current employment contract from overseas employer"
                  required
                />

                <FileUploadField
                  fieldName="remittanceProof"
                  label="Latest Proof of Remittance (3-6 months)"
                  description="Remittance receipts or bank transfer records"
                  multiple
                  maxFiles={6}
                  required
                />
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="modal modal-open">
        <div className="modal-box bg-base-100 text-base-content max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
            <p className="text-base-content/70">
              {loading ? 'Authenticating...' : 'Loading saved progress...'}
            </p>
          </div>
        </div>
        <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm"></div>
      </div>
    );
  }

  // Show login required state
  if (!user) {
    return (
      <div className="modal modal-open">
        <div className="modal-box bg-base-100 text-base-content max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <RiUserLine className="w-16 h-16 text-base-content/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-base-content/70 text-center mb-4">
              Please login to submit documents for this property.
            </p>
            <button onClick={handleClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
        <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm" onClick={handleClose}></div>
      </div>
    );
  }

  // Success screen
  if (submitSuccess) {
    return (
      <div className="modal modal-open">
        <div className="modal-box bg-base-100 text-base-content max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <RiCheckboxCircleLine className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-success mb-2">Documents Submitted Successfully!</h3>
            <p className="text-base-content/70 mb-4">
              Your documents for <strong>{selectedProperty?.title}</strong> have been submitted for review.
            </p>
            <p className="text-sm text-base-content/60">
              You'll receive an email confirmation and updates on the review process.
            </p>
          </motion.div>
        </div>
        <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm"></div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl bg-base-100 text-base-content max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
          <div className="flex-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <RiFileTextLine className="text-primary" />
              Submit Documents
              {formData.status === 'draft' && (
                <span className="badge badge-warning badge-sm ml-2">Draft</span>
              )}
            </h3>
            {selectedProperty && (
              <p className="text-sm text-base-content/60 mt-1">
                For: <span className="font-medium">{selectedProperty.title}</span>
              </p>
            )}
            {lastSaved && (
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <RiCheckLine className="w-3 h-3" />
                Last saved: {lastSaved.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-2 text-primary">
                <span className="loading loading-spinner loading-xs"></span>
                <span className="text-xs">Saving...</span>
              </div>
            )}
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-circle"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="alert alert-error mb-6">
            <span>{errors.general}</span>
          </div>
        )}

        {/* Progress Tabs */}
        <div className="flex justify-between mb-8">
          {tabs.map((tab, index) => {
            const isActive = activeTab === index;
            const isCompleted = index < activeTab;
            const Icon = tab.icon;
            
            return (
              <div key={tab.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-success border-success text-success-content' 
                      : isActive 
                        ? 'bg-primary border-primary text-primary-content' 
                        : 'border-base-300 text-base-content/50'
                  }`}>
                    {isCompleted ? (
                      <RiCheckLine className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-base-content/50'
                    }`}>
                      {tab.title}
                    </div>
                    <div className="text-xs text-base-content/50">
                      {tab.description}
                    </div>
                  </div>
                </div>
                
                {index < tabs.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                    isCompleted ? 'bg-success' : 'bg-base-300'
                  }`} style={{ zIndex: -1 }}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-base-300">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevTab}
              disabled={activeTab === 0}
              className="btn btn-outline gap-2"
            >
              <RiArrowLeftLine className="w-4 h-4" />
              Previous
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="text-sm text-base-content/60">
              Step {activeTab + 1} of {tabs.length}
            </div>
            {lastSaved && (
              <div className="text-xs text-success flex items-center gap-1">
                <RiCheckLine className="w-3 h-3" />
                Saved {lastSaved.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
            )}
          </div>

          {activeTab === tabs.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !user}
              className="btn btn-primary gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <RiSendPlaneLine className="w-4 h-4" />
                  Submit Documents
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goToNextTab}
              className="btn btn-primary gap-2"
            >
              Next
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm" onClick={handleClose}></div>
      
      {/* Professional Close Confirmation Modal */}
      {showCloseConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box bg-base-100 text-base-content max-w-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center py-4"
            >
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiFileTextLine className="w-8 h-8 text-warning" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-base-content mb-2">
                Unsaved Changes Detected
              </h3>
              
              {/* Message */}
              <p className="text-base-content/70 mb-6 leading-relaxed">
                You have entered information in your document submission. 
                Would you like to save your progress before closing?
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSaveAndClose}
                  disabled={isClosing}
                  className="btn btn-primary gap-2 w-full"
                >
                  {isClosing ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <RiSaveLine className="w-4 h-4" />
                      Save & Close
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCloseWithoutSaving}
                  disabled={isClosing}
                  className="btn btn-ghost gap-2 w-full"
                >
                  <RiCloseLine className="w-4 h-4" />
                  Close Without Saving
                </button>
                
                <button
                  onClick={() => setShowCloseConfirmation(false)}
                  disabled={isClosing}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
          <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm"></div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        duration={3000}
        position="top-right"
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default DocumentSubmissionModal;
