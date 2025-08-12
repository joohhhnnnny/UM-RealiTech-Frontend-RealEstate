# Document Upload System Implementation - UPDATED

## Overview
This implementation provides professional file upload functionality for the real estate document submission system. Files are now properly stored in the file system and only their paths are saved to Firestore.

## NEW ARCHITECTURE ✅

### File Storage
- **Physical Storage**: Files are stored in `uploads/buyer/documents/` directory
- **Database Storage**: Only file paths are stored in Firestore (not the actual files)
- **File Naming**: `{userId}_{documentType}_{timestamp}.{extension}`

### API Endpoints
- **Upload**: `POST http://localhost:3001/api/upload-document`
- **Delete**: `DELETE http://localhost:3001/api/delete-document`

### Security Features
- File type validation (PDF, JPG, PNG only)
- File size limit (5MB maximum)
- User authentication required
- Path validation to prevent directory traversal

## IMPLEMENTATION COMPLETE ✅

### Starting the System
1. Start the file upload server:
   ```bash
   npm run server
   ```

2. Start both server and client:
   ```bash
   npm run dev:full
   ```

### File Upload Process
1. User selects file(s) in the Document Submission Modal
2. File is validated (type, size)
3. File is uploaded to server via API
4. Server stores file in `uploads/buyer/documents/`
5. Server returns file path
6. File path is stored in component state and later saved to Firestore

## Components Updated ✅

### DocumentUploadService.js
- ✅ Updated to use HTTP API instead of localStorage
- ✅ Professional error handling
- ✅ Real file system storage

### DocumentSubmissionModal.jsx
- ✅ Enhanced loading states
- ✅ Better error handling
- ✅ Upload progress indicators

### Server (server/index.js)
- ✅ Express.js server with multer middleware
- ✅ CORS enabled for frontend communication
- ✅ File validation and security

## File Structure
```
uploads/
  buyer/
    documents/
      userId_governmentId_1640995200000.jpg
      userId_payslips_1640995300000.pdf
      ...
```

## Firestore Structure
```javascript
documentSubmissions: {
  "userId_propertyId": {
    // File objects are null (not stored)
    governmentId: null,
    payslips: [],
    
    // Only paths are stored
    governmentIdPath: "uploads/buyer/documents/userId_governmentId_timestamp.jpg",
    payslipsPaths: ["uploads/buyer/documents/userId_payslips_timestamp1.pdf"],
    
    // Other form data
    tinNumber: "123-456-789-012",
    civilStatus: "single"
  }
}
```
```
{userId}_{documentType}_{timestamp}.{extension}
```

Example: `abc123_governmentId_1642789123456.pdf`

## Technical Implementation

### DocumentUploadService
A professional service class (`src/services/DocumentUploadService.js`) handles:

- ✅ **File Upload**: Secure upload with validation
- ✅ **File Deletion**: Clean removal from storage and references
- ✅ **File Validation**: Type and size checking
- ✅ **File Management**: Index tracking and metadata storage
- ✅ **Error Handling**: Comprehensive error management

### Key Features

#### 1. File Validation
- **Allowed Types**: PDF, JPG, JPEG, PNG
- **Size Limit**: 5MB per file
- **Security**: MIME type validation

#### 2. Data Storage
- **Files**: Stored in `uploads/buyer/documents/` directory
- **Paths**: Only file paths stored as strings in Firestore
- **Metadata**: User ID, document type, upload timestamp
- **Index**: File tracking per user

#### 3. Firestore Data Structure
```javascript
{
  // Personal Identification
  governmentIdPath: "uploads/buyer/documents/abc123_governmentId_1642789123456.pdf",
  tinNumber: "123-456-789-012",
  
  // Civil Status
  civilStatus: "single",
  birthCertificatePath: "uploads/buyer/documents/abc123_birthCertificate_1642789123456.pdf",
  marriageCertificatePath: "", // Empty if single
  
  // Proof of Income
  employmentType: "employed",
  payslipsPaths: [
    "uploads/buyer/documents/abc123_payslips_1642789123456.pdf",
    "uploads/buyer/documents/abc123_payslips_1642789123457.pdf"
  ],
  employmentCertificatePath: "uploads/buyer/documents/abc123_employmentCertificate_1642789123456.pdf",
  itrPath: "uploads/buyer/documents/abc123_itr_1642789123456.pdf"
}
```

## Development Mode Features

### LocalStorage Fallback
During development, files are stored in browser localStorage with the format:
- **Key**: `file_{filePath}`
- **Value**: JSON object containing file metadata and base64 data
- **Index**: `fileIndex_{userId}` tracks all user files

### File Information Storage
```javascript
{
  name: "government-id.pdf",
  size: 2048576,
  type: "application/pdf",
  data: "data:application/pdf;base64,JVBERi0xLjQ...",
  path: "uploads/buyer/documents/abc123_governmentId_1642789123456.pdf",
  userId: "abc123",
  documentType: "governmentId",
  uploadedAt: "2024-01-21T10:25:23.456Z"
}
```

## Security Considerations

### File Validation
- MIME type checking prevents malicious file uploads
- File size limits prevent storage abuse
- File extension validation ensures only allowed types

### Access Control
- User ID validation ensures users can only access their files
- Path validation prevents directory traversal attacks
- Firestore security rules control data access

### Data Privacy
- Files are stored locally, not in cloud storage
- Only authenticated users can upload/access files
- File paths are stored as strings, not public URLs

## Production Deployment

### Backend Requirements
For production deployment, implement:

1. **File Upload API** (`/api/upload-document`)
   - Multer middleware for file handling
   - File type and size validation
   - Secure file storage with proper permissions

2. **File Deletion API** (`/api/delete-document`)
   - Secure file deletion
   - User authentication validation
   - Audit logging

3. **File Serving** 
   - Secure file serving with authentication
   - Access control based on user permissions
   - Virus scanning for uploaded files

### Example Production APIs
```javascript
// Upload endpoint
POST /api/upload-document
Content-Type: multipart/form-data

// Delete endpoint
DELETE /api/delete-document
Content-Type: application/json
Body: { filePath, userId }
```

## Usage in DocumentSubmissionModal

### File Upload Process
1. User selects files through UI
2. Files are validated for type and size
3. Files are uploaded using DocumentUploadService
4. File paths are stored in form state
5. Form auto-saves to Firestore with file paths only

### File Display
- Files show with proper names and formatted sizes
- Users can remove files with confirmation
- Upload progress and error states are handled

### Form Submission
- Only file paths (strings) are saved to Firestore
- Files remain in local uploads directory
- Complete audit trail maintained

## Benefits of This Approach

### Performance
- ✅ Faster uploads (no cloud storage latency)
- ✅ Better user experience with immediate feedback
- ✅ Reduced Firestore storage costs

### Security
- ✅ Full control over file access
- ✅ No public URLs exposed
- ✅ Server-side validation and scanning

### Scalability
- ✅ Easy to implement CDN if needed
- ✅ Simple backup and migration
- ✅ Flexible storage options

### Maintainability  
- ✅ Clear file organization
- ✅ Professional service architecture
- ✅ Comprehensive error handling
- ✅ Development and production ready
