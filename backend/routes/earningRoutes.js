const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const earningController = require('../controllers/earningController');
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
    .isIn(['pending', 'approved', 'paid', 'cancelled', 'refunded', 'held', 'rejected'])
    .withMessage('Invalid status filter'),
  query('type')
    .optional()
    .isIn(['direct', 'indirect', 'bonus', 'performance', 'monthly', 'quarterly', 'annual', 'signup', 'sale', 'subscription', 'recurring'])
    .withMessage('Invalid earning type'),
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

const periodValidation = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year', 'custom'])
    .withMessage('Invalid period')
];

const chartValidation = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Invalid period for chart'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid earning ID format')
];

const compareValidation = [
  query('compareWith')
    .optional()
    .isIn(['last_period', 'last_year'])
    .withMessage('Compare with must be last_period or last_year')
];

const forecastValidation = [
  query('months')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Months must be between 1 and 12')
];

const limitValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const affiliateIdValidation = [
  param('affiliateId')
    .isMongoId()
    .withMessage('Invalid affiliate ID format')
];

const bulkUpdateValidation = [
  body('ids')
    .isArray()
    .withMessage('IDs must be an array')
    .custom((ids) => ids.every(id => mongoose.Types.ObjectId.isValid(id)))
    .withMessage('Invalid ID format in array'),
  body('updates')
    .isObject()
    .withMessage('Updates must be an object')
];

const markPaidValidation = [
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
];

// ============================================
// Protected Routes (All authenticated users)
// ============================================
router.use(protect);

/**
 * @route   GET /api/earnings/dashboard
 * @desc    Get earnings dashboard
 * @access  Private
 */
router.get(
  '/dashboard',
  earningController.getDashboard
);

/**
 * @route   GET /api/earnings
 * @desc    Get all earnings for logged in user
 * @access  Private
 */
router.get(
  '/',
  paginationValidation,
  dateRangeValidation,
  validate,
  earningController.getEarnings
);

/**
 * @route   GET /api/earnings/overview
 * @desc    Get earnings overview
 * @access  Private
 */
router.get(
  '/overview',
  periodValidation,
  validate,
  earningController.getOverview
);

/**
 * @route   GET /api/earnings/summary
 * @desc    Get earnings summary
 * @access  Private
 */
router.get(
  '/summary',
  earningController.getEarningsSummary
);

/**
 * @route   GET /api/earnings/chart
 * @desc    Get earnings chart data
 * @access  Private
 */
router.get(
  '/chart',
  chartValidation,
  validate,
  earningController.getEarningsChart
);

/**
 * @route   GET /api/earnings/timeline
 * @desc    Get earnings timeline
 * @access  Private
 */
router.get(
  '/timeline',
  earningController.getEarningsTimeline
);

/**
 * @route   GET /api/earnings/comparison
 * @desc    Get earnings comparison
 * @access  Private
 */
router.get(
  '/comparison',
  compareValidation,
  periodValidation,
  validate,
  earningController.getEarningsComparison
);
/**
 * @route   GET /api/earnings/forecast
 * @desc    Get earnings forecast
 * @access  Private
 */
router.get(
  '/forecast',
  forecastValidation,
  validate,
  earningController.getEarningsForecast
);

/**
 * @route   GET /api/earnings/trends
 * @desc    Get earning trends
 * @access  Private
 */
router.get(
  '/trends',
  earningController.getEarningTrends
);

/**
 * @route   GET /api/earnings/by-source
 * @desc    Get earnings by source
 * @access  Private
 */
router.get(
  '/by-source',
  dateRangeValidation,
  validate,
  earningController.getEarningsBySource
);

/**
 * @route   GET /api/earnings/by-category
 * @desc    Get earnings by category
 * @access  Private
 */
router.get(
  '/by-category',
  earningController.getEarningsByCategory
);

/**
 * @route   GET /api/earnings/top-sources
 * @desc    Get top earning sources
 * @access  Private
 */
router.get(
  '/top-sources',
  limitValidation,
  validate,
  earningController.getTopSources
);

/**
 * @route   GET /api/earnings/export
 * @desc    Export earnings data
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
  earningController.exportEarnings
);

/**
 * @route   GET /api/earnings/:id
 * @desc    Get earning by ID
 * @access  Private
 */
router.get(
  '/:id',
  idValidation,
  validate,
  earningController.getEarningById
);

// ============================================
// Admin Routes
// ============================================

/**
 * @route   GET /api/earnings/admin/platform-summary
 * @desc    Get platform earnings summary (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/platform-summary',
  authorize('admin'),
  periodValidation,
  validate,
  earningController.getPlatformEarningsSummary
);

/**
 * @route   GET /api/earnings/admin/all
 * @desc    Get all earnings (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/all',
  authorize('admin'),
  paginationValidation,
  dateRangeValidation,
  validate,
  earningController.getAllEarnings
);

/**
 * @route   GET /api/earnings/admin/affiliate/:affiliateId'
 * @desc    Get earnings by affiliate (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/affiliate/:affiliateId',
  authorize('admin'),
  affiliateIdValidation,
  paginationValidation,
  dateRangeValidation,
  validate,
  earningController.getEarningsByAffiliate
);

/**
 * @route   PUT /api/earnings/:id/mark-paid
 * @desc    Mark earning as paid (admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id/mark-paid',
  authorize('admin'),
  idValidation,
  markPaidValidation,
  validate,
  earningController.markEarningAsPaid
);

/**
 * @route   POST /api/earnings/bulk-update
 * @desc    Bulk update earnings (admin only)
 * @access  Private/Admin
 */
