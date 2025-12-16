/**
 * Socket.io handlers for delivery-related real-time events
 */

/**
 * Emit delivery status update
 * @param {Object} io - Socket.io server instance
 * @param {Object} order - Order object with delivery information
 */
const emitDeliveryStatusUpdate = (io, order) => {
  const deliveryData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    deliveryBoy: order.deliveryBoy ? {
      _id: order.deliveryBoy._id || order.deliveryBoy,
      name: order.deliveryBoy.name,
      phone: order.deliveryBoy.phone
    } : null,
    deliveryAddress: order.deliveryAddress,
    deliveryType: order.deliveryType,
    updatedAt: order.updatedAt || new Date()
  };

  // Emit to order room
  io.to(`order:${order._id}`).emit('delivery_update', deliveryData);

  // Emit to user
  if (order.user && order.user._id) {
    io.to(`user:${order.user._id}`).emit('delivery_update', deliveryData);
  }

  // Emit to delivery boy
  if (order.deliveryBoy && order.deliveryBoy._id) {
    io.to(`delivery:${order.deliveryBoy._id}`).emit('delivery_update', deliveryData);
  }

  // Emit to admin
  io.to('admin').emit('delivery_update', deliveryData);
};

/**
 * Emit delivery assignment
 * @param {Object} io - Socket.io server instance
 * @param {Object} order - Order object
 * @param {String} deliveryBoyId - Delivery boy ID
 */
const emitDeliveryAssignment = (io, order, deliveryBoyId) => {
  const assignmentData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    deliveryBoyId: deliveryBoyId,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    assignedAt: new Date()
  };

  // Notify delivery boy
  io.to(`delivery:${deliveryBoyId}`).emit('order_assigned', assignmentData);

  // Notify user
  if (order.user && order.user._id) {
    io.to(`user:${order.user._id}`).emit('delivery_assigned', assignmentData);
  }

  // Notify admin
  io.to('admin').emit('delivery_assigned', assignmentData);
};

/**
 * Emit delivery location update
 * @param {Object} io - Socket.io server instance
 * @param {String} deliveryBoyId - Delivery boy ID
 * @param {String} orderId - Order ID
 * @param {Object} location - Location object with lat, lng
 */
const emitDeliveryLocationUpdate = (io, deliveryBoyId, orderId, location) => {
  const locationData = {
    deliveryBoyId,
    orderId,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || null
    },
    timestamp: new Date()
  };

  // Emit to order room
  if (orderId) {
    io.to(`order:${orderId}`).emit('delivery_location_update', locationData);
  }

  // Emit to admin
  io.to('admin').emit('delivery_location_update', locationData);
};

module.exports = {
  emitDeliveryStatusUpdate,
  emitDeliveryAssignment,
  emitDeliveryLocationUpdate
};

