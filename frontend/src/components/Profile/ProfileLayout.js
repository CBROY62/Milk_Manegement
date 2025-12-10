import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import ProfileSidebar from './ProfileSidebar';
import './ProfileLayout.css';

const ProfileLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="profile-layout">
      <button 
        className="profile-mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>
      {isMobileMenuOpen && (
        <div 
          className="profile-mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}
      <ProfileSidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />
      <div className="profile-content-area">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
