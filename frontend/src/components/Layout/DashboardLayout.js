import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show sidebar on all authenticated pages (except login/signup/home)
  const publicRoutes = ['/login', '/signup', '/'];
  const showSidebar = isAuthenticated && !publicRoutes.includes(location.pathname);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSidebarStateChange = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {showSidebar && (
        <>
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu-overlay"
              onClick={closeMobileMenu}
            />
          )}
          <Sidebar 
            onStateChange={handleSidebarStateChange}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={closeMobileMenu}
          />
        </>
      )}
      <div className={`dashboard-content ${showSidebar ? 'with-sidebar' : ''} ${showSidebar && isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

