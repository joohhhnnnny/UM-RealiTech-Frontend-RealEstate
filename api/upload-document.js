import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'buyer', 'documents');
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadPath, { recursive: true });
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

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use multer middleware
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const { userId, path: uploadPath } = req.body;
      
      // Validate required fields
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
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
}

export const config = {
  api: {
    bodyParser: false,
  },
};
