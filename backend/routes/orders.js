const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { emitNewOrder, emitOrderStatusUpdate, emitOrderCancellation } = require('../socketHandlers/orderHandlers');
const { emitDeliveryAssignment } = require('../socketHandlers/deliveryHandlers');
const { emitNotification } = require('../socketHandlers/notificationHandlers');

const router = express.Router();

// Helper to get io instance
const getIO = (req) => {
  return req.app.get('io');
};

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

    // Populate order for Socket.io emit
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('user', 'name email phone');

    // Emit new order event via Socket.io
    const io = getIO(req);
    if (io) {
      emitNewOrder(io, populatedOrder);
      
      // Send notification to user
      emitNotification(io, req.user._id.toString(), {
        type: 'success',
        title: 'Order Placed Successfully',
        message: `Your order #${order.orderNumber} has been placed successfully!`,
        data: { orderId: order._id.toString() }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: populatedOrder,
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

// Get delivery boy's assigned orders
router.get('/my-deliveries', authenticate, checkRole('delivery_boy'), async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.user._id })
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

// Get available orders for delivery (unassigned orders)
router.get('/available-for-delivery', authenticate, checkRole('delivery_boy'), async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryBoy: null,
      status: { $in: ['pending', 'confirmed', 'processing'] },
      deliveryType: 'home_delivery'
    })
      .populate('user', 'name email phone')
      .populate('items.product')
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

// Take/Accept order by delivery boy
router.put('/:id/take', authenticate, checkRole('delivery_boy'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already assigned
    if (order.deliveryBoy && order.deliveryBoy.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Order is already assigned to another delivery boy'
      });
    }

    // Check if order is for home delivery
    if (order.deliveryType !== 'home_delivery') {
      return res.status(400).json({
        success: false,
        message: 'Only home delivery orders can be taken'
      });
    }

    // Assign order to delivery boy and update status
    const oldStatus = order.status;
    order.deliveryBoy = req.user._id;
    if (order.status === 'pending' || order.status === 'confirmed') {
      order.status = 'processing';
    }
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('deliveryBoy', 'name phone');

    // Emit Socket.io events
    const io = getIO(req);
    if (io) {
      emitDeliveryAssignment(io, populatedOrder, req.user._id.toString());
      emitOrderStatusUpdate(io, populatedOrder, oldStatus);
    }

    res.json({
      success: true,
      message: 'Order taken successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all orders (Admin, Mediator) or delivery boy's own orders - Must come before /:id route
router.get('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin or mediator
    const isAdminOrMediator = ['admin', 'mediator'].includes(req.user.role);
    
    // If delivery boy, only allow querying their own orders
    if (req.user.role === 'delivery_boy') {
      const query = { deliveryBoy: req.user._id };
      const { status } = req.query;
      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product')
        .populate('deliveryBoy', 'name phone')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    }

    // For admin and mediator, allow full access
    if (!isAdminOrMediator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

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

// Update order status (Admin, Mediator, Delivery Boy) - Specific route before generic
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

    const oldOrder = await Order.findById(req.params.id).populate('user', 'name email phone').populate('deliveryBoy', 'name phone');
    
    if (!oldOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = oldOrder.status;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product').populate('user', 'name email phone').populate('deliveryBoy', 'name phone');

    // Emit Socket.io events
    const io = getIO(req);
    if (io) {
      emitOrderStatusUpdate(io, order, oldStatus);
      
      // Emit delivery update if status changed
      if (['processing', 'out_for_delivery', 'delivered'].includes(status)) {
        const { emitDeliveryStatusUpdate } = require('../socketHandlers/deliveryHandlers');
        emitDeliveryStatusUpdate(io, order);
      }
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

// Assign delivery boy (Admin, Mediator) - Specific route before generic
router.put('/:id/assign-delivery', authenticate, checkRole('admin', 'mediator'), async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryBoy: deliveryBoyId },
      { new: true }
    ).populate('items.product').populate('user', 'name email phone').populate('deliveryBoy', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Emit Socket.io events
    const io = getIO(req);
    if (io) {
      emitDeliveryAssignment(io, order, deliveryBoyId);
      emitOrderStatusUpdate(io, order);
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

// Cancel order (User can cancel their own orders) - Specific route before generic
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can't cancel delivered or already cancelled orders
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id || item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // Update order status
    const oldStatus = order.status;
    order.status = 'cancelled';
    await order.save();

    // Update payment status if payment exists
    if (order.payment) {
      await Payment.findByIdAndUpdate(order.payment, {
        status: 'cancelled'
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('user', 'name email phone')
      .populate('deliveryBoy', 'name phone');

    // Emit Socket.io events
    const io = getIO(req);
    if (io) {
      emitOrderCancellation(io, populatedOrder);
      emitOrderStatusUpdate(io, populatedOrder, oldStatus);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Cancel individual item from order - Specific route before generic
router.put('/:id/cancel-item/:itemId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can't cancel items from delivered or cancelled orders
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel items from ${order.status} order`
      });
    }

    // Find the item to cancel
    const itemIndex = order.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }

    const item = order.items[itemIndex];

    // Restore product stock
    await Product.findByIdAndUpdate(item.product._id || item.product, {
      $inc: { stock: item.quantity }
    });

    // Remove item from order
    order.items.splice(itemIndex, 1);

    // Recalculate totals
    let subtotal = 0;
    for (const orderItem of order.items) {
      subtotal += orderItem.total;
    }
    order.subtotal = subtotal;
    order.total = subtotal + order.deliveryCharge;

    // If no items left, cancel the entire order
    if (order.items.length === 0) {
      order.status = 'cancelled';
      if (order.payment) {
        await Payment.findByIdAndUpdate(order.payment, {
          status: 'cancelled'
        });
      }
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order item cancelled successfully',
      data: await Order.findById(order._id).populate('items.product')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get single order - Generic route comes last
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

// Delete order (Only cancelled orders can be deleted)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow deletion of cancelled orders
    if (order.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled orders can be deleted'
      });
    }

    // Delete payment if exists
    if (order.payment) {
      await Payment.findByIdAndDelete(order.payment);
    }

    // Delete order
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
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

