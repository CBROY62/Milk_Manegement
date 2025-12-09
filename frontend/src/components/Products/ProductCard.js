import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Products.css';

const ProductCard = ({ product, onAddToCart }) => {
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const productTypeLabel = product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk';
  const productIcon = product.type === 'cow_milk' ? '🐄' : '🐃';

  const getVariantLabel = (variant) => {
    const variantLabels = {
      'full_cream': 'Full Cream',
      'standardized': 'Standardized',
      'toned': 'Toned',
      'double_toned': 'Double Toned',
      'skimmed': 'Skimmed'
    };
    return variantLabels[variant] || '';
  };

  const getVariantColor = (variant) => {
    const colors = {
      'full_cream': '#ff6b6b',
      'standardized': '#4ecdc4',
      'toned': '#45b7d1',
      'double_toned': '#96ceb4',
      'skimmed': '#ffeaa7'
    };
    return colors[variant] || '#667eea';
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    const maxStock = product.stock || 999;
    if (value >= 1 && value <= maxStock) {
      setQuantity(value);
    } else if (value > maxStock) {
      setQuantity(maxStock);
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const maxQuantity = product.stock || 999;

  return (
    <div className="product-card">
      <div className="product-card-header">
        <div className="product-icon">{productIcon}</div>
        {product.pricingType === 'B2B' && (
          <div className="b2b-badge-top">B2B</div>
        )}
        {product.variant && (
          <div 
            className="variant-badge-top"
            style={{ backgroundColor: getVariantColor(product.variant) }}
          >
            {getVariantLabel(product.variant)}
          </div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-type-row">
          <p className="product-type">{productTypeLabel}</p>
          {product.variant && (
            <span className="variant-label-badge" style={{ backgroundColor: getVariantColor(product.variant) + '20', color: getVariantColor(product.variant) }}>
              {getVariantLabel(product.variant)}
            </span>
          )}
        </div>
        {product.fatContent !== null && product.fatContent !== undefined && (
          <p className="fat-content-info">
            <span className="fat-icon">💧</span>
            Fat Content: {product.fatContent}%
          </p>
        )}
        {product.description && <p className="product-description">{product.description}</p>}
        <div className="product-pricing">
          <div className="price">
            <span className="price-label">{product.pricingType || 'B2C'} Price:</span>
            <span className="price-value">₹{product.currentPrice || product.priceB2C}</span>
          </div>
          <span className="price-unit">/ {product.unit || 'liter'}</span>
        </div>
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">✓ In Stock ({product.stock} {product.unit})</span>
          ) : (
            <span className="out-of-stock">✗ Out of Stock</span>
          )}
        </div>
        <div className="quantity-selector">
          <label>Quantity:</label>
          <div className="quantity-controls">
            <button
              className="quantity-btn minus"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || product.stock === 0}
            >
              −
            </button>
            <input
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={handleQuantityInput}
              min="1"
              max={maxQuantity}
              disabled={product.stock === 0}
            />
            <button
              className="quantity-btn plus"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity || product.stock === 0}
            >
              +
            </button>
          </div>
        </div>
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

