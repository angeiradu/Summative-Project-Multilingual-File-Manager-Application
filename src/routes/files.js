// Import the express module to create a router.
const express = require('express');

// Import the authentication middleware to protect routes.
const authenticate = require('../middlewares/authenticate');

// Import the upload middleware for handling file uploads.
const upload = require('../middlewares/upload');

// Import file-related controller functions to handle various file operations.
const { searchFile, updateFile, uploadFile, deleteFile, getFiles } = require('../controllers/fileController');

// Create a new router instance using express.Router.
const router = express.Router();

// Apply the authentication middleware to all routes in this router.
// Ensures that only authenticated users can access the file routes.
router.use(authenticate);

/**
 * Route for uploading a file.
 * @route POST /upload
 * @description Handles file uploads using the 'uploadFile' function from fileController.
 * Uses the 'upload.single' middleware to process a single file from the 'file' field in the request.
 */
router.post('/upload', upload.single('file'), uploadFile);

/**
 * Route for deleting a file.
 * @route DELETE /delete/:fileId
 * @description Deletes a specific file by its ID using the 'deleteFile' function from fileController.
 */
router.delete('/delete/:fileId', deleteFile);

/**
 * Route for updating a file.
 * @route PUT /update/:fileId
 * @description Updates a specific file by its ID using the 'updateFile' function from fileController.
 * Uses the 'upload.single' middleware to process the updated file.
 */
router.put('/update/:fileId', upload.single('file'), updateFile);

/**
 * Route for searching files.
 * @route GET /search
 * @description Searches for files using the 'searchFile' function from fileController.
 */
router.get('/search', searchFile);

/**
 * Route for retrieving all files.
 * @route GET /
 * @description Retrieves a list of all files using the 'getFiles' function from fileController.
 */
router.get('/', getFiles);

// Export the router so it can be used in other parts of the application.
module.exports = router;
