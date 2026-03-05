const Referral = require('../models/Referral');
const User = require('../models/User');
const Commission = require('../models/Commission');
const Affiliate = require('../models/Affiliate');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const { calculateCommission, generateReferralCode } = require('../utils/helpers');
const logger = require('../utils/logger');

// ============================================
// Helper Functions
// ============================================

// Log referral activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'referral',
      message: `Referral ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'referral', id: details.referralId },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging referral activity:', error);
  }
};

// Calculate commission based on MLM level
const calculateMLMCommission = (amount, level, commissionRates = {}) => {
  const rates = {
    1: commissionRates.level1 || 10, // 10% for direct referrals
    2: commissionRates.level2 || 5,  // 5% for level 2
    3: commissionRates.level3 || 3,  // 3% for level 3
    4: commissionRates.level4 || 2,  // 2% for level 4
    5: commissionRates.level5 || 1,  // 1% for level 5
    default: commissionRates.default || 0
  };
  
  const rate = rates[level] || rates.default;
  return (amount * rate) / 100;
};

// Build referral tree recursively
const buildReferralTree = async (userId, depth = 1, maxDepth = 5, level = 1) => {
  if (depth > maxDepth) return [];
  
  const referrals = await Referral.find({ 
    referrer: userId, 
    isDeleted: false 
  })
  .populate('referredUser', 'name email profilePicture createdAt')
  .select('referredUser level status commission referredAt');
  
  const tree = [];
  
  for (const ref of referrals) {
    const node = {
      user: ref.referredUser,
      level: ref.level || level,
      status: ref.status,
      commission: ref.commission,
      referredAt: ref.referredAt,
      children: await buildReferralTree(ref.referredUser._id, depth + 1, maxDepth, level + 1)
    };
    tree.push(node);
  }
  
  return tree;
};

// ============================================
// @desc    Get referral dashboard
// @route   GET /api/referrals/dashboard
// @access  Private
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get user details with referral code
    const user = await User.findById(userId).select('referralCode name email');
    
    // Get referral statistics
    const [totalReferrals, activeReferrals, pendingReferrals, convertedReferrals] = await Promise.all([
      Referral.countDocuments({ referrer: userId, isDeleted: false }),
      Referral.countDocuments({ referrer: userId, status: 'active', isDeleted: false }),
      Referral.countDocuments({ referrer: userId, status: 'pending', isDeleted: false }),
      Referral.countDocuments({ referrer: userId, status: 'converted', isDeleted: false })
    ]);
    
    // Get recent referrals
    const recentReferrals = await Referral.find({ referrer: userId, isDeleted: false })
      .populate('referredUser', 'name email profilePicture')
      .sort('-referredAt')
      .limit(10);
    
    // Get referral earnings
    const earnings = await Commission.aggregate([
      {
        $match: {
          user: userId,
          type: { $in: ['direct', 'indirect'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyTrend = await Referral.aggregate([
      {
        $match: {
          referrer: userId,
          referredAt: { $gte: thirtyDaysAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$referredAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`
        },
        stats: {
          total: totalReferrals,
          active: activeReferrals,
          pending: pendingReferrals,
          converted: convertedReferrals
        },
        earnings: {
          direct: earnings.find(e => e._id === 'direct')?.total || 0,
          indirect: earnings.find(e => e._id === 'indirect')?.total || 0,
          total: earnings.reduce((sum, e) => sum + e.total, 0)
        },
        recentReferrals,
        monthlyTrend
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all referrals
// @route   GET /api/referrals
// @access  Private
// ============================================
exports.getReferrals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      level, 
      sortBy = '-referredAt',
      startDate,
      endDate 
    } = req.query;
    
    const query = { referrer: userId, isDeleted: false };
    
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
        { path: 'referredUser', select: 'name email profilePicture createdAt isVerified' },
        { path: 'referralLink' }
      ]
    };
    
    const referrals = await Referral.paginate(query, options);
    
    // Get summary statistics
    const summary = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
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
    await logActivity(userId, 'view_referrals', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get referral by ID
// @route   GET /api/referrals/:id
// @access  Private
// ============================================
exports.getReferralById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const referral = await Referral.findOne({ 
      _id: id, 
      referrer: userId,
      isDeleted: false 
    })
    .populate('referredUser', 'name email profilePicture phone address city state country createdAt isVerified')
    .populate('referralLink')
    .populate('conversion.productId');
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }
    
    // Get commission history
    const commissions = await Commission.find({ 
      referral: id,
      isDeleted: false 
    }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      referral,
      commissions
    });
    
    // Log activity
    await logActivity(userId, 'view_referral_details', { referralId: id }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Create referral (when user registers with referral code)
// @route   POST /api/referrals
// @access  Public (called during registration)
// ============================================
exports.createReferral = async (req, res, next) => {
  try {
    const { referralCode, referredUserId } = req.body;
    
    // Find referrer by referral code
    const referrer = await User.findOne({ referralCode, isActive: true, isDeleted: false });
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }
    
    // Check if referral already exists
    const existingReferral = await Referral.findOne({ 
      referredUser: referredUserId,
      isDeleted: false 
    });
    
    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'User already referred'
      });
    }
    
    // Get referrer's affiliate settings for commission rates
    const affiliate = await Affiliate.findOne({ user: referrer._id });
    const commissionRates = affiliate?.commissionRates || {
      level1: 10,
      level2: 5,
      level3: 3
    };
    
    // Create referral
    const referral = await Referral.create({
      referrer: referrer._id,
      referredUser: referredUserId,
      referralCode,
      status: 'pending',
      level: 1,
      commission: {
        rate: commissionRates.level1,
        status: 'pending'
      },
      referredAt: Date.now()
    });
    
    // Update referrer's affiliate stats
    await Affiliate.findOneAndUpdate(
      { user: referrer._id },
      { 
        $inc: { referralCount: 1 },
        $set: { updatedAt: Date.now() }
      }
    );
    
    // Check for MLM upline commissions
    await distributeUplineCommissions(referrer._id, referredUserId, 1, commissionRates);
    
    res.status(201).json({
      success: true,
      message: 'Referral created successfully',
      referral
    });
    
    // Log activity
    await logActivity(referrer._id, 'create_referral', { 
      referralId: referral._id,
      referredUserId 
    }, req);
  } catch (error) {
    next(error);
  }
};

