/**
 * File Upload Utility for Document Submission
 * Handles secure file upload to the uploads/buyer/documents directory
 */

export class DocumentUploadService {
  static async uploadFile(file, userId, documentType) {
    try {
      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}_${documentType}_${timestamp}.${fileExtension}`;
      const filePath = `uploads/buyer/documents/${fileName}`;
      
      // Validate file type
      const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png'];
      if (!allowedTypes.includes(fileExtension.toLowerCase())) {
        throw new Error('Invalid file type. Only PDF and image files are allowed.');
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 5MB.');
      }
      
      // For development: Store file info in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const fileData = await this.fileToBase64(file);
        
        const fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: fileData,
          path: filePath,
          userId: userId,
          documentType: documentType,
          uploadedAt: new Date().toISOString()
        };
        
        localStorage.setItem(`file_${filePath}`, JSON.stringify(fileInfo));
        localStorage.setItem(`fileIndex_${userId}`, 
          JSON.stringify([
            ...this.getFileIndex(userId), 
            filePath
          ])
        );
      }
      
      return filePath;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  static async deleteFile(filePath, userId) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Remove file data
        localStorage.removeItem(`file_${filePath}`);
        
        // Update file index
        const index = this.getFileIndex(userId);
        const updatedIndex = index.filter(path => path !== filePath);
        localStorage.setItem(`fileIndex_${userId}`, JSON.stringify(updatedIndex));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
  
  static getFileIndex(userId) {
    if (typeof window === 'undefined') return [];
    try {
      const index = localStorage.getItem(`fileIndex_${userId}`);
      return index ? JSON.parse(index) : [];
    } catch {
      return [];
    }
  }
  
  static getFileInfo(filePath) {
    if (typeof window === 'undefined') return null;
    try {
      const fileInfo = localStorage.getItem(`file_${filePath}`);
      return fileInfo ? JSON.parse(fileInfo) : null;
    } catch {
      return null;
    }
  }
  
  static async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  static validateFileType(file) {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    return allowedMimeTypes.includes(file.type);
  }
  
  static validateFileSize(file, maxSizeMB = 5) {
    return file.size <= maxSizeMB * 1024 * 1024;
  }
  
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default DocumentUploadService;
