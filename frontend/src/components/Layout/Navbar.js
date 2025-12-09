import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Layout.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on authenticated pages (where sidebar is shown)
  const publicRoutes = ['/login', '/signup', '/'];
  const profileRoutes = ['/profile', '/profile/orders', '/profile/addresses', '/profile/pan-card', '/profile/gift-cards', '/profile/saved-upi', '/profile/saved-cards', '/profile/coupons', '/profile/reviews', '/profile/notifications', '/profile/wishlist'];
  const shouldShowNavbar = (!isAuthenticated || publicRoutes.includes(location.pathname)) && !profileRoutes.includes(location.pathname);

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'mediator') return '/mediator/dashboard';
    if (user?.role === 'delivery_boy') return '/delivery/dashboard';
    if (user?.isB2B) return '/b2b/dashboard';
    return '/shop';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!shouldShowNavbar) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>White Craft</h2>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Home</Link>
          
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="nav-link">Dashboard</Link>
              <div className="nav-user">
                <span>{user?.name}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link signup-link">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

