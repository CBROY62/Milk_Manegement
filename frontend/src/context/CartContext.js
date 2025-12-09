import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
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

// Helper function to load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem('localCart');
    if (storedCart) {
      return JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Helper function to save cart to localStorage
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('localCart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => loadCartFromStorage());
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const cartItemsRef = useRef([]);
  const isFetchingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Keep ref in sync with state
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Save cart to localStorage whenever cartItems changes (except on initial mount)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const fetchCart = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return cartItemsRef.current;
    }

    const previousItems = [...cartItemsRef.current];
    isFetchingRef.current = true;
    
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
          // Save to localStorage as backup
          saveCartToStorage(items);
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
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // For authenticated users: Load from localStorage first, then sync with backend
      const localCart = loadCartFromStorage();
      if (localCart.length > 0) {
        // Keep local cart visible while fetching from backend
        setCartItems(localCart);
      }
      // Sync with backend
      fetchCart();
    } else {
      // For non-authenticated users: Load from localStorage
      const localCart = loadCartFromStorage();
      setCartItems(localCart);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Store in localStorage for non-authenticated users
      const localCart = loadCartFromStorage();
      const existingItem = localCart.find(item => item.product._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.push({ product, quantity });
      }
      
      setCartItems(localCart);
      saveCartToStorage(localCart);
      return;
    }

    // Use ref to get current state without creating dependency
    const previousItems = [...cartItemsRef.current];

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
            // Save to localStorage as backup
            saveCartToStorage(response.data.data.items);
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
      const localCart = loadCartFromStorage();
      const item = localCart.find(item => item.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          removeFromCart(productId);
        } else {
          item.quantity = quantity;
          setCartItems(localCart);
          saveCartToStorage(localCart);
        }
      }
      return;
    }

    // Validate input
    if (!productId || quantity <= 0) {
      console.error('Invalid productId or quantity');
      return;
    }

    // Use ref to get current state without creating dependency
    const previousCartItems = [...cartItemsRef.current];
    if (previousCartItems.length === 0) {
      console.warn('Cannot update quantity: cart is empty');
      return;
    }

    // Optimistic update - update local state immediately
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
          // Save to localStorage as backup
          saveCartToStorage(response.data.data.items);
        } else if (response.data.data && response.data.data.items && response.data.data.items.length === 0) {
          // If response has empty items array, revert to previous state
          console.warn('API returned empty cart, reverting to previous state');
          setCartItems(previousCartItems);
        } else {
          // Fallback to fetchCart if response structure is different
          try {
            await fetchCart();
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
      const localCart = loadCartFromStorage();
      const updatedCart = localCart.filter(item => item.product._id !== productId);
      setCartItems(updatedCart);
      saveCartToStorage(updatedCart);
      return;
    }

    // Use ref to get current state without creating dependency
    const previousCartItems = [...cartItemsRef.current];
    
    // Optimistic update - remove from local state immediately
    setCartItems(prevItems => prevItems.filter(item => item.product._id !== productId));

    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      if (response.data.success) {
        // Use response data directly if available (backend already includes pricing)
        if (response.data.data && response.data.data.items) {
          setCartItems(response.data.data.items);
          // Save to localStorage as backup
          saveCartToStorage(response.data.data.items);
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
        // Clear localStorage as well
        localStorage.removeItem('localCart');
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

