const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// =========================================
// ✅ DASHBOARD
// =========================================
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getDashboardStats);
router.get('/recent-activities', adminController.getRecentActivities);

// =========================================
// ✅ USER MANAGEMENT
// =========================================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.post('/users/:id/verify-email', adminController.verifyUserEmail);
router.get('/users/export', adminController.exportUsers);

// =========================================
// ✅ AFFILIATE MANAGEMENT
// =========================================
router.get('/affiliates', adminController.getAllAffiliates);
router.get('/affiliates/:id', adminController.getAffiliateById);
router.put('/affiliates/:id/status', adminController.updateAffiliateStatus);
router.put('/affiliates/:id/commission-rate', adminController.updateCommissionRate);
router.get('/affiliates/top/:limit', adminController.getTopAffiliates);
router.get('/affiliates/export', adminController.exportAffiliates);

// =========================================
// ✅ REFERRAL MANAGEMENT
// =========================================
router.get('/referrals', adminController.getAllReferrals);
router.get('/referrals/stats', adminController.getReferralStats);
router.get('/referrals/tree/:userId', adminController.getReferralTree);

// =========================================
// ✅ COMMISSION MANAGEMENT
// =========================================
router.get('/commissions', adminController.getAllCommissions);
router.get('/commissions/stats', adminController.getCommissionStats);
router.get('/commissions/pending', adminController.getPendingCommissions);
router.put('/commissions/:id/approve', adminController.approveCommission);
router.put('/commissions/:id/reject', adminController.rejectCommission);
router.put('/commissions/:id/mark-paid', adminController.markCommissionPaid);
router.get('/commissions/export', adminController.exportCommissions);

// =========================================
// ✅ PAYOUT MANAGEMENT
// =========================================
router.get('/payouts', adminController.getAllPayouts);
router.get('/payouts/stats', adminController.getPayoutStats);
router.get('/payouts/pending', adminController.getPendingPayouts);
router.put('/payouts/:id/approve', adminController.approvePayout);
router.put('/payouts/:id/reject', adminController.rejectPayout);
router.put('/payouts/:id/process', adminController.processPayout);
router.put('/payouts/:id/complete', adminController.completePayout);
router.get('/payouts/export', adminController.exportPayouts);

// =========================================
// ✅ WALLET MANAGEMENT
// =========================================
router.get('/wallets', adminController.getAllWallets);
router.get('/wallets/:userId', adminController.getWalletByUserId);
router.post('/wallets/:userId/credit', adminController.creditWallet);
router.post('/wallets/:userId/debit', adminController.debitWallet);
router.post('/wallets/:userId/hold', adminController.holdAmount);
router.post('/wallets/:userId/release', adminController.releaseHold);
router.get('/wallets/transactions/:userId', adminController.getWalletTransactions);

// =========================================
// ✅ TRANSACTION MANAGEMENT
// =========================================
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/:id', adminController.getTransactionById);
router.get('/transactions/user/:userId', adminController.getUserTransactions);
router.get('/transactions/export', adminController.exportTransactions);

// =========================================
// ✅ PRODUCT MANAGEMENT
// =========================================
router.get('/products', adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/:id/images', adminController.uploadProductImages);
router.delete('/products/:id/images/:imageId', adminController.deleteProductImage);

// =========================================
// ✅ ORDER MANAGEMENT
// =========================================
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.get('/orders/user/:userId', adminController.getUserOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/orders/export', adminController.exportOrders);

// =========================================
// ✅ TICKET MANAGEMENT
// =========================================
router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', adminController.getTicketById);
router.put('/tickets/:id/status', adminController.updateTicketStatus);
router.put('/tickets/:id/assign', adminController.assignTicket);
router.post('/tickets/:id/reply', adminController.replyToTicket);
router.get('/tickets/stats', adminController.getTicketStats);

// =========================================
// ✅ SETTINGS MANAGEMENT
// =========================================
router.get('/settings', adminController.getSettings);
router.get('/settings/:key', adminController.getSettingByKey);
router.put('/settings/:key', adminController.updateSetting);
router.post('/settings', adminController.createSetting);
router.delete('/settings/:key', adminController.deleteSetting);
router.put('/settings/bulk', adminController.bulkUpdateSettings);
router.post('/settings/:key/reset', adminController.resetSetting);

// =========================================
// ✅ REPORT MANAGEMENT
// =========================================
router.get('/reports/earnings', adminController.getEarningsReport);
router.get('/reports/commissions', adminController.getCommissionsReport);
router.get('/reports/referrals', adminController.getReferralsReport);
router.get('/reports/users', adminController.getUsersReport);
router.get('/reports/conversions', adminController.getConversionsReport);
router.get('/reports/traffic', adminController.getTrafficReport);
router.get('/reports/export/:type', adminController.exportReport);

// =========================================
// ✅ ANALYTICS
// =========================================
router.get('/analytics/overview', adminController.getAnalyticsOverview);
router.get('/analytics/chart/:type', adminController.getChartData);
router.get('/analytics/top-products', adminController.getTopProducts);
router.get('/analytics/top-affiliates', adminController.getTopAffiliates);
router.get('/analytics/conversion-rates', adminController.getConversionRates);

// =========================================
// ✅ SYSTEM MANAGEMENT
// =========================================
router.get('/system/health', adminController.getSystemHealth);
router.get('/system/logs', adminController.getSystemLogs);
router.delete('/system/logs', adminController.clearLogs);
router.post('/system/maintenance', adminController.runMaintenance);
router.get('/system/stats', adminController.getSystemStats);
router.post('/system/backup', adminController.createBackup);
router.post('/system/restore', adminController.restoreBackup);
router.get('/system/info', adminController.getSystemInfo);

// =========================================
// ✅ NOTIFICATION MANAGEMENT
// =========================================
router.get('/notifications', adminController.getAllNotifications);
router.post('/notifications', adminController.createNotification);
router.post('/notifications/broadcast', adminController.broadcastNotification);
router.delete('/notifications/:id', adminController.deleteNotification);
router.post('/notifications/test', adminController.testNotification);

// =========================================
// ✅ ADMIN MANAGEMENT (SELF)
// =========================================
router.post('/admins', adminController.createAdmin);
router.get('/admins', adminController.getAdmins);
router.get('/admins/:id', adminController.getAdminById);
router.put('/admins/:id', adminController.updateAdmin);
router.delete('/admins/:id', adminController.removeAdmin);
router.post('/admins/:id/roles', adminController.updateAdminRoles);
router.get('/admins/activity/:id', adminController.getAdminActivity);

// =========================================
// ✅ AUDIT LOGS
// =========================================
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/audit-logs/:id', adminController.getAuditLogById);
router.get('/audit-logs/user/:userId', adminController.getUserAuditLogs);
router.get('/audit-logs/export', adminController.exportAuditLogs);

module.exports = router;
