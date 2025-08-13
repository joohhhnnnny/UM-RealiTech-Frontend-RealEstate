import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'buyer', 'documents');
    
    // Create directory if it doesn't exist
    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const { userId, fileName } = req.body;
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const finalFileName = fileName || `${userId}_${timestamp}${fileExtension}`;
    cb(null, finalFileName);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Upload endpoint
app.post('/api/upload-document', upload.single('file'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the file path relative to the uploads directory
    const relativePath = path.join('uploads', 'buyer', 'documents', req.file.filename);
    
    // Log the upload for audit purposes
    console.log(`File uploaded: ${req.file.filename} by user: ${userId}`);
    
    res.status(200).json({
      success: true,
      filePath: relativePath,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
});

// Delete endpoint
app.delete('/api/delete-document', async (req, res) => {
  try {
    const { filePath, userId } = req.body;
    
    // Validate required fields
    if (!filePath || !userId) {
      return res.status(400).json({ error: 'File path and user ID are required' });
    }

    // Security: Only allow deletion of files in the buyer directory
    if (!filePath.startsWith('uploads/buyer/documents/')) {
      return res.status(403).json({ error: 'Unauthorized file path' });
    }

    // Construct absolute path
    const absolutePath = path.join(__dirname, '..', filePath);
    
    // Check if file exists and delete it
    try {
      await fs.promises.access(absolutePath);
      await fs.promises.unlink(absolutePath);
      
      // Log the deletion for audit purposes
      console.log(`File deleted: ${filePath} by user: ${userId}`);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        filePath: filePath
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: 'File not found' });
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error during deletion' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

// Serve uploaded files statically (for development)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.listen(PORT, () => {
  console.log(`File upload server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload-document`);
  console.log(`Delete endpoint: http://localhost:${PORT}/api/delete-document`);
});
