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
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  imageUrl: String,
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AffiliateLink', affiliateLinkSchema);
