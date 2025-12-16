import React from 'react';
import { FiPackage, FiCheckCircle, FiTruck, FiHome, FiClock } from 'react-icons/fi';
import './OrderStatusTracking.css';

const OrderStatusTracking = ({ order }) => {
  if (!order) return null;

  const statusSteps = [
    { key: 'pending', label: 'Pending', icon: <FiClock /> },
    { key: 'confirmed', label: 'Confirmed', icon: <FiCheckCircle /> },
    { key: 'processing', label: 'Processing', icon: <FiPackage /> },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <FiTruck /> },
    { key: 'delivered', label: 'Delivered', icon: <FiHome /> }
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="order-status-tracking">
      <div className="tracking-header">
        <h3>Order Status Tracking</h3>
        <span className={`current-status-badge ${order.status}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="status-timeline">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const isCancelled = order.status === 'cancelled';

          return (
            <div
              key={step.key}
              className={`timeline-step ${isCompleted && !isCancelled ? 'completed' : ''} ${isCurrent && !isCancelled ? 'current' : ''} ${isCancelled ? 'cancelled' : ''}`}
            >
              <div className="step-icon">
                {step.icon}
              </div>
              <div className="step-label">{step.label}</div>
              {index < statusSteps.length - 1 && (
                <div className={`step-connector ${isCompleted && !isCancelled ? 'active' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="order-products-section">
        <h4>Products in this Order</h4>
        <div className="products-grid">
          {order.items?.map((item, idx) => (
            <div key={idx} className="product-card">
              <div className="product-image-placeholder">
                <FiPackage />
              </div>
              <div className="product-info">
                <h5>{item.product?.name || 'Product'}</h5>
                <div className="product-details">
                  <span className="product-quantity">Quantity: {item.quantity}</span>
                  <span className="product-price">₹{item.total.toFixed(2)}</span>
                </div>
                {item.product?.description && (
                  <p className="product-description">{item.product.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        {order.deliveryCharge > 0 && (
          <div className="summary-row">
            <span>Delivery Charge:</span>
            <span>₹{order.deliveryCharge.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total:</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTracking;

