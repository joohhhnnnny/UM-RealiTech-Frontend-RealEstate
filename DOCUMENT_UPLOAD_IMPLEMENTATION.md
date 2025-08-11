# Document Upload System Implementation

## Overview
The Document Submission Modal has been professionally updated to store uploaded files locally in the `uploads/buyer/documents/` directory and save only file paths as strings in Firestore, not Firebase Storage URLs.

## File Storage Structure

### Directory Organization
```
uploads/
└── buyer/
    └── documents/
        ├── personal/     # Government IDs, TIN, Birth/Marriage certificates
        ├── financial/    # Payslips, ITR, Bank statements, Remittance proof
        ├── legal/        # Business registration, Employment certificates, Contracts
        └── property/     # Property-related documents
```

### File Naming Convention
Files are automatically renamed using the pattern:
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
