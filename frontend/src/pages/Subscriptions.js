import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useModal } from '../context/ModalContext';
import './Subscriptions.css';

const Subscriptions = () => {
  const { showConfirm } = useModal();
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    planType: '30_days',
    productId: '',
    quantity: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subsRes, productsRes] = await Promise.all([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/my-subscriptions'),
        api.get('/products')
      ]);

      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (subsRes.data.success) setSubscriptions(subsRes.data.data);
      if (productsRes.data.success) setProducts(productsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/subscriptions/create', formData);
      if (response.data.success) {
        toast.success('Subscription created successfully!');
        setShowForm(false);
        fetchData();
        // Navigate to payment if needed
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subscription');
    }
  };

  const handleCancel = async (subscriptionId) => {
    const confirmed = await showConfirm({
      title: 'Cancel Subscription',
      message: 'Are you sure you want to cancel this subscription?',
      type: 'warning',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep'
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.put(`/subscriptions/${subscriptionId}/cancel`);
      if (response.data.success) {
        toast.success('Subscription cancelled');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <div className="subscriptions-loading">Loading...</div>;
  }

  return (
    <div className="subscriptions-container">
      <div className="subscriptions-header">
        <h1>Subscriptions</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'New Subscription'}
        </button>
      </div>

      {showForm && (
        <div className="subscription-form-card">
          <h2>Create New Subscription</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Plan Duration</label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                required
              >
                {plans.map((plan) => (
                  <option key={plan.type} value={plan.type}>
                    {plan.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ₹{product.currentPrice || product.priceB2C} / {product.unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity (liters per day)</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Subscription
            </button>
          </form>
        </div>
      )}

      <div className="subscriptions-list">
        <h2>My Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <div className="no-subscriptions">
            <p>No active subscriptions</p>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <div key={sub._id} className="subscription-card">
              <div className="subscription-header">
                <h3>{sub.product?.name}</h3>
                <span className={`status-badge ${sub.status}`}>{sub.status}</span>
              </div>
              <div className="subscription-details">
                <p><strong>Plan:</strong> {sub.planType.replace('_', ' ')}</p>
                <p><strong>Quantity:</strong> {sub.quantity} {sub.product?.unit || 'liter'} per day</p>
                <p><strong>Start Date:</strong> {new Date(sub.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(sub.endDate).toLocaleDateString()}</p>
                <p><strong>Next Delivery:</strong> {new Date(sub.nextDeliveryDate).toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> ₹{sub.price.toFixed(2)}</p>
              </div>
              {sub.status === 'active' && (
                <button
                  onClick={() => handleCancel(sub._id)}
                  className="btn btn-danger"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

