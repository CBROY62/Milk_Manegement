const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Create order from cart
router.post('/create', authenticate, async (req, res) => {
  try {
    const { deliveryType, deliveryAddress, phone, paymentMethod } = req.body;

    // Validate required fields
    if (deliveryType === 'home_delivery' && !deliveryAddress && !req.user.address) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required for home delivery'
      });
    }

    const phoneNumber = phone || req.user.phone;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const price = req.user.isB2B ? product.priceB2B : product.priceB2C;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
        total
      });
    }

    // Check for monthly subscription free milk
    let freeMilkAdded = false;
    const activeSubscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      planDuration: 30 // Monthly subscription
    });

    if (activeSubscription) {
      // Check if free milk already added this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const ordersThisMonth = await Order.find({
        user: req.user._id,
        freeMilkAdded: true,
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      });

      if (ordersThisMonth.length === 0) {
        // Add 2 liters free cow milk
        const freeMilkProduct = await Product.findOne({ type: 'cow_milk', isActive: true });
        if (freeMilkProduct) {
          const freePrice = req.user.isB2B ? freeMilkProduct.priceB2B : freeMilkProduct.priceB2C;
          orderItems.push({
            product: freeMilkProduct._id,
            quantity: 2,
            price: 0, // Free
            total: 0
          });
          subtotal += 0; // Free
          freeMilkAdded = true;
        }
      }
    }

    const deliveryCharge = deliveryType === 'home_delivery' ? 50 : 0;
    const total = subtotal + deliveryCharge;

    // Determine initial order status based on payment method
    const initialStatus = paymentMethod === 'cod' ? 'pending' : 'pending';
    const paymentMethodValue = paymentMethod || 'stripe';

    // Generate unique order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const orderNumber = `WC${timestamp}${random}`;

    // Create order
    const order = new Order({
      user: req.user._id,
      orderNumber: orderNumber,
      items: orderItems,
      deliveryType,
      deliveryAddress: deliveryAddress || req.user.address || '',
      phone: phoneNumber,
      subtotal,
      deliveryCharge,
      total,
      freeMilkAdded,
      status: initialStatus
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      order: order._id,
      amount: total,
      paymentMethod: paymentMethodValue,
      status: paymentMethodValue === 'cod' ? 'pending' : 'pending'
    });
    await payment.save();

    // Update order with payment
    order.payment = payment._id;
    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: await Order.findById(order._id).populate('items.product'),
        payment: payment
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    // If it's a validation error, return 400 instead of 500
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .populate('deliveryBoy', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('deliveryBoy', 'name phone')
      .populate('payment');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin/mediator/delivery boy
    if (order.user.toString() !== req.user._id.toString() &&
        !['admin', 'mediator', 'delivery_boy'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update order status (Admin, Mediator, Delivery Boy)
router.put('/:id/status', authenticate, checkRole('admin', 'mediator', 'delivery_boy'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Assign delivery boy (Admin, Mediator)
router.put('/:id/assign-delivery', authenticate, checkRole('admin', 'mediator'), async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryBoy: deliveryBoyId },
      { new: true }
    ).populate('items.product').populate('deliveryBoy', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery boy assigned',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all orders (Admin, Mediator)
router.get('/', authenticate, checkRole('admin', 'mediator'), async (req, res) => {
  try {
    const { status, deliveryBoy } = req.query;
    const query = {};

    if (status) query.status = status;
    if (deliveryBoy) query.deliveryBoy = deliveryBoy;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('deliveryBoy', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

