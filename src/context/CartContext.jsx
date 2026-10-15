import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api, { getErrorMessage } from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ user, children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if initial load has happened
  const hasLoaded = useRef(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/cart');
      setCartItems(response.data.cart || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load cart on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
      hasLoaded.current = true;
    } else {
      setCartItems([]);
      hasLoaded.current = false;
    }
  }, [user, fetchCart]);

  // Add to cart
  const addToCart = useCallback(async (productId) => {
    const response = await api.post(`/cart/${productId}`);
    setCartItems(response.data.cart || []);
    return response.data;
  }, []);

  // Update quantity
  const updateQuantity = useCallback(async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    setCartItems(response.data.cart || []);
    return response.data;
  }, []);

  // Remove from cart
  const removeFromCart = useCallback(async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    setCartItems(response.data.cart || []);
    return response.data;
  }, []);

  // Derived values
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);
  const itemCount = cartItems.length;

  const value = {
    cartItems,
    isLoading,
    error,
    cartCount,
    subtotal,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
