const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

// =========================================
// Payment Management
// =========================================

// Get all payments/withdrawals
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Withdrawal.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get single payment by ID
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Withdrawal.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Create new withdrawal request
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, method, paymentDetails } = req.body;
    
    // Check if user has sufficient balance
    const user = await User.findById(req.user.id);
    if (user.wallet.balance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient balance' 
      });
    }
    
    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.user.id,
      amount,
      method,
      paymentDetails,
      status: 'pending'
    });
    
    // Deduct from user balance
    user.wallet.balance -= amount;
    user.wallet.pendingEarnings += amount;
    await user.save();
    
    res.status(201).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status (admin only)
exports.updatePayment = async (req, res, next) => {
  try {
    const { status, transactionId } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update status
    withdrawal.status = status || withdrawal.status;
    if (transactionId) withdrawal.transactionId = transactionId;
    
    if (status === 'completed') {
      withdrawal.processedAt = Date.now();
      
      // Update user's pending earnings
      const user = await User.findById(withdrawal.user);
      user.wallet.pendingEarnings -= withdrawal.amount;
      await user.save();
    }
    
    await withdrawal.save();
    
    res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// Delete/cancel payment request
exports.deletePayment = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Only allow cancellation if still pending
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot cancel processed payment' 
      });
    }
    
    // Refund to user balance
    const user = await User.findById(withdrawal.user);
    user.wallet.balance += withdrawal.amount;
    user.wallet.pendingEarnings -= withdrawal.amount;
    await user.save();
    
    await withdrawal.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Payment request cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user's payment history
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Withdrawal.find({ user: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get pending withdrawals (admin only)
exports.getPendingWithdrawals = async (req, res, next) => {
  try {
    const pending = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending
    });
  } catch (error) {
    next(error);
  }
};

// Process withdrawal (admin only)
exports.processWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    withdrawal.status = 'processing';
    await withdrawal.save();
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal is being processed',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// Complete withdrawal (admin only)
exports.completeWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    withdrawal.status = 'completed';
    withdrawal.processedAt = Date.now();
    withdrawal.transactionId = req.body.transactionId;
    await withdrawal.save();
    
    // Update user's pending earnings
    const user = await User.findById(withdrawal.user);
    user.wallet.pendingEarnings -= withdrawal.amount;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal completed successfully',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// Reject withdrawal (admin only)
exports.rejectWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }
    
    withdrawal.status = 'rejected';
    await withdrawal.save();
    
    // Refund to user
    const user = await User.findById(withdrawal.user);
    user.wallet.balance += withdrawal.amount;
    user.wallet.pendingEarnings -= withdrawal.amount;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected and refunded',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res, next) => {
  try {
    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const completedWithdrawals = await Withdrawal.countDocuments({ status: 'completed' });
    
    const totalAmount = await Withdrawal.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalWithdrawals,
        pendingWithdrawals,
        completedWithdrawals,
        totalPaid: totalAmount[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
