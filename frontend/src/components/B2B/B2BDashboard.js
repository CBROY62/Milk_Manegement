import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import '../Admin/Dashboard.css';

const B2BDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isB2B) {
      fetchB2BData();
    }
  }, [user]);

  const fetchB2BData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        const b2bOrders = response.data.data;
        setOrders(b2bOrders);
        setStats({
          totalOrders: b2bOrders.length,
          totalSpent: b2bOrders.reduce((sum, order) => sum + order.total, 0),
          pendingInvoices: b2bOrders.filter(o => o.status !== 'delivered').length
        });
      }
    } catch (error) {
      console.error('Error fetching B2B data:', error);
      toast.error('Failed to load B2B data');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isB2B) {
    return (
      <div className="dashboard-container">
        <h1>B2B Dashboard</h1>
        <p>This dashboard is only available for B2B customers. Please contact admin to enable B2B features.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>B2B Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p className="stat-value">₹{stats.totalSpent.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Invoices</h3>
          <p className="stat-value">{stats.pendingInvoices}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Orders</h2>
        <div className="orders-table">
          {orders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-row">
                <span>#{order.orderNumber}</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span>₹{order.total.toFixed(2)}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>B2B Benefits</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✓ Bulk pricing discounts</li>
          <li>✓ Credit terms available</li>
          <li>✓ Dedicated account manager</li>
          <li>✓ Priority support</li>
        </ul>
      </div>
    </div>
  );
};

export default B2BDashboard;

