const User = require('../models/User');
const AffiliateLink = require('../models/AffiliateLink');

// =========================================
// Dashboard Stats
// =========================================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAffiliates = await AffiliateLink.countDocuments();
    const totalWithdrawals = 0; // Placeholder
    const totalCommissions = 0; // Placeholder
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAffiliates,
        totalWithdrawals,
        totalCommissions
      }
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// User Management
// =========================================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Alias for getAllUsers (for compatibility)
exports.getUsers = exports.getAllUsers;

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// Affiliate Management
// =========================================
exports.getAllAffiliateLinks = async (req, res, next) => {
  try {
    const links = await AffiliateLink.find().populate('createdBy', 'name email');
    res.status(200).json({
      success: true,
      count: links.length,
      data: links
    });
  } catch (error) {
    next(error);
  }
};

// Alias for getAllAffiliateLinks
exports.getAllAffiliates = exports.getAllAffiliateLinks;

exports.approveAffiliate = async (req, res, next) => {
  try {
    const link = await AffiliateLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Affiliate link not found' });
    }
    
    link.isActive = true;
    await link.save();
    
    res.status(200).json({
      success: true,
      message: 'Affiliate link approved successfully',
      data: link
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectAffiliate = async (req, res, next) => {
  try {
    const link = await AffiliateLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Affiliate link not found' });
    }
    
    link.isActive = false;
    await link.save();
    
    res.status(200).json({
      success: true,
      message: 'Affiliate link rejected',
      data: link
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// Withdrawal Management (Placeholders)
// =========================================
exports.getWithdrawals = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Withdrawals endpoint - to be implemented',
    data: []
  });
};

exports.getPendingWithdrawals = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Pending withdrawals - to be implemented',
    data: []
  });
};

exports.processWithdrawal = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Processing withdrawal ${req.params.id} - to be implemented`
  });
};

exports.completeWithdrawal = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Completed withdrawal ${req.params.id} - to be implemented`
  });
};

exports.rejectWithdrawal = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Rejected withdrawal ${req.params.id} - to be implemented`
  });
};

// =========================================
// Commission Management (Placeholders)
// =========================================
exports.getCommissions = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Commissions endpoint - to be implemented',
    data: []
  });
};

exports.updateCommissionSettings = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Commission settings updated - to be implemented'
  });
};

exports.getPendingCommissions = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Pending commissions - to be implemented',
    data: []
  });
};

exports.approveCommission = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Approved commission ${req.params.id} - to be implemented`
  });
};

// =========================================
// System Settings (Placeholders)
// =========================================
exports.getSettings = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      siteName: 'Affiliate Platform',
      currency: 'USD',
      minWithdrawal: 10
    }
  });
};

exports.updateSettings = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Settings updated - to be implemented'
  });
};

// =========================================
// Reports (Placeholders)
// =========================================
exports.getEarningsReport = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Earnings report - to be implemented',
    data: []
  });
};

exports.getUsersReport = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Users report - to be implemented',
    data: []
  });
};

exports.getConversionsReport = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Conversions report - to be implemented',
    data: []
  });
};

exports.exportData = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Exporting ${req.params.type} data - to be implemented`
  });
};

// =========================================
// Analytics (Placeholders)
// =========================================
exports.getAnalyticsOverview = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      totalUsers: 0,
      totalAffiliates: 0,
      totalEarnings: 0,
      totalClicks: 0
    }
  });
};

exports.getChartData = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [0, 0, 0]
    }
  });
};

// =========================================
// Admin Management (Placeholders)
// =========================================
exports.createAdmin = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Create admin endpoint - to be implemented'
  });
};

exports.getAdmins = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: []
  });
};

exports.removeAdmin = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `Removed admin ${req.params.id} - to be implemented`
  });
};
