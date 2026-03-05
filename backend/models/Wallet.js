const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  // User who owns this wallet
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Wallet balance
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },

  // Wallet status
  status: {
    type: String,
    enum: ['active', 'suspended', 'blocked', 'closed'],
    default: 'active',
    index: true
  },

  // Wallet type
  type: {
    type: String,
    enum: [
      'main',           // Main wallet
      'commission',     // Commission earnings
      'bonus',          // Bonus earnings
      'referral',       // Referral earnings
      'withdrawal',     // Withdrawal wallet
      'hold',           // Hold funds
      'escrow'          // Escrow wallet
    ],
    default: 'main'
  },

  // Lifetime statistics
  lifetime: {
    totalCredited: {
      type: Number,
      default: 0
    },
    totalDebited: {
      type: Number,
      default: 0
    },
    totalCommission: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    },
    totalBonus: {
      type: Number,
      default: 0
    },
    totalReferralEarnings: {
      type: Number,
      default: 0
    },
    transactionCount: {
      type: Number,
      default: 0
    }
  },

  // Monthly statistics
  monthly: {
    currentMonthEarnings: {
      type: Number,
      default: 0
    },
    lastMonthEarnings: {
      type: Number,
      default: 0
    },
    currentMonthWithdrawals: {
      type: Number,
      default: 0
    },
    lastMonthWithdrawals: {
      type: Number,
      default: 0
    },
    bestMonth: {
      amount: Number,
      month: Date,
      description: String
    }
  },

  // Daily statistics
  daily: {
    todayEarnings: {
      type: Number,
      default: 0
    },
    yesterdayEarnings: {
      type: Number,
      default: 0
    },
    todayWithdrawals: {
      type: Number,
      default: 0
    },
    yesterdayWithdrawals: {
      type: Number,
      default: 0
    },
    bestDay: {
      amount: Number,
      date: Date,
      description: String
    }
  },

  // Withdrawal limits
  withdrawalLimits: {
    minAmount: {
      type: Number,
      default: 10
    },
    maxAmount: {
      type: Number,
      default: 10000
    },
    dailyLimit: {
      type: Number,
      default: 5000
    },
    weeklyLimit: {
      type: Number,
      default: 15000
    },
    monthlyLimit: {
      type: Number,
      default: 50000
    },
    remainingDaily: {
      type: Number,
      default: 5000
    },
    remainingWeekly: {
      type: Number,
      default: 15000
    },
    remainingMonthly: {
      type: Number,
      default: 50000
    },
    lastWithdrawalDate: Date,
    lastWithdrawalAmount: Number
  },

  // Hold funds (pending)
  holdBalance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Available balance (balance - holdBalance)
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Pending balance (waiting for approval)
  pendingBalance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Locked balance (under review)
  lockedBalance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Last transaction
  lastTransaction: {
    type: {
      type: String,
      enum: ['credit', 'debit', 'hold', 'release', 'lock', 'unlock']
    },
    amount: Number,
    description: String,
    reference: String,
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    at: Date
  },

  // Wallet settings
  settings: {
    autoWithdrawal: {
      enabled: {
        type: Boolean,
        default: false
      },
      threshold: {
        type: Number,
        default: 100
      },
      method: String,
      schedule: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      }
    },
    notifications: {
      onCredit: {
        type: Boolean,
        default: true
      },
      onDebit: {
        type: Boolean,
        default: true
      },
      onWithdrawal: {
        type: Boolean,
        default: true
      },
      onLowBalance: {
        type: Boolean,
        default: true,
        threshold: {
          type: Number,
          default: 10
        }
      }
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Security
  security: {
    twoFactorRequired: {
      type: Boolean,
      default: false
    },
    withdrawalWhitelist: [{
      address: String,
      method: String,
      verified: {
        type: Boolean,
        default: false
      },
      addedAt: Date
    }],
    dailyWithdrawalCount: {
      type: Number,
      default: 0
    },
    weeklyWithdrawalCount: {
      type: Number,
      default: 0
    },
    monthlyWithdrawalCount: {
      type: Number,
      default: 0
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    lastFailedAttempt: Date,
    blockedUntil: Date
  },

  // Verification
  verification: {
    level: {
      type: String,
      enum: ['unverified', 'basic', 'advanced', 'pro'],
      default: 'unverified'
    },
    documents: [{
      type: String,
      url: String,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    verifiedAt: Date,
    expiresAt: Date
  },

  // History
  history: [{
    action: {
      type: String,
      enum: [
        'created',
        'credited',
        'debited',
        'held',
        'released',
        'locked',
        'unlocked',
        'withdrawn',
        'limit_changed',
        'status_changed',
        'verified',
        'blocked',
        'unblocked'
      ]
    },
    amount: Number,
    balance: Number,
    reference: String,
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  }],

  // Notes
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],

  // Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  frozenReason: String,
  frozenAt: Date,
  frozenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
walletSchema.index({ user: 1, status: 1 });
walletSchema.index({ balance: -1 });
walletSchema.index({ 'withdrawalLimits.remainingDaily': 1 });
walletSchema.index({ isActive: 1, isDeleted: 1 });
walletSchema.index({ 'security.blockedUntil': 1 });

// Update the updatedAt field on save
walletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate available balance
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  next();
});

// Virtual for total balance
walletSchema.virtual('totalBalance').get(function() {
  return this.balance;
});

// Virtual for usable balance
walletSchema.virtual('usableBalance').get(function() {
  return this.balance - this.holdBalance - this.lockedBalance - this.pendingBalance;
});

// Virtual for percentage used
walletSchema.virtual('percentageUsed').get(function() {
  if (this.balance === 0) return 0;
  return ((this.holdBalance + this.lockedBalance) / this.balance) * 100;
});

// Virtual for days since last transaction
walletSchema.virtual('daysSinceLastTransaction').get(function() {
  if (!this.lastTransaction?.at) return null;
  return Math.floor((Date.now() - this.lastTransaction.at) / (1000 * 60 * 60 * 24));
});

// Method to credit wallet
walletSchema.methods.credit = async function(amount, description = '', options = {}) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  this.balance += amount;
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  // Update lifetime stats
  this.lifetime.totalCredited += amount;
  this.lifetime.transactionCount += 1;
  
  // Update daily/monthly stats
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  
  if (this.lastTransaction?.at && new Date(this.lastTransaction.at).setHours(0, 0, 0, 0) === today) {
    this.daily.todayEarnings += amount;
  } else {
    this.daily.yesterdayEarnings = this.daily.todayEarnings;
    this.daily.todayEarnings = amount;
  }
  
  if (this.lastTransaction?.at && 
      new Date(this.lastTransaction.at).getMonth() === now.getMonth() &&
      new Date(this.lastTransaction.at).getFullYear() === now.getFullYear()) {
    this.monthly.currentMonthEarnings += amount;
  } else {
    this.monthly.lastMonthEarnings = this.monthly.currentMonthEarnings;
    this.monthly.currentMonthEarnings = amount;
  }
  
  // Update best day/month
  if (amount > (this.daily.bestDay?.amount || 0)) {
    this.daily.bestDay = {
      amount,
      date: new Date(),
      description
    };
  }
  
  if (amount > (this.monthly.bestMonth?.amount || 0)) {
    this.monthly.bestMonth = {
      amount,
      month: new Date(),
      description
    };
  }
  
  // Add to history
  this.history.push({
    action: 'credited',
    amount,
    balance: this.balance,
    reference: options.reference,
    transactionId: options.transactionId,
    performedBy: options.performedBy,
    performedAt: Date.now(),
    description,
    metadata: options.metadata
  });
  
  // Update last transaction
  this.lastTransaction = {
    type: 'credit',
    amount,
    description,
    reference: options.reference,
    transactionId: options.transactionId,
    at: Date.now()
  };
  
  return this.save();
};

