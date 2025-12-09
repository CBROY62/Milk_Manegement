import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import OrderSuccessModal from '../components/Checkout/OrderSuccessModal';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deliveryType: 'home_delivery',
    address: user?.address || '',
    phone: user?.phone || '',
    paymentMethod: 'cod'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    // Update form data when user data changes
    if (user) {
      setFormData(prev => ({
        ...prev,
        address: prev.address || user.address || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (formData.deliveryType === 'home_delivery') {
      if (!formData.address || formData.address.trim() === '') {
        newErrors.address = 'Delivery address is required';
      }
    }

    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Check if cart is empty
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items to cart first.');
      navigate('/shop');
      return;
    }

    setLoading(true);
    setErrors({});

    // If COD is selected, create order directly and show success modal
    if (formData.paymentMethod === 'cod') {
      try {
        const response = await api.post('/orders/create', {
          deliveryType: formData.deliveryType,
          deliveryAddress: formData.address,
          phone: formData.phone,
          paymentMethod: 'cod'
        });
        
        if (response.data.success) {
          const order = response.data.data.order;
          setPlacedOrder(order);
          clearCart();
          setShowSuccessModal(true);
          // Modal will handle navigation automatically after 3 seconds
        } else {
          toast.error(response.data.message || 'Failed to place order');
        }
      } catch (error) {
        console.error('Order creation error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
        toast.error(errorMessage);
        
        // Set specific field errors if available
        if (error.response?.data?.errors) {
          const fieldErrors = {};
          error.response.data.errors.forEach(err => {
            if (err.param) {
              fieldErrors[err.param] = err.msg;
            }
          });
          setErrors(fieldErrors);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // For Stripe, go to payment page
      navigate('/payment', { state: { formData, total: getCartTotal() + 50 } });
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Navigate to orders history page to see all orders
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    navigate('/shop');
  };

  // Don't show empty cart message if order was just placed (show modal instead)
  if (cartItems.length === 0 && !placedOrder && !showSuccessModal) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const delivery = 50;
  const total = subtotal + delivery;

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Delivery Information</h2>
            <div className="form-group">
              <label>Delivery Type</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="home_delivery"
                    checked={formData.deliveryType === 'home_delivery'}
                    onChange={handleChange}
                  />
                  <span>Home Delivery</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="store_pickup"
                    checked={formData.deliveryType === 'store_pickup'}
                    onChange={handleChange}
                  />
                  <span>Store Pickup</span>
                </label>
              </div>
            </div>

            {formData.deliveryType === 'home_delivery' && (
              <>
                <div className="form-group">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your delivery address"
                    rows="4"
                    className={errors.address ? 'input-error' : ''}
                    required
                  />
                  {errors.address && (
                    <span className="error-message">{errors.address}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'input-error' : ''}
                    required
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>
              </>
            )}

            {formData.deliveryType === 'store_pickup' && (
              <div className="store-info">
                <p><strong>Store Address:</strong></p>
                <p>123 Main Street, City, State 12345</p>
                <p>Phone: +1 234 567 8900</p>
                <p>Hours: Mon-Sat 9 AM - 8 PM</p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Payment Method</h2>
            <div className="form-group">
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={formData.paymentMethod === 'stripe'}
                    onChange={handleChange}
                  />
                  <span>Credit/Debit Card (Stripe)</span>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="checkout-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : formData.paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
          </button>
        </form>

        {showSuccessModal && placedOrder && (
          <OrderSuccessModal
            order={placedOrder}
            onClose={handleCloseModal}
            onContinueShopping={handleContinueShopping}
          />
        )}

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map((item) => (
              <div key={item.product._id} className="order-item">
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{((item.product.currentPrice || item.product.priceB2C) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>₹{delivery.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

