# Uploads Directory Structure

This directory contains user-uploaded documents organized by user type, category, and user ID.

## Structure

```
uploads/
└── buyer/
    └── documents/
        ├── personal/       # Personal identification documents
        ├── financial/      # Financial verification documents  
        ├── property/       # Property-related documents
        └── legal/          # Legal contracts and forms
```

## File Naming Convention

Files are automatically organized using the following pattern:
`buyer/documents/{userId}/{category}/{docType}_{timestamp}.{extension}`

Example: `buyer/documents/user123/personal/validId_1672531200000.pdf`

## Supported File Types

- **Images**: JPG, JPEG, PNG
- **Documents**: PDF
- **Maximum Size**: 10MB per file

## Security Notes

1. This directory should be properly secured in production
2. Access should be restricted to authenticated users
3. Files should be scanned for malware
4. Consider using cloud storage (Firebase Storage) for better scalability

## Document Categories

### Personal Documents
- Valid ID (Primary) - Required
- Birth Certificate - Required  
- Marriage Certificate - Optional
- Income Tax Returns - Required
- Valid ID (Secondary) - Optional

### Financial Documents
- Certificate of Employment - Required
- Latest Pay Slips (3 months) - Required
- Bank Statements (6 months) - Required
- Credit Report - Optional

### Property Documents
- Property Title/Deed - Required
- Property Photos - Required
- Location Map - Optional

### Legal Documents
- Sales Contract - Required
- Disclosure Forms - Required
- Authorization Letter - Optional

## Firebase Integration

The DocumentSubmission component integrates with Firebase:
- **Storage**: Files are uploaded to Firebase Storage under `uploads/buyer/documents/`
- **Firestore**: Document metadata is stored in the `buyerDocuments` collection
- **Authentication**: Users must be authenticated to upload documents

## Local Development

For local development, files would be stored in this uploads/buyer/documents directory, but in production, Firebase Storage handles all file storage with better security and scalability.

## Future Expansion

The structure is designed to support additional user types:
- `uploads/buyer/documents/` - Buyer document uploads
- `uploads/agent/documents/` - Future agent document uploads  
- `uploads/developer/documents/` - Future developer document uploads
