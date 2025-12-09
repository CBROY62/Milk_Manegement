import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessModal.css';

const OrderSuccessModal = ({ order, onClose, onContinueShopping }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-navigate to orders history page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/orders');
      // Close modal after navigation
      setTimeout(() => {
        onClose();
      }, 100);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose, navigate]);

  const handleViewOrder = () => {
    if (order?._id) {
      navigate(`/orders/${order._id}`);
      onClose();
    }
  };

  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    }
    navigate('/shop');
    onClose();
  };

  // Three-step status visualization
  const steps = [
    { key: 'ordered', label: 'Ordered', completed: true },
    { key: 'ongoing', label: 'On Going', completed: false },
    { key: 'delivered', label: 'Delivered Product', completed: false }
  ];

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#28a745"/>
              <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="success-title">Order Placed Successfully!</h2>
          {order?.orderNumber && (
            <p className="success-order-number">Order #{order.orderNumber}</p>
          )}
        </div>

        <div className="success-modal-body">
          <div className="order-summary">
            <h3>Order Summary</h3>
            {order?.items && order.items.length > 0 && (
              <div className="summary-items">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="summary-item">
                    <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                    <span>₹{item.total?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="summary-item-more">
                    +{order.items.length - 3} more item(s)
                  </div>
                )}
              </div>
            )}
            {order?.total && (
              <div className="summary-total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{order.total.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="status-steps-container">
            <h3>Order Status</h3>
            <div className="status-steps">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`status-step ${step.completed ? 'completed' : ''} ${index === 0 ? 'active' : ''}`}
                >
                  <div className="step-indicator">
                    {step.completed ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#28a745"/>
                        <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <div className="step-number">{index + 1}</div>
                    )}
                  </div>
                  <div className="step-label">{step.label}</div>
                  {index < steps.length - 1 && (
                    <div className={`step-connector ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>
            <p className="status-message">
              Your order has been placed and is being processed. You will receive updates on your order status.
            </p>
          </div>
        </div>

        <div className="success-modal-footer">
          <button
            onClick={handleContinueShopping}
            className="btn-continue-shopping"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleViewOrder}
            className="btn-view-order"
          >
            View Order Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
