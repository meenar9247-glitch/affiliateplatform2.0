const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // User involved in transaction
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Transaction type
  type: {
    type: String,
    enum: [
      'credit',           // Money added
      'debit',            // Money deducted
      'commission',       // Commission earned
      'referral_bonus',   // Referral bonus
      'withdrawal',       // Withdrawal request
      'payout',           // Payout processed
      'refund',           // Refund issued
      'fee',              // Transaction fee
      'transfer',         // Transfer between wallets
      'exchange',         // Currency exchange
      'bonus',            // Bonus credited
      'penalty',          // Penalty deducted
      'adjustment',       // Manual adjustment
      'reversal'          // Transaction reversal
    ],
    required: true,
    index: true
  },

  // Transaction direction
  direction: {
    type: String,
    enum: ['in', 'out', 'internal'],
    required: true
  },

  // Amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },

  // Balance after transaction
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },

  // Transaction status
  status: {
    type: String,
    enum: [
      'pending',      // Transaction initiated
      'processing',   // Being processed
      'completed',    // Successfully completed
      'failed',       // Failed
      'cancelled',    // Cancelled by user
      'reversed',     // Reversed
      'refunded',     // Refunded
      'expired'       // Expired
    ],
    default: 'pending',
    index: true
  },

  // Source of transaction
  source: {
    type: {
      type: String,
      enum: [
        'commission',
        'referral',
        'withdrawal',
        'payout',
        'bonus',
        'sale',
        'subscription',
        'product',
        'service',
        'adjustment',
        'transfer',
        'exchange',
        'fee',
        'refund',
        'reversal',
        'other'
      ],
      required: true
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'source.model'
    },
    model: {
      type: String,
      enum: [
        'Commission',
        'Referral',
        'Withdrawal',
        'Payout',
        'Order',
        'Subscription',
        'Product',
        'Service',
        'Wallet',
        'User'
      ]
    },
    description: String,
    reference: String,
    metadata: mongoose.Schema.Types.Mixed
  },

  // Destination
  destination: {
    type: {
      type: String,
      enum: ['wallet', 'bank', 'paypal', 'stripe', 'other']
    },
    destinationId: String,
    details: mongoose.Schema.Types.Mixed,
    accountName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    iban: String,
    bankName: String,
    bankAddress: String,
    email: String,
    phone: String
  },

  // Related models
  related: {
    commission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commission'
    },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral'
    },
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout'
    },
    withdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal'
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  },

  // Payment details
  payment: {
    method: {
      type: String,
      enum: [
        'wallet',
        'paypal',
        'stripe',
        'bank_transfer',
        'credit_card',
        'debit_card',
        'crypto',
        'cash',
        'check',
        'other'
      ]
    },
    provider: String,
    transactionId: String,
    reference: String,
    receipt: String,
    proof: String,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    webhookData: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
  },

  // Fee breakdown
  fees: [{
    type: {
      type: String,
      enum: ['processing', 'gateway', 'currency_conversion', 'tax', 'service']
    },
    amount: Number,
    currency: String,
    percentage: Number,
    description: String,
    chargedBy: String
  }],

  // Exchange rate (if currency conversion)
  exchangeRate: {
    rate: Number,
    fromCurrency: String,
    toCurrency: String,
    originalAmount: Number,
    convertedAmount: Number,
    appliedAt: Date
  },

  // Tax information
  tax: {
    amount: Number,
    rate: Number,
    type: String,
    country: String,
    invoiceNumber: String,
    invoiceUrl: String
  },

  // Timeline
  initiatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  reversedAt: Date,
  expiresAt: Date,

  // Expiry
  expiry: {
    duration: Number, // in hours
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'hours'
    },
    notifyBefore: Number, // hours before expiry to notify
    notifiedAt: Date
  },

  // Approval
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String,
    comments: String
  },

  // Processing
  processing: {
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    initiatedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    attempts: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    nextAttempt: Date,
    notes: String
  },

  // Reversal information
  reversal: {
    originalTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    reason: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    initiatedAt: Date,
    completedAt: Date,
    notes: String
  },

  // Notifications
  notifications: {
    userNotified: {
      type: Boolean,
      default: false
    },
    adminNotified: {
      type: Boolean,
      default: false
    },
    notifiedAt: Date,
    notificationChannels: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'push', 'in_app']
      },
      sentAt: Date,
      status: String,
      error: String
    }]
  },

  // History
  history: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    notes: String,
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
  isReversible: {
    type: Boolean,
    default: true
  },
  isTest: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },

  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],

  // Metadata for additional data
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Audit
  audit: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdVia: {
      type: String,
      enum: ['api', 'web', 'mobile', 'admin', 'system', 'cron']
    },
    ipAddress: String,
    userAgent: String,
    sessionId: String
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
transactionSchema.index({ user: 1, type: 1, status: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ 'source.sourceId': 1, 'source.model': 1 });
transactionSchema.index({ 'payment.transactionId': 1 });
transactionSchema.index({ 'payment.reference': 1 });
transactionSchema.index({ status: 1, expiresAt: 1 });
transactionSchema.index({ 'related.commission': 1 });
transactionSchema.index({ 'related.referral': 1 });
transactionSchema.index({ 'related.payout': 1 });
transactionSchema.index({ isActive: 1, isDeleted: 1 });
transactionSchema.index({ 'audit.createdBy': 1 });
transactionSchema.index({ 'audit.ipAddress': 1 });
transactionSchema.index({ tags: 1 });