// Method to debit wallet
walletSchema.methods.debit = async function(amount, description = '', options = {}) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const available = this.balance - this.holdBalance - this.lockedBalance;
  if (amount > available) {
    throw new Error('Insufficient available balance');
  }
  
  this.balance -= amount;
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  // Update lifetime stats
  this.lifetime.totalDebited += amount;
  this.lifetime.transactionCount += 1;
  
  // Update daily/monthly stats
  const now = new Date();
  
  if (this.lastTransaction?.at && 
      new Date(this.lastTransaction.at).getMonth() === now.getMonth() &&
      new Date(this.lastTransaction.at).getFullYear() === now.getFullYear()) {
    this.monthly.currentMonthWithdrawals += amount;
  } else {
    this.monthly.lastMonthWithdrawals = this.monthly.currentMonthWithdrawals;
    this.monthly.currentMonthWithdrawals = amount;
  }
  
  // Update withdrawal counts
  this.security.dailyWithdrawalCount += 1;
  this.security.weeklyWithdrawalCount += 1;
  this.security.monthlyWithdrawalCount += 1;
  
  // Update withdrawal limits
  this.withdrawalLimits.remainingDaily -= amount;
  this.withdrawalLimits.remainingWeekly -= amount;
  this.withdrawalLimits.remainingMonthly -= amount;
  this.withdrawalLimits.lastWithdrawalDate = Date.now();
  this.withdrawalLimits.lastWithdrawalAmount = amount;
  
  // Add to history
  this.history.push({
    action: 'debited',
    amount,
    balance: this.balance,
    reference: options.reference,
    transactionId: options.transactionId,
    performedBy: options.performedBy,
    performedAt: Date.now(),
    description,
    metadata: options.metadata
  });
  
  // Update last transaction
  this.lastTransaction = {
    type: 'debit',
    amount,
    description,
    reference: options.reference,
    transactionId: options.transactionId,
    at: Date.now()
  };
  
  return this.save();
};

