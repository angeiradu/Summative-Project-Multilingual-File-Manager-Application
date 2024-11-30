const multer = require('multer');
const path = require('path');
const upload = require('../middlewares/upload'); // Adjust path as necessary

describe('Multer Middleware', () => {
    const mockRequest = {};
    const mockResponse = {};
    const mockNext = jest.fn();

    let multerStorage;

    beforeEach(() => {
        jest.clearAllMocks();
        multerStorage = upload.storage; // Access the multer storage configuration
    });

    it('should save files to the specified destination', (done) => {
        const file = { originalname: 'test.pdf' };
        multerStorage.getDestination(mockRequest, file, (err, destination) => {
            expect(err).toBeNull();
            expect(destination).toBe('src/uploads/'); // Ensure the correct folder is used
            done();
        });
    });

    it('should use the original filename', (done) => {
        const file = { originalname: 'test.pdf' };
        multerStorage.getFilename(mockRequest, file, (err, filename) => {
            expect(err).toBeNull();
            expect(filename).toBe('test.pdf'); // Ensure original file name is preserved
            done();
        });
    });

    it('should allow files with MIME type "application/pdf"', (done) => {
        const file = { mimetype: 'application/pdf' };
        const cb = jest.fn();

        upload.fileFilter(mockRequest, file, cb);
        expect(cb).toHaveBeenCalledWith(null, true); // Allow the file
        done();
    });

    it('should reject files with invalid MIME types', (done) => {
        const file = { mimetype: 'image/jpeg' }; // Invalid file type
        const cb = jest.fn();

        upload.fileFilter(mockRequest, file, cb);
        expect(cb).toHaveBeenCalledWith(expect.any(Error), false); // Reject the file
        done();
    });

    it('should enforce file size limit of 10MB', async () => {
        const file = {
            originalname: 'largeFile.pdf',
            mimetype: 'application/pdf',
            size: 15 * 1024 * 1024, // 15MB
        };

        const multerInstance = multer({
            storage: multerStorage,
            limits: { fileSize: 10 * 1024 * 1024 },
        }).single('file');

        // Create a more complete mock request object
        const req = {
            file,
            headers: {
                'content-type': 'multipart/form-data',
                'content-length': file.size
            },
            method: 'POST'
        };

        const res = {
            headersSent: false
        };
        const next = jest.fn();

        multerInstance(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error)); // Expect an error for file size
    });
});