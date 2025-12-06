import React from 'react';
import './Layout.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>White Craft</h3>
          <p>Premium quality milk products delivered to your doorstep.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/subscriptions">Subscriptions</a></li>
            <li><a href="/franchise">Franchise</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@whitecraft.com</p>
          <p>Phone: +1 234 567 8900</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 White Craft. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

