import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Create Socket.io connection
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected:', newSocket.id);
      setIsConnected(true);
      
      // Join user-specific room
      if (user._id) {
        newSocket.emit('join_room', `user:${user._id}`);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.io reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      
      // Rejoin user-specific room
      if (user._id) {
        newSocket.emit('join_room', `user:${user._id}`);
      }
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket.io reconnection attempt:', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket.io reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Socket.io reconnection failed');
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount or when user changes
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up Socket.io connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  // Helper function to track an order
  const trackOrder = (orderId) => {
    if (socket && socket.connected) {
      socket.emit('track_order', orderId);
      console.log('Tracking order:', orderId);
    }
  };

  // Helper function to untrack an order
  const untrackOrder = (orderId) => {
    if (socket && socket.connected) {
      socket.emit('untrack_order', orderId);
      console.log('Untracking order:', orderId);
    }
  };

  // Helper function to update delivery location
  const updateDeliveryLocation = (orderId, location) => {
    if (socket && socket.connected && user?.role === 'delivery_boy') {
      socket.emit('update_location', {
        orderId,
        location
      });
    }
  };

  const value = {
    socket,
    isConnected,
    trackOrder,
    untrackOrder,
    updateDeliveryLocation
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

