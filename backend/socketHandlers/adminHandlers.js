/**
 * Socket.io handlers for admin-related real-time events
 */

/**
 * Emit admin dashboard statistics update
 * @param {Object} io - Socket.io server instance
 * @param {Object} stats - Statistics object
 */
const emitAdminStatsUpdate = (io, stats) => {
  const statsData = {
    totalOrders: stats.totalOrders || 0,
    pendingOrders: stats.pendingOrders || 0,
    completedOrders: stats.completedOrders || 0,
    totalRevenue: stats.totalRevenue || 0,
    todayRevenue: stats.todayRevenue || 0,
    totalUsers: stats.totalUsers || 0,
    activeSubscriptions: stats.activeSubscriptions || 0,
    lowStockProducts: stats.lowStockProducts || 0,
    updatedAt: new Date()
  };

  io.to('admin').emit('admin_stats_update', statsData);
};

/**
 * Emit inventory update
 * @param {Object} io - Socket.io server instance
 * @param {Object} product - Product object
 */
const emitInventoryUpdate = (io, product) => {
  const inventoryData = {
    productId: product._id.toString(),
    productName: product.name,
    stock: product.stock,
    previousStock: product.previousStock || product.stock,
    isLowStock: product.stock < (product.lowStockThreshold || 10),
    updatedAt: new Date()
  };

  // Emit to admin
  io.to('admin').emit('inventory_update', inventoryData);

  // Emit to all users if stock becomes 0 (out of stock)
  if (product.stock === 0) {
    io.emit('product_out_of_stock', {
      productId: product._id.toString(),
      productName: product.name
    });
  }
};

/**
 * Emit user activity update
 * @param {Object} io - Socket.io server instance
 * @param {Object} activity - Activity object
 */
const emitUserActivity = (io, activity) => {
  const activityData = {
    userId: activity.userId,
    userName: activity.userName,
    action: activity.action,
    details: activity.details || {},
    timestamp: new Date()
  };

  io.to('admin').emit('user_activity', activityData);
};

/**
 * Emit system alert to admins
 * @param {Object} io - Socket.io server instance
 * @param {Object} alert - Alert object
 */
const emitSystemAlert = (io, alert) => {
  const alertData = {
    type: alert.type || 'warning',
    title: alert.title,
    message: alert.message,
    severity: alert.severity || 'medium',
    data: alert.data || {},
    timestamp: new Date()
  };

  io.to('admin').emit('system_alert', alertData);
};

module.exports = {
  emitAdminStatsUpdate,
  emitInventoryUpdate,
  emitUserActivity,
  emitSystemAlert
};

