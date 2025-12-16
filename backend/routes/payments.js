const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');
const { emitPaymentNotification } = require('../socketHandlers/notificationHandlers');
const { emitOrderStatusUpdate } = require('../socketHandlers/orderHandlers');

const router = express.Router();

// Helper to get io instance
const getIO = (req) => {
  return req.app.get('io');
};

// Create payment intent
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { amount, orderId, currency = 'INR' } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId.toString(),
        userId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment intent creation failed',
      error: error.message
    });
  }
});

// Confirm payment
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          status: 'succeeded',
          transactionId: paymentIntent.id
        },
        { new: true }
      ).populate('user', 'name email');

      // Update order status
      let order = null;
      if (orderId) {
        const oldOrder = await Order.findById(orderId).populate('user', 'name email phone').populate('deliveryBoy', 'name phone');
        await Order.findByIdAndUpdate(orderId, {
          status: 'confirmed'
        });
        order = await Order.findById(orderId)
          .populate('items.product')
          .populate('user', 'name email phone')
          .populate('deliveryBoy', 'name phone');
      }

      // Emit Socket.io events
      const io = getIO(req);
      if (io) {
        // Emit payment notification
        if (payment && payment.user) {
          emitPaymentNotification(io, payment.user._id.toString(), payment);
        }
        
        // Emit order status update
        if (order) {
          emitOrderStatusUpdate(io, order, 'pending');
        }
      }

      res.json({
        success: true,
        message: 'Payment confirmed',
        data: payment
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed',
      error: error.message
    });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
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

