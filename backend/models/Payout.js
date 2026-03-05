const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  // User requesting payout
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Payout details
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
  
  // Payout method
  method: {
    type: {
      type: String,
      enum: [
        'paypal',
        'bank_transfer',
        'stripe',
        'payoneer',
        'wise',
        'crypto',
        'wallet',
        'check',
        'cash'
      ],
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    accountName: String,
    accountEmail: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    iban: String,
    bankName: String,
    bankAddress: String,
    walletAddress: String,
    cryptoCurrency: String
  },

  // Payout status
  status: {
    type: String,
    enum: [
      'pending',        // Waiting for approval
      'approved',       // Approved by admin
      'processing',     // Being processed
      'completed',      // Successfully paid
      'failed',         // Failed
      'cancelled',      // Cancelled by user
      'rejected',       // Rejected by admin
      'on_hold',        // Held for review
      'refunded'        // Refunded
    ],
    default: 'pending',
    index: true
  },

  // Commissions included in this payout
  commissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commission',
    required: true
  }],

  // Payout summary
  summary: {
    totalCommissions: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    fees: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    },
    commissionIds: [String],
    dateRange: {
      start: Date,
      end: Date
    }
  },

  // Transaction details
  transaction: {
    id: String,
    reference: String,
    externalId: String,
    receipt: String,
    proof: String,
    initiatedAt: Date,
    completedAt: Date,
    failedAt: Date,
    failureReason: String,
    estimatedArrival: Date,
    trackingNumber: String,
    metadata: mongoose.Schema.Types.Mixed
  },

  // Fee breakdown
  fees: [{
    type: {
      type: String,
      enum: ['processing', 'transfer', 'currency_conversion', 'tax', 'service']
    },
    amount: Number,
    currency: String,
    description: String
  }],

  // Exchange rate (if currency conversion)
  exchangeRate: {
    rate: Number,
    fromCurrency: String,
    toCurrency: String,
    convertedAmount: Number,
    appliedAt: Date
  },

  // Approval process
  approval: {
    required: {
      type: Boolean,
      default: true
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
    notes: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  },

  // Timeline
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date,
  completedAt: Date,
  expectedDate: Date,

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
    notifiedAt: Date
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
  isAutoProcessed: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly']
  },
  nextPayoutDate: Date,

  // Risk assessment
  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    flags: [String],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String
  },

  // Compliance
  compliance: {
    kycVerified: {
      type: Boolean,
      default: false
    },
    taxInfoVerified: {
      type: Boolean,
      default: false
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
    notes: String
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
payoutSchema.index({ user: 1, status: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: 1 });
payoutSchema.index({ 'method.type': 1, status: 1 });
payoutSchema.index({ requestedAt: -1 });
payoutSchema.index({ completedAt: -1 });
payoutSchema.index({ 'transaction.externalId': 1 });
payoutSchema.index({ isActive: 1, isDeleted: 1 });

// Update the updatedAt field on save
payoutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for payout age
payoutSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.requestedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
payoutSchema.virtual('processingTime').get(function() {
  if (!this.processedAt) return null;
  return Math.floor((this.processedAt - this.requestedAt) / (1000 * 60 * 60));
});

// Virtual for readable status
payoutSchema.virtual('statusText').get(function() {
  const statusMap = {
    'pending': '⏳ Pending',
    'approved': '✅ Approved',
    'processing': '⚙️ Processing',
    'completed': '💰 Completed',
    'failed': '❌ Failed',
    'cancelled': '🚫 Cancelled',
    'rejected': '📝 Rejected',
    'on_hold': '⏸️ On Hold',
    'refunded': '↩️ Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Method to approve payout
payoutSchema.methods.approve = async function(userId, comments = '') {
  this.status = 'approved';
  this.approval.status = 'approved';
  this.approval.approvedBy = userId;
  this.approval.approvedAt = Date.now();
  this.approval.comments = comments;
  
  this.history.push({
    status: 'approved',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout approved',
    notes: comments
  });
  
  return this.save();
};

// Method to reject payout
payoutSchema.methods.reject = async function(userId, reason) {
  this.status = 'rejected';
  this.approval.status = 'rejected';
  this.approval.rejectedBy = userId;
  this.approval.rejectedAt = Date.now();
  this.approval.rejectionReason = reason;
  
  this.history.push({
    status: 'rejected',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout rejected',
    notes: reason
  });
  
  return this.save();
};

// Method to start processing
payoutSchema.methods.startProcessing = async function(userId) {
  this.status = 'processing';
  this.processing.initiatedBy = userId;
  this.processing.initiatedAt = Date.now();
  this.processedAt = Date.now();
  
  this.history.push({
    status: 'processing',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout processing started'
  });
  
  return this.save();
};

// Method to mark as completed
payoutSchema.methods.markCompleted = async function(userId, transactionData = {}) {
  this.status = 'completed';
  this.processing.completedBy = userId;
  this.processing.completedAt = Date.now();
  this.completedAt = Date.now();
  
  if (transactionData) {
    this.transaction = {
      ...this.transaction,
      ...transactionData,
      completedAt: Date.now()
    };
  }
  
  this.history.push({
    status: 'completed',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout completed successfully'
  });
  
  return this.save();
};

// Method to mark as failed
payoutSchema.methods.markFailed = async function(userId, reason) {
  this.status = 'failed';
  this.transaction.failedAt = Date.now();
  this.transaction.failureReason = reason;
  
  this.history.push({
    status: 'failed',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout failed',
    notes: reason
  });
  
  return this.save();
};

// Method to cancel payout
payoutSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  
  this.history.push({
    status: 'cancelled',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout cancelled',
    notes: reason
  });
  
  return this.save();
};

// Method to hold payout
payoutSchema.methods.hold = async function(userId, reason) {
  this.status = 'on_hold';
  
  this.history.push({
    status: 'on_hold',
    changedBy: userId,
    changedAt: Date.now(),
    reason: 'Payout put on hold',
    notes: reason
  });
  
  return this.save();
};

// Method to add note
payoutSchema.methods.addNote = async function(text, userId, isPrivate = false) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: Date.now(),
    isPrivate
  });
  
  return this.save();
};

// Method to update risk assessment
payoutSchema.methods.updateRisk = async function(score, level, flags = [], userId) {
  this.risk = {
    score,
    level,
    flags,
    reviewedBy: userId,
    reviewedAt: Date.now()
  };
  
  return this.save();
};

// Method to soft delete
payoutSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Static method to get pending payouts
payoutSchema.statics.getPending = async function(limit = 50) {
  return this.find({ 
    status: 'pending', 
    isDeleted: false 
  })
  .populate('user', 'name email paymentMethod')
  .sort({ requestedAt: 1 })
  .limit(limit);
};

// Static method to get user payouts
payoutSchema.statics.getUserPayouts = async function(userId, status = null) {
  const query = { user: userId, isDeleted: false };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('commissions')
    .sort({ requestedAt: -1 });
};

// Static method to get total paid amount
payoutSchema.statics.getTotalPaid = async function(userId = null, startDate = null, endDate = null) {
  const query = { 
    status: 'completed',
    isDeleted: false
  };
  
  if (userId) query.user = userId;
  if (startDate || endDate) {
    query.completedAt = {};
    if (startDate) query.completedAt.$gte = startDate;
    if (endDate) query.completedAt.$lte = endDate;
  }
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get pending amount
payoutSchema.statics.getPendingAmount = async function(userId = null) {
  const query = { 
    status: { $in: ['pending', 'approved', 'processing'] },
    isDeleted: false
  };
  if (userId) query.user = userId;
  
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get payout statistics
payoutSchema.statics.getStats = async function(userId = null) {
  const match = { isDeleted: false };
  if (userId) match.user = mongoose.Types.ObjectId(userId);
  
  const stats = await this.aggregate([
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
        totalFees: { $sum: '$summary.fees' },
        avgProcessingTime: { $avg: '$processingTime' }
      }
    }
  ]);
  
  return {
    byStatus: stats,
    totals: total[0] || { 
      totalCount: 0, 
      totalAmount: 0, 
      totalFees: 0,
      avgProcessingTime: 0
    }
  };
};

// Static method to get payouts by date range
payoutSchema.statics.getByDateRange = async function(startDate, endDate, status = null) {
  const query = {
    requestedAt: { $gte: startDate, $lte: endDate },
    isDeleted: false
  };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ requestedAt: -1 });
};

// Static method to get monthly summary
payoutSchema.statics.getMonthlySummary = async function(year) {
  return this.aggregate([
    {
      $match: {
        requestedAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: { $month: '$requestedAt' },
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        fees: { $sum: '$summary.fees' },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

// Static method to get method usage statistics
payoutSchema.statics.getMethodStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        requestedAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$method.type',
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        fees: { $sum: '$summary.fees' }
      }
    }
  ]);
};

// Create and export model
const Payout = mongoose.model('Payout', payoutSchema);
module.exports = Payout;