// Method to hold amount
walletSchema.methods.hold = async function(amount, description = '', options = {}) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const available = this.balance - this.holdBalance - this.lockedBalance;
  if (amount > available) {
    throw new Error('Insufficient available balance');
  }
  
  this.holdBalance += amount;
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  // Add to history
  this.history.push({
    action: 'held',
    amount,
    balance: this.balance,
    reference: options.reference,
    transactionId: options.transactionId,
    performedBy: options.performedBy,
    performedAt: Date.now(),
    description,
    metadata: options.metadata
  });
  
  return this.save();
};

// Method to release hold
walletSchema.methods.releaseHold = async function(amount, description = '', options = {}) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (amount > this.holdBalance) {
    throw new Error('Insufficient hold balance');
  }
  
  this.holdBalance -= amount;
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  // Add to history
  this.history.push({
    action: 'released',
    amount,
    balance: this.balance,
    reference: options.reference,
    transactionId: options.transactionId,
    performedBy: options.performedBy,
    performedAt: Date.now(),
    description,
    metadata: options.metadata
  });
  
  return this.save();
};

// Method to lock amount
walletSchema.methods.lock = async function(amount, description = '', options = {}) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  const available = this.balance - this.holdBalance - this.lockedBalance;
  if (amount > available) {
    throw new Error('Insufficient available balance');
  }
  
  this.lockedBalance += amount;
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  // Add to history
  this.history.push({
    action: 'locked',
    amount,
    balance: this.balance,
    reference: options.reference,
    transactionId: options.transactionId,
    performedBy: options.performedBy,
    performedAt: Date.now(),
    description,
    metadata: options.metadata
  });
  
  return this.save();
};

// Method to unlock amount
walletSchema.methods.unlock = async function(amount, description = '', options = {}) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  
  if (amount > this.lockedBalance) {
    throw new Error('Insufficient locked balance');
  }
  
  this.lockedBalance -= amount;
  this.availableBalance = this.balance - this.holdBalance - this.lockedBalance;
  
  // Add to history
  this.history.push({
    action: 'unlocked',
    amount,
    balance: this.balance,
    reference: options.reference,
    transactionId: options.transactionId,
    performedBy: options.performedBy,
    performedAt: Date.now(),
    description,
    metadata: options.metadata
  });
  
  return this.save();
};

// Method to freeze wallet
walletSchema.methods.freeze = async function(reason, userId) {
  this.isFrozen = true;
  this.frozenReason = reason;
  this.frozenAt = Date.now();
  this.frozenBy = userId;
  this.status = 'suspended';
  
  this.history.push({
    action: 'frozen',
    performedBy: userId,
    performedAt: Date.now(),
    description: `Wallet frozen: ${reason}`
  });
  
  return this.save();
};

// Method to unfreeze wallet
walletSchema.methods.unfreeze = async function(userId) {
  this.isFrozen = false;
  this.frozenReason = null;
  this.frozenAt = null;
  this.frozenBy = null;
  this.status = 'active';
  
  this.history.push({
    action: 'unfrozen',
    performedBy: userId,
    performedAt: Date.now(),
    description: 'Wallet unfrozen'
  });
  
  return this.save();
};

// Method to check withdrawal limit
walletSchema.methods.checkWithdrawalLimit = function(amount) {
  if (amount < this.withdrawalLimits.minAmount) {
    return { allowed: false, reason: `Minimum withdrawal amount is ${this.withdrawalLimits.minAmount}` };
  }
  
  if (amount > this.withdrawalLimits.maxAmount) {
    return { allowed: false, reason: `Maximum withdrawal amount is ${this.withdrawalLimits.maxAmount}` };
  }
  
  if (amount > this.withdrawalLimits.remainingDaily) {
    return { allowed: false, reason: 'Daily withdrawal limit exceeded' };
  }
  
  if (amount > this.withdrawalLimits.remainingWeekly) {
    return { allowed: false, reason: 'Weekly withdrawal limit exceeded' };
  }
  
  if (amount > this.withdrawalLimits.remainingMonthly) {
    return { allowed: false, reason: 'Monthly withdrawal limit exceeded' };
  }
  
  return { allowed: true };
};

