import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiLayout,
  FiUser,
  FiShoppingBag,
  FiShoppingCart,
  FiFileText,
  FiStar,
  FiCreditCard,
  FiUsers,
  FiPackage,
  FiHome,
  FiLogOut,
  FiBarChart2,
  FiX
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ onStateChange, isMobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const cart = useCart();
  const cartCount = cart?.getCartItemCount ? cart.getCartItemCount() : 0;
  
  // State management for sidebar collapse/expand (hover only)
  const [isHovered, setIsHovered] = useState(false); // Hover state
  
  // Sidebar is expanded only when hovered (desktop) or when mobile menu is open
  const isExpanded = isHovered || isMobileOpen;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onStateChange) {
      onStateChange(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onStateChange) {
      onStateChange(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'mediator') return '/mediator/dashboard';
    if (user?.role === 'delivery_boy') return '/delivery/dashboard';
    if (user?.isB2B) return '/b2b/dashboard';
    return '/shop';
  };

  const mainMenuItems = [
    {
      path: '/',
      label: 'Home',
      icon: <FiHome />,
      roles: ['customer', 'admin', 'mediator', 'delivery_boy'],
      show: true
    },
    {
      path: getDashboardPath(),
      label: 'Dashboard',
      icon: <FiLayout />,
      roles: ['customer', 'admin', 'mediator', 'delivery_boy'],
      show: true
    },
    {
      path: '/shop',
      label: 'Shop',
      icon: <FiShoppingBag />,
      roles: ['customer', 'admin', 'mediator'],
      show: isAuthenticated
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: <FiShoppingCart />,
      roles: ['customer', 'admin', 'mediator'],
      show: isAuthenticated,
      badge: cartCount
    },
    {
      path: '/subscriptions',
      label: 'My Subscription',
      icon: <FiStar />,
      roles: ['customer', 'admin', 'mediator'],
      show: isAuthenticated
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: <FiFileText />,
      roles: ['customer', 'admin', 'mediator', 'delivery_boy'],
      show: isAuthenticated
    },
    {
      path: '/payment-history',
      label: 'Payment History',
      icon: <FiCreditCard />,
      roles: ['customer', 'admin', 'mediator'],
      show: isAuthenticated
    },
    {
      path: '/franchise',
      label: 'Franchise',
      icon: <FiUsers />,
      roles: ['customer', 'admin', 'mediator'],
      show: isAuthenticated
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <FiUser />,
      roles: ['customer', 'admin', 'mediator', 'delivery_boy'],
      show: isAuthenticated
    }
  ];

  const adminMenuItems = useMemo(() => [
    {
      path: '/admin/dashboard',
      label: 'Admin Dashboard',
      icon: <FiLayout />,
      show: true
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: <FiUsers />,
      show: true
    },
    {
      path: '/admin/products',
      label: 'Manage Tests',
      icon: <FiPackage />,
      show: true
    },
    {
      path: '/admin/questions',
      label: 'Questions',
      icon: <FiFileText />,
      show: true
    },
    {
      path: '/admin/subscriptions',
      label: 'Subscription Management',
      icon: <FiStar />,
      show: true
    },
    {
      path: '/admin/subscription-plans',
      label: 'Subscription Plans',
      icon: <FiStar />,
      show: true
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: <FiBarChart2 />,
      show: true
    }
  ], []);

  // Calculate isAdmin - check if user exists and role is admin
  const isAdmin = isAuthenticated && user && user.role === 'admin';

  // Filter admin menu items based on show property
  const visibleAdminMenuItems = adminMenuItems.filter(item => item.show === true);

  // Debug: Log admin section visibility
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Admin Section Debug:', {
        isAuthenticated,
        user: user,
        userRole: user?.role,
        isAdmin: user?.role === 'admin',
        visibleAdminMenuItemsCount: visibleAdminMenuItems.length,
        shouldShow: isAuthenticated && (user?.role === 'admin')
      });
    }
  }, [isAuthenticated, user, visibleAdminMenuItems.length]);

  // Filter main menu items based on user role and authentication
  const visibleMainMenuItems = mainMenuItems.filter(item => {
    if (!item.show) return false;
    if (!isAuthenticated && item.path !== '/') return false;
    if (item.roles && user && !item.roles.includes(user.role)) return false;
    return true;
  });

  // Remove duplicates by path (keep first occurrence)
  const uniqueMainMenuItems = visibleMainMenuItems.filter((item, index, self) =>
    index === self.findIndex(t => t.path === item.path)
  );

  // Handle menu item click on mobile - close sidebar
  const handleMenuItemClick = () => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div 
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${isMobileOpen ? 'open' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-circle">
            <div className="logo-checkmark">✓</div>
            <div className="logo-book">📖</div>
          </div>
        </div>
        <div className="sidebar-brand">
          <h2 className="brand-title">White Craft</h2>
          <p className="brand-tagline">Where Every Mock Moves</p>
        </div>
        {isMobileOpen && onMobileClose && (
          <button 
            className="sidebar-close-btn"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        )}
      </div>

      <div className="sidebar-content">
        <div className="menu-section">
          <div className="menu-section-header">
            <span className="section-title">
              {user?.role === 'delivery_boy' ? 'DELIVERY BOY' : 'MAIN MENU'}
            </span>
            {user?.role === 'delivery_boy' && (
              <span className="delivery-badge">Delivery</span>
            )}
            {user?.role !== 'delivery_boy' && (
              <span className="section-toggle">⚙</span>
            )}
          </div>
          <nav className="menu-nav">
            {uniqueMainMenuItems.map((item) => (
              <Link
                key={`${item.path}-${item.label}`}
                to={item.path}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                title={isExpanded ? item.path : item.label}
                onClick={handleMenuItemClick}
              >
                <span className="menu-icon">
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="menu-badge">{item.badge}</span>
                  )}
                </span>
                <span className="menu-label">{item.label}</span>
                {!isExpanded && (
                  <span className="menu-tooltip">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Admin section - show only for admin users */}
        {isAuthenticated && visibleAdminMenuItems.length > 0 && user?.role === 'admin' && (
          <div className="menu-section">
            <div className="menu-section-header">
              <span className="section-title">ADMINISTRATION</span>
              <span className="admin-badge">Admin</span>
            </div>
            <nav className="menu-nav">
              {visibleAdminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                  title={isExpanded ? item.path : item.label}
                  onClick={handleMenuItemClick}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  {!isExpanded && (
                    <span className="menu-tooltip">{item.label}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Customer'}</span>
            </div>
          </div>
          <button 
            onClick={() => {
              handleLogout();
              if (isMobileOpen && onMobileClose) {
                onMobileClose();
              }
            }} 
            className="sidebar-logout-btn"
          >
            <FiLogOut />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

