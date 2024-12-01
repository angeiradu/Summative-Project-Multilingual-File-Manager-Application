// Import the express module to create a router.
const express = require('express');

// Import the register and login functions from the authController.
// These functions handle the logic for user registration and login.
const { register, login } = require('../controllers/authController');

// Create a new router instance using express.Router.
const router = express.Router();

/**
 * Route for user registration.
 * @route POST /register
 * @description Handles user registration by invoking the 'register' function from authController.
 */
router.post('/register', register);

/**
 * Route for user login.
 * @route POST /login
 * @description Handles user authentication by invoking the 'login' function from authController.
 */
router.post('/login', login);

// Export the router so it can be used in other parts of the application.
module.exports = router;
