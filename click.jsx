const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  affiliateLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateLink',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralCode: String,
  ipAddress: String,
  userAgent: String,
  referrer: String,
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'bot']
  },
  browser: String,
  os: String,
  country: String,
  city: String,
  clickedAt: {
    type: Date,
    default: Date.now
  },
  converted: {
    type: Boolean,
    default: false
  },
  conversionAmount: Number,
  commission: Number,
  conversionDate: Date,
  sessionId: String,
  utmParams: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  }
});

// Index for faster queries
clickSchema.index({ affiliateLink: 1, user: 1, clickedAt: -1 });

module.exports = mongoose.model('Click', clickSchema);