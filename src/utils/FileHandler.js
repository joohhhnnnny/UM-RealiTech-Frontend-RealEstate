import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/Firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/Firebase';

// Document category mappings
export const DOCUMENT_CATEGORIES = {
  personal: 'Personal Documents',
  financial: 'Financial Documents', 
  property: 'Property Documents',
  legal: 'Legal Documents'
};

export const DOCUMENT_TYPES = {
  personal: [
    { 
      id: 'validId', 
      label: 'Valid ID (Primary)', 
      description: 'Passport or Driver\'s License',
      required: true
    },
    { 
      id: 'birthCertificate', 
      label: 'Birth Certificate', 
      description: 'PSA-authenticated copy',
      required: true
    },
    { 
      id: 'marriageCertificate', 
      label: 'Marriage Certificate', 
      description: 'If applicable',
      required: false
    },
    { 
      id: 'taxReturns', 
      label: 'Income Tax Returns', 
      description: 'Latest 2 years',
      required: true
    },
    { 
      id: 'secondaryId', 
      label: 'Valid ID (Secondary)', 
      description: 'Any government-issued ID',
      required: false
    }
  ],
  financial: [
    { 
      id: 'employmentCertificate', 
      label: 'Certificate of Employment', 
      description: 'With compensation details',
      required: true
    },
    { 
      id: 'payslips', 
      label: 'Latest Pay Slips', 
      description: 'Last 3 months',
      required: true
    },
    { 
      id: 'bankStatements', 
      label: 'Bank Statements', 
      description: 'Last 6 months',
      required: true
    },
    { 
      id: 'creditReport', 
      label: 'Credit Report', 
      description: 'From accredited bureau',
      required: false
    }
  ],
  property: [
    { 
      id: 'titleDeed', 
      label: 'Property Title/Deed', 
      description: 'Certified true copy',
      required: true
    },
    { 
      id: 'propertyPhotos', 
      label: 'Property Photos', 
      description: 'All angles and features',
      required: true
    },
    { 
      id: 'locationMap', 
      label: 'Location Map', 
      description: 'With property marked',
      required: false
    }
  ],
  legal: [
    { 
      id: 'contract', 
      label: 'Sales Contract', 
      description: 'Draft or executed',
      required: true
    },
    { 
      id: 'disclosure', 
      label: 'Disclosure Forms', 
      description: 'Completed and signed',
      required: true
    },
    { 
      id: 'authorization', 
      label: 'Authorization Letter', 
      description: 'If applicable',
      required: false
    }
  ]
};

// File validation
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF, JPG, JPEG, and PNG files are allowed' };
  }
  
  return { valid: true };
};

// Generate unique filename
export const generateFileName = (userId, category, docType, originalName) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `buyer/documents/${userId}/${category}/${docType}_${timestamp}.${extension}`;
};

// Upload file to Firebase Storage
export const uploadDocument = async (file, userId, category, docType, onProgress = null) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileName = generateFileName(userId, category, docType, file.name);
  const storageRef = ref(storage, `uploads/${fileName}`);
  
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: fileName,
            size: file.size,
            type: file.type,
            originalName: file.name
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Save document record to Firestore
export const saveDocumentRecord = async (userId, category, docType, fileData, additionalData = {}) => {
  const docData = {
    userId,
    category,
    docType,
    fileName: fileData.originalName,
    filePath: fileData.path,
    fileUrl: fileData.url,
    fileSize: fileData.size,
    fileType: fileData.type,
    userType: 'buyer', // Specify this is for buyer documents
    status: 'pending', // pending, processing, verified, rejected
    score: 0,
    feedback: [],
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...additionalData
  };

  try {
    const docRef = await addDoc(collection(db, 'buyerDocuments'), docData);
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error('Error saving document record:', error);
    throw error;
  }
};

// Get user documents
export const getUserDocuments = async (userId) => {
  try {
    console.log('FileHandler: Fetching documents for user:', userId);
    
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, 'buyerDocuments'),
      where('userId', '==', userId)
    );
    
    console.log('FileHandler: Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    console.log('FileHandler: Query returned', querySnapshot.size, 'documents');
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('FileHandler: Successfully fetched documents:', documents);
    return documents;
  } catch (error) {
    console.error('FileHandler: Error fetching user documents:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your access rights.');
    } else if (error.code === 'unauthenticated') {
      throw new Error('User not authenticated. Please log in first.');
    } else if (error.code === 'unavailable') {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    
    throw error;
  }
};

// Update document status
export const updateDocumentStatus = async (docId, status, score = 0, feedback = []) => {
  try {
    const docRef = doc(db, 'buyerDocuments', docId);
    await updateDoc(docRef, {
      status,
      score,
      feedback,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (docId, filePath) => {
  try {
    // Delete from storage
    if (filePath) {
      const storageRef = ref(storage, `uploads/${filePath}`);
      await deleteObject(storageRef);
    }
    
    // Delete from firestore
    await deleteDoc(doc(db, 'buyerDocuments', docId));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Calculate completion statistics
export const calculateDocumentStats = (documents, category = null) => {
  let targetDocs = [];
  
  if (category) {
    targetDocs = DOCUMENT_TYPES[category] || [];
  } else {
    // All categories
    Object.keys(DOCUMENT_TYPES).forEach(cat => {
      targetDocs = [...targetDocs, ...DOCUMENT_TYPES[cat]];
    });
  }
  
  const requiredDocs = targetDocs.filter(doc => doc.required);
  const totalRequired = requiredDocs.length;
  const totalOptional = targetDocs.length - totalRequired;
  
  // Filter documents for this category
  const categoryDocs = category 
    ? documents.filter(doc => doc.category === category)
    : documents;
  
  const verifiedDocs = categoryDocs.filter(doc => doc.status === 'verified');
  const processingDocs = categoryDocs.filter(doc => doc.status === 'processing');
  const rejectedDocs = categoryDocs.filter(doc => doc.status === 'rejected');
  
  // Calculate completion percentage
  const verifiedRequired = verifiedDocs.filter(doc => {
    const docType = targetDocs.find(type => type.id === doc.docType);
    return docType && docType.required;
  }).length;
  
  const completionPercentage = totalRequired > 0 
    ? Math.round((verifiedRequired / totalRequired) * 100)
    : 0;
  
  // Calculate average score
  const scoredDocs = categoryDocs.filter(doc => doc.score > 0);
  const averageScore = scoredDocs.length > 0
    ? Math.round(scoredDocs.reduce((sum, doc) => sum + doc.score, 0) / scoredDocs.length)
    : 0;
  
  return {
    total: targetDocs.length,
    totalRequired,
    totalOptional,
    uploaded: categoryDocs.length,
    verified: verifiedDocs.length,
    processing: processingDocs.length,
    rejected: rejectedDocs.length,
    pending: categoryDocs.filter(doc => doc.status === 'pending').length,
    completionPercentage,
    averageScore,
    verifiedRequired
  };
};
