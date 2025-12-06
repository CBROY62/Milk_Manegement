import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Products.css';

const ProductCard = ({ product, onAddToCart }) => {
  const { isAuthenticated } = useAuth();
  const productTypeLabel = product.type === 'cow_milk' ? 'Cow Milk' : 'Buffalo Milk';
  const productIcon = product.type === 'cow_milk' ? '🐄' : '🐃';

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    onAddToCart(product);
  };

  return (
    <div className="product-card">
      <div className="product-icon">{productIcon}</div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-type">{productTypeLabel}</p>
        {product.description && <p className="product-description">{product.description}</p>}
        <div className="product-pricing">
          <div className="price">
            <span className="price-label">{product.pricingType || 'B2C'} Price:</span>
            <span className="price-value">₹{product.currentPrice || product.priceB2C} / {product.unit || 'liter'}</span>
          </div>
          {product.pricingType === 'B2B' && (
            <div className="b2b-badge">B2B</div>
          )}
        </div>
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">In Stock ({product.stock} {product.unit})</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

