import React from 'react';
import { useLocation } from 'react-router-dom';
import './Layout.css';

const Footer = () => {
  const location = useLocation();
  
  // Hide footer on profile pages
  const profileRoutes = ['/profile', '/profile/orders', '/profile/addresses', '/profile/pan-card', '/profile/gift-cards', '/profile/saved-upi', '/profile/saved-cards', '/profile/coupons', '/profile/reviews', '/profile/notifications', '/profile/wishlist'];
  if (profileRoutes.includes(location.pathname)) {
    return null;
  }
  
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Information Section */}
        <div className="footer-section footer-company">
          <div className="footer-brand">
            <span className="brand-icon">□</span>
            <h3 className="brand-name">WHITE CRAFT</h3>
          </div>
          <div className="company-info">
            <p><strong>Corporate Office:</strong></p>
            <p>H Block, Sector 63, Noida, Uttar Pradesh 201301</p>
            <p><strong>Manufacturing & Packaging Address:</strong></p>
            <p>Nawada Sahaswan Budaun</p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="footer-section">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><a href="/shop?category=dairy">Dairy</a></li>
            <li><a href="/shop?category=desi-ghee">Desi Ghee</a></li>
            <li><a href="/shop?category=bakery">Bakery</a></li>
            <li><a href="/shop?category=breakfast">Breakfast</a></li>
            <li><a href="/shop?category=fresh-fruits-veggies">Fresh Fruits & Veggies</a></li>
            <li><a href="/shop?category=grocery">Grocery</a></li>
            <li><a href="/shop?category=cold-pressed-oil">Cold Pressed Oil</a></li>
            <li><a href="/shop?category=dry-fruits">Dry Fruits</a></li>
          </ul>
        </div>

        {/* Useful Links Section */}
        <div className="footer-section">
          <h4 className="footer-heading">Useful Links</h4>
          <ul className="footer-links">
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-conditions">Terms & Conditions</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
            <li><a href="/shipping-policy">Shipping Policy</a></li>
            <li><a href="/reviews">WHITE CRAFT Reviews</a></li>
          </ul>
        </div>

        {/* Download App & Social Section */}
        <div className="footer-section footer-app-social">
          <div className="download-app-section">
            <h4 className="footer-heading">Download App</h4>
            <div className="app-buttons">
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="app-button google-play">
                <div className="app-button-text">
                  <span className="app-button-top">GET IT ON</span>
                  <span className="app-button-bottom">Google Play</span>
                </div>
              </a>
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="app-button app-store">
                <div className="app-button-text">
                  <span className="app-button-top">Download on the</span>
                  <span className="app-button-bottom">App Store</span>
                </div>
              </a>
            </div>
          </div>

          <div className="connect-section">
            <h4 className="footer-heading">Connect with us</h4>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <span>f</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <span>in</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                <span>▶</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <span>📷</span>
              </a>
            </div>
          </div>

          <div className="contact-section">
            <h4 className="footer-heading">Contact us</h4>
            <p className="contact-info">
              <a href="mailto:furqanullah3677@gmail.com">furqanullah3677@gmail.com</a>
            </p>
            <p className="contact-info">
              <a href="tel:+919927335197">+91 99273 35197</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>©2025, by whitecraft.com | All rights reserved | WHITE CRAFT Dairy Farms Private Limited</p>
        <p className="footer-owner">Owned & Managed by <span className="owner-name">Mr.Furqan ullah khan</span></p>
      </div>
    </footer>
  );
};

export default Footer;

