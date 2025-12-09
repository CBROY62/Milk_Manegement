import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/history');
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      completed: '#28a745',
      failed: '#dc3545',
      refunded: '#6c757d'
    };
    return colors[status] || '#666';
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    return method.toUpperCase().replace('_', ' ');
  };

  if (loading) {
    return <div className="payment-history-loading">Loading payment history...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="payment-history-empty">
        <h2>No payment history yet</h2>
        <p>Your payment history will appear here once you make a payment.</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <h1>Payment History</h1>
      <div className="payment-history-list">
        {payments.map((payment) => (
          <div key={payment._id} className="payment-card">
            <div className="payment-header">
              <div>
                <h3>Payment #{payment._id.slice(-8).toUpperCase()}</h3>
                <p className="payment-date">
                  {new Date(payment.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div
                className="payment-status"
                style={{ backgroundColor: getStatusColor(payment.status) }}
              >
                {payment.status?.toUpperCase() || 'PENDING'}
              </div>
            </div>

            <div className="payment-details">
              <div className="payment-detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">₹{payment.amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="payment-detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{formatPaymentMethod(payment.paymentMethod)}</span>
              </div>
              {payment.order && (
                <div className="payment-detail-row">
                  <span className="detail-label">Order:</span>
                  <Link to={`/orders/${payment.order._id || payment.order}`} className="detail-link">
                    View Order #{payment.order.orderNumber || payment.order}
                  </Link>
                </div>
              )}
              {payment.transactionId && (
                <div className="payment-detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
