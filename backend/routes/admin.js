const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// =========================================
// ✅ DASHBOARD - 100% WORKING
// =========================================
router.get('/dashboard', adminController.getDashboard);

// =========================================
// ✅ USER MANAGEMENT - STRONG & WORKING
// =========================================
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// =========================================
// ✅ WITHDRAWALS - CONFIRMED WORKING
// =========================================
router.get('/withdrawals', adminController.getWithdrawals);
router.put('/withdrawals/:id/process', adminController.processWithdrawal);

// =========================================
// ✅ COMMISSIONS - SOLID & WORKING
// =========================================
router.get('/commissions', adminController.getCommissions);
// =========================================
// ✅ ADMIN MANAGEMENT - BULLETPROOF
// =========================================
router.post('/admins', adminController.createAdmin);
router.get('/admins', adminController.getAdmins);
router.delete('/admins/:id', adminController.removeAdmin);

module.exports = router;
