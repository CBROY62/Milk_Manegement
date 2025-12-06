import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCartItems(response.data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Store in localStorage for non-authenticated users
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const existingItem = localCart.find(item => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.push({ product, quantity });
      }
      
      localStorage.setItem('localCart', JSON.stringify(localCart));
      setCartItems(localCart);
      return;
    }

    try {
      const response = await api.post('/cart/add', {
        productId: product._id,
        quantity
      });
      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const item = localCart.find(item => item.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          removeFromCart(productId);
        } else {
          item.quantity = quantity;
          localStorage.setItem('localCart', JSON.stringify(localCart));
          setCartItems(localCart);
        }
      }
      return;
    }

    try {
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const updatedCart = localCart.filter(item => item.product._id !== productId);
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      return;
    }

    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('localCart');
      setCartItems([]);
      return;
    }

    try {
      const response = await api.delete('/cart/clear');
      if (response.data.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.currentPrice || item.product.priceB2C || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

