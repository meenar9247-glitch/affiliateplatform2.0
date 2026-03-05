const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const referralController = require('../controllers/referralController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// ============================================
// Validation Rules
// ============================================

const createReferralValidation = [
  body('referralCode')
    .notEmpty()
    .withMessage('Referral code is required')
    .isString()
    .withMessage('Referral code must be a string'),
  body('referredUserId')
    .notEmpty()
    .withMessage('Referred user ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid referral ID format'),
  body('status')
    .isIn(['active', 'pending', 'converted', 'expired', 'blocked'])
    .withMessage('Invalid status value'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
];

const trackClickValidation = [
  body('referralCode')
    .notEmpty()
    .withMessage('Referral code is required'),
  body('linkId')
    .optional()
    .isMongoId()
    .withMessage('Invalid link ID format'),
  body('ipAddress')
    .optional()
    .isIP()
    .withMessage('Invalid IP address'),
  body('userAgent')
    .optional()
    .isString()
];

const recordConversionValidation = [
  body('referralId')
    .notEmpty()
    .withMessage('Referral ID is required')
    .isMongoId()
    .withMessage('Invalid referral ID format'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID format'),
  body('productName')
    .optional()
    .isString()
    .withMessage('Product name must be a string'),
  body('orderId')
    .optional()
    .isString()
];

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
    .isIn(['pending', 'active', 'converted', 'expired', 'blocked'])
    .withMessage('Invalid status filter'),
  query('level')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
  query('sortBy')
    .optional()
    .isString()
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

const depthValidation = [
  query('depth')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Depth must be between 1 and 10')
];

const leaderboardValidation = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year', 'all'])
    .withMessage('Invalid period'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const bulkDeleteValidation = [
  body('ids')
    .isArray()
    .withMessage('IDs must be an array')
    .custom((ids) => ids.every(id => mongoose.Types.ObjectId.isValid(id)))
    .withMessage('Invalid ID format in array')
];

// ============================================
// Public Routes
// ============================================

/**
 * @route   POST /api/referrals/track-click
 * @desc    Track referral click
 * @access  Public
 */
router.post(
  '/track-click',
  trackClickValidation,
  validate,
  referralController.trackClick
);

/**
 * @route   GET /api/referrals/leaderboard
 * @desc    Get top referrers leaderboard
 * @access  Public
 */
router.get(
  '/leaderboard',
  leaderboardValidation,
  validate,
  referralController.getLeaderboard
);

// ============================================
// Protected Routes (All authenticated users)
// ============================================
router.use(protect);

/**
 * @route   GET /api/referrals/dashboard
 * @desc    Get referral dashboard
 * @access  Private
 */
router.get(
  '/dashboard',
  referralController.getDashboard
);

/**
 * @route   GET /api/referrals
 * @desc    Get all referrals for logged in user
 * @access  Private
 */
router.get(
  '/',
  paginationValidation,
  dateRangeValidation,
  validate,
  referralController.getReferrals
);

/**
 * @route   GET /api/referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get(
  '/stats',
  referralController.getReferralStats
);

/**
 * @route   GET /api/referrals/tree
 * @desc    Get referral tree
 * @access  Private
 */
router.get(
  '/tree',
  depthValidation,
  validate,
  referralController.getReferralTree
);

/**
 * @route   GET /api/referrals/analytics
 * @desc    Get referral analytics
 * @access  Private
 */
router.get(
  '/analytics',
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  validate,
  referralController.getReferralAnalytics
);
/**
 * @route   GET /api/referrals/rewards
 * @desc    Get referral rewards and achievements
 * @access  Private
 */
router.get(
  '/rewards',
  referralController.getReferralRewards
);

/**
 * @route   GET /api/referrals/:id
 * @desc    Get referral by ID
 * @access  Private
 */
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid referral ID format'),
  validate,
  referralController.getReferralById
);

/**
 * @route   POST /api/referrals
 * @desc    Create referral (when user registers with referral code)
 * @access  Private (System only - usually called from auth controller)
 */
router.post(
  '/',
  createReferralValidation,
  validate,
  referralController.createReferral
);

/**
 * @route   PUT /api/referrals/:id/status
 * @desc    Update referral status
 * @access  Private
 */
router.put(
  '/:id/status',
  updateStatusValidation,
  validate,
  referralController.updateReferralStatus
);

/**
 * @route   POST /api/referrals/convert
 * @desc    Record conversion
 * @access  Private (Admin/System only)
 */
router.post(
  '/convert',
  recordConversionValidation,
  validate,
  authorize('admin', 'system'),
  referralController.recordConversion
);

/**
 * @route   DELETE /api/referrals/:id
 * @desc    Delete referral (soft delete)
 * @access  Private
 */
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid referral ID format'),
  validate,
  referralController.deleteReferral
);

/**
 * @route   POST /api/referrals/bulk-delete
 * @desc    Bulk delete referrals
 * @access  Private
 */
router.post(
  '/bulk-delete',
  bulkDeleteValidation,
  validate,
  referralController.bulkDeleteReferrals
);

/**
 * @route   GET /api/referrals/export
 * @desc    Export referral data
 * @access  Private
 */
router.get(
  '/export',
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  dateRangeValidation,
  validate,
  referralController.exportReferralData
);

// ============================================
// Admin Routes
// ============================================

/**
 * @route   GET /api/referrals/admin/all
 * @desc    Get all referrals (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/all',
  authorize('admin'),
  paginationValidation,
  dateRangeValidation,
  validate,
  referralController.getAllReferrals
);

/**
 * @route   GET /api/referrals/admin/settings
 * @desc    Get referral settings (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/settings',
  authorize('admin'),
  referralController.getReferralSettings
);

/**
 * @route   PUT /api/referrals/admin/settings
 * @desc    Update referral settings (admin only)
 * @access  Private/Admin
 */
router.put(
  '/admin/settings',
  authorize('admin'),
  referralController.updateReferralSettings
);

/**
 * @route   GET /api/referrals/admin/stats
 * @desc    Get global referral statistics (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/stats',
  authorize('admin'),
  referralController.getGlobalReferralStats
);

/**
 * @route   GET /api/referrals/admin/export
 * @desc    Export all referrals (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/export',
  authorize('admin'),
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  dateRangeValidation,
  validate,
  referralController.exportAllReferrals
);

/**
 * @route   DELETE /api/referrals/admin/:id
 * @desc    Hard delete referral (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/admin/:id',
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid referral ID format'),
  validate,
  referralController.hardDeleteReferral
);

module.exports = router;
// ============================================
// Additional Controller Methods for Routes
// ============================================

// @desc    Get all referrals (admin only)
// @route   GET /api/referrals/admin/all
// @access  Private/Admin
exports.getAllReferrals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, level, startDate, endDate, sortBy = '-referredAt' } = req.query;
    
    const query = { isDeleted: false };
    
    if (status) query.status = status;
    if (level) query.level = parseInt(level);
    
    if (startDate || endDate) {
      query.referredAt = {};
      if (startDate) query.referredAt.$gte = new Date(startDate);
      if (endDate) query.referredAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: [
        { path: 'referrer', select: 'name email' },
        { path: 'referredUser', select: 'name email' }
      ]
    };
    
    const referrals = await Referral.paginate(query, options);
    
    // Get summary statistics
    const summary = await Referral.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCommission: { $sum: '$commission.amount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      referrals: referrals.docs,
      summary,
      totalPages: referrals.totalPages,
      totalDocs: referrals.totalDocs,
      page: referrals.page,
      limit: referrals.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_view_all_referrals', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// @desc    Get global referral statistics (admin only)
// @route   GET /api/referrals/admin/stats
// @access  Private/Admin
exports.getGlobalReferralStats = async (req, res, next) => {
  try {
    const stats = await Referral.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 }, totalCommission: { $sum: '$commission.amount' } } }
          ],
          byLevel: [
            { $group: { _id: '$level', count: { $sum: 1 } } }
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$referredAt' },
                  month: { $month: '$referredAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalReferrals: { $sum: 1 },
                totalCommission: { $sum: '$commission.amount' },
                avgCommission: { $avg: '$commission.amount' },
                conversionRate: {
                  $avg: {
                    $cond: [{ $eq: ['$status', 'converted'] }, 1, 0]
                  }
                }
              }
            }
          ],
          topReferrers: [
            {
              $group: {
                _id: '$referrer',
                count: { $sum: 1 },
                totalCommission: { $sum: '$commission.amount' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'referrer'
              }
            },
            { $unwind: '$referrer' },
            {
              $project: {
                'referrer.name': 1,
                'referrer.email': 1,
                count: 1,
                totalCommission: 1
              }
            }
          ]
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: stats[0]
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_view_global_stats', {}, req);
  } catch (error) {
    next(error);
  }
};

// @desc    Export all referrals (admin only)
// @route   GET /api/referrals/admin/export
// @access  Private/Admin
exports.exportAllReferrals = async (req, res, next) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = { isDeleted: false };
    
    if (startDate || endDate) {
      query.referredAt = {};
      if (startDate) query.referredAt.$gte = new Date(startDate);
      if (endDate) query.referredAt.$lte = new Date(endDate);
    }
    
    const referrals = await Referral.find(query)
      .populate('referrer', 'name email')
      .populate('referredUser', 'name email')
      .sort('-referredAt');
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=all-referrals-${Date.now()}.csv`);
      
      // Headers
      res.write('Referrer Name,Referrer Email,Referred User,Referred Email,Status,Level,Commission Amount,Referred At\n');
      
      // Data
      referrals.forEach(r => {
        res.write([
          r.referrer?.name || 'Unknown',
          r.referrer?.email || '',
          r.referredUser?.name || 'Unknown',
          r.referredUser?.email || '',
          r.status,
          r.level,
          r.commission?.amount || 0,
          r.referredAt.toISOString()
        ].join(',') + '\n');
      });
      
      res.end();
    } else {
      res.status(200).json({
        success: true,
        count: referrals.length,
        referrals
      });
    }
    
    // Log activity
    await logActivity(req.user.id, 'admin_export_all_referrals', { format }, req);
  } catch (error) {
    next(error);
  }
};

// @desc    Hard delete referral (admin only)
// @route   DELETE /api/referrals/admin/:id
// @access  Private/Admin
exports.hardDeleteReferral = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const referral = await Referral.findById(id);
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }
    
    // Hard delete
    await referral.deleteOne();
    
    // Log activity
    await logActivity(req.user.id, 'admin_hard_delete_referral', { referralId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'Referral permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

