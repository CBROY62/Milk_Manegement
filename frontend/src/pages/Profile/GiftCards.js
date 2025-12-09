import React from 'react';
import './ProfilePage.css';

const GiftCards = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <h2 className="profile-section-title">Gift Cards</h2>
        <div className="profile-section-content">
          <div className="profile-info-row">
            <span className="profile-info-label">Available Balance:</span>
            <span className="profile-info-value" style={{ color: '#28a745', fontWeight: '600' }}>₹0</span>
          </div>
          <p style={{ marginTop: '20px', color: '#666' }}>
            You don't have any gift cards yet. Gift cards can be purchased and redeemed during checkout.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;
