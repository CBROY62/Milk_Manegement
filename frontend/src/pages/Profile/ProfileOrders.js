import React from 'react';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfileOrders = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <h2 className="profile-section-title">My Orders</h2>
        <p>View and manage all your orders here.</p>
        <Link to="/orders" className="profile-btn profile-btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default ProfileOrders;
