import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    console.log('AuthContext Initialization:', {
      hasToken: !!token,
      hasSavedUser: !!savedUser
    });

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed User from localStorage:', {
          id: parsedUser._id,
          email: parsedUser.email,
          role: parsedUser.role,
          fullUser: parsedUser
        });
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Verify token is still valid
        verifyToken();
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      console.log('No token or saved user found');
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        console.log('Token verified - User data from API:', {
          id: userData._id,
          email: userData.email,
          role: userData.role,
          fullUser: userData
        });
        
        // Ensure role is present
        if (!userData.role) {
          console.warn('User data from API does not have role property:', userData);
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('Token verification failed - API returned success: false');
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        console.log('Login successful - User data:', {
          id: user._id,
          email: user.email,
          role: user.role,
          fullUser: user
        });
        
        // Ensure role is present
        if (!user.role) {
          console.warn('User data from login does not have role property:', user);
        }
        
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    console.log('Updating user:', {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      fullUser: updatedUser
    });
    
    // Ensure role is preserved
    if (!updatedUser.role) {
      console.warn('Updated user data does not have role property:', updatedUser);
    }
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Debug: Log user state changes
  useEffect(() => {
    if (user) {
      console.log('AuthContext User State:', {
        id: user._id,
        email: user.email,
        role: user.role,
        isAuthenticated,
        hasRole: !!user.role
      });
    } else {
      console.log('AuthContext User State: No user');
    }
  }, [user, isAuthenticated]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

