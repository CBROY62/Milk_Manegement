/**
 * Socket.io handlers for notification-related real-time events
 */

/**
 * Emit notification to specific user
 * @param {Object} io - Socket.io server instance
 * @param {String} userId - User ID to send notification to
 * @param {Object} notification - Notification object
 */
const emitNotification = (io, userId, notification) => {
  const notificationData = {
    _id: notification._id || new Date().getTime().toString(),
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    read: false,
    createdAt: notification.createdAt || new Date()
  };

  io.to(`user:${userId}`).emit('notification', notificationData);
};

/**
 * Emit notification to multiple users
 * @param {Object} io - Socket.io server instance
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notification - Notification object
 */
const emitNotificationToUsers = (io, userIds, notification) => {
  userIds.forEach(userId => {
    emitNotification(io, userId, notification);
  });
};

/**
 * Emit notification to all admins
 * @param {Object} io - Socket.io server instance
 * @param {Object} notification - Notification object
 */
const emitAdminNotification = (io, notification) => {
  const notificationData = {
    _id: notification._id || new Date().getTime().toString(),
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    read: false,
    createdAt: notification.createdAt || new Date()
  };

  io.to('admin').emit('admin_notification', notificationData);
};

/**
 * Emit notification to all delivery boys
 * @param {Object} io - Socket.io server instance
 * @param {Object} notification - Notification object
 */
const emitDeliveryNotification = (io, notification) => {
  const notificationData = {
    _id: notification._id || new Date().getTime().toString(),
    type: notification.type || 'info',
    title: notification.title,
    message: notification.message,
    data: notification.data || {},
    read: false,
    createdAt: notification.createdAt || new Date()
  };

  io.to('delivery').emit('delivery_notification', notificationData);
};

/**
 * Emit payment notification
 * @param {Object} io - Socket.io server instance
 * @param {String} userId - User ID
 * @param {Object} payment - Payment object
 */
const emitPaymentNotification = (io, userId, payment) => {
  const notification = {
    type: payment.status === 'success' ? 'success' : 'error',
    title: payment.status === 'success' ? 'Payment Successful' : 'Payment Failed',
    message: payment.status === 'success' 
      ? `Payment of ₹${payment.amount} was successful`
      : `Payment of ₹${payment.amount} failed`,
    data: {
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status
    }
  };

  emitNotification(io, userId, notification);
};

module.exports = {
  emitNotification,
  emitNotificationToUsers,
  emitAdminNotification,
  emitDeliveryNotification,
  emitPaymentNotification
};

