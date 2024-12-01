// Import required modules
const passport = require('passport'); // Passport.js for authentication
const LocalStrategy = require('passport-local').Strategy; // Local strategy for username/password authentication
const bcrypt = require('bcryptjs'); // Library for hashing and comparing passwords
const jwt = require('jsonwebtoken'); // Library for generating and verifying JWTs
const db = require('../models/db'); // Database connection and query handler
const { jwtSecret } = require('../config'); // JWT secret for signing tokens

// Configure Passport.js with a Local Strategy for authentication
passport.use(
    new LocalStrategy(
        {
            // Specify the fields to use for username and password
            usernameField: 'identifier', // Can be username or email
            passwordField: 'password', // Password field
        },
        async (identifier, password, done) => {
            try {
                // Query the database for a user with the given username or email
                const [rows] = await db.execute(
                    'SELECT * FROM users WHERE username = ? OR email = ?',
                    [identifier, identifier]
                );

                const user = rows[0]; // Get the first matching user

                // If no user is found, return an error
                if (!user) {
                    return done(null, false);
                }

                // Compare the provided password with the hashed password in the database
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false); // If passwords don't match, authentication fails
                }

                // If user is authenticated, pass the user object to the next step
                return done(null, user);
            } catch (error) {
                // Handle any errors that occur during the process
                return done(error);
            }
        }
    )
);

// Serialize the user by storing their ID in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize the user by fetching their details using their ID
passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        done(null, rows[0]); // Pass the user object to the next step
    } catch (error) {
        done(error); // Handle errors during deserialization
    }
});

// Register a new user
exports.register = async (req, res) => {
    const { username, email, password } = req.body; // Extract data from the request body
    const t = req.t; // Translation function for internationalization

    // Validate input fields
    if (!username || !email || !password) {
        return res.status(400).json({ error: t('error.required_fields') });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: t('error.invalid_email') });
    }

    try {
        // Hash the password for secure storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the username or email already exists in the database
        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: t('error.user_exists') });
        }

        // Insert the new user into the database
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Respond with a success message and user details
        res.status(201).json({
            message: t('welcome'),
            username: username,
            email: email,
            userId: result.insertId, // ID of the newly created user
        });
    } catch (error) {
        console.error(error); // Log any server errors
        res.status(500).json({ error: t('error.error_registering') }); // Respond with a server error
    }
};

// Log in a user
exports.login = async (req, res) => {
    const { identifier, password } = req.body; // Extract data from the request body
    const t = req.t; // Translation function for internationalization

    // Validate input fields
    if (!identifier || !password) {
        return res.status(400).json({ error: t('error.required_fields') });
    }

    try {
        // Query the database for a user with the given username or email
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [identifier, identifier]
        );

        const user = rows[0]; // Get the first matching user

        // Check if the user exists and if the password matches
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: t('error.invalid_credentials') });
        }

        // Generate a JWT for the user
        const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

        // Respond with a success message, user details, and the JWT
        res.json({
            message: t('login'),
            username: user.username,
            email: user.email,
            token: token,
        });
    } catch (error) {
        res.status(500).json({ error: t('error.error_logging_in') }); // Handle server errors
    }
};
