const db = require('../models/db');
const fileQueue = require('../queue/queue');
const fs = require('fs');
const path = require('path');
const {
    uploadFile,
    getFiles,
    deleteFile,
    updateFile,
    searchFile
} = require('../controllers/fileController'); // Adjust the path if necessary

jest.mock('../models/db');
jest.mock('../queue/queue');
jest.mock('fs');

describe('File Operations Tests', () => {
    const mockUser = { id: 1 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadFile', () => {
        it('should upload a valid PDF file successfully', async () => {
            const req = {
                file: { filename: 'test.pdf', mimetype: 'application/pdf', path: '/uploads/test.pdf' },
                user: mockUser,
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

            await uploadFile(req, res);

            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO files (user_id, filename, filepath) VALUES (?, ?, ?)',
                [mockUser.id, 'test.pdf', '/uploads/test.pdf']
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'success.file_uploaded',
                fileId: 1,
                filename: 'test.pdf',
                filepath: '/uploads/test.pdf'
            });
        });

        it('should handle no file uploaded', async () => {
            const req = { file: null, t: jest.fn((key) => key) };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.no_file_uploaded' });
        });

        it('should handle invalid file type', async () => {
            const req = {
                file: { mimetype: 'text/plain' },
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await uploadFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.invalid_file_type' });
        });
    });

    describe('getFiles', () => {
        it('should fetch files for a user', async () => {
            const req = { user: mockUser, t: jest.fn((key) => key) };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[{ id: 1, filename: 'test.pdf' }]]);

            await getFiles(req, res);

            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM files WHERE user_id = ?', [mockUser.id]);
            expect(res.json).toHaveBeenCalledWith([{ id: 1, filename: 'test.pdf' }]);
        });

        it('should handle no files found', async () => {
            const req = { user: mockUser, t: jest.fn((key) => key) };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[]]);

            await getFiles(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'error.no_files_found' });
        });
    });

    describe('deleteFile', () => {
        it('should delete a file successfully', async () => {
            const req = { params: { fileId: 1 }, user: mockUser, t: jest.fn((key) => key) };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[{ id: 1, filepath: '/uploads/test.pdf' }]]);
            fs.unlink.mockImplementation((path, callback) => callback(null));
            db.execute.mockResolvedValueOnce([]);

            await deleteFile(req, res);

            expect(fs.unlink).toHaveBeenCalledWith(path.resolve('/uploads/test.pdf'), expect.any(Function));
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM files WHERE id = ?', [1]);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'success.file_deleted' });
        });

        it('should handle file not found', async () => {
            const req = { params: { fileId: 1 }, user: mockUser, t: jest.fn((key) => key) };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[]]);

            await deleteFile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.file_not_found' });
        });
    });

    describe('searchFile', () => {
        it('should return search results', async () => {
            const req = {
                query: { query: 'test' },
                user: mockUser,
                t: jest.fn((key) => key)
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            db.execute.mockResolvedValueOnce([[{ id: 1, filename: 'test.pdf' }]]);

            await searchFile(req, res);

            expect(db.execute).toHaveBeenCalledWith(
                'SELECT * FROM files WHERE user_id = ? AND filename LIKE ?',
                [mockUser.id, '%test%']
            );
            expect(res.json).toHaveBeenCalledWith([{ id: 1, filename: 'test.pdf' }]);
        });

        it('should handle no search query', async () => {
            const req = { query: {}, t: jest.fn((key) => key) };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await searchFile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'error.search_query_required' });
        });
    });
});