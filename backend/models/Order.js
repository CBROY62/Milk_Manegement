const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: false
  },
  items: [orderItemSchema],
  deliveryType: {
    type: String,
    enum: ['home_delivery', 'store_pickup'],
    required: true
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    default: 50
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  freeMilkAdded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'orders'
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      // Use a more reliable method to generate unique order number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.orderNumber = `WC${timestamp}${random}`;
    } catch (error) {
      // Fallback if there's any error
      this.orderNumber = `WC${Date.now()}${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

