import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Note: This endpoint might need to be created in backend for admin to get all subscriptions
      const response = await api.get('/subscriptions/all');
      if (response.data.success) {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      // If endpoint doesn't exist, try alternative approach
      console.error('Error fetching subscriptions:', error);
      // For now, we'll show empty state or use a different endpoint
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      const response = await api.put(`/subscriptions/${subscriptionId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        toast.success('Subscription status updated');
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    }
  };

  const handleCancel = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      const response = await api.put(`/subscriptions/${subscriptionId}/cancel`);
      if (response.data.success) {
        toast.success('Subscription cancelled');
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'cancelled':
        return 'status-cancelled';
      case 'expired':
        return 'status-expired';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="subscription-management-container">
        <div className="loading-spinner">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="subscription-management-container">
      <div className="subscription-management-header">
        <h1>Subscription Management</h1>
        <div className="subscription-stats">
          <span>Total Subscriptions: {subscriptions.length}</span>
          <span>Active: {subscriptions.filter(s => s.status === 'active').length}</span>
        </div>
      </div>

      <div className="subscription-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by user name, email, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Product</th>
              <th>Plan Type</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No subscriptions found</td>
              </tr>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <tr key={subscription._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{subscription.user?.name || 'N/A'}</div>
                      <div className="user-email">{subscription.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{subscription.product?.name || 'N/A'}</td>
                  <td>{subscription.planType || 'N/A'}</td>
                  <td>{subscription.quantity || 0}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(subscription.status)}`}>
                      {subscription.status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {subscription.startDate 
                      ? new Date(subscription.startDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    {subscription.endDate 
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {subscription.status === 'active' && (
                        <select
                          value={subscription.status}
                          onChange={(e) => handleStatusChange(subscription._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="active">Active</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                      )}
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancel(subscription._id)}
                          className="btn-cancel-sub"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionManagement;

