const Payout = require('../models/Payout');
const User = require('../models/User');
const Commission = require('../models/Commission');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Affiliate = require('../models/Affiliate');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../services/emailService');
const { processPayment } = require('../services/paymentService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ============================================
// Helper Functions
// ============================================

// Log payout activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'payout',
      message: `Payout ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'payout', id: details.payoutId },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging payout activity:', error);
  }
};

// Calculate payout summary
const calculatePayoutSummary = async (userId, status = null) => {
  const matchStage = { isDeleted: false };
  if (userId) matchStage.user = mongoose.Types.ObjectId(userId);
  if (status) matchStage.status = status;
  
  const summary = await Payout.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$summary.fees' },
        totalNet: { $sum: '$summary.netAmount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    }
  ]);
  
  const totals = await Payout.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$summary.fees' },
        totalNet: { $sum: '$summary.netAmount' },
        totalCount: { $sum: 1 }
      }
    }
  ]);
  
  return {
    byStatus: summary,
    totals: totals[0] || { totalAmount: 0, totalFees: 0, totalNet: 0, totalCount: 0 }
  };
};

// Send payout notification
const sendPayoutNotification = async (user, payout, type = 'requested') => {
  try {
    let subject, message;
    
    switch(type) {
      case 'requested':
        subject = 'Payout Request Received';
        message = `
          <h1>Payout Request Received</h1>
          <p>We have received your payout request for <strong>$${payout.amount}</strong>.</p>
          <p>Your request is being processed and you will receive another notification once it's approved.</p>
          <p>Request ID: ${payout._id}</p>
          <p>Requested on: ${payout.requestedAt}</p>
        `;
        break;
      case 'approved':
        subject = 'Payout Request Approved';
        message = `
          <h1>Payout Request Approved</h1>
          <p>Your payout request for <strong>$${payout.amount}</strong> has been approved.</p>
          <p>The payment will be processed shortly and sent to your registered payment method.</p>
          <p>Expected completion: ${payout.expectedDate || 'within 2-3 business days'}</p>
        `;
        break;
      case 'completed':
        subject = 'Payout Completed';
        message = `
          <h1>Payout Completed</h1>
          <p>Your payout of <strong>$${payout.amount}</strong> has been successfully processed.</p>
          <p>Transaction ID: ${payout.transaction?.id || 'N/A'}</p>
          <p>Completed on: ${payout.completedAt}</p>
          <p>Please check your account for the funds.</p>
        `;
        break;
      case 'failed':
        subject = 'Payout Failed';
        message = `
          <h1>Payout Failed</h1>
          <p>Your payout request for <strong>$${payout.amount}</strong> has failed.</p>
          <p>Reason: ${payout.transaction?.failureReason || 'Unknown error'}</p>
          <p>Please update your payment information and try again, or contact support.</p>
        `;
        break;
      case 'cancelled':
        subject = 'Payout Cancelled';
        message = `
          <h1>Payout Cancelled</h1>
          <p>Your payout request for <strong>$${payout.amount}</strong> has been cancelled.</p>
          <p>If you did not request this cancellation, please contact support immediately.</p>
        `;
        break;
    }
    
    await sendEmail({
      email: user.email,
      subject,
      html: message
    });
  } catch (error) {
    logger.error('Error sending payout notification:', error);
  }
};

// ============================================
// @desc    Get payout dashboard
// @route   GET /api/payouts/dashboard
// @access  Private
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user: userId });
    
    // Get payout statistics
    const summary = await calculatePayoutSummary(userId);
    
    // Get recent payouts
    const recentPayouts = await Payout.find({ user: userId, isDeleted: false })
      .sort('-requestedAt')
      .limit(5);
    
    // Get pending payout requests
    const pendingPayouts = await Payout.find({ 
      user: userId, 
      status: { $in: ['pending', 'approved', 'processing'] },
      isDeleted: false 
    }).sort('-requestedAt');
    
    // Get payout eligibility
    const affiliate = await Affiliate.findOne({ user: userId });
    const minPayout = affiliate?.paymentMethod?.minPayout || 10;
    const maxPayout = affiliate?.paymentMethod?.maxPayout || 10000;
    
    const eligible = wallet && wallet.availableBalance >= minPayout;
    const maxEligibleAmount = Math.min(wallet?.availableBalance || 0, maxPayout);
    
    res.status(200).json({
      success: true,
      dashboard: {
        wallet: wallet ? {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          holdBalance: wallet.holdBalance,
          pendingBalance: wallet.pendingBalance
        } : null,
        summary: summary.totals,
        recentPayouts,
        pendingPayouts: {
          count: pendingPayouts.length,
          totalAmount: pendingPayouts.reduce((sum, p) => sum + p.amount, 0)
        },
        eligibility: {
          eligible,
          minPayout,
          maxPayout,
          maxEligibleAmount,
          reason: !eligible ? 'Insufficient balance' : null
        },
        paymentMethod: affiliate?.paymentMethod || null
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all payouts
// @route   GET /api/payouts
// @access  Private
// ============================================
exports.getPayouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      startDate, 
      endDate,
      sortBy = '-requestedAt'
    } = req.query;
    
    const query = { user: userId, isDeleted: false };
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.requestedAt = {};
      if (startDate) query.requestedAt.$gte = new Date(startDate);
      if (endDate) query.requestedAt.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: ['commissions']
    };
    
    const payouts = await Payout.paginate(query, options);
    
    // Get summary
    const summary = await calculatePayoutSummary(userId);
    
    res.status(200).json({
      success: true,
      payouts: payouts.docs,
      summary: summary.totals,
      byStatus: summary.byStatus,
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
// @desc    Get payout by ID
// @route   GET /api/payouts/:id
// @access  Private
// ============================================
exports.getPayoutById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    const query = { _id: id, isDeleted: false };
    if (!isAdmin) query.user = userId;
    
    const payout = await Payout.findOne(query)
      .populate('user', 'name email')
      .populate('commissions')
      .populate('approval.approvedBy', 'name email')
      .populate('processing.initiatedBy', 'name email')
      .populate('processing.completedBy', 'name email');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    res.status(200).json({
      success: true,
      payout
    });
    
    // Log activity
    await logActivity(userId, 'view_payout_details', { payoutId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Request payout
// @route   POST /api/payouts/request
// @access  Private
// ============================================
exports.requestPayout = async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user.id;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }
    
    // Get user's wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    
    // Get affiliate settings for payout limits
    const affiliate = await Affiliate.findOne({ user: userId });
    const minPayout = affiliate?.paymentMethod?.minPayout || 10;
    const maxPayout = affiliate?.paymentMethod?.maxPayout || 10000;
    
    // Check minimum payout
    if (amount < minPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is $${minPayout}`
      });
    }
    
    // Check maximum payout
    if (amount > maxPayout) {
      return res.status(400).json({
        success: false,
        message: `Maximum payout amount is $${maxPayout}`
      });
    }
    
    // Check available balance
    if (amount > wallet.availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance'
      });
    }
    
    // Get pending commissions that can be included
    const pendingCommissions = await Commission.find({
      user: userId,
      status: 'pending',
      isDeleted: false
    }).sort('createdAt');
    
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
    
    // Select commissions to include (FIFO)
    let selectedAmount = 0;
    const selectedCommissions = [];
    
    for (const commission of pendingCommissions) {
      if (selectedAmount + commission.amount <= amount) {
        selectedCommissions.push(commission._id);
        selectedAmount += commission.amount;
      } else {
        // Partial commission not allowed in this example
        break;
      }
    }
    
    if (selectedAmount < amount) {
      return res.status(400).json({
        success: false,
        message: 'Unable to fulfill full amount with available commissions'
      });
    }
    
    // Calculate fees (example: 2% processing fee)
    const feeRate = 0.02;
    const fees = amount * feeRate;
    const netAmount = amount - fees;
    
    // Create payout request
    const payout = await Payout.create({
      user: userId,
      amount,
      method: {
        type: method || affiliate?.paymentMethod?.type || 'wallet',
        details: affiliate?.paymentMethod?.details || {}
      },
      commissions: selectedCommissions,
      summary: {
        totalCommissions: selectedCommissions.length,
        totalAmount: amount,
        fees,
        netAmount,
        dateRange: {
          start: pendingCommissions[0]?.createdAt,
          end: pendingCommissions[selectedCommissions.length - 1]?.createdAt
        }
      },
      fees: [{
        type: 'processing',
        amount: fees,
        description: 'Processing fee (2%)'
      }],
      status: 'pending',
      requestedAt: Date.now(),
      expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });
    
    // Update commission status
    await Commission.updateMany(
      { _id: { $in: selectedCommissions } },
      { 
        status: 'processing',
        payment: { payoutId: payout._id }
      }
    );
    
    // Hold amount in wallet
    wallet.holdBalance += amount;
    await wallet.save();
    
    // Update affiliate pending earnings
    if (affiliate) {
      affiliate.pendingEarnings -= amount;
      await affiliate.save();
    }
    
    // Send notification
    await sendPayoutNotification(req.user, payout, 'requested');
    
    // Log activity
    await logActivity(userId, 'request_payout', { 
      payoutId: payout._id, 
      amount,
      commissions: selectedCommissions.length 
    }, req);
    
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
// @desc    Cancel payout request
// @route   POST /api/payouts/:id/cancel
// @access  Private
// ============================================
exports.cancelPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    const payout = await Payout.findOne({ 
      _id: id, 
      user: userId,
      status: 'pending',
      isDeleted: false 
    });
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Pending payout not found'
      });
    }
    
    // Update payout status
    payout.status = 'cancelled';
    payout.cancelledAt = Date.now();
    payout.history.push({
      status: 'cancelled',
      changedBy: userId,
      reason: reason || 'Cancelled by user'
    });
    await payout.save();
    
    // Release held amount in wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      wallet.holdBalance -= payout.amount;
      await wallet.save();
    }
    
    // Update commission status back to pending
    await Commission.updateMany(
      { _id: { $in: payout.commissions } },
      { 
        status: 'pending',
        $unset: { payment: "" }
      }
    );
    
    // Send notification
    await sendPayoutNotification(req.user, payout, 'cancelled');
    
    // Log activity
    await logActivity(userId, 'cancel_payout', { payoutId: id, reason }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payout cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get payout statistics
// @route   GET /api/payouts/stats
// @access  Private
// ============================================
exports.getPayoutStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await Payout.aggregate([
      { $match: { user: userId, isDeleted: false } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$requestedAt' },
                  month: { $month: '$requestedAt' }
                },
                count: { $sum: 1 },
                total: { $sum: '$amount' }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ],
          byMethod: [
            { $group: { _id: '$method.type', count: { $sum: 1 }, total: { $sum: '$amount' } } }
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalPayouts: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                totalFees: { $sum: '$summary.fees' },
                avgAmount: { $avg: '$amount' },
                minAmount: { $min: '$amount' },
                maxAmount: { $max: '$amount' }
              }
            }
          ],
          completionTime: [
            {
              $match: {
                completedAt: { $exists: true },
                requestedAt: { $exists: true }
              }
            },
            {
              $project: {
                processingTime: {
                  $divide: [
                    { $subtract: ['$completedAt', '$requestedAt'] },
                    1000 * 60 * 60 * 24 // days
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgDays: { $avg: '$processingTime' },
                minDays: { $min: '$processingTime' },
                maxDays: { $max: '$processingTime' }
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
    await logActivity(userId, 'view_payout_stats', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export payout data
// @route   GET /api/payouts/export
// @access  Private
// ============================================
exports.exportPayouts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = { user: userId, isDeleted: false };
    
    if (startDate || endDate) {
      query.requestedAt = {};
      if (startDate) query.requestedAt.$gte = new Date(startDate);
      if (endDate) query.requestedAt.$lte = new Date(endDate);
    }
    
    const payouts = await Payout.find(query)
      .populate('commissions')
      .sort('-requestedAt');
    
    if (format === 'csv') {
      const csvData = payouts.map(p => ({
        'Request ID': p._id,
        'Date': p.requestedAt.toISOString().split('T')[0],
        'Amount': p.amount,
        'Method': p.method.type,
        'Status': p.status,
        'Fees': p.summary?.fees || 0,
        'Net Amount': p.summary?.netAmount || p.amount,
        'Completed At': p.completedAt?.toISOString().split('T')[0] || '',
        'Transaction ID': p.transaction?.id || ''
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payouts.csv');
      
      // Headers
      res.write('Request ID,Date,Amount,Method,Status,Fees,Net Amount,Completed At,Transaction ID\n');
      
      // Data
      csvData.forEach(row => {
        res.write(`${row['Request ID']},${row.Date},${row.Amount},${row.Method},${row.Status},${row.Fees},${row['Net Amount']},${row['Completed At']},${row['Transaction ID']}\n`);
      });
      
      res.end();
    } else {
      res.status(200).json({
        success: true,
        count: payouts.length,
        payouts
      });
    }
    
    // Log activity
    await logActivity(userId, 'export_payouts', { format }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// ADMIN CONTROLLERS
// ============================================

// ============================================
// @desc    Get all payouts (Admin)
// @route   GET /api/payouts/admin/all
// @access  Private (Admin only)
// ============================================
exports.getAllPayouts = async (req, res, next) => {
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
        { path: 'user', select: 'name email referralCode' },
        { path: 'commissions' }
      ]
    };
    
    const payouts = await Payout.paginate(query, options);
    
    // Get summary statistics
    const summary = await calculatePayoutSummary();
    
    res.status(200).json({
      success: true,
      payouts: payouts.docs,
      summary: summary.totals,
      byStatus: summary.byStatus,
      totalPages: payouts.totalPages,
      totalDocs: payouts.totalDocs,
      page: payouts.page,
      limit: payouts.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_view_all_payouts', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Approve payout (Admin)
// @route   POST /api/payouts/:id/approve
// @access  Private (Admin only)
// ============================================
exports.approvePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments, expectedDate } = req.body;
    const adminId = req.user.id;
    
    const payout = await Payout.findOne({ 
      _id: id, 
      status: 'pending',
      isDeleted: false 
    }).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Pending payout not found'
      });
    }
    
    // Update payout
    payout.status = 'approved';
    payout.approval = {
      status: 'approved',
      approvedBy: adminId,
      approvedAt: Date.now(),
      comments
    };
    if (expectedDate) {
      payout.expectedDate = new Date(expectedDate);
    }
    payout.history.push({
      status: 'approved',
      changedBy: adminId,
      reason: 'Approved by admin',
      notes: comments
    });
    
    await payout.save();
    
    // Send notification
    await sendPayoutNotification(payout.user, payout, 'approved');
    
    // Log activity
    await logActivity(adminId, 'approve_payout', { payoutId: id }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payout approved successfully',
      payout
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Reject payout (Admin)
// @route   POST /api/payouts/:id/reject
// @access  Private (Admin only)
// ============================================
exports.rejectPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const payout = await Payout.findOne({ 
      _id: id, 
      status: { $in: ['pending', 'approved'] },
      isDeleted: false 
    }).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found or cannot be rejected'
      });
    }
    
    // Update payout
    payout.status = 'rejected';
    payout.approval = {
      status: 'rejected',
      rejectedBy: adminId,
      rejectedAt: Date.now(),
      rejectionReason: reason
    };
    payout.history.push({
      status: 'rejected',
      changedBy: adminId,
      reason: 'Rejected by admin',
      notes: reason
    });
    
    await payout.save();
    
    // Release held amount in wallet
    const wallet = await Wallet.findOne({ user: payout.user._id });
    if (wallet) {
      wallet.holdBalance -= payout.amount;
      await wallet.save();
    }
    
    // Update commission status back to pending
    await Commission.updateMany(
      { _id: { $in: payout.commissions } },
      { 
        status: 'pending',
        $unset: { payment: "" }
      }
    );
    
    // Send notification
    await sendPayoutNotification(payout.user, payout, 'failed');
    
    // Log activity
    await logActivity(adminId, 'reject_payout', { payoutId: id, reason }, req);
    
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
// @desc    Process payout (Admin/Mark as processing)
// @route   POST /api/payouts/:id/process
// @access  Private (Admin only)
// ============================================
exports.processPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;
    
    const payout = await Payout.findOne({ 
      _id: id, 
      status: 'approved',
      isDeleted: false 
    }).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Approved payout not found'
      });
    }
    
    // Update payout
    payout.status = 'processing';
    payout.processing = {
      initiatedBy: adminId,
      initiatedAt: Date.now(),
      notes
    };
    payout.history.push({
      status: 'processing',
      changedBy: adminId,
      reason: 'Processing started',
      notes
    });
    
    await payout.save();
    
    // Log activity
    await logActivity(adminId, 'process_payout', { payoutId: id }, req);
    
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
// @desc    Complete payout (Admin)
// @route   POST /api/payouts/:id/complete
// @access  Private (Admin only)
// ============================================
exports.completePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionId, reference, notes } = req.body;
    const adminId = req.user.id;
    
    const payout = await Payout.findOne({ 
      _id: id, 
      status: { $in: ['approved', 'processing'] },
      isDeleted: false 
    }).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found or cannot be completed'
      });
    }
    
    // Update payout
    payout.status = 'completed';
    payout.completedAt = Date.now();
    payout.processing.completedBy = adminId;
    payout.processing.completedAt = Date.now();
    payout.transaction = {
      id: transactionId,
      reference,
      completedAt: Date.now()
    };
    payout.history.push({
      status: 'completed',
      changedBy: adminId,
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
      // Move from hold to withdrawn
      wallet.holdBalance -= payout.amount;
      wallet.balance -= payout.amount;
      wallet.lifetime.totalWithdrawn += payout.amount;
      await wallet.save();
      
      // Create transaction record
      await Transaction.create({
        user: payout.user._id,
        type: 'withdrawal',
        direction: 'out',
        amount: payout.amount,
        balanceAfter: wallet.balance,
        source: {
          type: 'payout',
          sourceId: payout._id,
          description: 'Payout completed'
        },
        related: {
          payout: payout._id
        },
        status: 'completed'
      });
    }
    
    // Update affiliate stats
    const affiliate = await Affiliate.findOne({ user: payout.user._id });
    if (affiliate) {
      affiliate.withdrawnAmount += payout.amount;
      await affiliate.save();
    }
    
    // Send notification
    await sendPayoutNotification(payout.user, payout, 'completed');
    
    // Log activity
    await logActivity(adminId, 'complete_payout', { payoutId: id, transactionId }, req);
    
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
// @desc    Mark payout as failed (Admin)
// @route   POST /api/payouts/:id/fail
// @access  Private (Admin only)
// ============================================
exports.failPayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, error } = req.body;
    const adminId = req.user.id;
    
    const payout = await Payout.findOne({ 
      _id: id, 
      status: { $in: ['approved', 'processing'] },
      isDeleted: false 
    }).populate('user');
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found or cannot be marked as failed'
      });
    }
    
    // Update payout
    payout.status = 'failed';
    payout.transaction = {
      failedAt: Date.now(),
      failureReason: reason || error
    };
    payout.history.push({
      status: 'failed',
      changedBy: adminId,
      reason: 'Payout failed',
      notes: reason || error
    });
    
    await payout.save();
    
    // Release held amount in wallet
    const wallet = await Wallet.findOne({ user: payout.user._id });
    if (wallet) {
      wallet.holdBalance -= payout.amount;
      await wallet.save();
    }
    
    // Update commission status back to pending
    await Commission.updateMany(
      { _id: { $in: payout.commissions } },
      { 
        status: 'pending',
        $unset: { payment: "" }
      }
    );
    
    // Send notification
    await sendPayoutNotification(payout.user, payout, 'failed');
    
    // Log activity
    await logActivity(adminId, 'fail_payout', { payoutId: id, reason }, req);
    
    res.status(200).json({
      success: true,
      message: 'Payout marked as failed',
      payout
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Bulk approve payouts (Admin)
// @route   POST /api/payouts/bulk-approve
// @access  Private (Admin only)
// ============================================
exports.bulkApprovePayouts = async (req, res, next) => {
  try {
    const { ids, comments } = req.body;
    const adminId = req.user.id;
    
    const result = await Payout.updateMany(
      { _id: { $in: ids }, status: 'pending' },
      {
        $set: {
          status: 'approved',
          'approval.status': 'approved',
          'approval.approvedBy': adminId,
          'approval.approvedAt': Date.now(),
          'approval.comments': comments
        },
        $push: {
          history: {
            status: 'approved',
            changedBy: adminId,
            reason: 'Bulk approved by admin',
            notes: comments
          }
        }
      }
    );
    
    // Send notifications
    const payouts = await Payout.find({ _id: { $in: ids } }).populate('user');
    for (const payout of payouts) {
      await sendPayoutNotification(payout.user, payout, 'approved');
    }
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} payouts approved successfully`
    });
    
    // Log activity
    await logActivity(adminId, 'bulk_approve_payouts', { count: result.modifiedCount }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get payout settings (Admin)
// @route   GET /api/payouts/admin/settings
// @access  Private (Admin only)
// ============================================
exports.getPayoutSettings = async (req, res, next) => {
  try {
    const Setting = require('../models/Setting');
    
    const settings = await Setting.findOne({ 
      key: 'payout_settings',
      isDeleted: false 
    });
    
    res.status(200).json({
      success: true,
      settings: settings?.value || {
        minPayout: 10,
        maxPayout: 10000,
        feePercentage: 2,
        processingDays: 3,
        allowedMethods: ['paypal', 'bank_transfer', 'stripe', 'wallet'],
        autoApprove: false,
        autoApproveThreshold: 100,
        requireVerification: true,
        payoutSchedule: {
          type: 'weekly',
          day: 'monday'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Update payout settings (Admin)
// @route   PUT /api/payouts/admin/settings
// @access  Private (Admin only)
// ============================================
exports.updatePayoutSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    const Setting = require('../models/Setting');
    
    const updatedSettings = await Setting.findOneAndUpdate(
      { key: 'payout_settings' },
      {
        key: 'payout_settings',
        value: settings,
        label: 'Payout Settings',
        category: 'payout',
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Payout settings updated successfully',
      settings: updatedSettings.value
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get payout summary (Admin)
// @route   GET /api/payouts/admin/summary
// @access  Private (Admin only)
// ============================================
exports.getAdminSummary = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    if (period === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
    } else if (period === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
    } else if (period === 'year') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      endDate = new Date();
    }
    
    const matchStage = { isDeleted: false };
    if (startDate && endDate) {
      matchStage.requestedAt = { $gte: startDate, $lte: endDate };
    }
    
    const [
      totalStats,
      pendingStats,
      byMethod,
      dailyStats,
      topUsers
    ] = await Promise.all([
      // Total statistics
      Payout.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPayouts: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFees: { $sum: '$summary.fees' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]),
      
      // Pending payouts
      Payout.aggregate([
        {
          $match: {
            ...matchStage,
            status: { $in: ['pending', 'approved'] }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        }
      ]),
      
      // By payment method
      Payout.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$method.type',
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        }
      ]),
      
      // Daily statistics
      Payout.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$requestedAt' } }
            },
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.date': 1 } },
        { $limit: 30 }
      ]),
      
      // Top users by payout amount
      Payout.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
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
            count: 1,
            amount: 1
          }
        }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      period,
      summary: {
        totals: totalStats[0] || { totalPayouts: 0, totalAmount: 0, totalFees: 0, avgAmount: 0 },
        pending: pendingStats[0] || { count: 0, amount: 0 },
        byMethod,
        dailyStats,
        topUsers
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_view_summary', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete payout (Admin - hard delete)
// @route   DELETE /api/payouts/admin/:id
// @access  Private (Admin only)
// ============================================
exports.adminDeletePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const payout = await Payout.findById(id);
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    // Hard delete (use with caution)
    await payout.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Payout deleted permanently'
    });
    
    // Log activity
    await logActivity(req.user.id, 'admin_delete_payout', { payoutId: id }, req);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
