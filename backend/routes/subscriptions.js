const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      { type: '7_days', duration: 7, label: '7 Days' },
      { type: '15_days', duration: 15, label: '15 Days' },
      { type: '30_days', duration: 30, label: '30 Days (Monthly)' },
      { type: '3_months', duration: 90, label: '3 Months' }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create subscription
router.post('/create', authenticate, [
  body('planType').isIn(['7_days', '15_days', '30_days', '3_months']).withMessage('Invalid plan type'),
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { planType, productId, quantity } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate plan duration
    const planDurations = {
      '7_days': 7,
      '15_days': 15,
      '30_days': 30,
      '3_months': 90
    };
    const duration = planDurations[planType];

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    const nextDeliveryDate = new Date();
    nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1); // First delivery tomorrow

    // Calculate price
    const pricePerUnit = req.user.isB2B ? product.priceB2B : product.priceB2C;
    const totalPrice = pricePerUnit * quantity * duration;

    // Create subscription
    const subscription = new Subscription({
      user: req.user._id,
      planType,
      planDuration: duration,
      startDate,
      endDate,
      nextDeliveryDate,
      product: productId,
      quantity,
      price: totalPrice
    });

    await subscription.save();

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      amount: totalPrice,
      paymentMethod: 'stripe',
      status: 'pending'
    });
    await payment.save();

    subscription.payment = payment._id;
    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription: await Subscription.findById(subscription._id).populate('product'),
        payment: payment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all subscriptions (Admin only)
router.get('/all', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'name email phone')
      .populate('product', 'name type')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's subscriptions
router.get('/my-subscriptions', authenticate, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('product')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update subscription status (Admin only)
router.put('/:id/status', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'cancelled', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = status;
    if (status === 'cancelled') {
      subscription.autoRenew = false;
    }
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription status updated',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Cancel subscription
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled',
      data: subscription
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

