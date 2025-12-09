import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-badge">🥛 Fresh Daily</div>
          <h1>Welcome to White Craft</h1>
          <p className="hero-tagline">Premium Quality Milk Products</p>
          <p className="hero-subtitle">Fresh cow milk and buffalo milk delivered to your doorstep every day</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary">
              <span>🛒</span>
              Shop Now
            </Link>
            <Link to="/subscriptions" className="btn btn-secondary">
              <span>📦</span>
              View Subscriptions
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Orders Delivered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose White Craft?</h2>
            <p className="section-subtitle">Experience the difference with our premium milk products</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🥛</div>
              </div>
              <h3>Premium Quality</h3>
              <p>Fresh, pure milk from trusted farms with strict quality control</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🚚</div>
              </div>
              <h3>Home Delivery</h3>
              <p>Convenient delivery to your doorstep every morning</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📦</div>
              </div>
              <h3>Subscription Plans</h3>
              <p>Flexible plans: 7, 15, 30 days, or 3 months</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">💼</div>
              </div>
              <h3>B2B Solutions</h3>
              <p>Bulk orders and business partnerships with special pricing</p>
            </div>
          </div>
        </div>
      </section>

      <section className="products-preview">
        <div className="container">
          <div className="section-header">
            <h2>Our Products</h2>
            <p className="section-subtitle">Choose from our premium selection of fresh milk products</p>
          </div>
          <div className="products-grid">
            <div className="product-preview-card">
              <div className="product-card-header">
                <div className="product-image">🐄</div>
                <div className="product-badge">Popular</div>
              </div>
              <div className="product-card-content">
                <h3>Cow Milk</h3>
                <p>Fresh, pure cow milk packed with essential nutrients</p>
                <div className="product-features">
                  <span className="feature-tag">✓ Fresh Daily</span>
                  <span className="feature-tag">✓ Pure & Natural</span>
                </div>
                <Link to="/shop" className="btn btn-outline">View Product →</Link>
              </div>
            </div>
            <div className="product-preview-card">
              <div className="product-card-header">
                <div className="product-image">🐃</div>
                <div className="product-badge">Premium</div>
              </div>
              <div className="product-card-content">
                <h3>Buffalo Milk</h3>
                <p>Rich, creamy buffalo milk with higher fat content</p>
                <div className="product-features">
                  <span className="feature-tag">✓ Extra Creamy</span>
                  <span className="feature-tag">✓ Rich Taste</span>
                </div>
                <Link to="/shop" className="btn btn-outline">View Product →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

