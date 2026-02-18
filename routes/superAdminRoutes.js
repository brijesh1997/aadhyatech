const express = require('express');
const router = express.Router();
const { getAllAdmins, promoteToAdmin, demoteAdmin, getAllUsers, deleteUser, getUserById, updateUser, getAllTransactions } = require('../controllers/superAdminController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.get('/transactions', protect, superAdminOnly, getAllTransactions);
router.get('/users', protect, superAdminOnly, getAllUsers);
router.get('/users/:id', protect, superAdminOnly, getUserById);
router.put('/users/:id', protect, superAdminOnly, updateUser);
router.delete('/users/:id', protect, superAdminOnly, deleteUser);
router.get('/admins', protect, superAdminOnly, getAllAdmins);
router.post('/admins/promote', protect, superAdminOnly, promoteToAdmin);
router.put('/admins/:id/demote', protect, superAdminOnly, demoteAdmin);

module.exports = router;
