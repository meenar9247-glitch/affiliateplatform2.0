const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Withdrawal routes
router.get('/withdrawals', paymentController.getWithdrawals);
router.post('/withdrawals/request', paymentController.requestWithdrawal);
router.get('/withdrawals/:id', paymentController.getWithdrawal);
router.delete('/withdrawals/:id/cancel', paymentController.cancelWithdrawal);

// Wallet routes
router.get('/wallet', paymentController.getWalletInfo);
router.get('/transactions', paymentController.getTransactionHistory);
router.get('/balance', paymentController.getBalance);

// Payment method routes
router.post('/payment-methods', paymentController.addPaymentMethod);
router.get('/payment-methods', paymentController.getPaymentMethods);
router.delete('/payment-methods/:id', paymentController.removePaymentMethod);

// Stripe integration
router.post('/create-stripe-account', paymentController.createStripeAccount);
router.get('/stripe-dashboard', paymentController.getStripeDashboard);

// PayPal integration
router.post('/create-paypal-payout', paymentController.createPaypalPayout);

module.exports = router;

  
