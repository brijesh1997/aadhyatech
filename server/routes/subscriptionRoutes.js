const express = require('express');
const router = express.Router();
const { createCheckoutSession, createPortalSession, handleWebhook } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/portal', protect, createPortalSession);
router.post('/verify-session', protect, require('../controllers/subscriptionController').verifyCheckoutSession);

// Webhook route - using global rawBody capture
router.post('/webhook', handleWebhook);

module.exports = router;
