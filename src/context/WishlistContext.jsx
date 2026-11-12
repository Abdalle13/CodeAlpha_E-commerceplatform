import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const WishlistContext = createContext(null);

const WISHLIST_KEY = 'hilaara_guest_wishlist';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      loadFromDB(user.id);
    } else {
      try {
        const raw = localStorage.getItem(WISHLIST_KEY);
        setProductIds(raw ? JSON.parse(raw) : []);
      } catch {
        setProductIds([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
    }
  }, [productIds, user]);

  const loadFromDB = async (userId) => {
    try {
      const { data: wl } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!wl) return;

      const { data: items } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('wishlist_id', wl.id);

      if (items) setProductIds(items.map((i) => i.product_id));
    } catch (err) {
      console.error('Wishlist sync error:', err);
    }
  };

  const toggle = useCallback((productId) => {
    setProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId) => productIds.includes(productId), [productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, toggle, isWishlisted, count: productIds.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

