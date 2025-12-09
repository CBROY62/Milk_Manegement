import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Show sidebar on all authenticated pages (except login/signup/home)
  const publicRoutes = ['/login', '/signup', '/'];
  const showSidebar = isAuthenticated && !publicRoutes.includes(location.pathname);

  const handleSidebarStateChange = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  return (
    <div className="dashboard-layout">
      {showSidebar && <Sidebar onStateChange={handleSidebarStateChange} />}
      <div className={`dashboard-content ${showSidebar ? 'with-sidebar' : ''} ${showSidebar && isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

