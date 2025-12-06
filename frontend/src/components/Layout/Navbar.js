import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Layout.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>White Craft</h2>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <>
                  <Link to="/cart" className="nav-link">Cart ({getCartItemCount()})</Link>
                  <Link to="/orders" className="nav-link">Orders</Link>
                  <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">Admin</Link>
              )}
              {user?.role === 'mediator' && (
                <Link to="/mediator/dashboard" className="nav-link">Dashboard</Link>
              )}
              {user?.role === 'delivery_boy' && (
                <Link to="/delivery/dashboard" className="nav-link">Delivery</Link>
              )}
              {user?.isB2B && (
                <Link to="/b2b/dashboard" className="nav-link">B2B</Link>
              )}
              <Link to="/franchise" className="nav-link">Franchise</Link>
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

