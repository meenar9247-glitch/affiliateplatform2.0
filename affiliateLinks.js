const mongoose = require('mongoose');

const affiliateLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  originalUrl: {
    type: String,
    required: [true, 'Please provide the original URL']
  },
  commissionRate: {
    type: Number,
    required: [true, 'Please provide commission rate'],
    min: 0,
    max: 100
  },
  commissionType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  fixedCommission: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Amazon', 'Flipkart', 'eBay', 'AliExpress', 'Shopify', 'Other']
  },
  subCategory: String,
  brand: String,
  imageUrl: String,
  bannerUrl: String,
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  conversionCount: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  tags: [String],
  terms: String,
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AffiliateLink', affiliateLinkSchema);
