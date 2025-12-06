import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    deliveryType: 'home_delivery',
    address: user?.address || '',
    phone: user?.phone || '',
    paymentMethod: 'stripe'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.deliveryType === 'home_delivery' && !formData.address) {
      toast.error('Please provide delivery address');
      return;
    }

    setLoading(true);

    navigate('/payment', { state: { formData, total: getCartTotal() + 50 } });
    setLoading(false);
  };

  if (cartItems.length === 0) {
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
                    required
                  />
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
                    required
                  />
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

          <button type="submit" className="checkout-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>

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