// Helper function to distribute upline commissions
const distributeUplineCommissions = async (referrerId, referredUserId, level, rates, maxLevel = 5) => {
  try {
    if (level > maxLevel) return;
    
    // Get upline referrer
    const uplineReferral = await Referral.findOne({ 
      referredUser: referrerId,
      isDeleted: false 
    }).populate('referrer');
    
    if (!uplineReferral) return;
    
    const uplineUser = uplineReferral.referrer;
    
    // Calculate commission for this level
    const commissionAmount = calculateMLMCommission(0, level + 1, rates); // Placeholder, actual amount comes from conversions
    
    // Create commission record (pending until conversion)
    await Commission.create({
      user: uplineUser._id,
      referral: uplineReferral._id,
      amount: 0, // Will be updated when conversion happens
      rate: rates[`level${level + 1}`] || 0,
      type: 'indirect',
      status: 'pending',
      tier: {
        level: level + 1,
        percentage: rates[`level${level + 1}`] || 0
      },
      metadata: {
        sourceReferral: referredUserId,
        level: level + 1
      }
    });
    
    // Recursively distribute to next upline
    await distributeUplineCommissions(uplineUser._id, referredUserId, level + 1, rates, maxLevel);
  } catch (error) {
    logger.error('Error distributing upline commissions:', error);
  }
};

