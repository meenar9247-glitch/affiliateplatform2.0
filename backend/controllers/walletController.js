const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ============================================
// Helper Functions
// ============================================

// Log wallet activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'wallet',
      message: `Wallet ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'wallet', id: details.walletId },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging wallet activity:', error);
  }
};

// Calculate wallet summary
const calculateWalletSummary = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    return {
      balance: 0,
      availableBalance: 0,
      holdBalance: 0,
      lockedBalance: 0,
      pendingBalance: 0,
      lifetime: {
        totalCredited: 0,
        totalDebited: 0,
        totalCommission: 0,
        totalWithdrawn: 0,
        totalBonus: 0,
        totalReferralEarnings: 0,
        transactionCount: 0
      }
    };
  }
  
  return {
    balance: wallet.balance,
    availableBalance: wallet.availableBalance,
    holdBalance: wallet.holdBalance,
    lockedBalance: wallet.lockedBalance,
    pendingBalance: wallet.pendingBalance,
    lifetime: wallet.lifetime,
    monthly: wallet.monthly,
    daily: wallet.daily,
    withdrawalLimits: wallet.withdrawalLimits,
    lastTransaction: wallet.lastTransaction
  };
};

// Create wallet for user if not exists
const ensureWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    wallet = await Wallet.create({
      user: userId,
      balance: 0,
      currency: 'USD',
      status: 'active'
    });
    
    await logActivity(userId, 'created', { walletId: wallet._id });
  }
  
  return wallet;
};

// ============================================
// @desc    Get wallet dashboard
// @route   GET /api/wallet/dashboard
// @access  Private
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Ensure wallet exists
    const wallet = await ensureWallet(userId);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      user: userId, 
      isDeleted: false 
    })
    .sort('-createdAt')
    .limit(10);
    
    // Get pending payouts
    const pendingPayouts = await Payout.find({ 
      user: userId, 
      status: { $in: ['pending', 'approved', 'processing'] },
      isDeleted: false 
    }).sort('-requestedAt');
    
    // Get monthly earnings chart data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          direction: 'in',
          createdAt: { $gte: thirtyDaysAgo },
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
    ]);
    
    // Get earnings by type
    const earningsByType = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          direction: 'in',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      dashboard: {
        wallet: {
          id: wallet._id,
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          holdBalance: wallet.holdBalance,
          lockedBalance: wallet.lockedBalance,
          pendingBalance: wallet.pendingBalance,
          currency: wallet.currency,
          status: wallet.status,
          withdrawalLimits: wallet.withdrawalLimits
        },
        recentTransactions,
        pendingPayouts: {
          count: pendingPayouts.length,
          totalAmount: pendingPayouts.reduce((sum, p) => sum + p.amount, 0)
        },
        charts: {
          monthlyEarnings,
          earningsByType
        },
        lifetime: wallet.lifetime
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', { walletId: wallet._id }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
// ============================================
exports.getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const wallet = await ensureWallet(userId);
    
    res.status(200).json({
      success: true,
      balance: {
        total: wallet.balance,
        available: wallet.availableBalance,
        hold: wallet.holdBalance,
        locked: wallet.lockedBalance,
        pending: wallet.pendingBalance,
        currency: wallet.currency
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_balance', { walletId: wallet._id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
// ============================================
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      direction,
      startDate, 
      endDate,
      sortBy = '-createdAt'
    } = req.query;
    
    const query = { user: userId, isDeleted: false };
    
    if (type) query.type = type;
    if (direction) query.direction = direction;
    
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
        { path: 'source.sourceId' },
        { path: 'related.commission' },
        { path: 'related.payout' }
      ]
    };
    
    const transactions = await Transaction.paginate(query, options);
    
    // Get summary
    const summary = await Transaction.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $group: {
          _id: '$direction',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      transactions: transactions.docs,
      summary,
      totalPages: transactions.totalPages,
      totalDocs: transactions.totalDocs,
      page: transactions.page,
      limit: transactions.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_transactions', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get transaction by ID
// @route   GET /api/wallet/transactions/:id
// @access  Private
// ============================================
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const transaction = await Transaction.findOne({ 
      _id: id, 
      user: userId,
      isDeleted: false 
    })
    .populate('source.sourceId')
    .populate('related.commission')
    .populate('related.payout')
    .populate('related.referral');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      transaction
    });
    
    // Log activity
    await logActivity(userId, 'view_transaction_details', { transactionId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get wallet statistics
// @route   GET /api/wallet/stats
// @access  Private
// ============================================
exports.getWalletStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const wallet = await ensureWallet(userId);
    
    // Get daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          direction: 'in',
          createdAt: { $gte: today, $lt: tomorrow },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          direction: 'in',
          createdAt: { $gte: weekAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly stats
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          direction: 'in',
          createdAt: { $gte: monthAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get by type
    const byType = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        today: todayEarnings[0] || { amount: 0, count: 0 },
        thisWeek: weeklyEarnings[0] || { amount: 0, count: 0 },
        thisMonth: monthlyEarnings[0] || { amount: 0, count: 0 },
        allTime: {
          totalCredited: wallet.lifetime.totalCredited,
          totalDebited: wallet.lifetime.totalDebited,
          totalWithdrawn: wallet.lifetime.totalWithdrawn,
          transactionCount: wallet.lifetime.transactionCount
        },
        byType,
        withdrawalLimits: wallet.withdrawalLimits
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_stats', { walletId: wallet._id }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Credit wallet (Internal/Admin)
// @route   POST /api/wallet/credit
// @access  Private (Admin only)
// ============================================
exports.creditWallet = async (req, res, next) => {
  try {
    const { userId, amount, description, type, metadata } = req.body;
    const adminId = req.user.id;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user ID and amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    // Credit wallet
    await wallet.credit(amount, description || 'Manual credit', {
      performedBy: adminId,
      metadata: {
        ...metadata,
        adminId
      }
    });
    
    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      type: type || 'credit',
      direction: 'in',
      amount,
      balanceAfter: wallet.balance,
      source: {
        type: 'manual',
        description: description || 'Manual credit',
        metadata
      },
      status: 'completed',
      audit: {
        createdBy: adminId,
        createdVia: 'admin',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    // Log activity
    await logActivity(adminId, 'credit_wallet', { 
      targetUserId: userId,
      amount,
      transactionId: transaction._id 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Wallet credited successfully',
      transaction: {
        id: transaction._id,
        amount,
        newBalance: wallet.balance,
        description
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Debit wallet (Internal/Admin)
// @route   POST /api/wallet/debit
// @access  Private (Admin only)
// ============================================
exports.debitWallet = async (req, res, next) => {
  try {
    const { userId, amount, description, type, metadata } = req.body;
    const adminId = req.user.id;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user ID and amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    // Check available balance
    if (amount > wallet.availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance'
      });
    }
    
    // Debit wallet
    await wallet.debit(amount, description || 'Manual debit', {
      performedBy: adminId,
      metadata: {
        ...metadata,
        adminId
      }
    });
    
    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      type: type || 'debit',
      direction: 'out',
      amount,
      balanceAfter: wallet.balance,
      source: {
        type: 'manual',
        description: description || 'Manual debit',
        metadata
      },
      status: 'completed',
      audit: {
        createdBy: adminId,
        createdVia: 'admin',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    // Log activity
    await logActivity(adminId, 'debit_wallet', { 
      targetUserId: userId,
      amount,
      transactionId: transaction._id 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Wallet debited successfully',
      transaction: {
        id: transaction._id,
        amount,
        newBalance: wallet.balance,
        description
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Hold amount in wallet
// @route   POST /api/wallet/hold
// @access  Private (System/Admin)
// ============================================
exports.holdAmount = async (req, res, next) => {
  try {
    const { userId, amount, description, reference } = req.body;
    const adminId = req.user.id;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user ID and amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    // Hold amount
    await wallet.hold(amount, description || 'Hold for processing', {
      reference,
      performedBy: adminId
    });
    
    // Create transaction record (optional)
    const transaction = await Transaction.create({
      user: userId,
      type: 'hold',
      direction: 'out',
      amount,
      balanceAfter: wallet.balance,
      source: {
        type: 'hold',
        description: description || 'Hold for processing',
        reference
      },
      status: 'pending'
    });
    
    // Log activity
    await logActivity(adminId, 'hold_amount', { 
      targetUserId: userId,
      amount,
      transactionId: transaction._id 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Amount held successfully',
      hold: {
        amount,
        holdBalance: wallet.holdBalance,
        availableBalance: wallet.availableBalance,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Release held amount
// @route   POST /api/wallet/release
// @access  Private (System/Admin)
// ============================================
exports.releaseHold = async (req, res, next) => {
  try {
    const { userId, amount, description, reference } = req.body;
    const adminId = req.user.id;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user ID and amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    // Release hold
    await wallet.releaseHold(amount, description || 'Release hold', {
      reference,
      performedBy: adminId
    });
    
    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      type: 'release',
      direction: 'in',
      amount,
      balanceAfter: wallet.balance,
      source: {
        type: 'release',
        description: description || 'Release hold',
        reference
      },
      status: 'completed'
    });
    
    // Log activity
    await logActivity(adminId, 'release_hold', { 
      targetUserId: userId,
      amount,
      transactionId: transaction._id 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Hold released successfully',
      release: {
        amount,
        holdBalance: wallet.holdBalance,
        availableBalance: wallet.availableBalance,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Lock amount in wallet
// @route   POST /api/wallet/lock
// @access  Private (Admin only)
// ============================================
exports.lockAmount = async (req, res, next) => {
  try {
    const { userId, amount, description, reason } = req.body;
    const adminId = req.user.id;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user ID and amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    // Lock amount
    await wallet.lock(amount, description || 'Locked for review', {
      performedBy: adminId
    });
    
    // Log activity
    await logActivity(adminId, 'lock_amount', { 
      targetUserId: userId,
      amount,
      reason 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Amount locked successfully',
      lock: {
        amount,
        lockedBalance: wallet.lockedBalance,
        availableBalance: wallet.availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Unlock amount
// @route   POST /api/wallet/unlock
// @access  Private (Admin only)
// ============================================
exports.unlockAmount = async (req, res, next) => {
  try {
    const { userId, amount, description, reason } = req.body;
    const adminId = req.user.id;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user ID and amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    // Unlock amount
    await wallet.unlock(amount, description || 'Unlocked', {
      performedBy: adminId
    });
    
    // Log activity
    await logActivity(adminId, 'unlock_amount', { 
      targetUserId: userId,
      amount,
      reason 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Amount unlocked successfully',
      unlock: {
        amount,
        lockedBalance: wallet.lockedBalance,
        availableBalance: wallet.availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get withdrawal limits
// @route   GET /api/wallet/withdrawal-limits
// @access  Private
// ============================================
exports.getWithdrawalLimits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const wallet = await ensureWallet(userId);
    
    res.status(200).json({
      success: true,
      limits: {
        minAmount: wallet.withdrawalLimits.minAmount,
        maxAmount: wallet.withdrawalLimits.maxAmount,
        daily: {
          limit: wallet.withdrawalLimits.dailyLimit,
          remaining: wallet.withdrawalLimits.remainingDaily,
          used: wallet.withdrawalLimits.dailyLimit - wallet.withdrawalLimits.remainingDaily
        },
        weekly: {
          limit: wallet.withdrawalLimits.weeklyLimit,
          remaining: wallet.withdrawalLimits.remainingWeekly,
          used: wallet.withdrawalLimits.weeklyLimit - wallet.withdrawalLimits.remainingWeekly
        },
        monthly: {
          limit: wallet.withdrawalLimits.monthlyLimit,
          remaining: wallet.withdrawalLimits.remainingMonthly,
          used: wallet.withdrawalLimits.monthlyLimit - wallet.withdrawalLimits.remainingMonthly
        },
        lastWithdrawal: wallet.withdrawalLimits.lastWithdrawalDate,
        lastWithdrawalAmount: wallet.withdrawalLimits.lastWithdrawalAmount
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_withdrawal_limits', { walletId: wallet._id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Check withdrawal eligibility
// @route   POST /api/wallet/check-withdrawal
// @access  Private
// ============================================
exports.checkWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    const wallet = await ensureWallet(userId);
    
    const result = wallet.checkWithdrawalLimit(amount);
    
    if (!result.allowed) {
      return res.status(400).json({
        success: false,
        message: result.reason,
        limits: {
          available: wallet.availableBalance,
          minAmount: wallet.withdrawalLimits.minAmount,
          maxAmount: wallet.withdrawalLimits.maxAmount,
          remainingDaily: wallet.withdrawalLimits.remainingDaily,
          remainingWeekly: wallet.withdrawalLimits.remainingWeekly,
          remainingMonthly: wallet.withdrawalLimits.remainingMonthly
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal amount is eligible',
      eligible: true,
      availableBalance: wallet.availableBalance,
      amount
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export wallet data
// @route   GET /api/wallet/export
// @access  Private
// ============================================
exports.exportWalletData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format = 'json', startDate, endDate } = req.query;
    
    const wallet = await Wallet.findOne({ user: userId });
    
    const query = { user: userId, isDeleted: false };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .sort('-createdAt');
    
    if (format === 'csv') {
      // Wallet summary CSV
      const walletData = [
        ['Wallet Summary'],
        ['Balance', wallet?.balance || 0],
        ['Available Balance', wallet?.availableBalance || 0],
        ['Hold Balance', wallet?.holdBalance || 0],
        ['Locked Balance', wallet?.lockedBalance || 0],
        ['Currency', wallet?.currency || 'USD'],
        [''],
        ['Transaction History'],
        ['Date', 'Type', 'Direction', 'Amount', 'Description', 'Status']
      ];
      
      transactions.forEach(t => {
        walletData.push([
          t.createdAt.toISOString().split('T')[0],
          t.type,
          t.direction,
          t.amount,
          t.source?.description || '',
          t.status
        ]);
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=wallet-data.csv');
      
      walletData.forEach(row => {
        res.write(row.join(',') + '\n');
      });
      
      res.end();
    } else {
      res.status(200).json({
        success: true,
        wallet,
        transactions,
        count: transactions.length
      });
    }
    
    // Log activity
    await logActivity(userId, 'export_wallet_data', { format }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Freeze wallet (Admin)
// @route   POST /api/wallet/freeze
// @access  Private (Admin only)
// ============================================
exports.freezeWallet = async (req, res, next) => {
  try {
    const { userId, reason } = req.body;
    const adminId = req.user.id;
    
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    await wallet.freeze(reason, adminId);
    
    // Log activity
    await logActivity(adminId, 'freeze_wallet', { 
      targetUserId: userId,
      reason 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Wallet frozen successfully',
      wallet: {
        id: wallet._id,
        status: wallet.status,
        isFrozen: wallet.isFrozen,
        frozenReason: wallet.frozenReason
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Unfreeze wallet (Admin)
// @route   POST /api/wallet/unfreeze
// @access  Private (Admin only)
// ============================================
exports.unfreezeWallet = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.id;
    
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    await wallet.unfreeze(adminId);
    
    // Log activity
    await logActivity(adminId, 'unfreeze_wallet', { 
      targetUserId: userId
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Wallet unfrozen successfully',
      wallet: {
        id: wallet._id,
        status: wallet.status,
        isFrozen: wallet.isFrozen
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Add to withdrawal whitelist
// @route   POST /api/wallet/whitelist/add
// @access  Private
// ============================================
exports.addToWhitelist = async (req, res, next) => {
  try {
    const { address, method } = req.body;
    const userId = req.user.id;
    
    const wallet = await ensureWallet(userId);
    
    await wallet.addToWhitelist(address, method);
    
    // Log activity
    await logActivity(userId, 'add_whitelist', { 
      walletId: wallet._id,
      address,
      method 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Address added to whitelist',
      whitelist: wallet.security.withdrawalWhitelist
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get wallet settings
// @route   GET /api/wallet/settings
// @access  Private
// ============================================
exports.getWalletSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const wallet = await ensureWallet(userId);
    
    res.status(200).json({
      success: true,
      settings: {
        autoWithdrawal: wallet.settings.autoWithdrawal,
        notifications: wallet.settings.notifications,
        currency: wallet.settings.currency,
        timezone: wallet.settings.timezone,
        twoFactorRequired: wallet.security.twoFactorRequired,
        withdrawalWhitelist: wallet.security.withdrawalWhitelist
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_settings', { walletId: wallet._id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update wallet settings
// @route   PUT /api/wallet/settings
// @access  Private
// ============================================
exports.updateWalletSettings = async (req, res, next) => {
  try {
    const { autoWithdrawal, notifications, currency, timezone, twoFactorRequired } = req.body;
    const userId = req.user.id;
    
    const wallet = await ensureWallet(userId);
    
    if (autoWithdrawal !== undefined) {
      wallet.settings.autoWithdrawal = {
        ...wallet.settings.autoWithdrawal,
        ...autoWithdrawal
      };
    }
    
    if (notifications !== undefined) {
      wallet.settings.notifications = {
        ...wallet.settings.notifications,
        ...notifications
      };
    }
    
    if (currency) wallet.settings.currency = currency;
    if (timezone) wallet.settings.timezone = timezone;
    if (twoFactorRequired !== undefined) wallet.security.twoFactorRequired = twoFactorRequired;
    
    await wallet.save();
    
    // Log activity
    await logActivity(userId, 'update_settings', { 
      walletId: wallet._id,
      changes: req.body 
    }, req);
    
    res.status(200).json({
      success: true,
      message: 'Wallet settings updated successfully',
      settings: {
        autoWithdrawal: wallet.settings.autoWithdrawal,
        notifications: wallet.settings.notifications,
        currency: wallet.settings.currency,
        timezone: wallet.settings.timezone,
        twoFactorRequired: wallet.security.twoFactorRequired
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
