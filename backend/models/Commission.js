const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  // User who earns commission
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Referral associated with this commission
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    index: true
  },

  // Commission details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Commission type
  type: {
    type: String,
    enum: [
      'direct',           // Direct referral commission
      'indirect',         // Indirect referral (MLM)
      'bonus',            // Special bonus
      'performance',      // Performance based
      'monthly',          // Monthly payout
      'quarterly',        // Quarterly payout
      'annual',           // Annual payout
      'signup',           // Signup bonus
      'sale',             // Sale commission
      'subscription',     // Subscription commission
      'recurring'         // Recurring commission
    ],
    required: true,
    default: 'direct'
  },

  // Source of commission
  source: {
    type: {
      type: String,
      enum: [
        'product_sale',
        'subscription',
        'service',
        'course',
        'membership',
        'referral_bonus',
        'performance_bonus'
      ]
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'source.model'
    },
    model: {
      type: String,
      enum: ['Product', 'Order', 'Subscription', 'Course']
    },
    description: String
  },

  // Commission status
  status: {
    type: String,
    enum: [
      'pending',      // Awaiting approval/processing
      'approved',     // Approved but not paid
      'processing',   // Being processed for payment
      'paid',         // Successfully paid
      'cancelled',    // Cancelled
      'refunded',     // Refunded
      'held',         // Held for review
      'rejected'      // Rejected
    ],
    default: 'pending',
    index: true
  },

  // Payment details
  payment: {
    method: {
      type: String,
      enum: ['paypal', 'bank_transfer', 'stripe', 'wallet', 'other']
    },
    transactionId: String,
    reference: String,
    paidAt: Date,
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout'
    },
    fees: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      min: 0
    }
  },

  // Tier information (for MLM)
  tier: {
    level: {
      type: Number,
      min: 1,
      max: 10
    },
    name: String,
    percentage: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Time periods
  period: {
    startDate: Date,
    endDate: Date,
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
    }
  },

  // Transaction details
  transaction: {
    id: String,
    date: Date,
    amount: Number,
    currency: String,
    customerEmail: String,
    customerName: String,
    productName: String,
    orderId: String
  },

  // Approval process
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
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

  // Calculations
  calculations: {
    baseAmount: Number,
    bonusAmount: Number,
    deductionAmount: Number,
    taxAmount: Number,
    netAmount: Number,
    exchangeRate: Number,
    convertedCurrency: String,
    convertedAmount: Number
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
    notes: String
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
  isTaxable: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  recurringEndDate: Date,

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
commissionSchema.index({ user: 1, status: 1, createdAt: -1 });
commissionSchema.index({ user: 1, type: 1, status: 1 });
commissionSchema.index({ 'payment.paidAt': 1 });
commissionSchema.index({ period: 1 });
commissionSchema.index({ source: 1 });
commissionSchema.index({ isActive: 1, isDeleted: 1 });
commissionSchema.index({ 'payment.payoutId': 1 });

// Update the updatedAt field on save
commissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for commission age
commissionSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since created
commissionSchema.virtual('daysSinceCreated').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for readable status
commissionSchema.virtual('statusText').get(function() {
  const statusMap = {
    'pending': '⏳ Pending',
    'approved': '✅ Approved',
    'processing': '⚙️ Processing',
    'paid': '💰 Paid',
    'cancelled': '❌ Cancelled',
    'refunded': '↩️ Refunded',
    'held': '⏸️ Held',
    'rejected': '🚫 Rejected'
  };
  return statusMap[this.status] || this.status;
});

// Method to approve commission
commissionSchema.methods.approve = async function(userId, comments = '') {
  this.status = 'approved';
  this.approval.status = 'approved';
  this.approval.approvedBy = userId;
  this.approval.approvedAt = Date.now();
  this.approval.comments = comments;
  
  this.history.push({
    status: 'approved',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Commission approved',
    notes: comments
  });
  
  return this.save();
};

// Method to reject commission
commissionSchema.methods.reject = async function(userId, reason) {
  this.status = 'rejected';
  this.approval.status = 'rejected';
  this.approval.rejectedBy = userId;
  this.approval.rejectedAt = Date.now();
  this.approval.rejectionReason = reason;
  
  this.history.push({
    status: 'rejected',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Commission rejected',
    notes: reason
  });
  
  return this.save();
};

// Method to mark as paid
commissionSchema.methods.markPaid = async function(paymentData = {}) {
  this.status = 'paid';
  this.payment.method = paymentData.method || this.payment.method;
  this.payment.transactionId = paymentData.transactionId;
  this.payment.reference = paymentData.reference;
  this.payment.paidAt = Date.now();
  this.payment.fees = paymentData.fees || 0;
  this.payment.netAmount = this.amount - (paymentData.fees || 0);
  
  if (paymentData.payoutId) {
    this.payment.payoutId = paymentData.payoutId;
  }
  
  this.history.push({
    status: 'paid',
    changedAt: Date.now(),
    reason: 'Commission paid'
  });
  
  return this.save();
};

// Method to cancel commission
commissionSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  
  this.history.push({
    status: 'cancelled',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Commission cancelled',
    notes: reason
  });
  
  return this.save();
};

