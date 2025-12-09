import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

  const fetchCart = useCallback(async () => {
    const previousItems = [...cartItems];
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        const items = response.data.data?.items || [];
        // Only update if we got valid items array
        if (Array.isArray(items)) {
          // If items array is empty but we had items before, preserve previous state
          if (items.length === 0 && previousItems.length > 0) {
            console.warn('API returned empty cart but we had items, preserving previous state');
            setCartItems(previousItems);
            return previousItems;
          }
          setCartItems(items);
          return items;
        } else {
          console.warn('Invalid items array received, preserving previous state');
          if (previousItems.length > 0) {
            setCartItems(previousItems);
          }
          return previousItems;
        }
      } else {
        console.warn('Cart fetch unsuccessful, preserving previous state');
        if (previousItems.length > 0) {
          setCartItems(previousItems);
        }
        return previousItems;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Don't clear cart on error - preserve existing state
      if (previousItems.length > 0) {
        setCartItems(previousItems);
      }
      return previousItems;
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, fetchCart]);

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

    const previousItems = [...cartItems];
    try {
      const response = await api.post('/cart/add', {
        productId: product._id,
        quantity
      });
      if (response.data.success) {
        // Use response data directly if available (backend already includes pricing)
        if (response.data.data && response.data.data.items && Array.isArray(response.data.data.items)) {
          // Only update if we got valid items
          if (response.data.data.items.length > 0) {
            setCartItems(response.data.data.items);
          } else if (previousItems.length > 0) {
            // If response has empty items but we had items before, preserve state
            console.warn('API returned empty cart after add, preserving previous state');
            setCartItems(previousItems);
          }
        } else {
          // Fallback to fetchCart but preserve state
          try {
            await fetchCart();
          } catch (fetchError) {
            console.error('Error in fetchCart fallback:', fetchError);
            if (previousItems.length > 0) {
              setCartItems(previousItems);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Preserve previous state on error
      if (previousItems.length > 0) {
        setCartItems(previousItems);
      }
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

    // Validate input
    if (!productId || quantity <= 0) {
      console.error('Invalid productId or quantity');
      return;
    }

    // Optimistic update - update local state immediately
    const previousCartItems = [...cartItems];
    if (previousCartItems.length === 0) {
      console.warn('Cannot update quantity: cart is empty');
      return;
    }

    setCartItems(prevItems => {
      const updated = prevItems.map(item => {
        const itemProductId = item.product?._id || item.product;
        if (itemProductId === productId || String(itemProductId) === String(productId)) {
          return { ...item, quantity };
        }
        return item;
      });
      return updated;
    });

    try {
      const response = await api.put(`/cart/update/${productId}`, { quantity });
      if (response.data.success) {
        // Use response data directly if available (backend already includes pricing)
        if (response.data.data && response.data.data.items && Array.isArray(response.data.data.items) && response.data.data.items.length > 0) {
          setCartItems(response.data.data.items);
        } else if (response.data.data && response.data.data.items && response.data.data.items.length === 0) {
          // If response has empty items array, revert to previous state
          console.warn('API returned empty cart, reverting to previous state');
          setCartItems(previousCartItems);
        } else {
          // Fallback to fetchCart if response structure is different
          try {
            const fetchResponse = await api.get('/cart');
            if (fetchResponse.data.success) {
              const fetchedItems = fetchResponse.data.data?.items || [];
              if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
                setCartItems(fetchedItems);
              } else if (previousCartItems.length > 0) {
                // If fetched cart is empty but we had items, revert
                console.warn('fetchCart returned empty, reverting to previous state');
                setCartItems(previousCartItems);
              }
            } else {
              // API call succeeded but response indicates failure, revert
              setCartItems(previousCartItems);
            }
          } catch (fetchError) {
            console.error('Error in fetchCart fallback:', fetchError);
            // Revert to previous state if fetchCart fails
            setCartItems(previousCartItems);
          }
        }
      } else {
        // Revert optimistic update on failure
        setCartItems(previousCartItems);
        console.error('Failed to update cart quantity');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      console.error('Reverting to previous cart state');
      // Revert optimistic update on error
      setCartItems(previousCartItems);
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

    // Optimistic update - remove from local state immediately
    const previousCartItems = [...cartItems];
    setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));

    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      if (response.data.success) {
        // Use response data directly if available (backend already includes pricing)
        if (response.data.data && response.data.data.items) {
          setCartItems(response.data.data.items);
        } else {
          // Fallback to fetchCart
          await fetchCart();
        }
      } else {
        // Revert optimistic update on failure
        setCartItems(previousCartItems);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Revert optimistic update on error
      setCartItems(previousCartItems);
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

