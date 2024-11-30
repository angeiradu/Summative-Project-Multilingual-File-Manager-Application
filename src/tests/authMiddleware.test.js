const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authenticate'); // Adjust the path if needed
const { jwtSecret } = require('../config');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should set req.user and call next() for a valid token', () => {
        const mockDecodedToken = { id: 1, username: 'testuser' };
        const mockToken = 'valid.token.here';
        const req = {
            headers: {
                authorization: `Bearer ${mockToken}`
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jwt.verify.mockReturnValue(mockDecodedToken);

        authMiddleware(req, res, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(mockToken, jwtSecret);
        expect(req.user).toEqual(mockDecodedToken);
        expect(mockNext).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', () => {
        const req = {
            headers: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        authMiddleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for an invalid token', () => {
        const mockToken = 'invalid.token.here';
        const req = {
            headers: {
                authorization: `Bearer ${mockToken}`
            },
            t: jest.fn((key) => key)
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authMiddleware(req, res, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(mockToken, jwtSecret);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'error.invalid_token' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing Bearer prefix gracefully', () => {
        const mockToken = 'valid.token.here';
        const req = {
            headers: {
                authorization: mockToken // Missing "Bearer " prefix
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        authMiddleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
        expect(mockNext).not.toHaveBeenCalled();
    });
});