// Update the updatedAt field on save
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for transaction age
transactionSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.initiatedAt) / (1000 * 60 * 60));
});

// Virtual for processing time
transactionSchema.virtual('processingTime').get(function() {
  if (!this.processedAt) return null;
  return Math.floor((this.processedAt - this.initiatedAt) / (1000 * 60));
});

// Virtual for completion time
transactionSchema.virtual('completionTime').get(function() {
  if (!this.completedAt) return null;
  return Math.floor((this.completedAt - this.initiatedAt) / (1000 * 60));
});

// Virtual for readable status
transactionSchema.virtual('statusText').get(function() {
  const statusMap = {
    'pending': '⏳ Pending',
    'processing': '⚙️ Processing',
    'completed': '✅ Completed',
    'failed': '❌ Failed',
    'cancelled': '🚫 Cancelled',
    'reversed': '↩️ Reversed',
    'refunded': '💸 Refunded',
    'expired': '⌛ Expired'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for transaction type text
transactionSchema.virtual('typeText').get(function() {
  const typeMap = {
    'credit': '💰 Credit',
    'debit': '💳 Debit',
    'commission': '🏆 Commission',
    'referral_bonus': '👥 Referral Bonus',
    'withdrawal': '🏧 Withdrawal',
    'payout': '💵 Payout',
    'refund': '↩️ Refund',
    'fee': '💸 Fee',
    'transfer': '🔄 Transfer',
    'exchange': '💱 Exchange',
    'bonus': '🎁 Bonus',
    'penalty': '⚠️ Penalty',
    'adjustment': '📝 Adjustment',
    'reversal': '↪️ Reversal'
  };
  return typeMap[this.type] || this.type;
});

// Method to complete transaction
transactionSchema.methods.complete = async function(userId, notes = '') {
  this.status = 'completed';
  this.completedAt = Date.now();
  
  this.history.push({
    status: 'completed',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Transaction completed',
    notes
  });
  
  return this.save();
};

// Method to fail transaction
transactionSchema.methods.fail = async function(userId, reason, notes = '') {
  this.status = 'failed';
  this.failedAt = Date.now();
  
  this.history.push({
    status: 'failed',
    changedBy: userId,
    changedAt: Date.now(),
    reason,
    notes
  });
  
  return this.save();
};

// Method to cancel transaction
transactionSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  this.cancelledAt = Date.now();
  
  this.history.push({
    status: 'cancelled',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Transaction cancelled',
    notes: reason
  });
  
  return this.save();
};

// Method to reverse transaction
transactionSchema.methods.reverse = async function(userId, reason, originalTransaction = null) {
  this.status = 'reversed';
  this.reversedAt = Date.now();
  
  if (originalTransaction) {
    this.reversal = {
      originalTransaction,
      reason,
      initiatedBy: userId,
      initiatedAt: Date.now()
    };
  }
  
  this.history.push({
    status: 'reversed',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Transaction reversed',
    notes: reason
  });
  
  return this.save();
};

// Method to process transaction
transactionSchema.methods.process = async function(userId) {
  this.status = 'processing';
  this.processedAt = Date.now();
  this.processing.initiatedBy = userId;
  this.processing.initiatedAt = Date.now();
  this.processing.attempts += 1;
  this.processing.lastAttempt = Date.now();
  
  this.history.push({
    status: 'processing',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Transaction processing started'
  });
  
  return this.save();
};

// Method to add note
transactionSchema.methods.addNote = async function(text, userId, isPrivate = false) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: Date.now(),
    isPrivate
  });
  
  return this.save();
};

