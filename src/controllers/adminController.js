const User = require('../models/User');
const AffiliateLink = require('../models/AffiliateLink');

// =========================================
// Dashboard Stats
// =========================================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAffiliates = await AffiliateLink.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAffiliates,
        message: 'Admin dashboard stats'
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

// =========================================
// Affiliate Link Management
// =========================================
exports.getAllAffiliateLinks = async (req, res, next) => {
  try {
    const links = await AffiliateLink.find();
    res.status(200).json({
      success: true,
      count: links.length,
      data: links
    });
  } catch (error) {
    next(error);
  }
};

exports.createAffiliateLink = async (req, res, next) => {
  try {
    const link = await AffiliateLink.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({
      success: true,
      data: link
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAffiliateLink = async (req, res, next) => {
  try {
    const link = await AffiliateLink.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!link) {
      return res.status(404).json({ message: 'Affiliate link not found' });
    }
    
    res.status(200).json({
      success: true,
      data: link
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAffiliateLink = async (req, res, next) => {
  try {
    const link = await AffiliateLink.findByIdAndDelete(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Affiliate link not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Affiliate link deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
