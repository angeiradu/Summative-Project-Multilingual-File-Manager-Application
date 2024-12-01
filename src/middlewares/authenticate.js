// Import the 'jsonwebtoken' library to handle JWT operations.
const jwt = require('jsonwebtoken');

// Import the secret key used for signing and verifying JWTs from the configuration file.
const { jwtSecret } = require('../config');

// Export a middleware function to authenticate requests using JWT.
module.exports = (req, res, next) => {
    // Extract the token from the 'Authorization' header.
    // The expected format is 'Bearer <token>'.
    const token = req.headers.authorization?.split(' ')[1];

    // If no token is provided, respond with a 401 Unauthorized error.
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify the token using the secret key.
        // If valid, decode the payload and attach it to the 'req.user' object.
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;

        // Proceed to the next middleware or route handler.
        next();
    } catch {
        // If the token is invalid or verification fails, respond with a 401 error.
        res.status(401).json({ error: req.t('error.invalid_token') });
    }
};
