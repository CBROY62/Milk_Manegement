import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeCount: 0,
    cancelledCount: 0,
    expiredCount: 0
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions/all');
      if (response.data.success) {
        const subs = response.data.data || [];
        setSubscriptions(subs);
        
        // Calculate analytics
        const analyticsData = {
          totalRevenue: subs.reduce((sum, sub) => sum + (sub.price || 0), 0),
          activeCount: subs.filter(s => s.status === 'active').length,
          cancelledCount: subs.filter(s => s.status === 'cancelled').length,
          expiredCount: subs.filter(s => s.status === 'expired').length
        };
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubscriptions(filteredSubscriptions.map(s => s._id));
      setSelectAll(true);
    } else {
      setSelectedSubscriptions([]);
      setSelectAll(false);
    }
  };

  const handleSelectSubscription = (subId) => {
    if (selectedSubscriptions.includes(subId)) {
      setSelectedSubscriptions(selectedSubscriptions.filter(id => id !== subId));
      setSelectAll(false);
    } else {
      setSelectedSubscriptions([...selectedSubscriptions, subId]);
      if (selectedSubscriptions.length + 1 === filteredSubscriptions.length) {
        setSelectAll(true);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedSubscriptions.length === 0) {
      toast.error('Please select at least one subscription');
      return;
    }

    const actionText = action === 'cancel' ? 'cancel' : action === 'activate' ? 'activate' : 'pause';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedSubscriptions.length} subscription(s)?`)) {
      return;
    }

    try {
      if (action === 'cancel') {
        await Promise.all(selectedSubscriptions.map(subId => 
          api.put(`/subscriptions/${subId}/status`, { status: 'cancelled' })
        ));
        toast.success(`${selectedSubscriptions.length} subscription(s) cancelled successfully`);
      } else if (action === 'activate') {
        await Promise.all(selectedSubscriptions.map(subId => 
          api.put(`/subscriptions/${subId}/status`, { status: 'active' })
        ));
        toast.success(`${selectedSubscriptions.length} subscription(s) activated successfully`);
      }
      setSelectedSubscriptions([]);
      setSelectAll(false);
      fetchSubscriptions();
    } catch (error) {
      console.error(`Error ${actionText}ing subscriptions:`, error);
      toast.error(`Failed to ${actionText} subscriptions`);
    }
  };

  const handleExport = () => {
    const csvData = [
      ['User Name', 'User Email', 'Product', 'Plan Type', 'Quantity', 'Status', 'Start Date', 'End Date', 'Price'],
      ...filteredSubscriptions.map(sub => [
        sub.user?.name || 'N/A',
        sub.user?.email || 'N/A',
        sub.product?.name || 'N/A',
        sub.planType || 'N/A',
        sub.quantity || 0,
        sub.status || 'N/A',
        sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A',
        sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A',
        sub.price || 0
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriptions exported successfully');
  };

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
          <span>Total: {subscriptions.length}</span>
          <span>Active: {analytics.activeCount}</span>
          <span>Revenue: ₹{analytics.totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="subscription-analytics">
        <div className="analytics-card">
          <h3>Total Revenue</h3>
          <p className="analytics-value">₹{analytics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="analytics-card">
          <h3>Active Subscriptions</h3>
          <p className="analytics-value">{analytics.activeCount}</p>
        </div>
        <div className="analytics-card">
          <h3>Cancelled</h3>
          <p className="analytics-value">{analytics.cancelledCount}</p>
        </div>
        <div className="analytics-card">
          <h3>Expired</h3>
          <p className="analytics-value">{analytics.expiredCount}</p>
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

      {selectedSubscriptions.length > 0 && (
        <div className="bulk-actions-bar">
          <span>{selectedSubscriptions.length} subscription(s) selected</span>
          <div className="bulk-actions-buttons">
            <button onClick={() => handleBulkAction('activate')} className="btn-bulk-activate">
              Activate Selected
            </button>
            <button onClick={() => handleBulkAction('cancel')} className="btn-bulk-cancel">
              Cancel Selected
            </button>
            <button onClick={() => { setSelectedSubscriptions([]); setSelectAll(false); }} className="btn-clear-selection">
              Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="subscription-actions-bar">
        <button onClick={handleExport} className="btn-export">
          Export to CSV
        </button>
      </div>

      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="select-checkbox"
                />
              </th>
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
                <td colSpan="9" className="no-data">No subscriptions found</td>
              </tr>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <tr key={subscription._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.includes(subscription._id)}
                      onChange={() => handleSelectSubscription(subscription._id)}
                      className="select-checkbox"
                    />
                  </td>
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

