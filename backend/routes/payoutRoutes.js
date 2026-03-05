const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const payoutController = require('../controllers/payoutController');
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
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected', 'on_hold', 'refunded'])
    .withMessage('Invalid status filter'),
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
    .withMessage('Invalid payout ID format')
];

const requestPayoutValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('method')
    .optional()
    .isIn(['paypal', 'bank_transfer', 'stripe', 'payoneer', 'wise', 'crypto', 'wallet', 'check', 'cash'])
    .withMessage('Invalid payment method')
];

const cancelPayoutValidation = [
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const periodValidation = [
  query('period')
    .optional()
    .isIn(['today', 'week', 'month', 'quarter', 'year'])
    .withMessage('Invalid period')
];

const formatValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv')
];

// Admin validation rules
const adminApproveValidation = [
  body('comments')
    .optional()
    .isString()
    .withMessage('Comments must be a string'),
  body('expectedDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected date format')
];

const adminRejectValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const adminProcessValidation = [
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
];

const adminCompleteValidation = [
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  body('reference')
    .optional()
    .isString()
    .withMessage('Reference must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
];

const adminFailValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Failure reason is required')
    .isString()
    .withMessage('Reason must be a string'),
  body('error')
    .optional()
    .isString()
    .withMessage('Error must be a string')
];

const bulkApproveValidation = [
  body('ids')
    .isArray()
    .withMessage('IDs must be an array')
    .custom((ids) => ids.every(id => mongoose.Types.ObjectId.isValid(id)))
    .withMessage('Invalid ID format in array'),
  body('comments')
    .optional()
    .isString()
    .withMessage('Comments must be a string')
];

const userIdValidation = [
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format')
];

// ============================================
// Protected Routes (All authenticated users)
// ============================================
router.use(protect);

/**
 * @route   GET /api/payouts/dashboard
 * @desc    Get payout dashboard
 * @access  Private
 */
router.get(
  '/dashboard',
  payoutController.getDashboard
);

/**
 * @route   GET /api/payouts
 * @desc    Get all payouts for logged in user
 * @access  Private
 */
router.get(
  '/',
  paginationValidation,
  dateRangeValidation,
  validate,
  payoutController.getPayouts
);

/**
 * @route   GET /api/payouts/stats
 * @desc    Get payout statistics
 * @access  Private
 */
router.get(
  '/stats',
  payoutController.getPayoutStats
);

/**
 * @route   GET /api/payouts/export
 * @desc    Export payout data
 * @access  Private
 */
router.get(
  '/export',
  formatValidation,
  dateRangeValidation,
  validate,
  payoutController.exportPayouts
);

/**
 * @route   POST /api/payouts/request
 * @desc    Request payout
 * @access  Private
 */
router.post(
  '/request',
  requestPayoutValidation,
  validate,
  payoutController.requestPayout
);

/**
 * @route   GET /api/payouts/:id
 * @desc    Get payout by ID
 * @access  Private
 */
router.get(
  '/:id',
  idValidation,
  validate,
  payoutController.getPayoutById
);

/**
 * @route   POST /api/payouts/:id/cancel
 * @desc    Cancel payout request
 * @access  Private
 */
router.post(
  '/:id/cancel',
  idValidation,
  cancelPayoutValidation,
  validate,
  payoutController.cancelPayout
);

// ============================================
// Admin Routes
// ============================================

/**
 * @route   GET /api/payouts/admin/all
 * @desc    Get all payouts (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/all',
  authorize('admin'),
  paginationValidation,
  dateRangeValidation,
  userIdValidation,
  validate,
  payoutController.getAllPayouts
);

/**
 * @route   GET /api/payouts/admin/summary
 * @desc    Get admin payout summary
 * @access  Private/Admin
 */
router.get(
  '/admin/summary',
  authorize('admin'),
  periodValidation,
  validate,
  payoutController.getAdminSummary
);

/**
 * @route   GET /api/payouts/admin/settings
 * @desc    Get payout settings (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/settings',
  authorize('admin'),
  payoutController.getPayoutSettings
);

/**
 * @route   PUT /api/payouts/admin/settings
 * @desc    Update payout settings (admin only)
 * @access  Private/Admin
 */
router.put(
  '/admin/settings',
  authorize('admin'),
  payoutController.updatePayoutSettings
);

/**
 * @route   POST /api/payouts/:id/approve
 * @desc    Approve payout (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/approve',
  authorize('admin'),
  idValidation,
  adminApproveValidation,
  validate,
  payoutController.approvePayout
);

/**
 * @route   POST /api/payouts/:id/reject
 * @desc    Reject payout (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/reject',
  authorize('admin'),
  idValidation,
  adminRejectValidation,
  validate,
  payoutController.rejectPayout
);

/**
 * @route   POST /api/payouts/:id/process
 * @desc    Process payout (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/process',
  authorize('admin'),
  idValidation,
  adminProcessValidation,
  validate,
  payoutController.processPayout
);

/**
 * @route   POST /api/payouts/:id/complete
 * @desc    Complete payout (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/complete',
  authorize('admin'),
  idValidation,
  adminCompleteValidation,
  validate,
  payoutController.completePayout
);

/**
 * @route   POST /api/payouts/:id/fail
 * @desc    Mark payout as failed (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/fail',
  authorize('admin'),
  idValidation,
  adminFailValidation,
  validate,
  payoutController.failPayout
);

/**
 * @route   POST /api/payouts/bulk-approve
 * @desc    Bulk approve payouts (admin only)
 * @access  Private/Admin
 */
router.post(
  '/bulk-approve',
  authorize('admin'),
  bulkApproveValidation,
  validate,
  payoutController.bulkApprovePayouts
);

/**
 * @route   DELETE /api/payouts/admin/:id
 * @desc    Delete payout (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/admin/:id',
  authorize('admin'),
  idValidation,
  validate,
  payoutController.adminDeletePayout
);

module.exports = router;
