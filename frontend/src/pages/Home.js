import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to White Craft</h1>
          <p>Premium Quality Milk Products</p>
          <p className="hero-subtitle">Fresh cow milk and buffalo milk delivered to your doorstep</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
            <Link to="/subscriptions" className="btn btn-secondary">View Subscriptions</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose White Craft?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🥛</div>
              <h3>Premium Quality</h3>
              <p>Fresh, pure milk from trusted farms</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Home Delivery</h3>
              <p>Convenient delivery to your doorstep</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Subscription Plans</h3>
              <p>Flexible plans: 7, 15, 30 days, or 3 months</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>B2B Solutions</h3>
              <p>Bulk orders and business partnerships</p>
            </div>
          </div>
        </div>
      </section>

      <section className="products-preview">
        <div className="container">
          <h2>Our Products</h2>
          <div className="products-grid">
            <div className="product-preview-card">
              <div className="product-image">🐄</div>
              <h3>Cow Milk</h3>
              <p>Fresh, pure cow milk</p>
              <Link to="/shop" className="btn btn-outline">View Product</Link>
            </div>
            <div className="product-preview-card">
              <div className="product-image">🐃</div>
              <h3>Buffalo Milk</h3>
              <p>Rich, creamy buffalo milk</p>
              <Link to="/shop" className="btn btn-outline">View Product</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

