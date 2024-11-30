const mysql = require('mysql2/promise');
const pool = require('../models/db'); // Adjust path as necessary
const { db } = require('../config');

jest.mock('mysql2/promise');

describe('MySQL Pool', () => {
    let mockPool;
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Create a new mock pool for each test
        mockPool = {
            execute: jest.fn()
        };
        // Set up the createPool mock to return our mockPool
        mysql.createPool = jest.fn().mockReturnValue(mockPool);
    });

    it('should create a connection pool with correct configuration', () => {
        // Clear the module cache to ensure fresh require
        jest.isolateModules(() => {
            require('../models/db');
            
            expect(mysql.createPool).toHaveBeenCalledWith({
                host: db.host,
                user: db.user,
                password: db.password,
                database: db.database,
            });
        });
    });

    it('should allow execution of a query through the pool', async () => {
        const mockQueryResult = [[{ id: 1, name: 'Test' }], []];
        mockPool.execute.mockResolvedValue(mockQueryResult);

        jest.isolateModules(async () => {
            const dbPool = require('../models/db');
            const result = await dbPool.execute('SELECT * FROM test_table');

            expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM test_table');
            expect(result).toEqual(mockQueryResult);
        });
    });

    it('should handle query errors gracefully', async () => {
        const mockError = new Error('Database query failed');
        mockPool.execute.mockRejectedValue(mockError);

        jest.isolateModules(async () => {
            const dbPool = require('../models/db');
            await expect(dbPool.execute('SELECT * FROM test_table'))
                .rejects.toThrow('Database query failed');
            expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM test_table');
        });
    });
});