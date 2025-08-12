/**
 * File Upload Utility for Document Submission
 * Handles secure file upload to the uploads/buyer/documents directory via API
 */

export class DocumentUploadService {
  static async uploadFile(file, userId, documentType) {
    try {
      // Validate file before upload
      if (!this.validateFileType(file)) {
        throw new Error('Invalid file type. Only PDF and image files are allowed.');
      }
      
      if (!this.validateFileSize(file, 5)) {
        throw new Error('File too large. Maximum size is 5MB.');
      }
      
      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}_${documentType}_${timestamp}.${fileExtension}`;
      
      // Create FormData for API upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('fileName', fileName);
      
      // Upload to server via API
      const response = await fetch('http://localhost:3001/api/upload-document', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      console.log(`File uploaded successfully: ${result.filePath}`);
      return result.filePath;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  static async deleteFile(filePath, userId) {
    try {
      // Delete file via API
      const response = await fetch('http://localhost:3001/api/delete-document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: filePath,
          userId: userId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
      
      const result = await response.json();
      console.log(`File deleted successfully: ${filePath}`);
      return result.success;
      
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
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
  
  // Legacy methods for backward compatibility (now no-ops)
  static getFileIndex(_userId) {
    return [];
  }
  
  static getFileInfo(_filePath) {
    return null;
  }
}

export default DocumentUploadService;
