const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const Conversion = require('../models/Conversion');
const Payout = require('../models/Payout');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Log = require('../models/Log');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// ============================================
// Helper Functions
// ============================================

// Log analytics activity
const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    await Log.create({
      level: 'info',
      category: 'analytics',
      message: `Analytics ${action}`,
      user: userId,
      ipAddress: req?.ip,
      userAgent: req?.get('user-agent'),
      audit: {
        action,
        resource: { type: 'analytics' },
        changes: details,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error logging analytics activity:', error);
  }
};

// Get date range based on period
const getDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate, endDate;
  
  switch(period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.setHours(0, 0, 0, 0));
      endDate = new Date(yesterday.setHours(23, 59, 59, 999));
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
    case 'custom':
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
  }
  
  return { startDate, endDate };
};

// Calculate growth rate
const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100).toFixed(2);
};

// ============================================
// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
// ============================================
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Get date ranges
    const today = getDateRange('today');
    const yesterday = getDateRange('yesterday');
    const thisWeek = getDateRange('week');
    const thisMonth = getDateRange('month');
    
    // Base match condition
    const userMatch = isAdmin ? {} : { user: userId };
    
    // Fetch all analytics data in parallel
    const [
      clicksToday,
      clicksYesterday,
      clicksThisWeek,
      conversionsToday,
      conversionsYesterday,
      conversionsThisWeek,
      commissionsToday,
      commissionsYesterday,
      commissionsThisWeek,
      topPerformingLinks,
      recentActivities,
      userStats
    ] = await Promise.all([
      // Clicks today
      Click.countDocuments({ 
        ...userMatch, 
        clickedAt: { $gte: today.startDate, $lte: today.endDate } 
      }),
      
      // Clicks yesterday
      Click.countDocuments({ 
        ...userMatch, 
        clickedAt: { $gte: yesterday.startDate, $lte: yesterday.endDate } 
      }),
      
      // Clicks this week
      Click.countDocuments({ 
        ...userMatch, 
        clickedAt: { $gte: thisWeek.startDate, $lte: thisWeek.endDate } 
      }),
      
      // Conversions today
      Conversion.countDocuments({ 
        ...userMatch, 
        convertedAt: { $gte: today.startDate, $lte: today.endDate } 
      }),
      
      // Conversions yesterday
      Conversion.countDocuments({ 
        ...userMatch, 
        convertedAt: { $gte: yesterday.startDate, $lte: yesterday.endDate } 
      }),
      
      // Conversions this week
      Conversion.countDocuments({ 
        ...userMatch, 
        convertedAt: { $gte: thisWeek.startDate, $lte: thisWeek.endDate } 
      }),
      
      // Commissions today
      Commission.aggregate([
        {
          $match: {
            ...userMatch,
            createdAt: { $gte: today.startDate, $lte: today.endDate },
            status: { $in: ['pending', 'approved', 'paid'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Commissions yesterday
      Commission.aggregate([
        {
          $match: {
            ...userMatch,
            createdAt: { $gte: yesterday.startDate, $lte: yesterday.endDate },
            status: { $in: ['pending', 'approved', 'paid'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Commissions this week
      Commission.aggregate([
        {
          $match: {
            ...userMatch,
            createdAt: { $gte: thisWeek.startDate, $lte: thisWeek.endDate },
            status: { $in: ['pending', 'approved', 'paid'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Top performing links
      Link.aggregate([
        { $match: { ...userMatch, isDeleted: false } },
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
            revenue: { $sum: '$conversions.commission.amount' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]),
      
      // Recent activities
      Log.find({ 
        ...userMatch, 
        category: { $in: ['click', 'conversion', 'commission', 'referral'] }
      })
      .sort('-timestamp')
      .limit(10),
      
      // User statistics (for admin only)
      isAdmin ? User.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
          }
        }
      ]) : null
    ]);
    
    // Calculate growth rates
    const clickGrowth = calculateGrowthRate(clicksToday, clicksYesterday);
    const conversionGrowth = calculateGrowthRate(conversionsToday, conversionsYesterday);
    const commissionToday = commissionsToday[0]?.total || 0;
    const commissionYesterday = commissionsYesterday[0]?.total || 0;
    const commissionGrowth = calculateGrowthRate(commissionToday, commissionYesterday);
    
    res.status(200).json({
      success: true,
      analytics: {
        period: {
          today: today.startDate,
          yesterday: yesterday.startDate,
          thisWeek: thisWeek.startDate
        },
        metrics: {
          clicks: {
            today: clicksToday,
            yesterday: clicksYesterday,
            thisWeek: clicksThisWeek,
            growth: clickGrowth
          },
          conversions: {
            today: conversionsToday,
            yesterday: conversionsYesterday,
            thisWeek: conversionsThisWeek,
            growth: conversionGrowth
          },
          commissions: {
            today: commissionToday,
            yesterday: commissionYesterday,
            thisWeek: commissionsThisWeek[0]?.total || 0,
            growth: commissionGrowth
          }
        },
        topPerformingLinks,
        recentActivities,
        ...(isAdmin && { userStats })
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_dashboard', {}, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get performance analytics
// @route   GET /api/analytics/performance
// @access  Private
// ============================================
exports.getPerformanceAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month', groupBy = 'day' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const matchStage = {
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };
    
    // Get clicks over time
    const clicksOverTime = await Click.aggregate([
      {
        $match: {
          affiliate: userId,
          clickedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$clickedAt' },
            month: { $month: '$clickedAt' },
            day: { $dayOfMonth: '$clickedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get conversions over time
    const conversionsOverTime = await Conversion.aggregate([
      {
        $match: {
          affiliate: userId,
          convertedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$convertedAt' },
            month: { $month: '$convertedAt' },
            day: { $dayOfMonth: '$convertedAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$saleAmount' },
          commission: { $sum: '$commission.amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get commissions over time
    const commissionsOverTime = await Commission.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['pending', 'approved', 'paid'] }
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
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get conversion rate over time
    const conversionRateOverTime = [];
    const dateMap = new Map();
    
    clicksOverTime.forEach(click => {
      const key = `${click._id.year}-${click._id.month}-${click._id.day}`;
      dateMap.set(key, { clicks: click.count, conversions: 0 });
    });
    
    conversionsOverTime.forEach(conv => {
      const key = `${conv._id.year}-${conv._id.month}-${conv._id.day}`;
      if (dateMap.has(key)) {
        dateMap.get(key).conversions = conv.count;
      } else {
        dateMap.set(key, { clicks: 0, conversions: conv.count });
      }
    });
    
    dateMap.forEach((value, key) => {
      const rate = value.clicks > 0 ? (value.conversions / value.clicks * 100).toFixed(2) : 0;
      conversionRateOverTime.push({
        date: key,
        clicks: value.clicks,
        conversions: value.conversions,
        rate
      });
    });
    
    res.status(200).json({
      success: true,
      performance: {
        period: { startDate, endDate },
        clicksOverTime,
        conversionsOverTime,
        commissionsOverTime,
        conversionRateOverTime
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_performance', { period, groupBy }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get conversion analytics
// @route   GET /api/analytics/conversions
// @access  Private
// ============================================
exports.getConversionAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const matchStage = {
      affiliate: userId,
      convertedAt: { $gte: startDate, $lte: endDate },
      isDeleted: false
    };
    
    const [
      totalConversions,
      byStatus,
      byProduct,
      averageOrderValue,
      conversionRate,
      salesByDay
    ] = await Promise.all([
      // Total conversions
      Conversion.countDocuments(matchStage),
      
      // Conversions by status
      Conversion.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$saleAmount' } } }
      ]),
      
      // Conversions by product
      Conversion.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$productId',
            count: { $sum: 1 },
            revenue: { $sum: '$saleAmount' },
            commission: { $sum: '$commission.amount' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        }
      ]),
      
      // Average order value
      Conversion.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            avgOrderValue: { $avg: '$saleAmount' },
            totalRevenue: { $sum: '$saleAmount' },
            totalCommission: { $sum: '$commission.amount' }
          }
        }
      ]),
      
      // Conversion rate
      Click.aggregate([
        {
          $match: {
            affiliate: userId,
            clickedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalClicks: { $sum: 1 },
            convertedClicks: {
              $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
            }
          }
        }
      ]),
      
      // Sales by day of week
      Conversion.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dayOfWeek: '$convertedAt' },
            count: { $sum: 1 },
            revenue: { $sum: '$saleAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);
    
    const avgOrderValueData = averageOrderValue[0] || { avgOrderValue: 0, totalRevenue: 0, totalCommission: 0 };
    const clickData = conversionRate[0] || { totalClicks: 0, convertedClicks: 0 };
    const conversionRateValue = clickData.totalClicks > 0 
      ? (clickData.convertedClicks / clickData.totalClicks * 100).toFixed(2) 
      : 0;
    
    res.status(200).json({
      success: true,
      conversions: {
        total: totalConversions,
        byStatus,
        byProduct,
        averageOrderValue: avgOrderValueData.avgOrderValue,
        totalRevenue: avgOrderValueData.totalRevenue,
        totalCommission: avgOrderValueData.totalCommission,
        conversionRate: conversionRateValue,
        totalClicks: clickData.totalClicks,
        salesByDay
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_conversions', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get traffic analytics
// @route   GET /api/analytics/traffic
// @access  Private
// ============================================
exports.getTrafficAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const matchStage = {
      affiliate: userId,
      clickedAt: { $gte: startDate, $lte: endDate }
    };
    
    const [
      totalClicks,
      uniqueVisitors,
      bySource,
      byDevice,
      byBrowser,
      byCountry,
      hourlyDistribution,
      dailyDistribution
    ] = await Promise.all([
      // Total clicks
      Click.countDocuments(matchStage),
      
      // Unique visitors
      Click.distinct('ipAddress', matchStage).then(ips => ips.length),
      
      // Clicks by source/referrer
      Click.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$referrer',
            count: { $sum: 1 },
            unique: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            uniqueVisitors: { $size: '$unique' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Clicks by device
      Click.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$device',
            count: { $sum: 1 },
            unique: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            uniqueVisitors: { $size: '$unique' }
          }
        }
      ]),
      
      // Clicks by browser
      Click.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$browser',
            count: { $sum: 1 },
            unique: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            uniqueVisitors: { $size: '$unique' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Clicks by country
      Click.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$country',
            count: { $sum: 1 },
            unique: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            uniqueVisitors: { $size: '$unique' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Hourly distribution
      Click.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $hour: '$clickedAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      
      // Daily distribution (by day of week)
      Click.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dayOfWeek: '$clickedAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      traffic: {
        totalClicks,
        uniqueVisitors,
        bySource,
        byDevice,
        byBrowser,
        byCountry,
        hourlyDistribution,
        dailyDistribution
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_traffic', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get geographic analytics
// @route   GET /api/analytics/geographic
// @access  Private
// ============================================
exports.getGeographicAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const matchStage = {
      affiliate: userId,
      clickedAt: { $gte: startDate, $lte: endDate }
    };
    
    const geographicData = await Click.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            country: '$country',
            city: '$city',
            region: '$region'
          },
          clicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          conversions: {
            $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          city: '$_id.city',
          region: '$_id.region',
          clicks: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          conversions: 1,
          conversionRate: {
            $cond: [
              { $gt: ['$clicks', 0] },
              { $multiply: [{ $divide: ['$conversions', '$clicks'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { clicks: -1 } }
    ]);
    
    // Group by country for summary
    const byCountry = [];
    const countryMap = new Map();
    
    geographicData.forEach(item => {
      if (!countryMap.has(item.country)) {
        countryMap.set(item.country, {
          clicks: 0,
          uniqueVisitors: 0,
          conversions: 0,
          cities: []
        });
      }
      
      const country = countryMap.get(item.country);
      country.clicks += item.clicks;
      country.uniqueVisitors += item.uniqueVisitors;
      country.conversions += item.conversions;
      country.cities.push({
        city: item.city,
        region: item.region,
        clicks: item.clicks,
        conversions: item.conversions
      });
    });
    
    countryMap.forEach((value, key) => {
      byCountry.push({
        country: key,
        clicks: value.clicks,
        uniqueVisitors: value.uniqueVisitors,
        conversions: value.conversions,
        conversionRate: value.clicks > 0 ? (value.conversions / value.clicks * 100).toFixed(2) : 0,
        cities: value.cities.slice(0, 5)
      });
    });
    
    res.status(200).json({
      success: true,
      geographic: {
        byCountry: byCountry.sort((a, b) => b.clicks - a.clicks),
        detailed: geographicData
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_geographic', { period }, req);
  } catch (error) {
    next(error);
  }
};
// ============================================
// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private
// ============================================
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const matchStage = {
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'approved', 'paid'] },
      isDeleted: false
    };
    
    const [
      totalRevenue,
      revenueByStatus,
      revenueByType,
      monthlyRevenue,
      projectedRevenue,
      pendingPayouts,
      averageCommission
    ] = await Promise.all([
      // Total revenue
      Commission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Revenue by status
      Commission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Revenue by type
      Commission.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Monthly revenue breakdown
      Commission.aggregate([
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
      ]),
      
      // Projected revenue (based on recurring commissions)
      Commission.aggregate([
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
      ]),
      
      // Pending payouts
      Payout.aggregate([
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
      ]),
      
      // Average commission
      Commission.aggregate([
        { $match: { user: userId, isDeleted: false } },
        {
          $group: {
            _id: null,
            avg: { $avg: '$amount' },
            min: { $min: '$amount' },
            max: { $max: '$amount' }
          }
        }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      revenue: {
        total: totalRevenue[0]?.total || 0,
        totalCount: totalRevenue[0]?.count || 0,
        byStatus: revenueByStatus,
        byType: revenueByType,
        monthly: monthlyRevenue,
        projectedMonthly: projectedRevenue[0]?.monthly || 0,
        pendingPayouts: pendingPayouts[0]?.total || 0,
        pendingPayoutsCount: pendingPayouts[0]?.count || 0,
        averageCommission: averageCommission[0] || { avg: 0, min: 0, max: 0 }
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_revenue', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get affiliate performance analytics
// @route   GET /api/analytics/affiliate-performance
// @access  Private (Admin only)
// ============================================
exports.getAffiliatePerformance = async (req, res, next) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const affiliatePerformance = await Affiliate.aggregate([
      {
        $match: {
          createdAt: { $lte: endDate },
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $lookup: {
          from: 'commissions',
          let: { userId: '$user' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', '$$userId'] },
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $in: ['pending', 'approved', 'paid'] }
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
          'userInfo.name': 1,
          'userInfo.email': 1,
          totalEarnings: 1,
          pendingEarnings: 1,
          withdrawnAmount: 1,
          referralCount: 1,
          clickCount: 1,
          conversionRate: 1,
          status: 1,
          periodEarnings: { $sum: '$periodCommissions.amount' },
          periodReferrals: { $size: '$periodReferrals' },
          periodCommissionCount: { $size: '$periodCommissions' }
        }
      },
      { $sort: { periodEarnings: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Calculate totals
    const totals = await Commission.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['pending', 'approved', 'paid'] },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalCommissions: { $sum: 1 },
          uniqueAffiliates: { $addToSet: '$user' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      performance: {
        topAffiliates: affiliatePerformance,
        totals: {
          earnings: totals[0]?.totalEarnings || 0,
          commissions: totals[0]?.totalCommissions || 0,
          activeAffiliates: totals[0]?.uniqueAffiliates?.length || 0
        }
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_affiliate_performance', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get platform overview (Admin)
// @route   GET /api/analytics/platform-overview
// @access  Private (Admin only)
// ============================================
exports.getPlatformOverview = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    const [
      userStats,
      affiliateStats,
      referralStats,
      commissionStats,
      payoutStats,
      clickStats,
      conversionStats,
      revenueStats
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
      
      // Click statistics
      Click.countDocuments({
        clickedAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Conversion statistics
      Conversion.aggregate([
        {
          $match: {
            convertedAt: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: '$saleAmount' },
            commission: { $sum: '$commission.amount' }
          }
        }
      ]),
      
      // Revenue statistics
      Commission.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            byType: {
              $push: {
                type: '$type',
                amount: '$amount'
              }
            }
          }
        }
      ])
    ]);
    
    // Calculate conversion rate
    const totalClicks = clickStats || 0;
    const totalConversions = conversionStats[0]?.count || 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0;
    
    res.status(200).json({
      success: true,
      period: { startDate, endDate },
      overview: {
        users: userStats[0] || { total: 0, active: 0, verified: 0 },
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
        traffic: {
          clicks: totalClicks,
          conversions: totalConversions,
          conversionRate,
          revenue: conversionStats[0]?.revenue || 0,
          commission: conversionStats[0]?.commission || 0
        },
        revenue: revenueStats[0]?.total || 0
      }
    });
    
    // Log activity
    await logActivity(req.user.id, 'view_platform_overview', { period }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Export analytics report
// @route   GET /api/analytics/export
// @access  Private
// ============================================
exports.exportAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'month', format = 'json' } = req.query;
    
    const { startDate, endDate } = getDateRange(period);
    
    // Gather all analytics data
    const [
      clicks,
      conversions,
      commissions,
      referrals,
      payouts
    ] = await Promise.all([
      Click.find({
        affiliate: userId,
        clickedAt: { $gte: startDate, $lte: endDate }
      }).sort('-clickedAt'),
      
      Conversion.find({
        affiliate: userId,
        convertedAt: { $gte: startDate, $lte: endDate }
      }).sort('-convertedAt'),
      
      Commission.find({
        user: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort('-createdAt'),
      
      Referral.find({
        referrer: userId,
        referredAt: { $gte: startDate, $lte: endDate }
      }).populate('referredUser', 'name email'),
      
      Payout.find({
        user: userId,
        requestedAt: { $gte: startDate, $lte: endDate }
      }).sort('-requestedAt')
    ]);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}-${Date.now()}.csv`);
      
      // Write clicks section
      res.write('CLICKS\n');
      res.write('Date,IP Address,Device,Browser,Country,Converted\n');
      clicks.forEach(c => {
        res.write(`${c.clickedAt.toISOString()},${c.ipAddress},${c.device || 'Unknown'},${c.browser || 'Unknown'},${c.country || 'Unknown'},${c.converted}\n`);
      });
      
      res.write('\n');
      
      // Write conversions section
      res.write('CONVERSIONS\n');
      res.write('Date,Amount,Commission,Status,Product\n');
      conversions.forEach(c => {
        res.write(`${c.convertedAt.toISOString()},${c.saleAmount || 0},${c.commission?.amount || 0},${c.status},${c.productName || 'Unknown'}\n`);
      });
      
      res.write('\n');
      
      // Write commissions section
      res.write('COMMISSIONS\n');
      res.write('Date,Amount,Type,Status\n');
      commissions.forEach(c => {
        res.write(`${c.createdAt.toISOString()},${c.amount},${c.type},${c.status}\n`);
      });
      
      res.write('\n');
      
      // Write referrals section
      res.write('REFERRALS\n');
      res.write('Date,Referred User,Status,Commission\n');
      referrals.forEach(r => {
        res.write(`${r.referredAt.toISOString()},${r.referredUser?.name || 'Unknown'},${r.status},${r.commission?.amount || 0}\n`);
      });
      
      res.write('\n');
      
      // Write payouts section
      res.write('PAYOUTS\n');
      res.write('Date,Amount,Status,Method\n');
      payouts.forEach(p => {
        res.write(`${p.requestedAt.toISOString()},${p.amount},${p.status},${p.method?.type || 'Unknown'}\n`);
      });
      
      res.end();
    } else {
      res.status(200).json({
        success: true,
        period: { startDate, endDate },
        data: {
          clicks,
          conversions,
          commissions,
          referrals,
          payouts
        }
      });
    }
    
    // Log activity
    await logActivity(userId, 'export_analytics', { period, format }, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get real-time analytics
// @route   GET /api/analytics/realtime
// @access  Private
// ============================================
exports.getRealtimeAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      clicksLastHour,
      clicksLast24Hours,
      conversionsLastHour,
      conversionsLast24Hours,
      activeUsers,
      topReferrers
    ] = await Promise.all([
      // Clicks in last hour
      Click.countDocuments({
        affiliate: userId,
        clickedAt: { $gte: lastHour }
      }),
      
      // Clicks in last 24 hours
      Click.countDocuments({
        affiliate: userId,
        clickedAt: { $gte: last24Hours }
      }),
      
      // Conversions in last hour
      Conversion.countDocuments({
        affiliate: userId,
        convertedAt: { $gte: lastHour }
      }),
      
      // Conversions in last 24 hours
      Conversion.countDocuments({
        affiliate: userId,
        convertedAt: { $gte: last24Hours }
      }),
      
      // Active users (unique IPs in last 15 minutes)
      Click.distinct('ipAddress', {
        affiliate: userId,
        clickedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      }).then(ips => ips.length),
      
      // Top referrers in last hour
      Click.aggregate([
        {
          $match: {
            affiliate: userId,
            clickedAt: { $gte: lastHour }
          }
        },
        {
          $group: {
            _id: '$referrer',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      realtime: {
        clicks: {
          lastHour: clicksLastHour,
          last24Hours: clicksLast24Hours
        },
        conversions: {
          lastHour: conversionsLastHour,
          last24Hours: conversionsLast24Hours
        },
        activeUsers,
        topReferrers,
        timestamp: new Date()
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_realtime', {}, req);
  } catch (error) {
    next(error);
  }
};

// ============================================
// @desc    Get forecast analytics
// @route   GET /api/analytics/forecast
// @access  Private
// ============================================
exports.getForecastAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { months = 3 } = req.query;
    
    // Get historical monthly data
    const historicalData = await Commission.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ['pending', 'approved', 'paid'] },
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
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Simple forecasting (moving average)
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
        
        // Simple forecast with trend adjustment
        let predictedAmount = last3Avg;
        if (trend === 'up') {
          predictedAmount *= (1 + 0.05 * i);
        } else {
          predictedAmount *= (1 - 0.03 * i);
        }
        
        forecast.push({
          year,
          month,
          predictedAmount: Math.round(predictedAmount * 100) / 100,
          confidence: i === 1 ? 'high' : i === 2 ? 'medium' : 'low'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      forecast: {
        historical: historicalData,
        predicted: forecast,
        confidence: forecast.length > 0 ? 'medium' : 'low',
        basedOn: `${historicalData.length} months of data`
      }
    });
    
    // Log activity
    await logActivity(userId, 'view_forecast', { months }, req);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
