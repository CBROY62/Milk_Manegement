import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this cancelled order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(orderId);
      const response = await api.delete(`/orders/${orderId}`);
      if (response.data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      out_for_delivery: '#6f42c1',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  // Calculate statistics
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'processing', 'out_for_delivery'].includes(order.status)).length;

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here!</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="orders-statistics">
          <div className="stat-card">
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{totalAmount.toFixed(2)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{deliveredOrders}</div>
            <div className="stat-label">Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pendingOrders}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
      </div>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.orderNumber}</h3>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>
                    {item.product?.name || 'Product'} x {item.quantity}
                  </span>
                  <span>₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Total: ₹{order.total.toFixed(2)}</span>
              </div>
              <div className="order-actions">
                <Link to={`/orders/${order._id}`} className="view-order-btn">
                  View Details
                </Link>
                {order.status === 'cancelled' && (
                  <button
                    className="remove-order-btn"
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deleting === order._id}
                  >
                    {deleting === order._id ? 'Removing...' : 'Remove Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="help-section-card">
        <div className="help-header" onClick={() => setShowHelp(!showHelp)}>
          <h2>Help & Support</h2>
          <span className="help-toggle">{showHelp ? '−' : '+'}</span>
        </div>
        {showHelp && (
          <div className="help-content">
            <div className="help-item">
              <h3>Order Management</h3>
              <p>View all your orders, track their status, and manage cancellations from this page. Click "View Details" to see more information about a specific order.</p>
            </div>
            <div className="help-item">
              <h3>Cancelling Orders</h3>
              <p>You can cancel orders that haven't been delivered yet. Go to the order details page to cancel individual items or the entire order.</p>
            </div>
            <div className="help-item">
              <h3>Removing Orders</h3>
              <p>You can remove cancelled orders from your order history. This action is permanent and cannot be undone.</p>
            </div>
            <div className="help-item">
              <h3>Order Status</h3>
              <p>Orders can have different statuses: Pending, Confirmed, Processing, Out for Delivery, Delivered, or Cancelled. Check the status badge on each order card.</p>
            </div>
            <div className="help-item">
              <h3>Need Assistance?</h3>
              <p>If you have questions about your orders, contact our support team at support@milkmanagement.com or call +91-1234567890. We're here to help Monday-Saturday, 9 AM - 6 PM.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

