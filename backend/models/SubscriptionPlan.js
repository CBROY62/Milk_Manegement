const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Plan type is required'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  label: {
    type: String,
    required: [true, 'Plan label is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  collection: 'subscription_plans'
});

// Index for faster queries
subscriptionPlanSchema.index({ type: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

