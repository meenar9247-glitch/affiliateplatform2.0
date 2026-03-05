const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  // Referrer (जिसने refer किया)
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Referred user (जो refer हुआ)
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Referral code used
  referralCode: {
    type: String,
    required: true,
    index: true
  },

  // Referral status
  status: {
    type: String,
    enum: ['pending', 'active', 'converted', 'expired', 'blocked'],
    default: 'pending'
  },

  // Commission details
  commission: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    },
    paidAt: Date
  },

  // Referral level (for multi-level marketing)
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },

  // Tracking information
  tracking: {
    ipAddress: String,
    userAgent: String,
    referrerUrl: String,
    landingPage: String,
    country: String,
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown']
    },
    browser: String,
    os: String
  },

  // Conversion details (if any)
  conversion: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    amount: Number,
    currency: String,
    convertedAt: Date,
    orderId: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded']
    }
  },

  // Timeline
  referredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  activeAt: Date,
  convertedAt: Date,
  expiresAt: Date,
  
  // Referral link
  referralLink: {
    type: String,
    trim: true
  },

  // Notes (for admin)
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
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

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referralCode: 1, status: 1 });
referralSchema.index({ referredAt: -1 });
referralSchema.index({ 'commission.status': 1 });
referralSchema.index({ isActive: 1, isDeleted: 1 });

// Update the updatedAt field on save
referralSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for referral age
referralSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.referredAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since referral
referralSchema.virtual('daysSinceReferral').get(function() {
  return Math.floor((Date.now() - this.referredAt) / (1000 * 60 * 60 * 24));
});

// Method to activate referral
referralSchema.methods.activate = async function() {
  this.status = 'active';
  this.activeAt = Date.now();
  return this.save();
};

// Method to mark as converted
referralSchema.methods.markConverted = async function(conversionData = {}) {
  this.status = 'converted';
  this.convertedAt = Date.now();
  
  if (conversionData.amount) {
    this.commission.amount = conversionData.amount;
    this.commission.status = 'pending';
  }
  
  if (conversionData.productId) {
    this.conversion.productId = conversionData.productId;
    this.conversion.productName = conversionData.productName;
    this.conversion.amount = conversionData.amount;
    this.conversion.convertedAt = Date.now();
  }
  
  return this.save();
};

// Method to expire referral
referralSchema.methods.expire = async function() {
  this.status = 'expired';
  this.expiresAt = Date.now();
  return this.save();
};

// Method to add commission
referralSchema.methods.addCommission = async function(amount, rate = 0) {
  this.commission.amount = amount;
  this.commission.rate = rate;
  this.commission.status = 'pending';
  return this.save();
};

// Method to mark commission as paid
referralSchema.methods.markCommissionPaid = async function() {
  this.commission.status = 'paid';
  this.commission.paidAt = Date.now();
  return this.save();
};

// Method to add note
referralSchema.methods.addNote = async function(text, userId) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: Date.now()
  });
  return this.save();
};

// Method to soft delete
referralSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Static method to get active referrals count
referralSchema.statics.getActiveCount = async function(userId) {
  return this.countDocuments({
    referrer: userId,
    status: { $in: ['active', 'converted'] },
    isDeleted: false
  });
};

// Static method to get total commission
referralSchema.statics.getTotalCommission = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        referrer: mongoose.Types.ObjectId(userId),
        'commission.status': 'paid',
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$commission.amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get pending commission
referralSchema.statics.getPendingCommission = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        referrer: mongoose.Types.ObjectId(userId),
        'commission.status': 'pending',
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$commission.amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to get referral stats
referralSchema.statics.getReferralStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: {
        referrer: mongoose.Types.ObjectId(userId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCommission: { $sum: '$commission.amount' }
      }
    }
  ]);
  
  return stats.reduce((acc, curr) => {
    acc[curr._id] = {
      count: curr.count,
      totalCommission: curr.totalCommission
    };
    return acc;
  }, {});
};

// Static method to get recent referrals
referralSchema.statics.getRecentReferrals = async function(userId, limit = 10) {
  return this.find({
    referrer: userId,
    isDeleted: false
  })
  .populate('referredUser', 'name email createdAt')
  .sort({ referredAt: -1 })
  .limit(limit);
};

// Static method to get referral tree (for MLM)
referralSchema.statics.getReferralTree = async function(userId, level = 1, maxDepth = 3) {
  if (level > maxDepth) return [];
  
  const referrals = await this.find({
    referrer: userId,
    isDeleted: false
  }).populate('referredUser', 'name email');
  
  const tree = [];
  
  for (const ref of referrals) {
    const node = {
      user: ref.referredUser,
      level,
      status: ref.status,
      commission: ref.commission,
      referredAt: ref.referredAt,
      children: []
    };
    
    node.children = await this.getReferralTree(ref.referredUser._id, level + 1, maxDepth);
    tree.push(node);
  }
  
  return tree;
};

// Create and export model
const Referral = mongoose.model('Referral', referralSchema);
module.exports = Referral;