// Method to add to whitelist
walletSchema.methods.addToWhitelist = async function(address, method) {
  this.security.withdrawalWhitelist.push({
    address,
    method,
    verified: false,
    addedAt: Date.now()
  });
  
  return this.save();
};

// Method to verify whitelist address
walletSchema.methods.verifyWhitelistAddress = async function(address) {
  const entry = this.security.withdrawalWhitelist.find(w => w.address === address);
  if (entry) {
    entry.verified = true;
  }
  
  return this.save();
};

// Method to add note
walletSchema.methods.addNote = async function(text, userId, isPrivate = false) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: Date.now(),
    isPrivate
  });
  
  return this.save();
};

// Method to soft delete
walletSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Static method to create wallet for new user
walletSchema.statics.createForUser = async function(userId, options = {}) {
  const wallet = new this({
    user: userId,
    currency: options.currency || 'USD',
    type: options.type || 'main',
    settings: options.settings || {}
  });
  
  await wallet.save();
  
  // Add creation to history
  wallet.history.push({
    action: 'created',
    performedBy: userId,
    performedAt: Date.now(),
    description: 'Wallet created'
  });
  
  return wallet.save();
};

// Static method to get user wallet
walletSchema.statics.getUserWallet = async function(userId) {
  return this.findOne({ user: userId, isDeleted: false });
};

// Static method to get wallets with low balance
walletSchema.statics.getLowBalanceWallets = async function(threshold) {
  return this.find({
    balance: { $lt: threshold },
    isActive: true,
    isDeleted: false
  }).populate('user', 'name email');
};

// Static method to get wallets by status
walletSchema.statics.getByStatus = async function(status) {
  return this.find({ status, isDeleted: false })
    .populate('user', 'name email');
};

// Static method to get total balance
walletSchema.statics.getTotalBalance = async function() {
  const result = await this.aggregate([
    { $match: { isDeleted: false, isActive: true } },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get total held balance
walletSchema.statics.getTotalHeld = async function() {
  const result = await this.aggregate([
    { $match: { isDeleted: false, isActive: true } },
    { $group: { _id: null, total: { $sum: '$holdBalance' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get wallet statistics
walletSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBalance: { $sum: '$balance' },
        totalHold: { $sum: '$holdBalance' },
        totalLocked: { $sum: '$lockedBalance' },
        avgBalance: { $avg: '$balance' },
        minBalance: { $min: '$balance' },
        maxBalance: { $max: '$balance' }
      }
    }
  ]);
  
  const totals = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        globalBalance: { $sum: '$balance' },
        globalHold: { $sum: '$holdBalance' },
        globalLocked: { $sum: '$lockedBalance' },
        avgBalance: { $avg: '$balance' },
        walletsWithBalance: {
          $sum: { $cond: [{ $gt: ['$balance', 0] }, 1, 0] }
        },
        walletsWithZeroBalance: {
          $sum: { $cond: [{ $eq: ['$balance', 0] }, 1, 0] }
        }
      }
    }
  ]);
  
  return {
    byStatus: stats,
    totals: totals[0] || {}
  };
};

// Static method to reset daily limits
walletSchema.statics.resetDailyLimits = async function() {
  return this.updateMany(
    {},
    {
      $set: {
        'withdrawalLimits.remainingDaily': '$withdrawalLimits.dailyLimit',
        'security.dailyWithdrawalCount': 0
      }
    }
  );
};

// Static method to reset weekly limits
walletSchema.statics.resetWeeklyLimits = async function() {
  return this.updateMany(
    {},
    {
      $set: {
        'withdrawalLimits.remainingWeekly': '$withdrawalLimits.weeklyLimit',
        'security.weeklyWithdrawalCount': 0
      }
    }
  );
};

// Static method to reset monthly limits
walletSchema.statics.resetMonthlyLimits = async function() {
  return this.updateMany(
    {},
    {
      $set: {
        'withdrawalLimits.remainingMonthly': '$withdrawalLimits.monthlyLimit',
        'security.monthlyWithdrawalCount': 0
      }
    }
  );
};

// Create and export model
const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
