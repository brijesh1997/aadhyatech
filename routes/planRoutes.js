const express = require('express');
const router = express.Router();
const { getPublicPlans, getAllPlansAdmin, createPlan, updatePlan, deletePlan } = require('../controllers/planController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getPublicPlans);

// Admin
router.get('/admin/all', protect, adminOnly, getAllPlansAdmin);
router.post('/', protect, adminOnly, createPlan);
router.put('/:id', protect, adminOnly, updatePlan);
router.delete('/:id', protect, adminOnly, deletePlan);

module.exports = router;
