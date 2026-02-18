const express = require('express');
const router = express.Router();
const { getPageContent, updatePageContent, getAllContentAdmin } = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public: Get content for a specific page
router.get('/:page', getPageContent);

// Admin: Update content or get all
router.get('/admin/all', protect, adminOnly, getAllContentAdmin);
router.post('/', protect, adminOnly, updatePageContent);

module.exports = router;
