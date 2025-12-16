import React from 'react';
import { useCart } from '../../context/CartContext';
import { useModal } from '../../context/ModalContext';
import './Cart.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { showConfirm } = useModal();
  
  if (!item || !item.product) {
    return null;
  }
  
  const product = item.product;
  const productId = product._id || product;
  const price = product.currentPrice || product.priceB2C || 0;
  const total = price * item.quantity;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0 && !isNaN(newQuantity) && productId) {
      updateQuantity(productId, newQuantity);
    } else if (newQuantity <= 0) {
      // Reset to 1 if invalid quantity entered
      e.target.value = item.quantity;
    }
  };

  const handleRemove = async () => {
    if (!productId) return;
    
    const confirmed = await showConfirm({
      title: 'Remove Item',
      message: 'Remove this item from cart?',
      type: 'warning',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      removeFromCart(productId);
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

