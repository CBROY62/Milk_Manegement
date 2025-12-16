import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiClock, FiCheckCircle, FiDollarSign, FiTruck, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import DeliveryOrderTracking from './DeliveryOrderTracking';
import '../Admin/Dashboard.css';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchAvailableOrders();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
      fetchAvailableOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await api.get('/orders/my-deliveries');
      if (response.data.success) {
        const newOrders = response.data.data;
        // Check for new orders
        if (orders.length > 0 && newOrders.length > orders.length) {
          const newCount = newOrders.length - orders.length;
          toast.info(`${newCount} new order(s) assigned!`, {
            autoClose: 3000
          });
        }
        setOrders(newOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!silent) {
        toast.error('Failed to load orders');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const fetchAvailableOrders = async (silent = false) => {
    try {
      const response = await api.get('/orders/available-for-delivery');
      if (response.data.success) {
        setAvailableOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
      if (!silent) {
        toast.error('Failed to load available orders');
      }
    }
  };

  const handleTakeOrder = async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/take`);
      if (response.data.success) {
        toast.success('Order taken successfully! Status: On Going');
        // Refresh both lists
        await fetchOrders();
        await fetchAvailableOrders();
        // Expand the newly taken order
        setExpandedOrder(orderId);
      }
    } catch (error) {
      console.error('Error taking order:', error);
      toast.error(error.response?.data?.message || 'Failed to take order');
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = orders.filter(order => {
      if (order.status !== 'delivered') return false;
      const orderDate = new Date(order.updatedAt || order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;

    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed', 'processing', 'out_for_delivery'].includes(order.status)
    ).length;

    const totalEarnings = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      totalOrders: orders.length,
      pendingOrders,
      completedToday,
      totalEarnings,
      availableOrders: availableOrders.length
    };
  };

  const stats = calculateStats();

  // Map backend status to 3-step flow
  const getOrderStep = (status) => {
    if (['pending', 'confirmed'].includes(status)) return 'ordered';
    if (['processing', 'out_for_delivery'].includes(status)) return 'ongoing';
    if (status === 'delivered') return 'delivered';
    return 'ordered';
  };

  // Get next status for step progression
  const getNextStatus = (currentStatus) => {
    const step = getOrderStep(currentStatus);
    if (step === 'ordered') return 'processing'; // Move to On Going
    if (step === 'ongoing') return 'delivered'; // Move to Delivered
    return null; // Already delivered
  };

  // Filter orders by status (map 3-step flow to backend statuses)
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => {
        const step = getOrderStep(order.status);
        if (statusFilter === 'ordered') {
          return ['pending', 'confirmed'].includes(order.status);
        }
        if (statusFilter === 'ongoing') {
          return ['processing', 'out_for_delivery'].includes(order.status);
        }
        if (statusFilter === 'delivered') {
          return order.status === 'delivered';
        }
        return step === statusFilter;
      });

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      if (response.data.success) {
        const step = getOrderStep(status);
        const stepNames = {
          'ordered': 'Ordered',
          'ongoing': 'On Going',
          'delivered': 'Delivered'
        };
        toast.success(`Order moved to ${stepNames[step] || status}`);
        await fetchOrders();
        await fetchAvailableOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Move order to next step
  const moveToNextStep = async (order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) {
      toast.info('Order is already delivered');
      return;
    }
    await updateOrderStatus(order._id, nextStatus);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container delivery-dashboard">
      <h1>Delivery Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
          <p className="stat-subtext">All assigned orders</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <h3>Pending Deliveries</h3>
          <p className="stat-value">{stats.pendingOrders}</p>
          <p className="stat-subtext">Awaiting delivery</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <FiCheckCircle />
          </div>
          <h3>Completed Today</h3>
          <p className="stat-value">{stats.completedToday}</p>
          <p className="stat-subtext">Delivered today</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon earnings">
            <FiDollarSign />
          </div>
          <h3>Total Earnings</h3>
          <p className="stat-value">₹{stats.totalEarnings.toFixed(2)}</p>
          <p className="stat-subtext">From delivered orders</p>
        </div>
        
        {stats.availableOrders > 0 && (
          <div className="stat-card available-stat">
            <div className="stat-icon available">
              <FiAlertCircle />
            </div>
            <h3>Available Orders</h3>
            <p className="stat-value">{stats.availableOrders}</p>
            <p className="stat-subtext">Waiting for delivery</p>
          </div>
        )}
      </div>

      {/* Available Orders Section */}
      {availableOrders.length > 0 && (
        <div className="dashboard-section available-orders-section">
          <div className="section-header">
            <div>
              <h2>Available Orders</h2>
              <p className="section-subtitle">New orders waiting for delivery</p>
            </div>
            <div className="available-badge">
              <FiAlertCircle /> {availableOrders.length} Available
            </div>
          </div>

          <div className="orders-list">
            {availableOrders.map((order) => (
              <div key={order._id} className="order-card available-order">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className="order-customer">{order.user?.name || 'N/A'}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {order.deliveryAddress && (
                      <span className="order-address">
                        📍 {order.deliveryAddress}
                      </span>
                    )}
                  </div>
                  <div className="order-meta">
                    <span className="order-total">₹{order.total.toFixed(2)}</span>
                    <button
                      onClick={() => handleTakeOrder(order._id)}
                      className="btn btn-take-order"
                    >
                      <FiPackage /> Take Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Orders Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>My Assigned Orders</h2>
            <p className="section-subtitle">Orders assigned to you</p>
          </div>
          <button
            onClick={() => {
              fetchOrders();
              fetchAvailableOrders();
            }}
            className="btn-refresh"
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${statusFilter === 'ordered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ordered')}
          >
            Ordered
          </button>
          <button
            className={`filter-btn ${statusFilter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ongoing')}
          >
            On Going
          </button>
          <button
            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No {statusFilter !== 'all' ? statusFilter.replace('_', ' ') : ''} orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header" onClick={() => toggleOrderExpansion(order._id)}>
                  <div className="order-info">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className="order-customer">{order.user?.name || 'N/A'}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-meta">
                    <span className={`status-badge ${getOrderStep(order.status)}`}>
                      {getOrderStep(order.status) === 'ordered' ? 'Ordered' : 
                       getOrderStep(order.status) === 'ongoing' ? 'On Going' : 
                       'Delivered'}
                    </span>
                    <span className="order-total">₹{order.total.toFixed(2)}</span>
                    <span className="expand-icon">
                      {expandedOrder === order._id ? '−' : '+'}
                    </span>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="order-card-details">
                    <div className="detail-section">
                      <h4>Customer Information</h4>
                      <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{order.user?.name || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{order.user?.phone || order.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{order.user?.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Delivery Information</h4>
                      <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{order.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}</span>
                      </div>
                      {order.deliveryAddress && (
                        <div className="detail-row">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">{order.deliveryAddress}</span>
                        </div>
                      )}
                    </div>

                    <div className="detail-section">
                      <h4>Products</h4>
                      <div className="products-list">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="product-item">
                            <span className="product-name">
                              {item.product?.name || 'Product'}
                            </span>
                            <span className="product-quantity">Qty: {item.quantity}</span>
                            <span className="product-price">₹{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Tracking Timeline - Always Visible */}
                    <div className="detail-section">
                      <DeliveryOrderTracking order={order} />
                    </div>

                    <div className="order-actions">
                      
                      {getOrderStep(order.status) === 'ordered' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveToNextStep(order);
                          }}
                          className="btn btn-primary"
                        >
                          <FiTruck /> Move to On Going
                        </button>
                      )}
                      {getOrderStep(order.status) === 'ongoing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveToNextStep(order);
                          }}
                          className="btn btn-success"
                        >
                          <FiCheckCircle /> Mark as Delivered
                        </button>
                      )}
                      {getOrderStep(order.status) === 'delivered' && (
                        <span className="delivered-badge">✓ Delivered</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

