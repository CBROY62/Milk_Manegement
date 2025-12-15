import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-toastify';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    duration: 7,
    label: '',
    description: '',
    price: 0,
    discountPercent: 0,
    isDefault: false,
    isActive: true,
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions/plans/all');
      if (response.data.success) {
        setPlans(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error(error.response?.data?.message || 'Failed to load subscription plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    });
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFormData({
      ...formData,
      features: formData.features.filter(feature => feature !== featureToRemove)
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan._id);
    setFormData({
      name: plan.name || '',
      type: plan.type || '',
      duration: plan.duration || 7,
      label: plan.label || '',
      description: plan.description || '',
      price: plan.price || 0,
      discountPercent: plan.discountPercent || 0,
      isDefault: plan.isDefault || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      features: plan.features || []
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      type: '',
      duration: 7,
      label: '',
      description: '',
      price: 0,
      discountPercent: 0,
      isDefault: false,
      isActive: true,
      features: []
    });
    setFeatureInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.type.trim() || !formData.label.trim()) {
      toast.error('Name, type, and label are required');
      return;
    }

    if (formData.duration < 1) {
      toast.error('Duration must be at least 1 day');
      return;
    }

    try {
      if (editingPlan) {
        const response = await api.put(`/subscriptions/plans/${editingPlan}`, formData);
        if (response.data.success) {
          toast.success('Subscription plan updated successfully');
          handleCancel();
          fetchPlans();
        }
      } else {
        const response = await api.post('/subscriptions/plans', formData);
        if (response.data.success) {
          toast.success('Subscription plan created successfully');
          handleCancel();
          fetchPlans();
        }
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.message || 'Failed to save subscription plan');
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/subscriptions/plans/${planId}`);
      if (response.data.success) {
        toast.success('Subscription plan deleted successfully');
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subscription plan');
    }
  };

  const handleToggleStatus = async (planId, currentStatus) => {
    try {
      const response = await api.put(`/subscriptions/plans/${planId}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast.error(error.response?.data?.message || 'Failed to update plan status');
    }
  };

  if (loading) {
    return (
      <div className="subscription-plans-container">
        <div className="loading-spinner">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="subscription-plans-container">
      <div className="subscription-plans-header">
        <h1>Subscription Plans Management</h1>
        <div className="plans-stats">
          <span>Total Plans: {plans.length}</span>
          <span>Active: {plans.filter(p => p.isActive !== false).length}</span>
          <button 
            className="btn-add-plan"
            onClick={() => setShowForm(true)}
          >
            + Add Plan
          </button>
        </div>
      </div>

      {showForm && (
        <div className="plan-form-modal">
          <div className="plan-form-content">
            <div className="form-header">
              <h2>{editingPlan ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}</h2>
              <button className="btn-close" onClick={handleCancel}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., Weekly Plan"
                  />
                </div>
                <div className="form-group">
                  <label>Plan Type *</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., weekly_plan"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Label *</label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., 7 Days"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (Days) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-input"
                  placeholder="Plan description..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Features</label>
                <div className="features-input-container">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Add a feature and press Enter"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="btn-add-feature"
                  >
                    Add
                  </button>
                </div>
                <div className="features-list">
                  {formData.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="feature-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  Default Plan
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.length === 0 ? (
          <div className="no-data">No subscription plans found. Create your first plan!</div>
        ) : (
          plans.map((plan) => (
            <div key={plan._id} className="plan-card">
              <div className="plan-card-header">
                <div className="plan-meta">
                  {plan.isDefault && <span className="default-badge">Default</span>}
                  <span className={`status-badge ${plan.isActive !== false ? 'status-active' : 'status-inactive'}`}>
                    {plan.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="plan-actions">
                  <button
                    onClick={() => handleToggleStatus(plan._id, plan.isActive !== false)}
                    className={`btn-toggle-status ${plan.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                  >
                    {plan.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="plan-card-content">
                <h3 className="plan-name">{plan.name || plan.label}</h3>
                <p className="plan-type">Type: {plan.type}</p>
                <div className="plan-details">
                  <div className="plan-detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{plan.duration} days</span>
                  </div>
                  {plan.price > 0 && (
                    <div className="plan-detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">₹{plan.price.toFixed(2)}</span>
                    </div>
                  )}
                  {plan.discountPercent > 0 && (
                    <div className="plan-detail-item">
                      <span className="detail-label">Discount:</span>
                      <span className="detail-value">{plan.discountPercent}%</span>
                    </div>
                  )}
                </div>
                {plan.description && (
                  <p className="plan-description">{plan.description}</p>
                )}
                {plan.features && plan.features.length > 0 && (
                  <div className="plan-features">
                    <strong>Features:</strong>
                    <ul>
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

