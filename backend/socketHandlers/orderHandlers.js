/**
 * Socket.io handlers for order-related real-time events
 */

/**
 * Emit order status update to relevant users
 * @param {Object} io - Socket.io server instance
 * @param {Object} order - Order object
 * @param {String} oldStatus - Previous order status (optional)
 */
const emitOrderStatusUpdate = (io, order, oldStatus = null) => {
  const orderData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    oldStatus,
    updatedAt: order.updatedAt || new Date(),
    deliveryBoy: order.deliveryBoy ? {
      _id: order.deliveryBoy._id || order.deliveryBoy,
      name: order.deliveryBoy.name,
      phone: order.deliveryBoy.phone
    } : null
  };

  // Emit to order-specific room
  io.to(`order:${order._id}`).emit('order_status_update', orderData);

  // Emit to user who placed the order
  if (order.user && order.user._id) {
    io.to(`user:${order.user._id}`).emit('order_status_update', orderData);
  }

  // Emit to delivery boy if assigned
  if (order.deliveryBoy && order.deliveryBoy._id) {
    io.to(`delivery:${order.deliveryBoy._id}`).emit('order_status_update', orderData);
  }

  // Emit to admin room
  io.to('admin').emit('order_status_update', orderData);
};

/**
 * Emit new order notification
 * @param {Object} io - Socket.io server instance
 * @param {Object} order - New order object
 */
const emitNewOrder = (io, order) => {
  const orderData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    user: order.user ? {
      _id: order.user._id || order.user,
      name: order.user.name,
      email: order.user.email
    } : null,
    items: order.items,
    deliveryType: order.deliveryType,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt || new Date()
  };

  // Emit to admin room
  io.to('admin').emit('new_order', orderData);

  // Emit to all delivery boys
  io.to('delivery').emit('new_order', orderData);

  // Emit to user who placed the order
  if (order.user && order.user._id) {
    io.to(`user:${order.user._id}`).emit('new_order', orderData);
  }
};

/**
 * Emit order cancellation
 * @param {Object} io - Socket.io server instance
 * @param {Object} order - Cancelled order object
 */
const emitOrderCancellation = (io, order) => {
  const orderData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    status: 'cancelled',
    cancelledAt: new Date()
  };

  // Emit to all relevant rooms
  io.to(`order:${order._id}`).emit('order_cancelled', orderData);
  
  if (order.user && order.user._id) {
    io.to(`user:${order.user._id}`).emit('order_cancelled', orderData);
  }

  if (order.deliveryBoy && order.deliveryBoy._id) {
    io.to(`delivery:${order.deliveryBoy._id}`).emit('order_cancelled', orderData);
  }

  io.to('admin').emit('order_cancelled', orderData);
};

module.exports = {
  emitOrderStatusUpdate,
  emitNewOrder,
  emitOrderCancellation
};

