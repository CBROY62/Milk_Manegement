import React from 'react';
import './ProfilePage.css';

const MyReviews = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <h2 className="profile-section-title">My Reviews & Ratings</h2>
        <div className="profile-section-content">
          <p>You haven't submitted any reviews yet. Share your feedback on products you've purchased!</p>
        </div>
      </div>
    </div>
  );
};

export default MyReviews;
