const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const Ticket = require('../models/Ticket');
const Log = require('../models/Log');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const { uploadToCloud } = require('../services/uploadService');
const { generateReferralCode } = require('../utils/helpers');
const logger = require('../utils/logger');

// ============================================
// Helper Functions
// ============================================

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Set cookie options
const cookieOptions = {
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
      referralCode: user.referralCode,
      wallet: user.wallet,
      settings: user.settings
    }
  });
};

// Log user activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'user',
      message: `User ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'user', id: userId },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging user activity:', error);
  }
};

// ============================================
// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
// ============================================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
      .populate('wallet')
      .populate('affiliate');

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

    // Log activity
    await logActivity(user._id, 'view_profile', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// ============================================
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, state, country, postalCode, bio, website, socialLinks } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Track changes for audit
    const changes = [];

    if (name && name !== user.name) {
      changes.push({ field: 'name', oldValue: user.name, newValue: name });
      user.name = name;
    }

    if (phone && phone !== user.phone) {
      changes.push({ field: 'phone', oldValue: user.phone, newValue: phone });
      user.phone = phone;
    }

    // Update address fields
    if (address) {
      changes.push({ field: 'address', oldValue: user.address, newValue: address });
      user.address = address;
    }

    if (city) {
      changes.push({ field: 'city', oldValue: user.city, newValue: city });
      user.city = city;
    }

    if (state) {
      changes.push({ field: 'state', oldValue: user.state, newValue: state });
      user.state = state;
    }

    if (country) {
      changes.push({ field: 'country', oldValue: user.country, newValue: country });
      user.country = country;
    }

    if (postalCode) {
      changes.push({ field: 'postalCode', oldValue: user.postalCode, newValue: postalCode });
      user.postalCode = postalCode;
    }

    if (bio !== undefined) {
      changes.push({ field: 'bio', oldValue: user.bio, newValue: bio });
      user.bio = bio;
    }

    if (website !== undefined) {
      changes.push({ field: 'website', oldValue: user.website, newValue: website });
      user.website = website;
    }

    if (socialLinks) {
      changes.push({ field: 'socialLinks', oldValue: user.socialLinks, newValue: socialLinks });
      user.socialLinks = socialLinks;
    }

    await user.save();

    // Log activity
    if (changes.length > 0) {
      await logActivity(user._id, 'update_profile', { changes }, req);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        postalCode: user.postalCode,
        bio: user.bio,
        website: user.website,
        socialLinks: user.socialLinks,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
// ============================================
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upload to cloud storage
    const result = await uploadToCloud(req.file, {
      folder: 'profiles',
      public_id: `user_${user._id}_${Date.now()}`
    });

    const oldPicture = user.profilePicture;
    user.profilePicture = result.secure_url;
    await user.save();

    // Log activity
    await logActivity(user._id, 'upload_profile_picture', {
      oldPicture,
      newPicture: result.secure_url
    }, req);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: result.secure_url
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update email
// @route   PUT /api/users/email
// @access  Private
// ============================================
exports.updateEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    const oldEmail = user.email;
    user.email = email;
    user.isVerified = false;
    user.emailVerificationToken = crypto.randomBytes(32).toString('hex');

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Verify your new email address',
      html: `
        <h1>Email Update Request</h1>
        <p>Please click the link below to verify your new email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not request this, please contact support immediately.</p>
      `
    });

    // Log activity
    await logActivity(user._id, 'update_email', {
      oldEmail,
      newEmail: email
    }, req);

    res.status(200).json({
      success: true,
      message: 'Email updated successfully. Please verify your new email.'
    });
  } catch (error) {
    next(error);
  }

  // ============================================
// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
// ============================================
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send notification email
    await sendEmail({
      email: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <h1>Password Changed</h1>
        <p>Your password has been changed successfully.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    });

    // Log activity
    await logActivity(user._id, 'update_password', {}, req);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
// ============================================
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get wallet info
    const wallet = await Wallet.findOne({ user: userId });

    // Get referral stats
    const referralStats = await Referral.aggregate([
      { $match: { referrer: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get commission stats
    const commissionStats = await Commission.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payout stats
    const payoutStats = await Payout.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get ticket stats
    const ticketStats = await Ticket.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get affiliate stats if user is affiliate
    let affiliateStats = null;
    if (req.user.role === 'affiliate' || req.user.role === 'admin') {
      const affiliate = await Affiliate.findOne({ user: userId });
      if (affiliate) {
        affiliateStats = {
          commissionRate: affiliate.commissionRate,
          totalEarnings: affiliate.totalEarnings,
          pendingEarnings: affiliate.pendingEarnings,
          withdrawnAmount: affiliate.withdrawnAmount,
          referralCount: affiliate.referralCount,
          clickCount: affiliate.clickCount,
          conversionRate: affiliate.conversionRate,
          status: affiliate.status
        };
      }
    }

    // Log activity
    await logActivity(userId, 'view_stats', {}, req);

    res.status(200).json({
      success: true,
      stats: {
        wallet: wallet ? {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          holdBalance: wallet.holdBalance,
          lockedBalance: wallet.lockedBalance,
          pendingBalance: wallet.pendingBalance,
          lifetime: wallet.lifetime,
          monthly: wallet.monthly,
          daily: wallet.daily
        } : null,
        referrals: referralStats,
        commissions: commissionStats,
        payouts: payoutStats,
        tickets: ticketStats,
        affiliate: affiliateStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user referrals
// @route   GET /api/users/referrals
// @access  Private
// ============================================
exports.getUserReferrals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sortBy = '-referredAt' } = req.query;

    const query = { referrer: userId, isDeleted: false };
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: [
        { path: 'referredUser', select: 'name email profilePicture createdAt' }
      ]
    };

    const referrals = await Referral.paginate(query, options);

    // Log activity
    await logActivity(userId, 'view_referrals', { page, limit }, req);

    res.status(200).json({
      success: true,
      referrals: referrals.docs,
      totalPages: referrals.totalPages,
      totalDocs: referrals.totalDocs,
      page: referrals.page,
      limit: referrals.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user commissions
// @route   GET /api/users/commissions
// @access  Private
// ============================================
exports.getUserCommissions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;

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
        { path: 'referral', populate: { path: 'referredUser', select: 'name email' } }
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

    // Log activity
    await logActivity(userId, 'view_commissions', { page, limit }, req);

    res.status(200).json({
      success: true,
      commissions: commissions.docs,
      summary: summary[0] || { totalEarned: 0, totalPending: 0, totalCommission: 0, count: 0 },
      totalPages: commissions.totalPages,
      totalDocs: commissions.totalDocs,
      page: commissions.page,
      limit: commissions.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user payouts
// @route   GET /api/users/payouts
// @access  Private
// ============================================
exports.getUserPayouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId, isDeleted: false };
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-requestedAt',
      populate: ['commissions']
    };

    const payouts = await Payout.paginate(query, options);

    // Log activity
    await logActivity(userId, 'view_payouts', { page, limit }, req);

    res.status(200).json({
      success: true,
      payouts: payouts.docs,
      totalPages: payouts.totalPages,
      totalDocs: payouts.totalDocs,
      page: payouts.page,
      limit: payouts.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user tickets
// @route   GET /api/users/tickets
// @access  Private
// ============================================
exports.getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId, isDeleted: false };
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'assignedTo', select: 'name email' }
      ]
    };

    const tickets = await Ticket.paginate(query, options);

    // Log activity
    await logActivity(userId, 'view_tickets', { page, limit }, req);

    res.status(200).json({
      success: true,
      tickets: tickets.docs,
      totalPages: tickets.totalPages,
      totalDocs: tickets.totalDocs,
      page: tickets.page,
      limit: tickets.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user activity logs
// @route   GET /api/users/activity
// @access  Private
// ============================================
exports.getUserActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, action } = req.query;

    const query = { user: userId, category: 'user' };
    if (action) query['audit.action'] = action;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-timestamp'
    };

    const logs = await Log.paginate(query, options);

    res.status(200).json({
      success: true,
      logs: logs.docs,
      totalPages: logs.totalPages,
      totalDocs: logs.totalDocs,
      page: logs.page,
      limit: logs.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Deactivate account
// @route   POST /api/users/deactivate
// @access  Private
// ============================================
exports.deactivateAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Deactivate account
    user.isActive = false;
    user.deactivatedAt = Date.now();
    await user.save();

    // Log activity
    await logActivity(user._id, 'deactivate_account', {}, req);

    // Send notification email
    await sendEmail({
      email: user.email,
      subject: 'Account Deactivated',
      html: `
        <h1>Account Deactivated</h1>
        <p>Your account has been deactivated successfully.</p>
        <p>If you want to reactivate your account, please contact support.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Request account deletion
