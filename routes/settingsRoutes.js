const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, superAdminOnly, getSettings);
router.put('/', protect, superAdminOnly, updateSettings);
router.get('/public', getPublicSettings);

module.exports = router;
