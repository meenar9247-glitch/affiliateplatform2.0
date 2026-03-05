const Affiliate = require('../models/Affiliate');
const User = require('../models/User');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Link = require('../models/Link');
const Payout = require('../models/Payout');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const { generateReferralCode, generateTrackingId } = require('../utils/helpers');
const logger = require('../utils/logger');

// ============================================
// Helper Functions
// ============================================

// Log affiliate activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'affiliate',
      message: `Affiliate ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'affiliate', id: userId },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging affiliate activity:', error);
  }
};

// Calculate commission based on rules
const calculateCommission = (amount, rate, rules = {}) => {
  let commission = (amount * rate) / 100;
  
  if (rules.minCommission && commission < rules.minCommission) {
    commission = rules.minCommission;
  }
  
  if (rules.maxCommission && commission > rules.maxCommission) {
    commission = rules.maxCommission;
  }
  
  if (rules.roundTo) {
    commission = Math.round(commission * rules.roundTo) / rules.roundTo;
  }
  
  return commission;
};

// ============================================
// @desc    Get affiliate dashboard
// @route   GET /api/affiliate/dashboard
// @access  Private (Affiliate only)
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get affiliate profile
    let affiliate = await Affiliate.findOne({ user: userId })
      .populate('user', 'name email profilePicture');
    
    if (!affiliate) {
      // Create affiliate profile if not exists
      affiliate = await Affiliate.create({
        user: userId,
        commissionRate: 5.0,
        status: 'pending'
      });
    }
    
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [todayClicks, todayConversions, todayCommission] = await Promise.all([
      Click.countDocuments({
        affiliate: userId,
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      Conversion.countDocuments({
        affiliate: userId,
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      Commission.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $in: ['pending', 'approved', 'paid'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyStats = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: weekAgo },
          status: { $in: ['pending', 'approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get monthly stats
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthlyStats = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: monthAgo },
          status: { $in: ['pending', 'approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Get top performing links
    const topLinks = await Link.find({ user: userId })
      .sort('-clicks')
      .limit(5)
      .select('name url clicks conversions commission');
    
    // Get recent conversions
    const recentConversions = await Conversion.find({ affiliate: userId })
      .sort('-createdAt')
      .limit(10)
      .populate('referral', 'referredUser')
      .populate('link', 'name');
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user: userId });
    
    res.status(200).json({
      success: true,
      dashboard: {
        affiliate: {
          id: affiliate._id,
          commissionRate: affiliate.commissionRate,
          totalEarnings: affiliate.totalEarnings,
          pendingEarnings: affiliate.pendingEarnings,
          withdrawnAmount: affiliate.withdrawnAmount,
          referralCount: affiliate.referralCount,
          clickCount: affiliate.clickCount,
          conversionRate: affiliate.conversionRate,
          status: affiliate.status,
          paymentMethod: affiliate.paymentMethod,
          taxInfo: affiliate.taxInfo
        },
        wallet: wallet ? {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          holdBalance: wallet.holdBalance,
          pendingBalance: wallet.pendingBalance
        } : null,
        today: {
          clicks: todayClicks,
          conversions: todayConversions,
          commission: todayCommission[0]?.total || 0
        },
        weekly: weeklyStats,
        monthly: monthlyStats,
        topLinks,
        recentConversions
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get affiliate profile
// @route   GET /api/affiliate/profile
// @access  Private (Affiliate only)
// ============================================
exports.getProfile = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user.id })
      .populate('user', 'name email profilePicture phone address city state country postalCode bio website socialLinks');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      affiliate
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_profile', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update affiliate profile
// @route   PUT /api/affiliate/profile
// @access  Private (Affiliate only)
// ============================================
exports.updateProfile = async (req, res, next) => {
  try {
    const { paymentMethod, taxInfo, website, bio, socialLinks } = req.body;
    
    const affiliate = await Affiliate.findOne({ user: req.user.id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }
    
    // Track changes
    const changes = [];
    
    if (paymentMethod) {
      changes.push({ field: 'paymentMethod', oldValue: affiliate.paymentMethod, newValue: paymentMethod });
      affiliate.paymentMethod = paymentMethod;
    }
    
    if (taxInfo) {
      changes.push({ field: 'taxInfo', oldValue: affiliate.taxInfo, newValue: taxInfo });
      affiliate.taxInfo = taxInfo;
    }
    
    if (website !== undefined) {
      changes.push({ field: 'website', oldValue: affiliate.website, newValue: website });
      affiliate.website = website;
    }
    
    if (bio !== undefined) {
      changes.push({ field: 'bio', oldValue: affiliate.bio, newValue: bio });
      affiliate.bio = bio;
    }
    
    if (socialLinks) {
      changes.push({ field: 'socialLinks', oldValue: affiliate.socialLinks, newValue: socialLinks });
      affiliate.socialLinks = socialLinks;
    }
    
    await affiliate.save();
    
    // Update user profile as well
    if (website || bio || socialLinks) {
      const user = await User.findById(req.user.id);
      if (website) user.website = website;
      if (bio) user.bio = bio;
      if (socialLinks) user.socialLinks = socialLinks;
      await user.save();
    }
    
    // Log activity
    if (changes.length > 0) {
      await logActivity(req.user.id, 'update_profile', { changes }, req);
    }
    
    res.status(200).json({
      success: true,
      message: 'Affiliate profile updated successfully',
      affiliate
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get affiliate links
// @route   GET /api/affiliate/links
// @access  Private (Affiliate only)
// ============================================
exports.getLinks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, sortBy = '-createdAt', status } = req.query;
    
    const query = { user: userId, isDeleted: false };
    if (status) query.status = status;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy
    };
    
    const links = await Link.paginate(query, options);
    
    // Get stats for links
    const linkIds = links.docs.map(link => link._id);
    
    const stats = await Click.aggregate([
      { $match: { link: { $in: linkIds } } },
      {
        $group: {
          _id: '$link',
          clicks: { $sum: 1 },
          uniqueClicks: { $addToSet: '$ipAddress' },
          conversions: { $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] } }
        }
      }
    ]);
    
    // Map stats to links
    const linksWithStats = links.docs.map(link => {
      const linkStats = stats.find(s => s._id.toString() === link._id.toString());
      return {
        ...link.toObject(),
        stats: linkStats ? {
          clicks: linkStats.clicks,
          uniqueClicks: linkStats.uniqueClicks.length,
          conversions: linkStats.conversions,
          conversionRate: linkStats.clicks > 0 ? (linkStats.conversions / linkStats.clicks * 100).toFixed(2) : 0
        } : {
          clicks: 0,
          uniqueClicks: 0,
          conversions: 0,
          conversionRate: 0
        }
      };
    });
    
    // Log activity
    await logActivity(userId, 'view_links', { page, limit }, req);
    
    res.status(200).json({
      success: true,
      links: linksWithStats,
      totalPages: links.totalPages,
      totalDocs: links.totalDocs,
      page: links.page,
      limit: links.limit
    });
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Create affiliate link
// @route   POST /api/affiliate/links
// @access  Private (Affiliate only)
// ============================================
exports.createLink = async (req, res, next) => {
  try {
    const { name, url, description, tags, targetUrl, commissionRate, expiresAt } = req.body;
    
    const userId = req.user.id;
    
    // Check if user is approved affiliate
    const affiliate = await Affiliate.findOne({ user: userId });
    if (!affiliate || affiliate.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your affiliate account is not active'
      });
    }
    
    // Generate unique tracking ID
    const trackingId = generateTrackingId();
    
    // Create link
    const link = await Link.create({
      user: userId,
      name,
      url: url || `${process.env.BASE_URL}/r/${trackingId}`,
      targetUrl,
      trackingId,
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      commissionRate: commissionRate || affiliate.commissionRate,
      expiresAt,
      status: 'active'
    });
    
    // Log activity
    await logActivity(userId, 'create_link', { linkId: link._id, name }, req);
    
    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      link
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update affiliate link
// @route   PUT /api/affiliate/links/:id
// @access  Private (Affiliate only)
// ============================================
exports.updateLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, tags, targetUrl, commissionRate, status, expiresAt } = req.body;
    
    const link = await Link.findOne({ _id: id, user: req.user.id, isDeleted: false });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    // Track changes
    const changes = [];
    
    if (name && name !== link.name) {
      changes.push({ field: 'name', oldValue: link.name, newValue: name });
      link.name = name;
    }
    
    if (description !== undefined) {
      changes.push({ field: 'description', oldValue: link.description, newValue: description });
      link.description = description;
    }
    
    if (tags) {
      const newTags = tags.split(',').map(t => t.trim());
      changes.push({ field: 'tags', oldValue: link.tags, newValue: newTags });
      link.tags = newTags;
    }
    
    if (targetUrl) {
      changes.push({ field: 'targetUrl', oldValue: link.targetUrl, newValue: targetUrl });
      link.targetUrl = targetUrl;
    }
    
    if (commissionRate) {
      changes.push({ field: 'commissionRate', oldValue: link.commissionRate, newValue: commissionRate });
      link.commissionRate = commissionRate;
    }
    
    if (status) {
      changes.push({ field: 'status', oldValue: link.status, newValue: status });
      link.status = status;
    }
    
    if (expiresAt) {
      changes.push({ field: 'expiresAt', oldValue: link.expiresAt, newValue: expiresAt });
      link.expiresAt = expiresAt;
    }
    
    await link.save();
    
    // Log activity
    if (changes.length > 0) {
      await logActivity(req.user.id, 'update_link', { linkId: id, changes }, req);
    }
    
    res.status(200).json({
      success: true,
      message: 'Link updated successfully',
      link
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete affiliate link
// @route   DELETE /api/affiliate/links/:id
// @access  Private (Affiliate only)
// ============================================
exports.deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const link = await Link.findOne({ _id: id, user: req.user.id, isDeleted: false });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    // Soft delete
    link.isDeleted = true;
    link.status = 'deleted';
    await link.save();
    
    // Log activity
    await logActivity(req.user.id, 'delete_link', { linkId: id, name: link.name }, req);
    
    res.status(200).json({
      success: true,
      message: 'Link deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get link stats
// @route   GET /api/affiliate/links/:id/stats
// @access  Private (Affiliate only)
// ============================================
exports.getLinkStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const link = await Link.findOne({ _id: id, user: req.user.id, isDeleted: false });
    
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }
    
    // Date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Get clicks
    const clicks = await Click.find({ link: id, ...dateFilter }).sort('-createdAt');
    
    // Get conversions
    const conversions = await Conversion.find({ link: id, ...dateFilter })
      .populate('referral', 'referredUser')
      .sort('-createdAt');
    
    // Get daily stats
    const dailyStats = await Click.aggregate([
      {
        $match: {
          link: link._id,
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {})
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          clicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);
    
    // Get referrer stats
    const referrerStats = await Click.aggregate([
      {
        $match: {
          link: link._id,
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {})
        }
      },
      {
        $group: {
          _id: '$referrer',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);
    
    // Get device stats
    const deviceStats = await Click.aggregate([
      {
        $match: {
          link: link._id,
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {})
        }
      },
      {
        $group: {
          _id: '$device',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get country stats
    const countryStats = await Click.aggregate([
      {
        $match: {
          link: link._id,
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {})
        }
      },
      {
        $group: {
          _id: '$country',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);
    
    // Calculate summary
    const totalClicks = clicks.length;
    const uniqueClicks = [...new Set(clicks.map(c => c.ipAddress))].length;
    const totalConversions = conversions.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0;
    const totalCommission = conversions.reduce((sum, c) => sum + (c.commission?.amount || 0), 0);
    
    res.status(200).json({
      success: true,
      stats: {
        summary: {
          totalClicks,
          uniqueClicks,
          totalConversions,
          conversionRate,
          totalCommission
        },
        daily: dailyStats,
        referrers: referrerStats,
        devices: deviceStats,
        countries: countryStats,
        recentClicks: clicks.slice(0, 20),
        recentConversions: conversions.slice(0, 20)
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_link_stats', { linkId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all clicks
// @route   GET /api/affiliate/clicks
// @access  Private (Affiliate only)
// ============================================
exports.getClicks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, linkId, startDate, endDate } = req.query;
    
    const query = { affiliate: userId };
    
    if (linkId) query.link = linkId;
    
    if (startDate || endDate) {
      query.clickedAt = {};
      if (startDate) query.clickedAt.$gte = new Date(startDate);
      if (endDate) query.clickedAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-clickedAt',
      populate: ['link', 'referral']
    };
    
    const clicks = await Click.paginate(query, options);
    
    res.status(200).json({
      success: true,
      clicks: clicks.docs,
      totalPages: clicks.totalPages,
      totalDocs: clicks.totalDocs,
      page: clicks.page,
      limit: clicks.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_clicks', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get conversions
// @route   GET /api/affiliate/conversions
// @access  Private (Affiliate only)
// ============================================
exports.getConversions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, linkId, status, startDate, endDate } = req.query;
    
    const query = { affiliate: userId };
    
    if (linkId) query.link = linkId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.convertedAt = {};
      if (startDate) query.convertedAt.$gte = new Date(startDate);
      if (endDate) query.convertedAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-convertedAt',
      populate: ['link', 'referral']
    };
    
    const conversions = await Conversion.paginate(query, options);
    
    // Get summary
    const summary = await Conversion.aggregate([
      { $match: { affiliate: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$commission.amount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      conversions: conversions.docs,
      summary,
      totalPages: conversions.totalPages,
      totalDocs: conversions.totalDocs,
      page: conversions.page,
      limit: conversions.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_conversions', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get commissions
// @route   GET /api/affiliate/commissions
// @access  Private (Affiliate only)
// ============================================
exports.getCommissions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, type, startDate, endDate } = req.query;
    
    const query = { user: userId, isDeleted: false };
    if (status) query.status = status;
    if (type) query.type = type;
    
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
        { path: 'referral', populate: { path: 'referredUser', select: 'name email' } },
        { path: 'source.sourceId' }
      ]
    };
    
    const commissions = await Commission.paginate(query, options);
    
    // Get summary
    const summary = await Commission.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: { $cond: [{ $in: ['$status', ['paid', 'approved']] }, '$amount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          totalCommission: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly breakdown
    const monthlyBreakdown = await Commission.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.status(200).json({
      success: true,
      commissions: commissions.docs,
      summary: summary[0] || { totalEarned: 0, totalPending: 0, totalCommission: 0, count: 0 },
      monthlyBreakdown,
      totalPages: commissions.totalPages,
      totalDocs: commissions.totalDocs,
      page: commissions.page,
      limit: commissions.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_commissions', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get referrals
// @route   GET /api/affiliate/referrals
// @access  Private (Affiliate only)
// ============================================
exports.getReferrals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, level, startDate, endDate } = req.query;
    
    const query = { referrer: userId, isDeleted: false };
    if (status) query.status = status;
    if (level) query.level = level;
    
    if (startDate || endDate) {
      query.referredAt = {};
      if (startDate) query.referredAt.$gte = new Date(startDate);
      if (endDate) query.referredAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-referredAt',
      populate: [
        { path: 'referredUser', select: 'name email profilePicture createdAt' },
        { path: 'referralLink' }
      ]
    };
    
    const referrals = await Referral.paginate(query, options);
    
    // Get stats
    const stats = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCommission: { $sum: '$commission.amount' }
        }
      }
    ]);
    
    // Get referral tree (first level only)
    const referralTree = await Referral.find({ referrer: userId, isDeleted: false })
      .populate('referredUser', 'name email profilePicture')
      .limit(10);
    
    res.status(200).json({
      success: true,
      referrals: referrals.docs,
      stats,
      referralTree,
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
// @desc    Get referral tree (multi-level)
// @route   GET /api/affiliate/referral-tree
// @access  Private (Affiliate only)
// ============================================
exports.getReferralTree = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { depth = 3 } = req.query;
    
    // Recursive function to build tree
    const buildTree = async (userId, currentDepth = 1, maxDepth = depth) => {
      if (currentDepth > maxDepth) return [];
      
      const referrals = await Referral.find({ referrer: userId, isDeleted: false })
        .populate('referredUser', 'name email profilePicture referralCode')
        .select('referredUser level status commission referredAt');
      
      const tree = [];
      
      for (const ref of referrals) {
        const node = {
          user: ref.referredUser,
          level: ref.level,
          status: ref.status,
          commission: ref.commission,
          referredAt: ref.referredAt,
          children: await buildTree(ref.referredUser._id, currentDepth + 1, maxDepth)
        };
        tree.push(node);
      }
      
      return tree;
    };
    
    const tree = await buildTree(userId);
    
    // Get counts by level
    const levelCounts = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      tree,
      levelCounts,
      totalReferrals: tree.length
    });
    
    // Log activity
    await logActivity(userId, 'view_referral_tree', { depth }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Request payout
// @route   POST /api/affiliate/request-payout
// @access  Private (Affiliate only)
// ============================================
exports.requestPayout = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    const userId = req.user.id;
    
    // Get affiliate and wallet
    const [affiliate, wallet] = await Promise.all([
      Affiliate.findOne({ user: userId }),
      Wallet.findOne({ user: userId })
    ]);
    
    if (!affiliate || affiliate.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your affiliate account is not active'
      });
    }
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    // Check available balance
    if (amount > wallet.availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }
    
    // Check minimum payout
    const minPayout = affiliate.paymentMethod?.minPayout || 10;
    if (amount < minPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ${minPayout}`
      });
    }
    
    // Get pending commissions
    const pendingCommissions = await Commission.find({
      user: userId,
      status: 'pending',
      isDeleted: false
    });
    
    if (pendingCommissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending commissions available for payout'
      });
    }
    
    // Calculate total pending amount
    const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
    
    if (amount > totalPending) {
      return res.status(400).json({
        success: false,
        message: 'Requested amount exceeds pending commissions'
      });
    }
    
    // Create payout request
    const payout = await Payout.create({
      user: userId,
      amount,
      method: {
        type: paymentMethod || affiliate.paymentMethod?.type || 'wallet',
        details: affiliate.paymentMethod?.details || {}
      },
      commissions: pendingCommissions.filter(c => c.amount <= amount).map(c => c._id),
      status: 'pending',
      requestedAt: Date.now()
    });
    
    // Update commission status
    await Commission.updateMany(
      { _id: { $in: payout.commissions } },
      { status: 'processing' }
    );
    
    // Hold amount in wallet
    wallet.holdBalance += amount;
    await wallet.save();
    
    // Update affiliate pending earnings
    affiliate.pendingEarnings -= amount;
    await affiliate.save();
    
    // Log activity
    await logActivity(userId, 'request_payout', { amount, payoutId: payout._id }, req);
    
    res.status(201).json({
      success: true,
      message: 'Payout requested successfully',
      payout
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get payout history
// @route   GET /api/affiliate/payouts
// @access  Private (Affiliate only)
// ============================================
exports.getPayouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    
    const query = { user: userId, isDeleted: false };
    if (status) query.status = status;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-requestedAt',
      populate: ['commissions']
    };
    
    const payouts = await Payout.paginate(query, options);
    
    // Get summary
    const summary = await Payout.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      payouts: payouts.docs,
      summary,
      totalPages: payouts.totalPages,
      totalDocs: payouts.totalDocs,
      page: payouts.page,
      limit: payouts.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_payouts', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings report
// @route   GET /api/affiliate/earnings-report
// @access  Private (Affiliate only)
// ============================================
exports.getEarningsReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month', year, month } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch(period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        if (year && month) {
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 0, 23, 59, 59);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    
    // Get daily breakdown
    const dailyBreakdown = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['pending', 'approved', 'paid'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get source breakdown
    const sourceBreakdown = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['pending', 'approved', 'paid'] },
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
    
    // Get conversion stats
    const conversionStats = await Conversion.aggregate([
      {
        $match: {
          affiliate: userId,
          convertedAt: { $gte: startDate, $lte: endDate },
          status: 'completed',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalConversions: { $sum: 1 },
          totalRevenue: { $sum: '$saleAmount' },
          totalCommission: { $sum: '$commission.amount' },
          avgOrderValue: { $avg: '$saleAmount' }
        }
      }
    ]);
    
    // Get totals
    const totals = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['pending', 'approved', 'paid'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          avgCommission: { $avg: '$amount' },
          maxCommission: { $max: '$amount' },
          minCommission: { $min: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      report: {
        period: {
          startDate,
          endDate
        },
        totals: totals[0] || {
          totalCommission: 0,
          totalCount: 0,
          avgCommission: 0,
          maxCommission: 0,
          minCommission: 0
        },
        conversionStats: conversionStats[0] || {
          totalConversions: 0,
          totalRevenue: 0,
          totalCommission: 0,
          avgOrderValue: 0
        },
        dailyBreakdown,
        sourceBreakdown
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_report', { period, startDate, endDate }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get performance analytics
// @route   GET /api/affiliate/analytics
// @access  Private (Affiliate only)
// ============================================
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get daily performance
    const dailyPerformance = await Click.aggregate([
      {
        $match: {
          affiliate: userId,
          clickedAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'conversions',
          let: { clickId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$click', '$$clickId'] }
              }
            }
          ],
          as: 'conversion'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$clickedAt' },
            month: { $month: '$clickedAt' },
            day: { $dayOfMonth: '$clickedAt' }
          },
          clicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          conversions: {
            $sum: { $cond: [{ $gt: [{ $size: '$conversion' }, 0] }, 1, 0] }
          },
          revenue: {
            $sum: { $arrayElemAt: ['$conversion.commission.amount', 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get top performing links
    const topLinks = await Link.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $lookup: {
          from: 'clicks',
          localField: '_id',
          foreignField: 'link',
          as: 'clicks'
        }
      },
      {
        $lookup: {
          from: 'conversions',
          localField: '_id',
          foreignField: 'link',
          as: 'conversions'
        }
      },
      {
        $project: {
          name: 1,
          url: 1,
          clicks: { $size: '$clicks' },
          conversions: { $size: '$conversions' },
          revenue: { $sum: '$conversions.commission.amount' },
          conversionRate: {
            $cond: [
              { $gt: [{ $size: '$clicks' }, 0] },
              { $multiply: [{ $divide: [{ $size: '$conversions' }, { $size: '$clicks' }] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    
    // Get traffic sources
    const trafficSources = await Click.aggregate([
      {
        $match: {
          affiliate: userId,
          clickedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$referrer',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);
    
    // Get geographic data
    const geoData = await Click.aggregate([
      {
        $match: {
          affiliate: userId,
          clickedAt: { $gte: startDate },
          country: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$country',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);
    
    // Get device breakdown
    const deviceData = await Click.aggregate([
      {
        $match: {
          affiliate: userId,
          clickedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$device',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Calculate key metrics
    const totalClicks = dailyPerformance.reduce((sum, d) => sum + d.clicks, 0);
    const totalConversions = dailyPerformance.reduce((sum, d) => sum + d.conversions, 0);
    const totalRevenue = dailyPerformance.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0;
    const averageOrderValue = totalConversions > 0 ? (totalRevenue / totalConversions).toFixed(2) : 0;
    
    res.status(200).json({
      success: true,
      analytics: {
        period: {
          days,
          startDate
        },
        metrics: {
          totalClicks,
          totalConversions,
          totalRevenue,
          conversionRate,
          averageOrderValue
        },
        dailyPerformance,
        topLinks,
        trafficSources,
        geoData,
        deviceData
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_analytics', { days }, req);
  } catch (error) {
    next(error);
  }
};

// ===========================
=============
// @desc    Get referral code
// @route   GET /api/affiliate/referral-code
// @access  Private (Affiliate only)
// ============================================
exports.getReferralCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate referral code if not exists
    if (!user.referralCode) {
      user.referralCode = generateReferralCode();
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_referral_code', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Regenerate referral code
// @route   POST /api/affiliate/regenerate-code
// @access  Private (Affiliate only)
// ============================================
exports.regenerateReferralCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const oldCode = user.referralCode;
    user.referralCode = generateReferralCode();
    await user.save();
    
    // Log activity
    await logActivity(req.user.id, 'regenerate_referral_code', { oldCode, newCode: user.referralCode }, req);
    
    res.status(200).json({
      success: true,
      message: 'Referral code regenerated successfully',
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get payment methods
// @route   GET /api/affiliate/payment-methods
// @access  Private (Affiliate only)
// ============================================
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user.id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      paymentMethod: affiliate.paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update payment method
// @route   PUT /api/affiliate/payment-method
// @access  Private (Affiliate only)
// ============================================
exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const { type, details } = req.body;
    
    const affiliate = await Affiliate.findOne({ user: req.user.id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }
    
    const oldMethod = affiliate.paymentMethod;
    affiliate.paymentMethod = { type, details };
    await affiliate.save();
    
    // Log activity
    await logActivity(req.user.id, 'update_payment_method', {
      oldMethod,
      newMethod: { type, details }
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      paymentMethod: affiliate.paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get tax information
// @route   GET /api/affiliate/tax-info
// @access  Private (Affiliate only)
// ============================================
exports.getTaxInfo = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user.id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      taxInfo: affiliate.taxInfo
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update tax information
// @route   PUT /api/affiliate/tax-info
// @access  Private (Affiliate only)
// ============================================
exports.updateTaxInfo = async (req, res, next) => {
  try {
    const taxInfo = req.body;
    
    const affiliate = await Affiliate.findOne({ user: req.user.id });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate profile not found'
      });
    }
    
    const oldInfo = affiliate.taxInfo;
    affiliate.taxInfo = taxInfo;
    await affiliate.save();
    
    // Log activity
    await logActivity(req.user.id, 'update_tax_info', {
      oldInfo,
      newInfo: taxInfo
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Tax information updated successfully',
      taxInfo: affiliate.taxInfo
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
