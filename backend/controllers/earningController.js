const Earning = require('../models/Earning');
const Commission = require('../models/Commission');
const Referral = require('../models/Referral');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ============================================
// Helper Functions
// ============================================

// Log earning activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'earning',
      message: `Earning ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'earning', id: details.earningId },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging earning activity:', error);
  }
};

// Calculate earning summary
const calculateEarningSummary = async (userId, startDate, endDate) => {
  const matchStage = {
    user: mongoose.Types.ObjectId(userId),
    isDeleted: false
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  const [totalEarnings, byStatus, byType, monthlyBreakdown] = await Promise.all([
    // Total earnings summary
    Commission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]),
    
    // Earnings by status
    Commission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Earnings by type
    Commission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    
    // Monthly breakdown
    Commission.aggregate([
      { $match: matchStage },
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
    ])
  ]);
  
  return {
    summary: totalEarnings[0] || { totalAmount: 0, totalCount: 0, averageAmount: 0, maxAmount: 0, minAmount: 0 },
    byStatus,
    byType,
    monthlyBreakdown
  };
};

// ============================================
// @desc    Get earnings dashboard
// @route   GET /api/earnings/dashboard
// @access  Private
// ============================================
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user: userId });
    
    // Get today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEarnings = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $in: ['pending', 'approved', 'paid'] },
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
    
    // Get this week's earnings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekEarnings = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: weekAgo },
          status: { $in: ['pending', 'approved', 'paid'] },
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
    
    // Get this month's earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthEarnings = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: monthStart },
          status: { $in: ['pending', 'approved', 'paid'] },
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
    
    // Get recent earnings
    const recentEarnings = await Commission.find({ 
      user: userId, 
      isDeleted: false 
    })
    .populate('referral', 'referredUser')
    .sort('-createdAt')
    .limit(10);
    
    // Get earnings by source
    const earningsBySource = await Commission.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['pending', 'approved', 'paid'] },
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
    
    // Get pending payouts
    const pendingPayouts = await Payout.find({ 
      user: userId, 
      status: { $in: ['pending', 'approved', 'processing'] },
      isDeleted: false 
    });
    
    const totalPendingPayouts = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    
    res.status(200).json({
      success: true,
      dashboard: {
        wallet: wallet ? {
          balance: wallet.balance,
          availableBalance: wallet.availableBalance,
          holdBalance: wallet.holdBalance,
          pendingBalance: wallet.pendingBalance
        } : null,
        today: todayEarnings[0] || { amount: 0, count: 0 },
        thisWeek: weekEarnings[0] || { amount: 0, count: 0 },
        thisMonth: monthEarnings[0] || { amount: 0, count: 0 },
        allTime: {
          amount: wallet?.lifetime?.totalCredited || 0,
          count: wallet?.lifetime?.transactionCount || 0
        },
        pendingPayouts: {
          count: pendingPayouts.length,
          amount: totalPendingPayouts
        },
        earningsBySource,
        recentEarnings
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings overview
// @route   GET /api/earnings/overview
// @access  Private
// ============================================
exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch(period) {
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
    
    const summary = await calculateEarningSummary(userId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      overview: summary
    });
    
    // Log activity
    await logActivity(userId, 'view_overview', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get all earnings
// @route   GET /api/earnings
// @access  Private
// ============================================
exports.getEarnings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      startDate, 
      endDate,
      sortBy = '-createdAt'
    } = req.query;
    
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
      sort: sortBy,
      populate: [
        { path: 'referral', populate: { path: 'referredUser', select: 'name email' } },
        { path: 'source.sourceId' }
      ]
    };
    
    const earnings = await Commission.paginate(query, options);
    
    // Get summary
    const summary = await calculateEarningSummary(userId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      earnings: earnings.docs,
      summary: summary.summary,
      byStatus: summary.byStatus,
      byType: summary.byType,
      totalPages: earnings.totalPages,
      totalDocs: earnings.totalDocs,
      page: earnings.page,
      limit: earnings.limit
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings', { page, limit }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get earning by ID
// @route   GET /api/earnings/:id
// @access  Private
// ============================================
exports.getEarningById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const earning = await Commission.findOne({ 
      _id: id, 
      user: userId,
      isDeleted: false 
    })
    .populate('referral', 'referredUser referredAt status')
    .populate('source.sourceId');
    
    if (!earning) {
      return res.status(404).json({
        success: false,
        message: 'Earning not found'
      });
    }
    
    // Get related transactions
    const transactions = await Transaction.find({ 
      'related.commission': id,
      isDeleted: false 
    }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      earning,
      transactions
    });
    
    // Log activity
    await logActivity(userId, 'view_earning_details', { earningId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings chart data
// @route   GET /api/earnings/chart
// @access  Private
// ============================================
exports.getEarningsChart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month', groupBy = 'day' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch(period) {
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
    
    let groupById;
    if (groupBy === 'day') {
      groupById = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (groupBy === 'week') {
      groupById = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    } else if (groupBy === 'month') {
      groupById = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    }
    
    const chartData = await Commission.aggregate([
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
          _id: groupById,
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Format chart data for frontend
    const formattedData = chartData.map(item => {
      let label;
      if (groupBy === 'day') {
        label = `${item._id.year}-${item._id.month}-${item._id.day}`;
      } else if (groupBy === 'week') {
        label = `Week ${item._id.week}, ${item._id.year}`;
      } else if (groupBy === 'month') {
        label = `${item._id.year}-${item._id.month}`;
      }
      
      return {
        label,
        amount: item.amount,
        count: item.count
      };
    });
    
    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      groupBy,
      data: formattedData
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_chart', { period, groupBy }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings summary
// @route   GET /api/earnings/summary
// @access  Private
// ============================================
exports.getEarningsSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const summary = await calculateEarningSummary(userId);
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user: userId });
    
    // Get pending payouts
    const pendingPayouts = await Payout.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['pending', 'approved', 'processing'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get projected earnings (next 30 days based on recurring)
    const projectedEarnings = await Commission.aggregate([
      {
        $match: {
          user: userId,
          isRecurring: true,
          status: 'pending',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          monthly: { $sum: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      summary: {
        total: summary.summary,
        byStatus: summary.byStatus,
        byType: summary.byType,
        monthlyBreakdown: summary.monthlyBreakdown,
        wallet: wallet ? {
          balance: wallet.balance,
          available: wallet.availableBalance,
          hold: wallet.holdBalance,
          pending: wallet.pendingBalance
        } : null,
        pendingPayouts: pendingPayouts[0] || { total: 0, count: 0 },
        projectedMonthly: projectedEarnings[0]?.monthly || 0
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_summary', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings by source
// @route   GET /api/earnings/by-source
// @access  Private
// ============================================
exports.getEarningsBySource = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const matchStage = {
      user: userId,
      isDeleted: false
    };
    
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    
    const bySource = await Commission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            type: '$type',
            source: '$source.type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          sources: {
            $push: {
              source: '$_id.source',
              amount: '$amount',
              count: '$count'
            }
          },
          total: { $sum: '$amount' },
          totalCount: { $sum: '$count' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      bySource
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_by_source', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get top earning sources
// @route   GET /api/earnings/top-sources
// @access  Private
// ============================================
exports.getTopSources = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    const topSources = await Commission.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['paid', 'approved'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            description: '$source.description'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json({
      success: true,
      topSources
    });
    
    // Log activity
    await logActivity(userId, 'view_top_sources', { limit }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings timeline
// @route   GET /api/earnings/timeline
// @access  Private
// ============================================
exports.getEarningsTimeline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const timeline = await Commission.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
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
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Calculate growth rate
    const growth = [];
    for (let i = 1; i < timeline.length; i++) {
      const prev = timeline[i-1];
      const curr = timeline[i];
      const growthRate = prev.amount > 0 
        ? ((curr.amount - prev.amount) / prev.amount * 100).toFixed(2)
        : 0;
      
      growth.push({
        period: `${curr._id.year}-${curr._id.month}`,
        amount: curr.amount,
        growthRate: parseFloat(growthRate)
      });
    }
    
    res.status(200).json({
      success: true,
      timeline,
      growth
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_timeline', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings forecast
// @route   GET /api/earnings/forecast
// @access  Private
// ============================================
exports.getEarningsForecast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { months = 3 } = req.query;
    
    // Get historical data for trend analysis
    const historicalData = await Commission.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['paid', 'approved'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Simple moving average forecast
    const forecast = [];
    if (historicalData.length >= 3) {
      const last3Avg = historicalData.slice(-3).reduce((sum, d) => sum + d.amount, 0) / 3;
      const last6Avg = historicalData.slice(-6).reduce((sum, d) => sum + d.amount, 0) / 6;
      const trend = last3Avg > last6Avg ? 'up' : 'down';
      
      const lastDate = historicalData[historicalData.length - 1]._id;
      let year = lastDate.year;
      let month = lastDate.month;
      
      for (let i = 1; i <= parseInt(months); i++) {
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
        
        // Simple forecast: use moving average with slight trend adjustment
        let predictedAmount = last3Avg;
        if (trend === 'up') {
          predictedAmount *= (1 + 0.05 * i); // 5% growth per month
        } else {
          predictedAmount *= (1 - 0.03 * i); // 3% decline per month
        }
        
        forecast.push({
          year,
          month,
          predictedAmount: Math.round(predictedAmount * 100) / 100
        });
      }
    }
    
    res.status(200).json({
      success: true,
      historicalData,
      forecast
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_forecast', { months }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get earnings comparison
// @route   GET /api/earnings/comparison
// @access  Private
// ============================================
exports.getEarningsComparison = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { compareWith = 'last_period' } = req.query;
    
    const now = new Date();
    const currentPeriodStart = new Date(now.setDate(1));
    currentPeriodStart.setHours(0, 0, 0, 0);
    
    const currentPeriodEnd = new Date();
    
    let previousPeriodStart, previousPeriodEnd;
    
    if (compareWith === 'last_period') {
      // Previous month
      previousPeriodStart = new Date(currentPeriodStart);
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      previousPeriodEnd.setHours(23, 59, 59, 999);
    } else if (compareWith === 'last_year') {
      // Same month last year
      previousPeriodStart = new Date(currentPeriodStart);
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
      
      previousPeriodEnd = new Date(currentPeriodEnd);
      previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1);
    }
    
    const [currentEarnings, previousEarnings] = await Promise.all([
      Commission.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd },
            status: { $in: ['pending', 'approved', 'paid'] },
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
      ]),
      Commission.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd },
            status: { $in: ['pending', 'approved', 'paid'] },
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
      ])
    ]);
    
    const currentAmount = currentEarnings[0]?.amount || 0;
    const previousAmount = previousEarnings[0]?.amount || 0;
    
    const changeAmount = currentAmount - previousAmount;
    const changePercent = previousAmount > 0 
      ? (changeAmount / previousAmount * 100).toFixed(2)
      : 0;
    
    res.status(200).json({
      success: true,
      comparison: {
        current: {
          amount: currentAmount,
          count: currentEarnings[0]?.count || 0,
          period: {
            start: currentPeriodStart,
            end: currentPeriodEnd
          }
        },
        previous: {
          amount: previousAmount,
          count: previousEarnings[0]?.count || 0,
          period: {
            start: previousPeriodStart,
            end: previousPeriodEnd
          }
        },
        change: {
          amount: changeAmount,
          percent: parseFloat(changePercent),
          direction: changeAmount >= 0 ? 'increase' : 'decrease'
        }
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_comparison', { compareWith }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export earnings data
// @route   GET /api/earnings/export
// @access  Private
// ============================================
exports.exportEarnings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = { user: userId, isDeleted: false };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const earnings = await Commission.find(query)
      .populate('referral', 'referredUser')
      .populate('source.sourceId')
      .sort('-createdAt');
    
    if (format === 'csv') {
      // Convert to CSV
      const csvData = earnings.map(e => ({
        'Date': e.createdAt.toISOString().split('T')[0],
        'Type': e.type,
        'Source': e.source?.description || e.source?.type || 'N/A',
        'Amount': e.amount,
        'Currency': e.currency || 'USD',
        'Status': e.status,
        'Reference': e.referral?._id || e.source?.sourceId || 'N/A'
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=earnings.csv');
      
      // Headers
      res.write('Date,Type,Source,Amount,Currency,Status,Reference\n');
      
      // Data
      csvData.forEach(row => {
        res.write(`${row.Date},${row.Type},${row.Source},${row.Amount},${row.Currency},${row.Status},${row.Reference}\n`);
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
    await logActivity(userId, 'export_earnings', { format }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings by affiliate
// @route   GET /api/earnings/by-affiliate/:affiliateId
// @access  Private (Admin only)
// ============================================
exports.getEarningsByAffiliate = async (req, res, next) => {
  try {
    const { affiliateId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
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
    
    // Get affiliate info
    const affiliate = await User.findById(affiliateId).select('name email referralCode');
    
    // Get summary
    const summary = await calculateEarningSummary(affiliateId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      affiliate,
      earnings: earnings.docs,
      summary: summary.summary,
      totalPages: earnings.totalPages,
      totalDocs: earnings.totalDocs,
      page: earnings.page,
      limit: earnings.limit
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_earnings_by_affiliate', { affiliateId }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get platform earnings summary (Admin)
// @route   GET /api/earnings/platform-summary
// @access  Private (Admin only)
// ============================================
exports.getPlatformEarningsSummary = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { createdAt: { $gte: today } };
    } else if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      dateFilter = { createdAt: { $gte: yearAgo } };
    }
    
    const matchStage = { ...dateFilter, isDeleted: false };
    
    const [
      totalEarnings,
      earningsByStatus,
      earningsByType,
      topAffiliates,
      dailyStats
    ] = await Promise.all([
      // Total platform earnings
      Commission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCount: { $sum: 1 },
            averageAmount: { $avg: '$amount' },
            maxAmount: { $max: '$amount' },
            minAmount: { $min: '$amount' }
          }
        }
      ]),
      
      // Earnings by status
      Commission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Earnings by type
      Commission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Top earning affiliates
      Commission.aggregate([
        { $match: matchStage },
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
      ]),
      
      // Daily stats for chart
      Commission.aggregate([
        {
          $match: {
            ...dateFilter,
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } },
        { $limit: 30 }
      ])
    ]);
    
    // Get unique affiliates count
    const uniqueAffiliates = await Commission.distinct('user', matchStage);
    
    res.status(200).json({
      success: true,
      period,
      summary: {
        total: totalEarnings[0] || { totalAmount: 0, totalCount: 0, averageAmount: 0 },
        byStatus: earningsByStatus,
        byType: earningsByType,
        uniqueAffiliates: uniqueAffiliates.length,
        topAffiliates,
        dailyStats
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_platform_summary', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earning trends
// @route   GET /api/earnings/trends
// @access  Private
// ============================================
exports.getEarningTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const trends = await Commission.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['paid', 'approved'] },
          isDeleted: false
        }
      },
      {
        $facet: {
          monthly: [
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
          quarterly: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } }
                },
                amount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.quarter': -1 } },
            { $limit: 8 }
          ],
          yearly: [
            {
              $group: {
                _id: { $year: '$createdAt' },
                amount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': -1 } },
            { $limit: 5 }
          ],
          byDayOfWeek: [
            {
              $group: {
                _id: { $dayOfWeek: '$createdAt' },
                amount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ],
          byHour: [
            {
              $group: {
                _id: { $hour: '$createdAt' },
                amount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': 1 } }
          ]
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      trends: trends[0]
    });
    
    // Log activity
    await logActivity(userId, 'view_earning_trends', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get earnings by category
// @route   GET /api/earnings/by-category
// @access  Private
// ============================================
exports.getEarningsByCategory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const byCategory = await Commission.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            sourceType: '$source.type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              name: '$_id.sourceType',
              amount: '$amount',
              count: '$count'
            }
          },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      byCategory
    });
    
    // Log activity
    await logActivity(userId, 'view_earnings_by_category', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Mark earning as paid (Admin)
// @route   PUT /api/earnings/:id/mark-paid
// @access  Private (Admin only)
// ============================================
exports.markEarningAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionId, notes } = req.body;
    
    const earning = await Commission.findById(id);
    
    if (!earning) {
      return res.status(404).json({
        success: false,
        message: 'Earning not found'
      });
    }
    
    earning.status = 'paid';
    earning.payment = {
      transactionId,
      paidAt: Date.now(),
      notes
    };
    
    await earning.save();
    
    // Update wallet if needed
    const wallet = await Wallet.findOne({ user: earning.user });
    if (wallet) {
      wallet.balance += earning.amount;
      wallet.lifetime.totalCredited += earning.amount;
      await wallet.save();
      
      // Create transaction record
      await Transaction.create({
        user: earning.user,
        type: 'commission',
        direction: 'in',
        amount: earning.amount,
        balanceAfter: wallet.balance,
        source: {
          type: 'commission',
          sourceId: earning._id,
          description: 'Commission paid'
        },
        related: {
          commission: earning._id
        },
        status: 'completed'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Earning marked as paid successfully',
      earning
    });
    
    // Log activity
    await logActivity(req.user.id, 'mark_earning_paid', { earningId: id }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Bulk update earnings (Admin)
// @route   POST /api/earnings/bulk-update
// @access  Private (Admin only)
// ============================================
exports.bulkUpdateEarnings = async (req, res, next) => {
  try {
    const { ids, updates } = req.body;
    
    const result = await Commission.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} earnings updated successfully`
    });
    
    // Log activity
    await logActivity(req.user.id, 'bulk_update_earnings', { count: result.modifiedCount }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Delete earning (Admin)
// @route   DELETE /api/earnings/:id
// @access  Private (Admin only)
// ============================================
exports.deleteEarning = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const earning = await Commission.findById(id);
    
    if (!earning) {
      return res.status(404).json({
        success: false,
        message: 'Earning not found'
      });
    }
    
    // Soft delete
    earning.isDeleted = true;
    await earning.save();
    
    res.status(200).json({
      success: true,
      message: 'Earning deleted successfully'
    });
    
    // Log activity
    await logActivity(req.user.id, 'delete_earning', { earningId: id }, req);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
