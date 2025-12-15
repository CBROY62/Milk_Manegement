import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const hasShownError = useRef(false);

  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log('ProtectedRoute Debug:', {
        path: location.pathname,
        isAuthenticated,
        user: user ? { id: user._id, email: user.email, role: user.role } : null,
        allowedRoles,
        userRole: user?.role,
        hasAccess: allowedRoles.length === 0 || allowedRoles.includes(user?.role)
      });
    }
  }, [loading, isAuthenticated, user, allowedRoles, location.pathname]);

  // Reset error flag when route changes
  useEffect(() => {
    hasShownError.current = false;
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const userRole = user?.role;
    
    // Debug: Log role check details
    console.log('Role Check:', {
      userRole,
      allowedRoles,
      isMatch: allowedRoles.includes(userRole),
      userObject: user
    });

    if (!userRole) {
      console.error('User object does not have role property:', user);
      if (!hasShownError.current) {
        toast.error('User role information is missing. Please login again.');
        hasShownError.current = true;
      }
      return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
      console.warn('Access denied:', {
        requiredRoles: allowedRoles,
        userRole: userRole,
        path: location.pathname
      });
      
      if (!hasShownError.current) {
        toast.error(`Access denied. This page requires ${allowedRoles.join(' or ')} role. Your role: ${userRole}`);
        hasShownError.current = true;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

