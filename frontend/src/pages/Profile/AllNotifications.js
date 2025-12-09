import React from 'react';
import './ProfilePage.css';

const AllNotifications = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <h2 className="profile-section-title">All Notifications</h2>
        <div className="profile-section-content">
          <p>You don't have any notifications at the moment.</p>
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;
