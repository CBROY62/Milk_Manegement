import React from 'react';
import './ProfilePage.css';

const MyWishlist = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <h2 className="profile-section-title">My Wishlist</h2>
        <div className="profile-section-content">
          <p>Your wishlist is empty. Start adding products you love!</p>
        </div>
      </div>
    </div>
  );
};

export default MyWishlist;
