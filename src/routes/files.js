const express = require('express');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');
const { searchFile, updateFile, uploadFile, deleteFile, getFiles } = require('../controllers/fileController');

const router = express.Router();

router.use(authenticate);
router.post('/upload', upload.single('file'), uploadFile);
router.delete('/delete/:fileId', deleteFile);
router.put('/update/:fileId', upload.single('file'), updateFile);
router.get('/search', searchFile);
router.get('/', getFiles);

module.exports = router;