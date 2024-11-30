const db = require('../models/db');
const fileQueue = require('../queue/queue');
const path = require('path');
const fs = require('fs');

exports.uploadFile = async (req, res) => {
    console.log('Uploaded file: ', req.file);

    if (!req.file) {
        return res.status(400).json({ error: req.t('error.no_file_uploaded') });
    }

    if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: req.t('error.invalid_file_type') });
    }

    const { filename, path } = req.file;

    try {
        const [result] = await db.execute(
            'INSERT INTO files (user_id, filename, filepath) VALUES (?, ?, ?)', 
            [req.user.id, filename, path]
        );

        // await fileQueue.add({ fileId: result.insertId });
        return res.status(201).json({
            message: req.t('success.file_uploaded'),
            fileId: result.insertId,
            filename: filename,
            filepath: path
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Error uploading file' });
    }
};
// exports.uploadFile = async (req, res) => {
//     console.log('Uploaded file: ', req.file);

//     if (!req.file) {
//         return res.status(400).json({ error: req.t('error.no_file_uploaded') });
//     }

//     if (req.file.mimetype !== 'application/pdf') {
//         return res.status(400).json({ error: req.t('error.invalid_file_type') });
//     }

//     const { filename, path } = req.file;

//     try {
//         const [result] = await db.execute(
//             'INSERT INTO files (user_id, filename, filepath) VALUES (?, ?, ?)', 
//             [req.user.id, filename, path]
//         );

//         // Add file to processing queue with metadata
//         await fileQueue.add('processFile', {
//             fileId: result.insertId,
//             userId: req.user.id,
//             filename,
//             filepath: path
//         }, {
//             attempts: 3,
//             backoff: {
//                 type: 'exponential',
//                 delay: 1000
//             },
//             removeOnComplete: true,
//             removeOnFail: false
//         });

//         return res.status(201).json({
//             message: req.t('success.file_uploaded'),
//             fileId: result.insertId,
//             filename: filename,
//             filepath: path,
//             status: 'processing'
//         });

//     } catch (error) {
//         console.error('Error uploading file:', error);
//         return res.status(500).json({ error: 'Error uploading file' });
//     }
// };
exports.getFiles = async (req, res) => {
    try {
        const [files] = await db.execute('SELECT * FROM files WHERE user_id = ?', [req.user.id]);

        if (files.length === 0) {
            return res.status(404).json({ message: req.t('error.no_files_found') });
        }

        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching files' });
    }
};

exports.deleteFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: req.t('error.file_not_found') });
        }

        const file = rows[0];
        const filePath = path.resolve(file.filepath);
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error('Error deleting file from disk:', err);
                return res.status(500).json({ error: req.t('error.file_deletion_failed') });
            }
            await db.execute('DELETE FROM files WHERE id = ?', [fileId]);
            res.status(200).json({ message: req.t('success.file_deleted') });
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Error deleting file' });
    }
};

exports.updateFile = async (req, res) => {
    const { fileId } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: req.t('error.no_file_uploaded') });
    }
    if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: req.t('error.invalid_file_type') });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: req.t('error.file_not_found') });
        }

        const file = rows[0];
        const oldFilePath = path.resolve(file.filepath);

        fs.unlink(oldFilePath, async (err) => {
            if (err) {
                console.error('Error deleting old file from disk:', err);
                return res.status(500).json({ error: req.t('error.file_deletion_failed') });
            }

            const { filename, path: newPath } = req.file;
            await db.execute(
                'UPDATE files SET filename = ?, filepath = ? WHERE id = ?',
                [filename, newPath, fileId]
            );

            res.status(200).json({
                message: req.t('success.file_updated'),
                fileId: fileId,
                filename: filename,
                filepath: newPath
            });
        });
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Error updating file' });
    }
};

exports.searchFile = async (req, res) => {
    const { query } = req.query;  // Get the search query from the request query parameters

    if (!query) {
        return res.status(400).json({ error: req.t('error.search_query_required') });
    }

    try {
        // Query the database for files that match the query in their filename
        const [rows] = await db.execute(
            'SELECT * FROM files WHERE user_id = ? AND filename LIKE ?',
            [req.user.id, `%${query}%`]  // Use '%' to allow partial matching
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: req.t('error.no_files_found') });
        }

        // Return the search results
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error searching for file:', error);
        res.status(500).json({ error: 'Error searching for file' });
    }
};