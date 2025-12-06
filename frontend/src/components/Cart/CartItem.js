import React from 'react';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product;
  const price = product.currentPrice || product.priceB2C || 0;
  const total = price * item.quantity;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      updateQuantity(product._id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart(product._id);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <span className="product-icon-large">
          {product.type === 'cow_milk' ? '🐄' : '🐃'}
        </span>
      </div>
      <div className="cart-item-details">
        <h3>{product.name}</h3>
        <p className="product-type">
          {product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk'}
        </p>
        <p className="product-price">₹{price} / {product.unit || 'liter'}</p>
      </div>
      <div className="cart-item-quantity">
        <label>Quantity:</label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
        />
      </div>
      <div className="cart-item-total">
        <span className="total-label">Total:</span>
        <span className="total-value">₹{total.toFixed(2)}</span>
      </div>
      <button className="remove-btn" onClick={handleRemove}>
        Remove
      </button>
    </div>
  );
};

export default CartItem;

