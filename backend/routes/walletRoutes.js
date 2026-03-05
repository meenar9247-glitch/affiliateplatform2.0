const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const walletController = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// ============================================
// Validation Rules
// ============================================

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['credit', 'debit', 'commission', 'referral_bonus', 'withdrawal', 'payout', 'refund', 'fee', 'transfer', 'exchange', 'bonus', 'penalty', 'adjustment', 'reversal'])
    .withMessage('Invalid transaction type'),
  query('direction')
    .optional()
    .isIn(['in', 'out', 'internal'])
    .withMessage('Invalid direction'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Invalid sort field')
];

const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

const amountValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
];

const descriptionValidation = [
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const userIdValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const checkWithdrawalValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
];

const whitelistValidation = [
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .withMessage('Address must be a string'),
  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['paypal', 'bank_transfer', 'stripe', 'crypto'])
    .withMessage('Invalid payment method')
];

const settingsValidation = [
  body('autoWithdrawal')
    .optional()
    .isObject()
    .withMessage('Auto withdrawal must be an object'),
  body('notifications')
    .optional()
    .isObject()
    .withMessage('Notifications must be an object'),
  body('currency')
    .optional()
    .isString()
    .withMessage('Currency must be a string')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  body('twoFactorRequired')
    .optional()
    .isBoolean()
    .withMessage('Two factor required must be a boolean')
];

const freezeValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const formatValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv')
];

// Admin amount operation validation
const adminAmountValidation = [
  userIdValidation,
  amountValidation,
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('type')
    .optional()
    .isString()
    .withMessage('Type must be a string'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// ============================================
// Protected Routes (All authenticated users)
// ============================================
router.use(protect);

/**
 * @route   GET /api/wallet/dashboard
 * @desc    Get wallet dashboard
 * @access  Private
 */
router.get(
  '/dashboard',
  walletController.getDashboard
);

/**
 * @route   GET /api/wallet/balance
 * @desc    Get wallet balance
 * @access  Private
 */
router.get(
  '/balance',
  walletController.getBalance
);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get wallet transactions
 * @access  Private
 */
router.get(
  '/transactions',
  paginationValidation,
  dateRangeValidation,
  validate,
  walletController.getTransactions
);

/**
 * @route   GET /api/wallet/stats
 * @desc    Get wallet statistics
 * @access  Private
 */
router.get(
  '/stats',
  walletController.getWalletStats
);

/**
 * @route   GET /api/wallet/withdrawal-limits
 * @desc    Get withdrawal limits
 * @access  Private
 */
router.get(
  '/withdrawal-limits',
  walletController.getWithdrawalLimits
);

/**
 * @route   GET /api/wallet/settings
 * @desc    Get wallet settings
 * @access  Private
 */
router.get(
  '/settings',
  walletController.getWalletSettings
);

/**
 * @route   GET /api/wallet/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get(
  '/transactions/:id',
  idValidation,
  validate,
  walletController.getTransactionById
);

/**
 * @route   POST /api/wallet/check-withdrawal
 * @desc    Check withdrawal eligibility
 * @access  Private
 */
router.post(
  '/check-withdrawal',
  checkWithdrawalValidation,
  validate,
  walletController.checkWithdrawal
);

/**
 * @route   POST /api/wallet/whitelist/add
 * @desc    Add address to withdrawal whitelist
 * @access  Private
 */
router.post(
  '/whitelist/add',
  whitelistValidation,
  validate,
  walletController.addToWhitelist
);

/**
 * @route   PUT /api/wallet/settings
 * @desc    Update wallet settings
 * @access  Private
 */
router.put(
  '/settings',
  settingsValidation,
  validate,
  walletController.updateWalletSettings
);

/**
 * @route   GET /api/wallet/export
 * @desc    Export wallet data
 * @access  Private
 */
router.get(
  '/export',
  formatValidation,
  dateRangeValidation,
  validate,
  walletController.exportWalletData
);

// ============================================
// Admin Routes
// ============================================

/**
 * @route   POST /api/wallet/credit
 * @desc    Credit wallet (admin only)
 * @access  Private/Admin
 */
router.post(
  '/credit',
  authorize('admin'),
  adminAmountValidation,
  validate,
  walletController.creditWallet
);

/**
 * @route   POST /api/wallet/debit
 * @desc    Debit wallet (admin only)
 * @access  Private/Admin
 */
router.post(
  '/debit',
  authorize('admin'),
  adminAmountValidation,
  validate,
  walletController.debitWallet
);

/**
 * @route   POST /api/wallet/hold
 * @desc    Hold amount in wallet (admin only)
 * @access  Private/Admin
 */
router.post(
  '/hold',
  authorize('admin'),
  adminAmountValidation,
  body('reference')
    .optional()
    .isString()
    .withMessage('Reference must be a string'),
  validate,
  walletController.holdAmount
);

/**
 * @route   POST /api/wallet/release
 * @desc    Release held amount (admin only)
 * @access  Private/Admin
 */
router.post(
  '/release',
  authorize('admin'),
  adminAmountValidation,
  body('reference')
    .optional()
    .isString()
    .withMessage('Reference must be a string'),
  validate,
  walletController.releaseHold
);

/**
 * @route   POST /api/wallet/lock
 * @desc    Lock amount in wallet (admin only)
 * @access  Private/Admin
 */
router.post(
  '/lock',
  authorize('admin'),
  adminAmountValidation,
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string'),
  validate,
  walletController.lockAmount
);

/**
 * @route   POST /api/wallet/unlock
 * @desc    Unlock amount (admin only)
 * @access  Private/Admin
 */
router.post(
  '/unlock',
  authorize('admin'),
  adminAmountValidation,
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string'),
  validate,
  walletController.unlockAmount
);

/**
 * @route   POST /api/wallet/freeze
 * @desc    Freeze wallet (admin only)
 * @access  Private/Admin
 */
router.post(
  '/freeze',
  authorize('admin'),
  freezeValidation,
  validate,
  walletController.freezeWallet
);

/**
 * @route   POST /api/wallet/unfreeze
 * @desc    Unfreeze wallet (admin only)
 * @access  Private/Admin
 */
router.post(
  '/unfreeze',
  authorize('admin'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  validate,
  walletController.unfreezeWallet
);

module.exports = router;
