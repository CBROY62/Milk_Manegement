import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    activeSubscriptions: 0,
    pendingOrders: 0,
    totalQuestions: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats and recent orders
      const [usersRes, ordersRes, productsRes, subscriptionsRes, questionsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { success: false } })),
        api.get('/orders').catch(() => ({ data: { success: false } })),
        api.get('/products').catch(() => ({ data: { success: false } })),
        api.get('/subscriptions/all').catch(() => ({ data: { success: false } })),
        api.get('/questions').catch(() => ({ data: { success: false } }))
      ]);

      if (usersRes.data.success) {
        setStats(prev => ({ ...prev, totalUsers: usersRes.data.count || usersRes.data.data?.length || 0 }));
      }
      if (ordersRes.data.success) {
        const orders = ordersRes.data.data || [];
        setStats(prev => ({ ...prev, totalOrders: ordersRes.data.count || orders.length }));
        setRecentOrders(orders.slice(0, 5));
        // Calculate revenue
        const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const pending = orders.filter(order => order.status === 'pending').length;
        setStats(prev => ({ ...prev, totalRevenue: revenue, pendingOrders: pending }));
      }
      if (productsRes.data.success) {
        setStats(prev => ({ ...prev, totalProducts: productsRes.data.count || productsRes.data.data?.length || 0 }));
      }
      if (subscriptionsRes.data.success) {
        const subscriptions = subscriptionsRes.data.data || [];
        const active = subscriptions.filter(sub => sub.status === 'active').length;
        setStats(prev => ({ ...prev, activeSubscriptions: active }));
      }
      if (questionsRes.data.success) {
        setStats(prev => ({ ...prev, totalQuestions: questionsRes.data.count || questionsRes.data.data?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  return (
      <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
          {stats.pendingOrders > 0 && (
            <p className="stat-subtext">{stats.pendingOrders} pending</p>
          )}
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <p className="stat-value">{stats.activeSubscriptions}</p>
        </div>
        <div className="stat-card">
          <h3>Total Questions</h3>
          <p className="stat-value">{stats.totalQuestions}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Quick Actions</h2>
        </div>
        <div className="quick-actions-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
          <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
          <Link to="/admin/subscriptions" className="btn btn-primary">Subscriptions</Link>
          <Link to="/admin/subscription-plans" className="btn btn-primary">Subscription Plans</Link>
          <Link to="/admin/questions" className="btn btn-primary">Questions</Link>
          <Link 
            to="/admin/analytics" 
            className="btn btn-analytics" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Orders</h2>
        <div className="orders-table">
          {recentOrders.length === 0 ? (
            <p>No recent orders</p>
          ) : (
            recentOrders.map((order) => (
              <div key={order._id} className="order-row">
                <span>#{order.orderNumber}</span>
                <span>{order.user?.name || 'N/A'}</span>
                <span>₹{order.total.toFixed(2)}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