// @route   POST /api/users/request-deletion
// @access  Private
// ============================================
exports.requestAccountDeletion = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate deletion token
    const deletionToken = crypto.randomBytes(32).toString('hex');
    user.deletionToken = deletionToken;
    user.deletionRequestedAt = Date.now();
    await user.save();

    // Send confirmation email
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-deletion/${deletionToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Confirm Account Deletion',
      html: `
        <h1>Account Deletion Request</h1>
        <p>We received a request to delete your account.</p>
        <p>Click the link below to confirm account deletion. This action cannot be undone.</p>
        <a href="${confirmUrl}">Confirm Account Deletion</a>
        <p>If you did not request this, please contact support immediately.</p>
        <p>This link will expire in 24 hours.</p>
      `
    });

    // Log activity
    await logActivity(user._id, 'request_deletion', {}, req);

    res.status(200).json({
      success: true,
      message: 'Deletion confirmation email sent. Please check your email.'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Confirm account deletion
// @route   POST /api/users/confirm-deletion/:token
// @access  Public (with token)
// ============================================
exports.confirmDeletion = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      deletionToken: token,
      deletionRequestedAt: { $gt: Date.now() - 24 * 60 * 60 * 1000 } // 24 hours
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Soft delete user data
    user.isDeleted = true;
    user.deletedAt = Date.now();
    user.deletionToken = undefined;
    await user.save();

    // Soft delete related data
    await Wallet.updateMany({ user: user._id }, { isDeleted: true });
    await Affiliate.updateMany({ user: user._id }, { isDeleted: true });
    await Referral.updateMany({ $or: [{ referrer: user._id }, { referredUser: user._id }] }, { isDeleted: true });
    await Commission.updateMany({ user: user._id }, { isDeleted: true });
    await Payout.updateMany({ user: user._id }, { isDeleted: true });
    await Ticket.updateMany({ user: user._id }, { isDeleted: true });

    // Log activity
    await logActivity(user._id, 'confirm_deletion', {}, req);

    // Send final notification
    await sendEmail({
      email: user.email,
      subject: 'Account Deleted',
      html: `
        <h1>Account Deleted</h1>
        <p>Your account has been successfully deleted.</p>
        <p>We're sorry to see you go. If you ever want to come back, you'll need to create a new account.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
// ============================================
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query = { user: userId, isDeleted: false };
    if (unreadOnly === 'true') query.read = false;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt'
    };

    const Notification = mongoose.model('Notification');
    const notifications = await Notification.paginate(query, options);

    res.status(200).json({
      success: true,
      notifications: notifications.docs,
      unreadCount: await Notification.countDocuments({ user: userId, read: false, isDeleted: false }),
      totalPages: notifications.totalPages,
      totalDocs: notifications.totalDocs,
      page: notifications.page,
      limit: notifications.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
// ============================================
exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const Notification = mongoose.model('Notification');
    const notification = await Notification.findOne({
      _id: id,
      user: req.user.id,
      isDeleted: false
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
// ============================================
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    const Notification = mongoose.model('Notification');
    await Notification.updateMany(
      { user: req.user.id, read: false, isDeleted: false },
      { read: true, readAt: Date.now() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
// ============================================
exports.getUserSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('settings');

    res.status(200).json({
      success: true,
      settings: user.settings || {}
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
// ============================================
exports.updateUserSettings = async (req, res, next) => {
  try {
    const { notifications, privacy, preferences } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update settings
    if (notifications) {
      user.settings.notifications = {
        ...user.settings?.notifications,
        ...notifications
      };
    }

    if (privacy) {
      user.settings.privacy = {
        ...user.settings?.privacy,
        ...privacy
      };
    }

    if (preferences) {
      user.settings.preferences = {
        ...user.settings?.preferences,
        ...preferences
      };
    }

    await user.save();

    // Log activity
    await logActivity(user._id, 'update_settings', {}, req);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user by referral code
// @route   GET /api/users/referral/:code
// @access  Public
// ============================================
exports.getUserByReferralCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const user = await User.findOne({ referralCode: code, isActive: true, isDeleted: false })
      .select('name referralCode profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        referralCode: user.referralCode,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Search users (admin only)
// @route   GET /api/users/search
// @access  Private/Admin
// ============================================
exports.searchUsers = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 20, role, isActive } = req.query;

    const searchQuery = {
      isDeleted: false,
      $or: [
        { name: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') }
      ]
    };

    if (role) searchQuery.role = role;
    if (isActive !== undefined) searchQuery.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      select: '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -deletionToken'
    };

    const users = await User.paginate(searchQuery, options);

    res.status(200).json({
      success: true,
      users: users.docs,
      totalPages: users.totalPages,
      totalDocs: users.totalDocs,
      page: users.page,
      limit: users.limit
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export user data (GDPR)
// @route   GET /api/users/export-data
// @access  Private
// ============================================
exports.exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all user data
    const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -deletionToken');
    const wallet = await Wallet.findOne({ user: userId });
    const affiliate = await Affiliate.findOne({ user: userId });
    const referrals = await Referral.find({ $or: [{ referrer: userId }, { referredUser: userId }] })
      .populate('referredUser', 'name email')
      .populate('referrer', 'name email');
    const commissions = await Commission.find({ user: userId });
    const payouts = await Payout.find({ user: userId });
    const tickets = await Ticket.find({ user: userId });
    const transactions = await Transaction.find({ user: userId });

    // Compile data
    const userData = {
      user,
      wallet,
      affiliate,
      referrals,
      commissions,
      payouts,
      tickets,
      transactions,
      exportedAt: new Date()
    };

    // Log activity
    await logActivity(userId, 'export_data', {}, req);

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get user dashboard
// @route   GET /api/users/dashboard
// @access  Private
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get recent data
    const [wallet, recentReferrals, recentCommissions, recentTransactions, notifications] = await Promise.all([
      Wallet.findOne({ user: userId }),
      Referral.find({ referrer: userId, isDeleted: false })
        .populate('referredUser', 'name email profilePicture')
        .sort('-referredAt')
        .limit(5),
      Commission.find({ user: userId, isDeleted: false })
        .sort('-createdAt')
        .limit(5),
      Transaction.find({ user: userId, isDeleted: false })
        .sort('-createdAt')
        .limit(5),
      mongoose.model('Notification').find({ user: userId, read: false, isDeleted: false })
        .sort('-createdAt')
        .limit(5)
    ]);

    // Get summary stats
    const summary = await Commission.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: { $cond: [{ $in: ['$status', ['paid', 'approved']] }, '$amount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          referralCount: { $sum: 1 }
        }
      }
    ]);

    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);

    res.status(200).json({
      success: true,
      dashboard: {
        wallet: wallet ? {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          holdBalance: wallet.holdBalance
        } : null,
        summary: summary[0] || { totalEarned: 0, totalPending: 0, referralCount: 0 },
        recentReferrals,
        recentCommissions,
        recentTransactions,
        notifications,
        unreadNotificationCount: notifications.length
      }
    });
  } catch (error) {
    next(error);
  }
};
