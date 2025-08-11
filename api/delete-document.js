import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const absolutePath = path.join(process.cwd(), filePath);
    
    // Check if file exists and delete it
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      
      // Log the deletion for audit purposes
      console.log(`File deleted: ${filePath} by user: ${userId}`);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        filePath: filePath
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Internal server error during deletion' });
  }
}
