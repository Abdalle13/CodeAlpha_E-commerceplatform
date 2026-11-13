import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const activeCartIdRef = useRef(null);

  // Helper to ensure user cart exists in Supabase
  const getOrCreateUserCart = useCallback(async (userId) => {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data: existingCart, error: fetchErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingCart && !fetchErr) {
        return existingCart.id;
      }

      // Create new cart
      const { data: newCart, error: insertErr } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (!insertErr && newCart) {
        return newCart.id;
      }
    } catch (err) {
      console.error('[CartContext] getOrCreateUserCart error:', err);
    }
    return null;
  }, []);

  // Sync user cart with DB & merge any guest cart items
  const syncCartFromDB = useCallback(async (userId) => {
    setLoading(true);
    try {
      const cartId = await getOrCreateUserCart(userId);
      activeCartIdRef.current = cartId;

      if (!cartId) {
        // Fallback to local items if DB cart can't be resolved
        setItems(readGuestCart());
        setLoading(false);
        return;
      }

      // 1. Check if guest cart has items to migrate
      const guestItems = readGuestCart();
      if (guestItems.length > 0) {
        for (const gItem of guestItems) {
          if (!gItem.variantId) continue;
          // Upsert into cart_items
          try {
            const { data: existingItem } = await supabase
              .from('cart_items')
              .select('id, quantity')
              .eq('cart_id', cartId)
              .eq('variant_id', gItem.variantId)
              .maybeSingle();

            if (existingItem) {
              await supabase
                .from('cart_items')
                .update({
                  quantity: existingItem.quantity + gItem.quantity,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingItem.id);
            } else {
              await supabase
                .from('cart_items')
                .insert({
                  cart_id: cartId,
                  variant_id: gItem.variantId,
                  quantity: gItem.quantity,
                });
            }
          } catch (migrateErr) {
            console.error('[CartContext] Migration error for item:', gItem.variantId, migrateErr);
          }
        }
        // Clear guest cart once merged
        saveGuestCart([]);
      }

      // 2. Fetch full active cart items from DB
      const { data: cartItems, error: itemsErr } = await supabase
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
        .eq('cart_id', cartId);

      if (!itemsErr && cartItems) {
        const mapped = cartItems
          .filter((ci) => ci.variant && ci.variant.product)
          .map((ci) => ({
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
            image: ci.variant.product.images?.find((img) => img.is_primary)?.imagekit_url || ci.variant.product.images?.[0]?.imagekit_url || null,
            quantity: ci.quantity,
          }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('[CartContext] syncCartFromDB exception:', err);
      setItems(readGuestCart());
    } finally {
      setLoading(false);
    }
  }, [getOrCreateUserCart]);

  // Load cart on auth change
  useEffect(() => {
    if (user && isSupabaseConfigured) {
      syncCartFromDB(user.id);
    } else {
      activeCartIdRef.current = null;
      setItems(readGuestCart());
    }
  }, [user, syncCartFromDB]);

  // Persist guest cart to localStorage when unauthenticated
  useEffect(() => {
    if (!user) {
      saveGuestCart(items);
    }
  }, [items, user]);

  // Add Item
  const addItem = useCallback(async (product, variant, quantity = 1) => {
    const unitPrice = variant.price_override ?? product.discount_price ?? product.base_price;
    const primaryImg = product.images?.find((img) => img.is_primary)?.imagekit_url || product.images?.[0]?.imagekit_url || null;

    // 1. Optimistic update
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
        price: unitPrice,
        image: primaryImg,
        quantity,
      };
      return [...prev, newItem];
    });

    // 2. DB sync if authenticated
    if (user && isSupabaseConfigured && activeCartIdRef.current) {
      try {
        const cartId = activeCartIdRef.current;
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cartId)
          .eq('variant_id', variant.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({
              quantity: existing.quantity + quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({
              cart_id: cartId,
              variant_id: variant.id,
              quantity,
            });
        }
      } catch (dbErr) {
        console.error('[CartContext] DB addItem sync failed:', dbErr);
      }
    }
  }, [user]);

  // Update Quantity
  const updateQuantity = useCallback(async (variantId, quantity) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );

    if (user && isSupabaseConfigured && activeCartIdRef.current) {
      try {
        await supabase
          .from('cart_items')
          .update({
            quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('cart_id', activeCartIdRef.current)
          .eq('variant_id', variantId);
      } catch (dbErr) {
        console.error('[CartContext] DB updateQuantity sync failed:', dbErr);
      }
    }
  }, [user]);

  // Remove Item
  const removeItem = useCallback(async (variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

    if (user && isSupabaseConfigured && activeCartIdRef.current) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', activeCartIdRef.current)
          .eq('variant_id', variantId);
      } catch (dbErr) {
        console.error('[CartContext] DB removeItem sync failed:', dbErr);
      }
    }
  }, [user]);

  // Clear Cart
  const clearCart = useCallback(async () => {
    setItems([]);

    if (user && isSupabaseConfigured && activeCartIdRef.current) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', activeCartIdRef.current);
      } catch (dbErr) {
        console.error('[CartContext] DB clearCart sync failed:', dbErr);
      }
    }
  }, [user]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
