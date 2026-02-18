const express = require('express');
const router = express.Router();
const { uploadLogo, uploadMiddleware } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/logo', protect, uploadMiddleware, uploadLogo);

module.exports = router;
