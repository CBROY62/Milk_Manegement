import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Payment.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key');

const PaymentForm = ({ amount, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent
    api.post('/payments/create-intent', { amount, orderId })
      .then(res => {
        if (res.data.success) {
          setClientSecret(res.data.data.clientSecret);
        }
      })
      .catch(err => {
        console.error('Error creating payment intent:', err);
        toast.error('Failed to initialize payment');
      });
  }, [amount, orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      try {
        await api.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id,
          orderId
        });
        toast.success('Payment successful!');
        onSuccess();
      } catch (err) {
        console.error('Payment confirmation error:', err);
        toast.error('Payment processed but confirmation failed');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <h2>Total Amount: ₹{amount.toFixed(2)}</h2>
      </div>
      <div className="card-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="pay-button"
      >
        {loading ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { formData, total } = location.state || {};

  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formData || !total) {
      navigate('/checkout');
      return;
    }

    // Create order first
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      setLoading(true);
      const response = await api.post('/orders/create', formData);
      if (response.data.success) {
        setOrderId(response.data.data.order._id);
        toast.success('Order created successfully');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
      navigate('/checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/orders');
  };

  if (loading || !orderId) {
    return <div className="payment-loading">Creating order...</div>;
  }

  return (
    <div className="payment-container">
      <h1>Payment</h1>
      <div className="payment-content">
        <Elements stripe={stripePromise}>
          <PaymentForm amount={total} orderId={orderId} onSuccess={handlePaymentSuccess} />
        </Elements>
      </div>
    </div>
  );
};

export default Payment;

