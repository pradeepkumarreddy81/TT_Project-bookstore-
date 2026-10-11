import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '@/api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await client.get('/cart');
      setCart(res.data.data || { items: [], totalItems: 0, totalPrice: 0 });
    } catch (err) {
      console.warn('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (bookId, quantity = 1) => {
      if (!isAuthenticated) {
        showError('Please sign in to add books to your reading cart');
        return false;
      }
      try {
        const res = await client.post('/cart/items', { bookId, quantity });
        setCart(res.data.data);
        success('Book added to your cart');
        return true;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to add item to cart';
        showError(msg);
        return false;
      }
    },
    [isAuthenticated, success, showError]
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      try {
        const res = await client.put(`/cart/items/${cartItemId}`, { quantity });
        setCart(res.data.data);
        return true;
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update quantity';
        showError(msg);
        return false;
      }
    },
    [showError]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        const res = await client.delete(`/cart/items/${cartItemId}`);
        setCart(res.data.data);
        success('Item removed from cart');
        return true;
      } catch (err) {
        showError('Failed to remove item');
        return false;
      }
    },
    [success, showError]
  );

  const clearCart = useCallback(async () => {
    try {
      await client.delete('/cart');
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      return true;
    } catch {
      return false;
    }
  }, []);

  const cartCount = cart?.totalItems || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