// Method to add fee
transactionSchema.methods.addFee = async function(feeData) {
  this.fees.push(feeData);
  return this.save();
};

// Method to check if expired
transactionSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt;
};

// Method to soft delete
transactionSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = async function(userId, options = {}) {
  const query = { user: userId, isDeleted: false };
  
  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;
  if (options.startDate || options.endDate) {
    query.initiatedAt = {};
    if (options.startDate) query.initiatedAt.$gte = options.startDate;
    if (options.endDate) query.initiatedAt.$lte = options.endDate;
  }
  
  return this.find(query)
    .sort({ initiatedAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get transactions by source
transactionSchema.statics.getBySource = async function(sourceId, model) {
  return this.find({
    'source.sourceId': sourceId,
    'source.model': model,
    isDeleted: false
  }).sort({ initiatedAt: -1 });
};

// Static method to get transaction summary
transactionSchema.statics.getSummary = async function(userId = null, period = 'all') {
  const match = { isDeleted: false };
  if (userId) match.user = mongoose.Types.ObjectId(userId);
  
  // Date filtering based on period
  if (period !== 'all') {
    const now = new Date();
    match.initiatedAt = {};
    
    switch(period) {
      case 'today':
        match.initiatedAt.$gte = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        match.initiatedAt.$gte = weekAgo;
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        match.initiatedAt.$gte = monthAgo;
        break;
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        match.initiatedAt.$gte = yearAgo;
        break;
    }
  }
  
  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    }
  ]);
  
  const statusSummary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  const totals = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: { $sum: '$fees.amount' } },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return {
    byType: summary,
    byStatus: statusSummary,
    totals: totals[0] || { totalCount: 0, totalAmount: 0, totalFees: 0, avgAmount: 0 }
  };
};

// Static method to get daily summary
transactionSchema.statics.getDailySummary = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        initiatedAt: { $gte: startDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$initiatedAt' } },
          type: '$type'
        },
        count: { $sum: 1 },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.date': -1 } }
  ]);
};

// Static method to get monthly summary
transactionSchema.statics.getMonthlySummary = async function(year) {
  return this.aggregate([
    {
      $match: {
        initiatedAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: { $month: '$initiatedAt' },
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

// Static method to get transactions by date range
transactionSchema.statics.getByDateRange = async function(startDate, endDate, options = {}) {
  const query = {
    initiatedAt: { $gte: startDate, $lte: endDate },
    isDeleted: false
  };
  
  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;
  if (options.userId) query.user = mongoose.Types.ObjectId(options.userId);
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ initiatedAt: -1 })
    .limit(options.limit || 100);
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = async function() {
  const total = await this.countDocuments({ isDeleted: false });
  const completed = await this.countDocuments({ status: 'completed', isDeleted: false });
  const pending = await this.countDocuments({ status: 'pending', isDeleted: false });
  const failed = await this.countDocuments({ status: 'failed', isDeleted: false });
  
  const volume = await this.aggregate([
    { $match: { status: 'completed', isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const avgTransaction = await this.aggregate([
    { $match: { status: 'completed', isDeleted: false } },
    { $group: { _id: null, avg: { $avg: '$amount' } } }
  ]);
  
  const byType = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        volume: { $sum: '$amount' }
      }
    }
  ]);
  
  return {
    totals: {
      total,
      completed,
      pending,
      failed,
      volume: volume[0]?.total || 0,
      avgTransaction: avgTransaction[0]?.avg || 0
    },
    byType
  };
};

// Static method to create transaction from source
transactionSchema.statics.createFromSource = async function(data) {
  const transaction = new this({
    user: data.user,
    type: data.type,
    direction: data.direction,
    amount: data.amount,
    currency: data.currency || 'USD',
    balanceAfter: data.balanceAfter,
    source: data.source,
    destination: data.destination,
    related: data.related,
    payment: data.payment,
    fees: data.fees || [],
    exchangeRate: data.exchangeRate,
    tax: data.tax,
    initiatedAt: Date.now(),
    status: data.status || 'pending',
    metadata: data.metadata,
    audit: data.audit
  });
  
  // Add to history
  transaction.history.push({
    status: transaction.status,
    changedAt: Date.now(),
    reason: 'Transaction created',
    notes: data.notes
  });
  
  return transaction.save();
};

// Create and export model
const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
