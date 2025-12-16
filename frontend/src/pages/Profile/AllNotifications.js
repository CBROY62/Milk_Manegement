import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useModal } from '../../context/ModalContext';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const AllNotifications = () => {
  const { socket, isConnected } = useSocket();
  const { showConfirm } = useModal();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notifications from localStorage or API
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error parsing notifications:', error);
      }
    }
    setLoading(false);
  }, []);

  // Real-time notifications with Socket.io
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notificationData) => {
      console.log('New notification received:', notificationData);
      
      const newNotification = {
        _id: notificationData._id || Date.now().toString(),
        type: notificationData.type || 'info',
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        read: false,
        createdAt: notificationData.createdAt || new Date().toISOString()
      };

      // Add to notifications list
      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        // Save to localStorage
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });

      // Show toast notification
      const toastType = notificationData.type === 'success' ? 'success' :
                        notificationData.type === 'error' ? 'error' :
                        notificationData.type === 'warning' ? 'warning' : 'info';
      
      toast[toastType](notificationData.title || notificationData.message, {
        autoClose: 5000
      });
    };

    socket.on('notification', handleNotification);

    // Cleanup
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, isConnected]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({ ...notif, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif._id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = async () => {
    const confirmed = await showConfirm({
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notifications?',
      type: 'warning',
      confirmText: 'Yes, Clear All',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      setNotifications([]);
      localStorage.removeItem('notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-section-card">
          <h2 className="profile-section-title">All Notifications</h2>
          <div className="profile-section-content">
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="profile-section-title">
            All Notifications
            {unreadCount > 0 && (
              <span style={{ 
                marginLeft: '10px', 
                backgroundColor: '#ff4444', 
                color: 'white', 
                borderRadius: '50%', 
                padding: '2px 8px', 
                fontSize: '0.8rem' 
              }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        <div className="profile-section-content">
          {notifications.length === 0 ? (
            <p>You don't have any notifications at the moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: notification.read ? '#f9f9f9' : '#fff',
                    borderLeft: `4px solid ${
                      notification.type === 'success' ? '#28a745' :
                      notification.type === 'error' ? '#dc3545' :
                      notification.type === 'warning' ? '#ffc107' : '#007bff'
                    }`,
                    opacity: notification.read ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title}
                      </h3>
                      <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                        {notification.message}
                      </p>
                      <small style={{ color: '#999' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;
