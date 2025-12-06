import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'processing', label: 'Processing' },
      { key: 'out_for_delivery', label: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered' }
    ];
    return steps;
  };

  const getCurrentStepIndex = () => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
    return statusOrder.indexOf(order?.status) || 0;
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
        </div>

        <div className="order-items-card">
          <h2>Order Items</h2>
          {order.items.map((item, index) => (
            <div key={index} className="tracking-item">
              <span>{item.product?.name || 'Product'} x {item.quantity}</span>
              <span>₹{item.total.toFixed(2)}</span>
            </div>
          ))}
          <div className="tracking-total">
            <span>Total: ₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

