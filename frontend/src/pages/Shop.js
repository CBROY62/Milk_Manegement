import React from 'react';
import ProductList from '../components/Products/ProductList';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Shop.css';

const Shop = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
    toast.success(`${product.name} (${quantity} ${product.unit || 'item'}) added to cart!`);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="shop-header-content">
          <h1 className="shop-title">🛒 Our Products</h1>
          <p className="shop-subtitle">Premium Quality Fresh Milk Products</p>
          <div className="shop-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>100% Fresh</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Daily Delivery</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>
      <ProductList onAddToCart={handleAddToCart} />
    </div>
  );
};

export default Shop;

