const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['cow_milk', 'buffalo_milk'],
    required: [true, 'Product type is required']
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  priceB2C: {
    type: Number,
    required: [true, 'B2C price is required'],
    min: [0, 'Price must be positive']
  },
  priceB2B: {
    type: Number,
    required: [true, 'B2B price is required'],
    min: [0, 'Price must be positive']
  },
  unit: {
    type: String,
    default: 'liter',
    enum: ['liter', 'ml', 'kg']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  bulkDiscount: {
    enabled: {
      type: Boolean,
      default: false
    },
    minQuantity: {
      type: Number,
      default: 10
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  collection: 'products'
});

// Index for faster queries
productSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);

