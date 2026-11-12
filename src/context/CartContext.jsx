import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'hilaara_guest_cart';

function readGuestCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart on mount / user change
  useEffect(() => {
    if (user && isSupabaseConfigured) {
      syncCartFromDB(user.id);
    } else {
      setItems(readGuestCart());
    }
  }, [user]);

  // Persist guest cart to localStorage whenever items change (unauthenticated)
  useEffect(() => {
    if (!user) {
      saveGuestCart(items);
    }
  }, [items, user]);

  const syncCartFromDB = async (userId) => {
    setLoading(true);
    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!cart) {
        // Migrate guest cart items to DB if present
        const guestItems = readGuestCart();
        setItems(guestItems);
        setLoading(false);
        return;
      }

      const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`
          id, quantity,
          variant:product_variants(
            id, sku, size, color_name, color_hex, price_override,
            product:products(id, name, slug, base_price, discount_price,
              images:product_images(imagekit_url, is_primary, display_order)
            )
          )
        `)
        .eq('cart_id', cart.id);

      if (cartItems) {
        const mapped = cartItems.map((ci) => ({
          cartItemId: ci.id,
          variantId: ci.variant.id,
          productId: ci.variant.product.id,
          sku: ci.variant.sku,
          name: ci.variant.product.name,
          slug: ci.variant.product.slug,
          size: ci.variant.size,
          colorName: ci.variant.color_name,
          colorHex: ci.variant.color_hex,
          price: ci.variant.price_override ?? ci.variant.product.discount_price ?? ci.variant.product.base_price,
          image: ci.variant.product.images?.find(img => img.is_primary)?.imagekit_url || ci.variant.product.images?.[0]?.imagekit_url || null,
          quantity: ci.quantity,
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('Cart sync error:', err);
      setItems(readGuestCart());
    } finally {
      setLoading(false);
    }
  };

  const addItem = useCallback((product, variant, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variant.id);
      if (existing) {
        return prev.map((i) =>
          i.variantId === variant.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      const newItem = {
        variantId: variant.id,
        productId: product.id,
        sku: variant.sku,
        name: product.name,
        slug: product.slug,
        size: variant.size,
        colorName: variant.color_name,
        colorHex: variant.color_hex,
        price: variant.price_override ?? product.discount_price ?? product.base_price,
        image: product.images?.find(img => img.is_primary)?.imagekit_url || product.images?.[0]?.imagekit_url || null,
        quantity,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      totalItems,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

