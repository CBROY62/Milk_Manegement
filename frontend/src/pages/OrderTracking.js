import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await api.put(`/orders/${id}/cancel`);
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrder();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to cancel this item?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await api.put(`/orders/${id}/cancel-item/${itemId}`);
      if (response.data.success) {
        toast.success('Item cancelled successfully');
        fetchOrder();
      }
    } catch (error) {
      console.error('Error cancelling item:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel item');
    } finally {
      setCancelling(false);
    }
  };

  // Map backend statuses to frontend display stages
  const getDisplayStage = (status) => {
    if (!status) return 'ordered';
    
    // Map backend statuses to simplified stages
    if (status === 'pending' || status === 'confirmed') {
      return 'ordered';
    } else if (status === 'processing' || status === 'out_for_delivery') {
      return 'ongoing';
    } else if (status === 'delivered') {
      return 'delivered';
    } else if (status === 'cancelled') {
      return 'cancelled';
    }
    return 'ordered';
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'ordered', label: 'Ordered' },
      { key: 'ongoing', label: 'On Going' },
      { key: 'delivered', label: 'Delivered Product' }
    ];
    return steps;
  };

  const getCurrentStepIndex = () => {
    const displayStage = getDisplayStage(order?.status);
    const statusOrder = ['ordered', 'ongoing', 'delivered'];
    const index = statusOrder.indexOf(displayStage);
    return index >= 0 ? index : 0;
  };

  const isCompleted = () => {
    return order?.status === 'delivered';
  };

  const canCancel = () => {
    return order && order.status !== 'delivered' && order.status !== 'cancelled';
  };

  const isCancelled = () => {
    return order?.status === 'cancelled';
  };

  if (loading) {
    return <div className="tracking-loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="tracking-error">Order not found</div>;
  }

  const currentStep = getCurrentStepIndex();
  const steps = getStatusSteps();

  return (
    <div className="order-tracking-container">
      <h1>Order Tracking</h1>
      <div className="tracking-content">
        <div className="order-info-card">
          <h2>Order #{order.orderNumber}</h2>
          <div className="info-row">
            <span>Order Date:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span>Delivery Type:</span>
            <span>{order.deliveryType.replace('_', ' ').toUpperCase()}</span>
          </div>
          {order.deliveryAddress && (
            <div className="info-row">
              <span>Delivery Address:</span>
              <span>{order.deliveryAddress}</span>
            </div>
          )}
          {order.deliveryBoy && (
            <div className="info-row">
              <span>Delivery Boy:</span>
              <span>{order.deliveryBoy.name} - {order.deliveryBoy.phone}</span>
            </div>
          )}
        </div>

        <div className="status-timeline">
          <h2>Order Status</h2>
          <div className="timeline">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`timeline-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
              >
                <div className="step-circle">
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>
          {isCompleted() && (
            <div className="completed-status" style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#155724', margin: 0 }}>✓ Completed</h3>
              <p style={{ color: '#155724', margin: '5px 0 0 0' }}>Your order has been successfully delivered!</p>
            </div>
          )}
          {isCancelled() && (
            <div className="cancelled-status" style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#721c24', margin: 0 }}>✗ Cancelled</h3>
              <p style={{ color: '#721c24', margin: '5px 0 0 0' }}>This order has been cancelled.</p>
            </div>
          )}
        </div>

        <div className="order-items-card">
          <h2>Order Items</h2>
          {order.items.map((item, index) => (
            <div key={index} className="tracking-item">
              <div className="tracking-item-content">
                <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                <span>₹{item.total.toFixed(2)}</span>
              </div>
              {canCancel() && (
                <button
                  className="cancel-item-btn"
                  onClick={() => handleCancelItem(item._id)}
                  disabled={cancelling}
                >
                  Cancel Item
                </button>
              )}
            </div>
          ))}
          <div className="tracking-total">
            <span>Total: ₹{order.total.toFixed(2)}</span>
          </div>
          {canCancel() && (
            <div className="cancel-order-section">
              <button
                className="cancel-order-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Entire Order'}
              </button>
            </div>
          )}
          {isCancelled() && (
            <div className="cancelled-badge">
              <span>Order Cancelled</span>
            </div>
          )}
        </div>

        <div className="help-section-card">
          <div className="help-header" onClick={() => setShowHelp(!showHelp)}>
            <h2>Help & Support</h2>
            <span className="help-toggle">{showHelp ? '−' : '+'}</span>
          </div>
          {showHelp && (
            <div className="help-content">
              <div className="help-item">
                <h3>How to Track Your Order?</h3>
                <p>You can track your order status in real-time using the status timeline above. The order goes through three stages: Ordered, On Going, and Delivered Product.</p>
              </div>
              <div className="help-item">
                <h3>Can I Cancel My Order?</h3>
                <p>Yes, you can cancel your order before it is delivered. You can cancel individual items or the entire order. Once an order is delivered, it cannot be cancelled.</p>
              </div>
              <div className="help-item">
                <h3>What Happens When I Cancel?</h3>
                <p>When you cancel an order or item, the product stock will be restored and your payment will be refunded according to our refund policy.</p>
              </div>
              <div className="help-item">
                <h3>Delivery Time</h3>
                <p>Orders are typically delivered within 24-48 hours. You will receive updates on your order status via email or SMS.</p>
              </div>
              <div className="help-item">
                <h3>Need More Help?</h3>
                <p>Contact our customer support team at support@milkmanagement.com or call us at +91-1234567890. We're available Monday-Saturday, 9 AM - 6 PM.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

