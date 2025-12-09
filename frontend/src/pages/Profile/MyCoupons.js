import React from 'react';
import './ProfilePage.css';

const MyCoupons = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <h2 className="profile-section-title">My Coupons</h2>
        <div className="profile-section-content">
          <p>You don't have any coupons yet. Check back later for special offers and discounts!</p>
        </div>
      </div>
    </div>
  );
};

export default MyCoupons;
