jest.mock('bull');

describe('File Queue', () => {
    let mockQueue;
    let Bull;

    beforeEach(() => {
        // Clear module cache and setup fake timers
        jest.resetModules();
        jest.useFakeTimers();
        
        // Set up mock queue
        mockQueue = {
            process: jest.fn(),
            add: jest.fn().mockResolvedValue(true)
        };
        
        // Import Bull mock and set up implementation
        Bull = require('bull');
        Bull.mockImplementation(() => mockQueue);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should initialize the queue with the correct name and Redis config', () => {
        const { redis } = require('../config');
        require('../queue/queue'); // Trigger queue initialization

        expect(Bull).toHaveBeenCalledWith('file-queue', { redis });
    });

    it('should define a process handler', async () => {
        require('../queue/queue'); // Trigger queue initialization

        expect(mockQueue.process).toHaveBeenCalled();
        const processHandler = mockQueue.process.mock.calls[0][0];

        // Simulate job processing
        const mockJob = { data: { fileId: 123 } };
        const processingPromise = processHandler(mockJob);
        
        // Fast-forward timers and wait for processing to complete
        jest.advanceTimersByTime(1000);
        await processingPromise;

        expect(mockQueue.process).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should allow adding a job to the queue', async () => {
        const jobData = { fileId: 456 };
        const queue = require('../queue/queue');

        await queue.add(jobData);
        expect(mockQueue.add).toHaveBeenCalledWith(jobData);
    });
});