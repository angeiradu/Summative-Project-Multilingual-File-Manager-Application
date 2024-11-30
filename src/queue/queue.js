const Bull = require('bull');
const { redis } = require('../config');

const fileQueue = new Bull('file-queue', { redis });

fileQueue.process(async (job) => {
    // Process file job
    const { fileId } = job.data;
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Only log in non-test environment
    if (process.env.NODE_ENV !== 'test') {
        console.log(`File ID: ${fileId} processed`);
    }
});

module.exports = fileQueue;