router.post(
  '/bulk-update',
  authorize('admin'),
  bulkUpdateValidation,
  validate,
  earningController.bulkUpdateEarnings
);

/**
 * @route   DELETE /api/earnings/:id
 * @desc    Delete earning (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authorize('admin'),
  idValidation,
  validate,
  earningController.deleteEarning
);

/**
 * @route   GET /api/earnings/admin/stats
 * @desc    Get global earnings statistics (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin/stats',
  authorize('admin'),
  earningController.getGlobalEarningsStats
);

/**
 * @route   GET /api/earnings/admin/export
 * @desc    Export all earnings (admin only)
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
  earningController.exportAllEarnings
);

module.exports = router;
// ============================================
// Additional Controller Methods for Routes
// ============================================

// @desc    Get all earnings (admin only)
// @route   GET /api/earnings/admin/all
// @access  Private/Admin
exports.getAllEarnings = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type,
      userId,
      startDate, 
      endDate,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = { isDeleted: false };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'referral', populate: { path: 'referredUser', select: 'name email' } }
      ]
    };
    
    const earnings = await Commission.paginate(query, options);
    
    // Get summary statistics
    const summary = await Commission.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      earnings: earnings.docs,
      summary,
      totalPages: earnings.totalPages,
      totalDocs: earnings.totalDocs,
      page: earnings.page,
      limit: earnings.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_view_all_earnings', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// @desc    Get global earnings statistics (admin only)
// @route   GET /api/earnings/admin/stats
// @access  Private/Admin
exports.getGlobalEarningsStats = async (req, res, next) => {
  try {
    const stats = await Commission.aggregate([
      { $match: { isDeleted: false } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', amount: { $sum: '$amount' }, count: { $sum: 1 } } }
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                amount: { $sum: '$amount' },
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
                totalAmount: { $sum: '$amount' },
                totalCount: { $sum: 1 },
                avgAmount: { $avg: '$amount' },
                minAmount: { $min: '$amount' },
                maxAmount: { $max: '$amount' }
              }
            }
          ],
          topEarners: [
            {
              $group: {
                _id: '$user',
                amount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { amount: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: '$user' },
            {
              $project: {
                'user.name': 1,
                'user.email': 1,
                amount: 1,
                count: 1
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
    await logActivity(req.user.id, 'admin_view_global_earnings_stats', {}, req);
  } catch (error) {
    next(error);
  }
};

// @desc    Export all earnings (admin only)
// @route   GET /api/earnings/admin/export
// @access  Private/Admin
exports.exportAllEarnings = async (req, res, next) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = { isDeleted: false };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const earnings = await Commission.find(query)
      .populate('user', 'name email')
      .populate('referral', 'referredUser')
      .sort('-createdAt');
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=all-earnings-${Date.now()}.csv`);
      
      // Headers
      res.write('User Name,User Email,Amount,Type,Status,Source,Created At\n');
      
      // Data
      earnings.forEach(e => {
        res.write([
          e.user?.name || 'Unknown',
          e.user?.email || '',
          e.amount,
          e.type,
          e.status,
          e.source?.description || e.source?.type || 'N/A',
          e.createdAt.toISOString()
        ].join(',') + '\n');
      });
      
      res.end();
    } else {
      res.status(200).json({
        success: true,
        count: earnings.length,
        earnings
      });
    }
    
    // Log activity
    await logActivity(req.user.id, 'admin_export_all_earnings', { format }, req);
  } catch (error) {
    next(error);
  }
};

// @desc    Get earnings by affiliate (admin only)
// @route   GET /api/earnings/admin/affiliate/:affiliateId
// @access  Private/Admin
exports.getEarningsByAffiliate = async (req, res, next) => {
  try {
    const { affiliateId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
    // Check if affiliate exists
    const affiliate = await Affiliate.findOne({ user: affiliateId });
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    const query = { user: affiliateId, isDeleted: false };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'referral', populate: { path: 'referredUser', select: 'name email' } }
      ]
    };
    
    const earnings = await Commission.paginate(query, options);
    
    // Get summary for this affiliate
    const summary = await Commission.aggregate([
      { $match: { user: affiliateId, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      affiliate: {
        id: affiliateId,
        name: affiliate.name,
        email: affiliate.email,
        stats: affiliate
      },
      earnings: earnings.docs,
      summary: summary[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 },
      totalPages: earnings.totalPages,
      totalDocs: earnings.totalDocs,
      page: earnings.page,
      limit: earnings.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_view_earnings_by_affiliate', { affiliateId }, req);
  } catch (error) {
    next(error);
  }
};




