const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'resource-' + uniqueSuffix + extension);
  }
});

// Initialize Multer
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit (matches your ModuleManager.jsx)
});

// We export upload.array() because your form sends files AND links
// under the same field name 'resources'. Multer will create:
// - req.files: an array of file objects
// - req.body.resources: an array of string links
module.exports = upload.array('resources', 10); // Handle up to 10 items named 'resources'