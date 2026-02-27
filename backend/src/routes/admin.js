const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// =========================================
// Dashboard
// =========================================
router.get('/dashboard', adminController.getDashboardStats);

// =========================================
// User Management
// =========================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);

// =========================================
// Affiliate Management
// =========================================
router.get('/affiliates', adminController.getAllAffiliateLinks);
router.put('/affiliates/:id/approve', adminController.approveAffiliate);
router.put('/affiliates/:id/reject', adminController.rejectAffiliate);

// =========================================
// Withdrawals
// =========================================
router.get('/withdrawals', adminController.getWithdrawals);
router.get('/withdrawals/pending', adminController.getPendingWithdrawals);
router.put('/withdrawals/:id/process', adminController.processWithdrawal);
router.put('/withdrawals/:id/complete', adminController.completeWithdrawal);
router.put('/withdrawals/:id/reject', adminController.rejectWithdrawal);

// =========================================
// Commissions
// =========================================
router.get('/commissions', adminController.getCommissions);
router.get('/commissions/pending', adminController.getPendingCommissions);
router.put('/commissions/:id/approve', adminController.approveCommission);
router.put('/commissions/settings', adminController.updateCommissionSettings);

// =========================================
// Settings
// =========================================
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// =========================================
// Reports
// =========================================
router.get('/reports/earnings', adminController.getEarningsReport);
router.get('/reports/users', adminController.getUsersReport);
router.get('/reports/conversions', adminController.getConversionsReport);
router.get('/export/:type', adminController.exportData);

// =========================================
// Analytics
// =========================================
router.get('/analytics', adminController.getAnalyticsOverview);
router.get('/analytics/chart', adminController.getChartData);

// =========================================
// Admin Management
// =========================================
router.post('/admins', adminController.createAdmin);
router.get('/admins', adminController.getAdmins);
router.delete('/admins/:id', adminController.removeAdmin);

module.exports = router;
