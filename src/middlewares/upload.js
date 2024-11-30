const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder for uploaded files
        cb(null, 'src/uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        // Use the original filename (preserve the original file name)
        cb(null, file.originalname);  // Keep the original file name
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB for example
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true); // Allow PDF files only
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

module.exports = upload;