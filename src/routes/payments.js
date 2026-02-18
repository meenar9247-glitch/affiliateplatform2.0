const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User payment routes - यही functions हैं तुम्हारे पास
router.get('/my-payments', paymentController.getUserPayments);
router.post('/withdraw', paymentController.createPayment);
router.delete('/:id/cancel', paymentController.deletePayment);

// Admin routes - यही functions हैं तुम्हारे पास
router.get('/admin/all', authorize('admin'), paymentController.getAllPayments);
router.get('/admin/pending', authorize('admin'), paymentController.getPendingWithdrawals);
router.get('/admin/stats', authorize('admin'), paymentController.getPaymentStats);
router.get('/admin/:id', authorize('admin'), paymentController.getPayment);
router.put('/admin/:id/process', authorize('admin'), paymentController.processWithdrawal);
router.put('/admin/:id/complete', authorize('admin'), paymentController.completeWithdrawal);
router.put('/admin/:id/reject', authorize('admin'), paymentController.rejectWithdrawal);
router.put('/admin/:id', authorize('admin'), paymentController.updatePayment);

module.exports = router;

  
