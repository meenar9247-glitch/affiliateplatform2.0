const User = require('../models/User');
const Affiliate = require('../models/affiliatelink');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');
const Setting = require('../models/Setting');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Withdrawal = require('../models/Withdrawal');

// ============================================
// Helper Functions
// ============================================

// Log admin activity
const logActivity = async (adminId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'admin',
      message: `Admin ${action}`,
      user: adminId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'admin' },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging admin activity:', error);
  }
};

// Get date range
const getDateRange = (period = 'month') => {
  const now = new Date();
  let startDate, endDate;
  
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
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      endDate = new Date();
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      endDate = new Date();
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
  }
  
  return { startDate, endDate };
};

// ============================================
// @desc    Get admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const [
      userStats,
      affiliateStats,
      referralStats,
      commissionStats,
      payoutStats,
      ticketStats,
      recentUsers,
      recentAffiliates,
      recentPayouts,
      recentTickets,
      revenueData,
      systemHealth
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            verified: { $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] } },
            byRole: {
              $push: {
                role: '$role',
                count: 1
              }
            }
          }
        }
      ]),
      
      // Affiliate statistics
      Affiliate.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalEarnings: { $sum: '$totalEarnings' },
            pendingEarnings: { $sum: '$pendingEarnings' }
          }
        }
      ]),
      
      // Referral statistics
      Referral.aggregate([
        {
          $match: {
            referredAt: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Commission statistics
      Commission.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: '$status',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Payout statistics
      Payout.aggregate([
        {
          $match: {
            requestedAt: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: '$status',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Ticket statistics
      Ticket.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent users
      User.find({ isDeleted: false })
        .select('name email role isActive createdAt')
        .sort('-createdAt')
        .limit(5),
      
      // Recent affiliates
      Affiliate.find({ isDeleted: false })
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(5),
      
      // Recent payouts
      Payout.find({ isDeleted: false })
        .populate('user', 'name email')
        .sort('-requestedAt')
        .limit(5),
      
      // Recent tickets
      Ticket.find({ isDeleted: false })
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(5),
      
      // Revenue data for chart
      Commission.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      
      // System health metrics
      Promise.all([
        Log.countDocuments({ level: 'error', timestamp: { $gte: startDate } }),
        Log.countDocuments({ level: 'warn', timestamp: { $gte: startDate } }),
        User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) } })
      ]).then(([errors, warnings, activeToday]) => ({
        errors,
        warnings,
        activeToday
      }))
    ]);
    
    // Calculate user role breakdown
    const userRoleBreakdown = userStats[0]?.byRole.reduce((acc, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      dashboard: {
        users: {
          total: userStats[0]?.total || 0,
          active: userStats[0]?.active || 0,
          verified: userStats[0]?.verified || 0,
          byRole: userRoleBreakdown || {}
        },
        affiliates: affiliateStats,
        referrals: {
          total: referralStats.reduce((sum, r) => sum + r.count, 0),
          byStatus: referralStats
        },
        commissions: {
          total: commissionStats.reduce((sum, c) => sum + c.count, 0),
          amount: commissionStats.reduce((sum, c) => sum + c.amount, 0),
          byStatus: commissionStats
        },
        payouts: {
          total: payoutStats.reduce((sum, p) => sum + p.count, 0),
          amount: payoutStats.reduce((sum, p) => sum + p.amount, 0),
          byStatus: payoutStats
        },
        tickets: ticketStats,
        recent: {
          users: recentUsers,
          affiliates: recentAffiliates,
          payouts: recentPayouts,
          tickets: recentTickets
        },
        revenue: {
          data: revenueData,
          total: revenueData.reduce((sum, d) => sum + d.amount, 0)
        },
        systemHealth
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_dashboard', { period }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// USER MANAGEMENT
// ============================================

// ============================================
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
// ============================================
exports.getUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status,
      search,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = { isDeleted: false };
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      select: '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -deletionToken'
    };
    
    const users = await User.paginate(query, options);
    
    res.status(200).json({
      success: true,
      users: users.docs,
      totalPages: users.totalPages,
      totalDocs: users.totalDocs,
      page: users.page,
      limit: users.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_users', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
// ============================================
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -deletionToken')
      .populate('wallet')
      .populate('affiliate');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get additional user data
    const [referrals, commissions, payouts, tickets] = await Promise.all([
      Referral.find({ referrer: id, isDeleted: false }).countDocuments(),
      Commission.find({ user: id, isDeleted: false }).countDocuments(),
      Payout.find({ user: id, isDeleted: false }).countDocuments(),
      Ticket.find({ user: id, isDeleted: false }).countDocuments()
    ]);
    
    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          referrals,
          commissions,
          payouts,
          tickets
        }
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_user_details', { targetUserId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Create user
// @route   POST /api/admin/users
// @access  Private (Admin only)
// ============================================
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive, isVerified } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
      isVerified: isVerified !== undefined ? isVerified : false,
      createdBy: req.user.id
    });
    
    // Create wallet for user
    await Wallet.create({
      user: user._id,
      balance: 0,
      currency: 'USD',
      status: 'active'
    });
    
    // Log activity
    await logActivity(req.user.id, 'create_user', { targetUserId: user._id }, req);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
// ============================================
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, isVerified, phone, address, city, state, country, postalCode } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Track changes
    const changes = [];
    
    if (name && name !== user.name) {
      changes.push({ field: 'name', oldValue: user.name, newValue: name });
      user.name = name;
    }
    
    if (email && email !== user.email) {
      // Check if email already taken
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      changes.push({ field: 'email', oldValue: user.email, newValue: email });
      user.email = email;
    }
    
    if (role && role !== user.role) {
      changes.push({ field: 'role', oldValue: user.role, newValue: role });
      user.role = role;
    }
    
    if (isActive !== undefined && isActive !== user.isActive) {
      changes.push({ field: 'isActive', oldValue: user.isActive, newValue: isActive });
      user.isActive = isActive;
    }
    
    if (isVerified !== undefined && isVerified !== user.isVerified) {
      changes.push({ field: 'isVerified', oldValue: user.isVerified, newValue: isVerified });
      user.isVerified = isVerified;
    }
    
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (postalCode !== undefined) user.postalCode = postalCode;
    
    await user.save();
    
    // Log activity
    if (changes.length > 0) {
      await logActivity(req.user.id, 'update_user', { targetUserId: id, changes }, req);
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
// ============================================
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Soft delete
    user.isDeleted = true;
    user.deletedAt = Date.now();
    user.deletedBy = req.user.id;
    await user.save();
    
    // Soft delete related data
    await Wallet.updateOne({ user: id }, { isDeleted: true });
    await Affiliate.updateOne({ user: id }, { isDeleted: true });
    await Referral.updateMany(
      { $or: [{ referrer: id }, { referredUser: id }] },
      { isDeleted: true }
    );
    await Commission.updateMany({ user: id }, { isDeleted: true });
    await Payout.updateMany({ user: id }, { isDeleted: true });
    await Ticket.updateMany({ user: id }, { isDeleted: true });
    
    // Log activity
    await logActivity(req.user.id, 'delete_user', { targetUserId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (Admin only)
// ============================================
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const user = await User.findById(id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    // Send email notification
    await sendEmail({
      email: user.email,
      subject: 'Password Reset by Admin',
      html: `
        <h1>Password Reset</h1>
        <p>Your password has been reset by an administrator.</p>
        <p>If you did not request this, please contact support immediately.</p>
      `
    });
    
    // Log activity
    await logActivity(req.user.id, 'reset_user_password', { targetUserId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// AFFILIATE MANAGEMENT
// ============================================

// ============================================
// @desc    Get all affiliates
// @route   GET /api/admin/affiliates
// @access  Private (Admin only)
// ============================================
exports.getAffiliates = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      search,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = { isDeleted: false };
    
    if (status) query.status = status;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: {
        path: 'user',
        select: 'name email'
      }
    };
    
    if (search) {
      query.$or = [
        { 'user.name': new RegExp(search, 'i') },
        { 'user.email': new RegExp(search, 'i') }
      ];
    }
    
    const affiliates = await Affiliate.paginate(query, options);
    
    res.status(200).json({
      success: true,
      affiliates: affiliates.docs,
      totalPages: affiliates.totalPages,
      totalDocs: affiliates.totalDocs,
      page: affiliates.page,
      limit: affiliates.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_affiliates', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get affiliate by ID
// @route   GET /api/admin/affiliates/:id
// @access  Private (Admin only)
// ============================================
exports.getAffiliateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const affiliate = await Affiliate.findById(id)
      .populate('user', 'name email phone address');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    // Get additional data
    const [commissions, payouts, referrals] = await Promise.all([
      Commission.find({ user: affiliate.user, isDeleted: false }).sort('-createdAt').limit(10),
      Payout.find({ user: affiliate.user, isDeleted: false }).sort('-requestedAt').limit(10),
      Referral.find({ referrer: affiliate.user, isDeleted: false })
        .populate('referredUser', 'name email')
        .sort('-referredAt')
        .limit(10)
    ]);
    
    res.status(200).json({
      success: true,
      affiliate,
      recentCommissions: commissions,
      recentPayouts: payouts,
      recentReferrals: referrals
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_affiliate_details', { targetAffiliateId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update affiliate status
// @route   PUT /api/admin/affiliates/:id/status
// @access  Private (Admin only)
// ============================================
exports.updateAffiliateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const affiliate = await Affiliate.findById(id).populate('user');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    const oldStatus = affiliate.status;
    affiliate.status = status;
    
    if (status === 'active') {
      affiliate.approvedAt = Date.now();
    } else if (status === 'suspended') {
      affiliate.suspendedAt = Date.now();
      affiliate.suspendedReason = reason;
    }
    
    await affiliate.save();
    
    // Send notification
    await sendEmail({
      email: affiliate.user.email,
      subject: `Affiliate Account ${status}`,
      html: `
        <h1>Affiliate Account Update</h1>
        <p>Your affiliate account status has been changed from ${oldStatus} to ${status}.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
      `
    });
    
    // Log activity
    await logActivity(req.user.id, 'update_affiliate_status', { 
      targetAffiliateId: id, 
      oldStatus, 
      newStatus: status,
      reason 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Affiliate status updated successfully',
      affiliate
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update affiliate commission rate
// @route   PUT /api/admin/affiliates/:id/commission-rate
// @access  Private (Admin only)
// ============================================
exports.updateCommissionRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;
    
    const affiliate = await Affiliate.findById(id).populate('user');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    const oldRate = affiliate.commissionRate;
    affiliate.commissionRate = commissionRate;
    await affiliate.save();
    
    // Send notification
    await sendEmail({
      email: affiliate.user.email,
      subject: 'Commission Rate Updated',
      html: `
        <h1>Commission Rate Update</h1>
        <p>Your commission rate has been updated from ${oldRate}% to ${commissionRate}%.</p>
      `
    });
    
    // Log activity
    await logActivity(req.user.id, 'update_commission_rate', { 
      targetAffiliateId: id, 
      oldRate, 
      newRate: commissionRate 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Commission rate updated successfully',
      affiliate
    });
  } catch (error) {
    next(error);
  }
};
// ============================================
// PAYOUT MANAGEMENT
// ============================================

// ============================================
// @desc    Get all payouts
// @route   GET /api/admin/payouts
// @access  Private (Admin only)
// ============================================
exports.getPayouts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      userId,
      startDate,
      endDate,
      sortBy = '-requestedAt'
    } = req.query;
    
    const query = { isDeleted: false };
    
    if (status) query.status = status;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.requestedAt = {};
      if (startDate) query.requestedAt.$gte = new Date(startDate);
      if (endDate) query.requestedAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'commissions' }
      ]
    };
    
    const payouts = await Payout.paginate(query, options);
    
    res.status(200).json({
      success: true,
      payouts: payouts.docs,
      totalPages: payouts.totalPages,
      totalDocs: payouts.totalDocs,
      page: payouts.page,
      limit: payouts.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_payouts', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Process payout
// @route   POST /api/admin/payouts/:id/process
// @access  Private (Admin only)
// ============================================
exports.processPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionId, notes } = req.body;
    
    const payout = await Payout.findById(id).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    // Update payout
    payout.status = 'processing';
    payout.processing = {
      initiatedBy: req.user.id,
      initiatedAt: Date.now(),
      notes
    };
    payout.history.push({
      status: 'processing',
      changedBy: req.user.id,
      reason: 'Processing started',
      notes
    });
    
    await payout.save();
    
    // Log activity
    await logActivity(req.user.id, 'process_payout', { payoutId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payout processing started',
      payout
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Complete payout
// @route   POST /api/admin/payouts/:id/complete
// @access  Private (Admin only)
// ============================================
exports.completePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionId, reference, notes } = req.body;
    
    const payout = await Payout.findById(id).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    // Update payout
    payout.status = 'completed';
    payout.completedAt = Date.now();
    payout.processing.completedBy = req.user.id;
    payout.processing.completedAt = Date.now();
    payout.transaction = {
      id: transactionId,
      reference,
      completedAt: Date.now()
    };
    payout.history.push({
      status: 'completed',
      changedBy: req.user.id,
      reason: 'Payout completed',
      notes
    });
    
    await payout.save();
    
    // Update commissions
    await Commission.updateMany(
      { _id: { $in: payout.commissions } },
      { 
        status: 'paid',
        'payment.transactionId': transactionId,
        'payment.paidAt': Date.now(),
        'payment.payoutId': payout._id
      }
    );
    
    // Update wallet
    const wallet = await Wallet.findOne({ user: payout.user._id });
    if (wallet) {
      wallet.holdBalance -= payout.amount;
      wallet.balance -= payout.amount;
      wallet.lifetime.totalWithdrawn += payout.amount;
      await wallet.save();
    }
    
    // Update affiliate
    const affiliate = await Affiliate.findOne({ user: payout.user._id });
    if (affiliate) {
      affiliate.withdrawnAmount += payout.amount;
      affiliate.pendingEarnings -= payout.amount;
      await affiliate.save();
    }
    
    // Send notification
    await sendEmail({
      email: payout.user.email,
      subject: 'Payout Completed',
      html: `
        <h1>Payout Completed</h1>
        <p>Your payout of $${payout.amount} has been completed.</p>
        <p>Transaction ID: ${transactionId || 'N/A'}</p>
      `
    });
    
    // Log activity
    await logActivity(req.user.id, 'complete_payout', { payoutId: id, transactionId }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payout completed successfully',
      payout
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Reject payout
// @route   POST /api/admin/payouts/:id/reject
// @access  Private (Admin only)
// ============================================
exports.rejectPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const payout = await Payout.findById(id).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    // Update payout
    payout.status = 'rejected';
    payout.approval = {
      status: 'rejected',
      rejectedBy: req.user.id,
      rejectedAt: Date.now(),
      rejectionReason: reason
    };
    payout.history.push({
      status: 'rejected',
      changedBy: req.user.id,
      reason: 'Payout rejected',
      notes: reason
    });
    
    await payout.save();
    
    // Release held amount
    const wallet = await Wallet.findOne({ user: payout.user._id });
    if (wallet) {
      wallet.holdBalance -= payout.amount;
      await wallet.save();
    }
    
    // Update commissions
    await Commission.updateMany(
      { _id: { $in: payout.commissions } },
      { status: 'pending' }
    );
    
    // Update affiliate
    const affiliate = await Affiliate.findOne({ user: payout.user._id });
    if (affiliate) {
      affiliate.pendingEarnings += payout.amount;
      await affiliate.save();
    }
    
    // Send notification
    await sendEmail({
      email: payout.user.email,
      subject: 'Payout Rejected',
      html: `
        <h1>Payout Request Rejected</h1>
        <p>Your payout request for $${payout.amount} has been rejected.</p>
        <p>Reason: ${reason}</p>
      `
    });
    
    // Log activity
    await logActivity(req.user.id, 'reject_payout', { payoutId: id, reason }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payout rejected successfully',
      payout
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// SETTINGS MANAGEMENT
// ============================================
// @desc Get all settings
// @route GET /api/admin/settings
// @access Private (Admin only)
exports.getSettings = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isDeleted: false };
    if (category) query.category = category;

    const settings = await Setting.find(query).sort('category group order');

    // Group by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) acc[setting.category] = [];
      acc[setting.category].push(setting);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      settings: grouped
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update setting
// @route   PUT /api/admin/settings/:key
// @access  Private (Admin only)
// ============================================
exports.updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    let setting = await Setting.findOne({ key, isDeleted: false });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    const oldValue = setting.value;
    await setting.setValue(value, req.user.id, { ipAddress: req.ip, userAgent: req.get('user-agent') });
    
    // Log activity
    await logActivity(req.user.id, 'update_setting', { 
      settingKey: key, 
      oldValue, 
      newValue: value 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Create setting
// @route   POST /api/admin/settings
// @access  Private (Admin only)
// ============================================
exports.createSetting = async (req, res, next) => {
  try {
    const { key, value, label, type, category, group, description } = req.body;
    
    // Check if setting exists
    const existing = await Setting.findOne({ key });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Setting already exists'
      });
    }
    
    const setting = await Setting.create({
      key,
      value,
      label: label || key,
      type: type || 'string',
      category: category || 'general',
      group: group || 'default',
      description,
      createdBy: req.user.id
    });
    
    // Log activity
    await logActivity(req.user.id, 'create_setting', { settingKey: key }, req);
    
    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      setting
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// REPORTS & ANALYTICS
// ============================================

// ============================================
// @desc    Get revenue report
// @route   GET /api/admin/reports/revenue
// @access  Private (Admin only)
// ============================================
exports.getRevenueReport = async (req, res, next) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let start, end;
    if (period === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const range = getDateRange(period);
      start = range.startDate;
      end = range.endDate;
    }
    
    const revenue = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
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
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              amount: '$amount'
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    const totals = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['pending', 'approved', 'paid'] },
          isDeleted: false
        }
      },
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
    ]);
    
    res.status(200).json({
      success: true,
      report: {
        period: { start, end },
        daily: revenue,
        totals: totals[0] || { totalAmount: 0, totalCount: 0 }
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_revenue_report', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get affiliate report
// @route   GET /api/admin/reports/affiliates
// @access  Private (Admin only)
// ============================================
exports.getAffiliateReport = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const report = await Affiliate.aggregate([
      {
        $match: {
          createdAt: { $lte: endDate },
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'commissions',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                createdAt: { $gte: startDate, $lte: endDate }
              }
            }
          ],
          as: 'periodCommissions'
        }
      },
      {
        $lookup: {
          from: 'referrals',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$referrer', '$$userId'] },
                referredAt: { $gte: startDate, $lte: endDate }
              }
            }
          ],
          as: 'periodReferrals'
        }
      },
      {
        $project: {
          user: 1,
          status: 1,
          commissionRate: 1,
          totalEarnings: 1,
          periodEarnings: { $sum: '$periodCommissions.amount' },
          periodReferrals: { $size: '$periodReferrals' },
          periodCommissionsCount: { $size: '$periodCommissions' }
        }
      },
      {
        $group: {
          _id: null,
          totalAffiliates: { $sum: 1 },
          activeAffiliates: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalEarnings: { $sum: '$totalEarnings' },
          periodEarnings: { $sum: '$periodEarnings' },
          periodReferrals: { $sum: '$periodReferrals' },
          periodCommissions: { $sum: '$periodCommissionsCount' },
          avgCommissionRate: { $avg: '$commissionRate' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      report: {
        period: { startDate, endDate },
        ...report[0]
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_affiliate_report', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
// ============================================
exports.getSystemLogs = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      level, 
      category,
      userId,
      startDate,
      endDate,
      search
    } = req.query;
    
    const query = {};
    
    if (level) query.level = level;
    if (category) query.category = category;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { message: new RegExp(search, 'i') },
        { 'error.message': new RegExp(search, 'i') },
        { 'audit.action': new RegExp(search, 'i') }
      ];
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-timestamp',
      populate: {
        path: 'user',
        select: 'name email'
      }
    };
    
    const logs = await Log.paginate(query, options);
    
    // Get summary
    const summary = await Log.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      logs: logs.docs,
      summary,
      totalPages: logs.totalPages,
      totalDocs: logs.totalDocs,
      page: logs.page,
      limit: logs.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_system_logs', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Clear logs
// @route   DELETE /api/admin/logs
// @access  Private (Admin only)
// ============================================
exports.clearLogs = async (req, res, next) => {
  try {
    const { olderThan } = req.query;
    
    let filter = {};
    if (olderThan) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(olderThan));
      filter.timestamp = { $lt: date };
    }
    
    const result = await Log.deleteMany(filter);
    
    // Log activity
    await logActivity(req.user.id, 'clear_logs', { deletedCount: result.deletedCount }, req);
    
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// SYSTEM MANAGEMENT
// ============================================

// ============================================
// @desc    Get system health
// @route   GET /api/admin/system/health
// @access  Private (Admin only)
// ============================================
exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: {
        status: 'connected',
        collections: await mongoose.connection.db.listCollections().toArray()
      },
      stats: {
        users: await User.countDocuments({ isDeleted: false }),
        affiliates: await Affiliate.countDocuments({ isDeleted: false }),
        commissions: await Commission.countDocuments({ isDeleted: false }),
        payouts: await Payout.countDocuments({ isDeleted: false }),
        logs24h: await Log.countDocuments({ 
          timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) } 
        }),
        errors24h: await Log.countDocuments({ 
          level: 'error',
          timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) } 
        })
      }
    };
    
    res.status(200).json({
      success: true,
      health
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_system_health', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Run database maintenance
// @route   POST /api/admin/system/maintenance
// @access  Private (Admin only)
// ============================================
exports.runMaintenance = async (req, res, next) => {
  try {
    const { action } = req.body;
    
    let result = {};
    
    switch(action) {
      case 'cleanup':
        // Remove soft-deleted records older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
        
        result.users = await User.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } });
        result.affiliates = await Affiliate.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } });
        result.commissions = await Commission.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } });
        result.payouts = await Payout.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } });
                      break;
        
      case 'reindex':
        // Rebuild indexes
        await User.syncIndexes();
        await Affiliate.syncIndexes();
        await Commission.syncIndexes();
        await Payout.syncIndexes();
        result.message = 'Indexes rebuilt successfully';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid maintenance action'
        });
    }
    
    // Log activity
    await logActivity(req.user.id, 'run_maintenance', { action, result }, req);
    
    res.status(200).json({
      success: true,
      message: 'Maintenance completed successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export system data
// @route   GET /api/admin/system/export
// @access  Private (Admin only)
// ============================================
exports.exportSystemData = async (req, res, next) => {
  try {
    const { type = 'all', format = 'json' } = req.query;
    
    const exportData = {};
    
    if (type === 'all' || type === 'users') {
      exportData.users = await User.find({ isDeleted: false }).select('-password');
    }
    if (type === 'all' || type === 'affiliates') {
      exportData.affiliates = await Affiliate.find({ isDeleted: false }).populate('user', 'name email');
    }
    if (type === 'all' || type === 'commissions') {
      exportData.commissions = await Commission.find({ isDeleted: false });
    }
    if (type === 'all' || type === 'payouts') {
      exportData.payouts = await Payout.find({ isDeleted: false });
    }
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=system-export-${Date.now()}.json`);
      res.send(JSON.stringify(exportData, null, 2));
    } else {
      // Handle other formats if needed
      res.status(200).json(exportData);
    }
    
    // Log activity
    await logActivity(req.user.id, 'export_system_data', { type, format }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get system statistics
// @route   GET /api/admin/system/stats
// @access  Private (Admin only)
// ============================================
exports.getSystemStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Affiliate.countDocuments({ isDeleted: false }),
      Commission.countDocuments({ isDeleted: false }),
      Payout.countDocuments({ isDeleted: false }),
      Referral.countDocuments({ isDeleted: false }),
      Ticket.countDocuments({ isDeleted: false }),
      Log.countDocuments({}),
      Log.countDocuments({ level: 'error', timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      Wallet.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        users: stats[0],
        affiliates: stats[1],
        commissions: stats[2],
        payouts: stats[3],
        referrals: stats[4],
        tickets: stats[5],
        totalLogs: stats[6],
        errors24h: stats[7],
        totalBalance: stats[8][0]?.totalBalance || 0
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_system_stats', {}, req);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
// ============================================
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
// ============================================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select('-password')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
// ============================================
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Toggle user status (active/inactive)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
// ============================================
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all affiliates
// @route   GET /api/admin/affiliates
// @access  Private (Admin only)
// ============================================
exports.getAllAffiliates = async (req, res, next) => {
  try {
    const affiliates = await Affiliate.find({ isDeleted: false })
      .populate('user', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: affiliates.length,
      affiliates
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Approve affiliate
// @route   PUT /api/admin/affiliates/:id/approve
// @access  Private (Admin only)
// ============================================
exports.approveAffiliate = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    affiliate.status = 'approved';
    affiliate.approvedAt = Date.now();
    affiliate.approvedBy = req.user.id;
    await affiliate.save();
    
    res.status(200).json({
      success: true,
      message: 'Affiliate approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Reject affiliate
// @route   PUT /api/admin/affiliates/:id/reject
// @access  Private (Admin only)
// ============================================
exports.rejectAffiliate = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    affiliate.status = 'rejected';
    affiliate.rejectedAt = Date.now();
    affiliate.rejectedBy = req.user.id;
    await affiliate.save();
    
    res.status(200).json({
      success: true,
      message: 'Affiliate rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get pending withdrawals
// @route   GET /api/admin/withdrawals/pending
// @access  Private (Admin only)
// ============================================
exports.getPendingWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Payout.find({ 
      status: 'pending',
      isDeleted: false 
    })
    .populate('user', 'name email')
    .sort('-requestedAt');
    
    res.status(200).json({
      success: true,
      count: withdrawals.length,
      withdrawals
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Complete withdrawal
// @route   PUT /api/admin/withdrawals/:id/complete
// @access  Private (Admin only)
// ============================================
exports.completeWithdrawal = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }
    
    payout.status = 'completed';
    payout.completedAt = Date.now();
    payout.completedBy = req.user.id;
    await payout.save();
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Reject withdrawal
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private (Admin only)
// ============================================
exports.rejectWithdrawal = async (req, res, next) => {
  try {
    const payout = await Payout.findById(req.params.id);
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }
    
    payout.status = 'rejected';
    payout.rejectedAt = Date.now();
    payout.rejectedBy = req.user.id;
    await payout.save();
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get pending commissions
// @route   GET /api/admin/commissions/pending
// @access  Private (Admin only)
// ============================================
exports.getPendingCommissions = async (req, res, next) => {
  try {
    const commissions = await Commission.find({ 
      status: 'pending',
      isDeleted: false 
    })
    .populate('user', 'name email')
    .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: commissions.length,
      commissions
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Approve commission
// @route   PUT /api/admin/commissions/:id/approve
// @access  Private (Admin only)
// ============================================
exports.approveCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id);
    
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }
    
    commission.status = 'approved';
    commission.approvedAt = Date.now();
    commission.approvedBy = req.user.id;
    await commission.save();
    
    res.status(200).json({
      success: true,
      message: 'Commission approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update commission settings
// @route   PUT /api/admin/commissions/settings
// @access  Private (Admin only)
// ============================================
exports.updateCommissionSettings = async (req, res, next) => {
  try {
    // Update commission settings in database
    // This depends on how you store settings
    
    res.status(200).json({
      success: true,
      message: 'Commission settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings report
// @route   GET /api/admin/reports/earnings
// @access  Private (Admin only)
// ============================================
exports.getEarningsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = getDateRange(req.query.period || 'month');
    
    const earnings = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'approved',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      earnings
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get users report
// @route   GET /api/admin/reports/users
// @access  Private (Admin only)
// ============================================
exports.getUsersReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = getDateRange(req.query.period || 'month');
    
    const users = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      users
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get conversions report
// @route   GET /api/admin/reports/conversions
// @access  Private (Admin only)
// ============================================
exports.getConversionsReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = getDateRange(req.query.period || 'month');
    
    const conversions = await Referral.aggregate([
      {
        $match: {
          referredAt: { $gte: startDate, $lte: endDate },
          status: 'converted',
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
      period: { startDate, endDate },
      conversions
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private (Admin only)
// ============================================
exports.exportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    let data = [];
    
    switch(type) {
      case 'users':
        data = await User.find({ isDeleted: false }).select('-password');
        break;
      case 'affiliates':
        data = await Affiliate.find({ isDeleted: false }).populate('user', 'name email');
        break;
      case 'commissions':
        data = await Commission.find({ isDeleted: false }).populate('user', 'name email');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }
    
    res.status(200).json({
      success: true,
      type,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get analytics overview
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
// ============================================
exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = getDateRange('month');
    
    const [
      totalUsers,
      totalAffiliates,
      totalCommissions,
      totalPayouts,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Affiliate.countDocuments({ isDeleted: false }),
      Commission.aggregate([
        { $match: { isDeleted: false, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payout.aggregate([
        { $match: { isDeleted: false, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Log.find({ timestamp: { $gte: startDate } })
        .sort('-timestamp')
        .limit(10)
    ]);
    
    res.status(200).json({
      success: true,
      analytics: {
        totals: {
          users: totalUsers,
          affiliates: totalAffiliates,
          commissions: totalCommissions[0]?.total || 0,
          payouts: totalPayouts[0]?.total || 0
        },
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get chart data
// @route   GET /api/admin/analytics/chart
// @access  Private (Admin only)
// ============================================
exports.getChartData = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const chartData = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'approved',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          commissions: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      period,
      chartData
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get withdrawals
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
exports.getWithdrawals = async (req, res, next) => {
  try {
    // Agar Withdrawal model nahi hai to yeh use karo
    res.status(200).json({
      success: true,
      message: 'Withdrawals endpoint working',
      data: []
    });
    
    // Jab model ban jaye to yeh use karo:
    /*
    const withdrawals = await Withdrawal.find({})
      .populate('user', 'name email')
      .sort('-createdAt');
      
    res.status(200).json({
      success: true,
      data: withdrawals
    });
    */
  } catch (error) {
    next(error);
  }
};
// @desc    Process withdrawal
// @route   PUT /api/admin/withdrawals/:id/process
// @access  Private/Admin
exports.processWithdrawal = async (req, res, next) => {
  try {
    // Temporary response - actual logic baad mein implement karo
    res.status(200).json({
      success: true,
      message: 'Withdrawal processing endpoint working',
      data: { withdrawalId: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin

exports.updateSettings = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
};
