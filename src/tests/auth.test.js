const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');
const db = require('../models/db');
const { jwtSecret } = require('../config');

// Mock database functions
jest.mock('../models/db');
jest.mock('passport');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Authentication Module Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const req = {
                body: {
                    username: 'testuser',
                    email: 'testuser@example.com',
                    password: 'password123'
                },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute
                .mockResolvedValueOnce([[]]) // No existing user
                .mockResolvedValueOnce([{ insertId: 1 }]); // Insert user

            bcrypt.hash.mockResolvedValue('hashedpassword');

            await register(req, res);

            expect(db.execute).toHaveBeenCalledTimes(2);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'welcome',
                username: 'testuser',
                email: 'testuser@example.com',
                userId: 1
            });
        });

        it('should handle missing fields', async () => {
            const req = {
                body: {
                    username: '',
                    email: '',
                    password: ''
                },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.required_fields' });
        });

        it('should handle existing user', async () => {
            const req = {
                body: {
                    username: 'existinguser',
                    email: 'existinguser@example.com',
                    password: 'password123'
                },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[{ id: 1 }]]); // Existing user

            await register(req, res);

            expect(db.execute).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.user_exists' });
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const req = {
                body: {
                    identifier: 'testuser',
                    password: 'password123'
                },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const mockUser = { 
                id: 1, 
                username: 'testuser', 
                email: 'testuser@example.com', 
                password: 'hashedpassword' 
            };

            db.execute.mockResolvedValueOnce([[mockUser]]);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('testtoken');

            await login(req, res);

            expect(db.execute).toHaveBeenCalledTimes(1);
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser.id },
                jwtSecret,
                { expiresIn: '1h' }
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'login',
                username: 'testuser',
                email: 'testuser@example.com',
                token: 'testtoken'
            });
        });

        it('should handle invalid credentials', async () => {
            const req = {
                body: {
                    identifier: 'testuser',
                    password: 'wrongpassword'
                },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[{ id: 1, username: 'testuser', email: 'testuser@example.com', password: 'hashedpassword' }]]);
            bcrypt.compare.mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.invalid_credentials' });
        });

        it('should handle server errors during login', async () => {
            const req = {
                body: {
                    identifier: 'testuser',
                    password: 'password123'
                },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockRejectedValue(new Error('Database error'));

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.error_logging_in' });
        });
    });
});