// Method to refund commission
commissionSchema.methods.refund = async function(userId, reason) {
  this.status = 'refunded';
  
  this.history.push({
    status: 'refunded',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Commission refunded',
    notes: reason
  });
  
  return this.save();
};

// Method to hold commission
commissionSchema.methods.hold = async function(userId, reason) {
  this.status = 'held';
  
  this.history.push({
    status: 'held',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Commission held',
    notes: reason
  });
  
  return this.save();
};

// Method to add note
commissionSchema.methods.addNote = async function(text, userId, isPrivate = false) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: Date.now(),
    isPrivate
  });
  
  return this.save();
};

// Method to calculate net amount
commissionSchema.methods.calculateNet = function(fees = 0, tax = 0) {
  this.calculations = {
    baseAmount: this.amount,
    deductionAmount: fees + tax,
    taxAmount: tax,
    netAmount: this.amount - fees - tax
  };
  
  return this.calculations.netAmount;
};

// Method to soft delete
commissionSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Static method to get pending commissions count
commissionSchema.statics.getPendingCount = async function(userId = null) {
  const query = { status: 'pending', isDeleted: false };
  if (userId) query.user = userId;
  return this.countDocuments(query);
};

// Static method to get total approved amount
commissionSchema.statics.getTotalApproved = async function(userId = null) {
  const query = { 
    status: { $in: ['approved', 'processing', 'paid'] },
    isDeleted: false
  };
  if (userId) query.user = userId;
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get total paid amount
commissionSchema.statics.getTotalPaid = async function(userId = null) {
  const query = { status: 'paid', isDeleted: false };
  if (userId) query.user = userId;
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get total pending amount
commissionSchema.statics.getTotalPending = async function(userId = null) {
  const query = { status: 'pending', isDeleted: false };
  if (userId) query.user = userId;
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get commissions by date range
commissionSchema.statics.getByDateRange = async function(startDate, endDate, userId = null) {
  const query = {
    createdAt: { $gte: startDate, $lte: endDate },
    isDeleted: false
  };
  if (userId) query.user = userId;
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get commission summary
commissionSchema.statics.getSummary = async function(userId = null) {
  const match = { isDeleted: false };
  if (userId) match.user = mongoose.Types.ObjectId(userId);
  
  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        minAmount: { $min: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    }
  ]);
  
  const total = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return {
    byStatus: summary,
    total: total[0] || { totalCount: 0, totalAmount: 0, averageAmount: 0 }
  };
};

// Static method to get commissions by type
commissionSchema.statics.getByType = async function(userId = null) {
  const match = { isDeleted: false };
  if (userId) match.user = mongoose.Types.ObjectId(userId);
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        total: { $sum: '$amount' }
      }
    }
  ]);
};

// Static method to get monthly summary
commissionSchema.statics.getMonthlySummary = async function(year, userId = null) {
  const match = {
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`)
    },
    isDeleted: false
  };
  if (userId) match.user = mongoose.Types.ObjectId(userId);
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        paid: {
          $sum: {
            $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
          }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

// Create and export model
const Commission = mongoose.model('Commission', commissionSchema);
module.exports = Commission;
