const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  click: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Click',
    required: true
  },
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
  orderId: String,
  amount: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  conversionType: {
    type: String,
    enum: ['sale', 'lead', 'signup', 'click'],
    default: 'sale'
  },
  customerEmail: String,
  customerName: String,
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conversion', conversionSchema);