// ============================================
// @desc    Update referral status
// @route   PUT /api/referrals/:id/status
// @access  Private
// ============================================
exports.updateReferralStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;
    
    const referral = await Referral.findOne({ 
      _id: id, 
      referrer: userId,
      isDeleted: false 
    });
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }
    
    const oldStatus = referral.status;
    referral.status = status;
    
    // Update timestamps based on status
    if (status === 'active') {
      referral.activeAt = Date.now();
    } else if (status === 'converted') {
      referral.convertedAt = Date.now();
    } else if (status === 'expired') {
      referral.expiresAt = Date.now();
    }
    
    await referral.save();
    
    // Log activity
    await logActivity(userId, 'update_referral_status', { 
      referralId: id,
      oldStatus,
      newStatus: status,
      reason 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Referral status updated successfully',
      referral
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Track referral click
// @route   POST /api/referrals/track-click
// @access  Public
// ============================================
exports.trackClick = async (req, res, next) => {
  try {
    const { referralCode, linkId, ipAddress, userAgent, referrerUrl } = req.body;
    
    // Find referrer by code
    const referrer = await User.findOne({ referralCode, isActive: true, isDeleted: false });
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }
    
    // Create click record
    const Click = require('../models/Click');
    const click = await Click.create({
      affiliate: referrer._id,
      link: linkId,
      ipAddress,
      userAgent,
      referrer: referrerUrl,
      clickedAt: Date.now()
    });
    
    res.status(200).json({
      success: true,
      clickId: click._id
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Record conversion
// @route   POST /api/referrals/convert
// @access  Private (Admin/System)
// ============================================
exports.recordConversion = async (req, res, next) => {
  try {
    const { 
      referralId, 
      clickId,
      amount, 
      productId, 
      productName, 
      orderId,
      metadata 
    } = req.body;
    
    const referral = await Referral.findById(referralId)
      .populate('referrer');
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }
    
    // Calculate commission
    const affiliate = await Affiliate.findOne({ user: referral.referrer._id });
    const commissionRate = affiliate?.commissionRate || referral.commission.rate || 5;
    const commissionAmount = (amount * commissionRate) / 100;
    
    // Update referral
    referral.status = 'converted';
    referral.convertedAt = Date.now();
    referral.conversion = {
      productId,
      productName,
      amount,
      currency: 'USD',
      convertedAt: Date.now(),
      orderId
    };
    referral.commission.amount = commissionAmount;
    referral.commission.status = 'pending';
    
    await referral.save();
    
    // Create commission record
    const Commission = require('../models/Commission');
    const commission = await Commission.create({
      user: referral.referrer._id,
      referral: referral._id,
      amount: commissionAmount,
      rate: commissionRate,
      type: 'direct',
      status: 'pending',
      source: {
        type: 'product_sale',
        sourceId: productId,
        description: `Commission from referral conversion`
      },
      transaction: {
        id: orderId,
        date: Date.now(),
        amount,
        productName
      }
    });
    
    // Distribute upline commissions
    await distributeUplineCommissionsForConversion(referral.referrer._id, referral._id, amount, commissionRate);
    
    // Update click if exists
    if (clickId) {
      const Click = require('../models/Click');
      await Click.findByIdAndUpdate(clickId, { converted: true });
    }
    
    res.status(201).json({
      success: true,
      message: 'Conversion recorded successfully',
      commission
    });
    
    // Log activity
    await logActivity(referral.referrer._id, 'record_conversion', { 
      referralId,
      amount,
      commission: commissionAmount
    }, req);
  } catch (error) {
    next(error);
  }
};

// Helper function for upline commissions on conversion
const distributeUplineCommissionsForConversion = async (userId, referralId, saleAmount, baseRate, level = 2, maxLevel = 5) => {
  try {
    if (level > maxLevel) return;
    
    // Get upline
    const uplineReferral = await Referral.findOne({ 
      referredUser: userId,
      isDeleted: false 
    }).populate('referrer');
    
    if (!uplineReferral) return;
    
    const uplineUser = uplineReferral.referrer;
    const affiliate = await Affiliate.findOne({ user: uplineUser._id });
    
    // Get commission rate for this level (usually lower than direct)
    const uplineRate = affiliate?.commissionRates?.[`level${level}`] || (baseRate * 0.5);
    const commissionAmount = (saleAmount * uplineRate) / 100;
    
    // Create commission for upline
    const Commission = require('../models/Commission');
    await Commission.create({
      user: uplineUser._id,
      referral: uplineReferral._id,
      amount: commissionAmount,
      rate: uplineRate,
      type: 'indirect',
      status: 'pending',
      tier: {
        level,
        percentage: uplineRate
      },
      metadata: {
        sourceReferral: referralId,
        level
      }
    });
    
    // Recursively distribute to next upline
    await distributeUplineCommissionsForConversion(uplineUser._id, referralId, saleAmount, baseRate, level + 1, maxLevel);
  } catch (error) {
    logger.error('Error distributing upline conversion commissions:', error);
  }
};

// ============================================
// @desc    Get referral statistics
// @route   GET /api/referrals/stats
// @access  Private
// ============================================
exports.getReferralStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
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
                maxCommission: { $max: '$commission.amount' },
                conversionRate: {
                  $avg: {
                    $cond: [{ $eq: ['$status', 'converted'] }, 1, 0]
                  }
                }
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
    await logActivity(userId, 'view_referral_stats', {}, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get referral tree
// @route   GET /api/referrals/tree
// @access  Private
// ============================================
exports.getReferralTree = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { depth = 5 } = req.query;
    
    const tree = await buildReferralTree(userId, 1, parseInt(depth));
    
    // Get tree statistics
    const stats = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          totalCommission: { $sum: '$commission.amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      tree,
      stats,
      totalNodes: tree.length
    });
    
    // Log activity
    await logActivity(userId, 'view_referral_tree', { depth }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get referral performance analytics
// @route   GET /api/referrals/analytics
// @access  Private
// ============================================
exports.getReferralAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Daily referral signups
    const dailySignups = await Referral.aggregate([
      {
        $match: {
          referrer: userId,
          referredAt: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$referredAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    // Conversion funnel
    const funnel = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          expired: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Average time to conversion
    const avgTimeToConversion = await Referral.aggregate([
      {
        $match: {
          referrer: userId,
          status: 'converted',
          convertedAt: { $exists: true },
          isDeleted: false
        }
      },
      {
        $project: {
          timeToConvert: {
            $divide: [
              { $subtract: ['$convertedAt', '$referredAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$timeToConvert' },
          minDays: { $min: '$timeToConvert' },
          maxDays: { $max: '$timeToConvert' }
        }
      }
    ]);
    
    // Referral source performance
    const sourcePerformance = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $lookup: {
          from: 'clicks',
          localField: '_id',
          foreignField: 'referral',
          as: 'clicks'
        }
      },
      {
        $group: {
          _id: '$referralLink',
          count: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          },
          totalClicks: { $sum: { $size: '$clicks' } }
        }
      },
      {
        $project: {
          source: '$_id',
          count: 1,
          conversions: 1,
          totalClicks: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$totalClicks', 0] },
              { $multiply: [{ $divide: ['$conversions', '$totalClicks'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      analytics: {
        period: { days, startDate },
        dailySignups,
        funnel: funnel[0] || { total: 0, active: 0, converted: 0, pending: 0, expired: 0 },
        conversionTime: avgTimeToConversion[0] || { avgDays: 0, minDays: 0, maxDays: 0 },
        sourcePerformance
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_referral_analytics', { days }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get top referrers (leaderboard)
// @route   GET /api/referrals/leaderboard
// @access  Public
// ============================================
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { referredAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { referredAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      dateFilter = { referredAt: { $gte: yearAgo } };
    }
    
    const leaderboard = await Referral.aggregate([
      { $match: { ...dateFilter, isDeleted: false } },
      {
        $group: {
          _id: '$referrer',
          referralCount: { $sum: 1 },
          conversionCount: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] }
          },
          totalCommission: { $sum: '$commission.amount' }
        }
      },
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
          'user.profilePicture': 1,
          referralCount: 1,
          conversionCount: 1,
          totalCommission: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$referralCount', 0] },
              { $multiply: [{ $divide: ['$conversionCount', '$referralCount'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { referralCount: -1, totalCommission: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json({
      success: true,
      period,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get referral rewards
// @route   GET /api/referrals/rewards
// @access  Private
// ============================================
exports.getReferralRewards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get milestone rewards
    const milestones = [
      { count: 5, reward: 10, name: 'Bronze Referrer' },
      { count: 10, reward: 25, name: 'Silver Referrer' },
      { count: 25, reward: 50, name: 'Gold Referrer' },
      { count: 50, reward: 100, name: 'Platinum Referrer' },
      { count: 100, reward: 250, name: 'Diamond Referrer' }
    ];
    
    const totalReferrals = await Referral.countDocuments({ 
      referrer: userId, 
      isDeleted: false 
    });
    
    const achievements = [];
    let nextMilestone = null;
    
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      
      if (totalReferrals >= milestone.count) {
        achievements.push({
          ...milestone,
          achieved: true,
          achievedAt: null // Would need to track actual achievement dates
        });
      } else {
        if (!nextMilestone) {
          nextMilestone = {
            ...milestone,
            remaining: milestone.count - totalReferrals,
            progress: (totalReferrals / milestone.count) * 100
          };
        }
      }
    }
    
    res.status(200).json({
      success: true,
      rewards: {
        totalReferrals,
        achievements,
        nextMilestone,
        points: totalReferrals * 10, // Example points system
        tier: totalReferrals >= 50 ? 'Platinum' : 
              totalReferrals >= 25 ? 'Gold' :
              totalReferrals >= 10 ? 'Silver' :
              totalReferrals >= 5 ? 'Bronze' : 'New'
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_referral_rewards', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export referral data
// @route   GET /api/referrals/export
// @access  Private
// ============================================
exports.exportReferralData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format = 'json' } = req.query;
    
    const referrals = await Referral.find({ 
      referrer: userId, 
      isDeleted: false 
    })
    .populate('referredUser', 'name email createdAt')
    .sort('-referredAt');
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = referrals.map(ref => ({
        'Referred User': ref.referredUser?.name || 'Unknown',
        'Email': ref.referredUser?.email || '',
        'Status': ref.status,
        'Referred At': ref.referredAt,
        'Converted At': ref.convertedAt || '',
        'Commission Amount': ref.commission?.amount || 0,
        'Commission Status': ref.commission?.status || '',
        'Level': ref.level
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=referrals.csv');
      
      // Send CSV headers
      res.write('Referred User,Email,Status,Referred At,Converted At,Commission Amount,Commission Status,Level\n');
      
      // Send CSV data
      csvData.forEach(row => {
        res.write(`${row['Referred User']},${row['Email']},${row.Status},${row['Referred At']},${row['Converted At']},${row['Commission Amount']},${row['Commission Status']},${row.Level}\n`);
      });
      
      res.end();
    } else {
      res.status(200).json({
        success: true,
        referrals
      });
    }
    
    // Log activity
    await logActivity(userId, 'export_referral_data', { format }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete referral
// @route   DELETE /api/referrals/:id
// @access  Private
// ============================================
exports.deleteReferral = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const referral = await Referral.findOne({ 
      _id: id, 
      referrer: userId,
      isDeleted: false 
    });
    
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }
    
    // Soft delete
    referral.isDeleted = true;
    await referral.save();
    
    // Decrease referrer's referral count
    await Affiliate.findOneAndUpdate(
      { user: userId },
      { $inc: { referralCount: -1 } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Referral deleted successfully'
    });
    
    // Log activity
    await logActivity(userId, 'delete_referral', { referralId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Bulk delete referrals
// @route   POST /api/referrals/bulk-delete
// @access  Private
// ============================================
exports.bulkDeleteReferrals = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;
    
    const result = await Referral.updateMany(
      { 
        _id: { $in: ids }, 
        referrer: userId,
        isDeleted: false 
      },
      { isDeleted: true }
    );
    
    // Update referrer's referral count
    await Affiliate.findOneAndUpdate(
      { user: userId },
      { $inc: { referralCount: -result.modifiedCount } }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} referrals deleted successfully`
    });
    
    // Log activity
    await logActivity(userId, 'bulk_delete_referrals', { count: result.modifiedCount }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get referral settings
// @route   GET /api/referrals/settings
// @access  Private (Admin only)
// ============================================
exports.getReferralSettings = async (req, res, next) => {
  try {
    const Setting = require('../models/Setting');
    
    const settings = await Setting.findOne({ 
      key: 'referral_settings',
      isDeleted: false 
    });
    
    res.status(200).json({
      success: true,
      settings: settings?.value || {
        commissionRates: {
          level1: 10,
          level2: 5,
          level3: 3,
          level4: 2,
          level5: 1
        },
        maxDepth: 5,
        cookieDuration: 30, // days
        minimumPayout: 10,
        referralRewards: {
          5: 10,
          10: 25,
          25: 50,
          50: 100,
          100: 250
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update referral settings
// @route   PUT /api/referrals/settings
// @access  Private (Admin only)
// ============================================
exports.updateReferralSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    const Setting = require('../models/Setting');
    
    const updatedSettings = await Setting.findOneAndUpdate(
      { key: 'referral_settings' },
      {
        key: 'referral_settings',
        value: settings,
        label: 'Referral Settings',
        category: 'referral',
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Referral settings updated successfully',
      settings: updatedSettings.value
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
