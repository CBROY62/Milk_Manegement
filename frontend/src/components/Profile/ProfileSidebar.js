import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiUser,
  FiLogOut,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiFileText,
  FiTag,
  FiStar,
  FiBell,
  FiHeart,
  FiChevronRight
} from 'react-icons/fi';
import './ProfileSidebar.css';

const ProfileSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    orders: false,
    account: true,
    payments: false,
    stuff: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="profile-sidebar">
      <div className="profile-sidebar-header">
        <div className="profile-user-greeting">
          <div className="profile-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="profile-user-info">
            <p className="greeting-text">Hello,</p>
            <p className="user-name-text">{user?.name || 'User'}</p>
          </div>
        </div>
      </div>

      <div className="profile-sidebar-content">
        {/* MY ORDERS */}
        <div className="profile-nav-section">
          <Link
            to="/orders"
            className="profile-nav-header-clickable"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="profile-nav-header-left">
              <FiPackage className="profile-section-icon" />
              <span className="profile-nav-title">MY ORDERS</span>
            </div>
            <FiChevronRight className="profile-chevron" />
          </Link>
        </div>

        {/* ACCOUNT SETTINGS */}
        <div className="profile-nav-section">
          <div 
            className="profile-nav-header-clickable"
            onClick={() => toggleSection('account')}
          >
            <div className="profile-nav-header-left">
              <FiUser className="profile-section-icon" />
              <span className="profile-nav-title">ACCOUNT SETTINGS</span>
            </div>
            <FiChevronRight 
              className={`profile-chevron ${expandedSections.account ? 'expanded' : ''}`}
            />
          </div>
          {expandedSections.account && (
            <nav className="profile-nav-menu">
              <Link
                to="/profile"
                className={`profile-nav-item ${isActive('/profile') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiUser />
                </span>
                <span className="profile-nav-label">Profile Information</span>
              </Link>
              <Link
                to="/profile/addresses"
                className={`profile-nav-item ${isActive('/profile/addresses') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiMapPin />
                </span>
                <span className="profile-nav-label">Manage Addresses</span>
              </Link>
              <Link
                to="/profile/pan-card"
                className={`profile-nav-item ${isActive('/profile/pan-card') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiFileText />
                </span>
                <span className="profile-nav-label">PAN Card Information</span>
              </Link>
            </nav>
          )}
        </div>

        {/* PAYMENTS */}
        <div className="profile-nav-section">
          <div 
            className="profile-nav-header-clickable"
            onClick={() => toggleSection('payments')}
          >
            <div className="profile-nav-header-left">
              <FiCreditCard className="profile-section-icon" />
              <span className="profile-nav-title">PAYMENTS</span>
            </div>
            <FiChevronRight 
              className={`profile-chevron ${expandedSections.payments ? 'expanded' : ''}`}
            />
          </div>
          {expandedSections.payments && (
            <nav className="profile-nav-menu">
              <Link
                to="/profile/gift-cards"
                className={`profile-nav-item ${isActive('/profile/gift-cards') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiTag />
                </span>
                <span className="profile-nav-label">Gift Cards</span>
                <span className="profile-nav-badge">₹0</span>
              </Link>
              <Link
                to="/profile/saved-upi"
                className={`profile-nav-item ${isActive('/profile/saved-upi') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiCreditCard />
                </span>
                <span className="profile-nav-label">Saved UPI</span>
              </Link>
              <Link
                to="/profile/saved-cards"
                className={`profile-nav-item ${isActive('/profile/saved-cards') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiCreditCard />
                </span>
                <span className="profile-nav-label">Saved Cards</span>
              </Link>
            </nav>
          )}
        </div>

        {/* MY STUFF */}
        <div className="profile-nav-section">
          <div 
            className="profile-nav-header-clickable"
            onClick={() => toggleSection('stuff')}
          >
            <div className="profile-nav-header-left">
              <FiUser className="profile-section-icon" />
              <span className="profile-nav-title">MY STUFF</span>
            </div>
            <FiChevronRight 
              className={`profile-chevron ${expandedSections.stuff ? 'expanded' : ''}`}
            />
          </div>
          {expandedSections.stuff && (
            <nav className="profile-nav-menu">
              <Link
                to="/profile/coupons"
                className={`profile-nav-item ${isActive('/profile/coupons') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiTag />
                </span>
                <span className="profile-nav-label">My Coupons</span>
              </Link>
              <Link
                to="/profile/reviews"
                className={`profile-nav-item ${isActive('/profile/reviews') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiStar />
                </span>
                <span className="profile-nav-label">My Reviews & Ratings</span>
              </Link>
              <Link
                to="/profile/notifications"
                className={`profile-nav-item ${isActive('/profile/notifications') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiBell />
                </span>
                <span className="profile-nav-label">All Notifications</span>
              </Link>
              <Link
                to="/profile/wishlist"
                className={`profile-nav-item ${isActive('/profile/wishlist') ? 'active' : ''}`}
              >
                <span className="profile-nav-icon">
                  <FiHeart />
                </span>
                <span className="profile-nav-label">My Wishlist</span>
              </Link>
            </nav>
          )}
        </div>
      </div>

      <div className="profile-sidebar-footer">
        <button onClick={handleLogout} className="profile-logout-btn">
          <FiLogOut className="logout-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
