const express = require('express');
const router = express.Router();
const { createOrUpdateProfile, getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/profile', protect, createOrUpdateProfile);
router.get('/profile', protect, getProfile);

module.exports = router;
