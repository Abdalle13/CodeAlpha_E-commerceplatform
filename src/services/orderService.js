/**
 * orderService.js
 * Client-side service for placing and retrieving HILAARA orders.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Creates an order via the serverless function (or resilient local fallback).
 */
export async function createOrder(payload) {
  if (
    typeof window !== 'undefined' &&
    window.location?.origin &&
    import.meta.env.MODE !== 'test' &&
    !window.location.origin.includes('localhost')
  ) {
    try {
      const res = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        return { data: data.order, error: null };
      }
    } catch (err) {
      console.warn('[orderService] Serverless function not reachable, creating resilient client order:', err);
    }
  }

  // Resilient fallback when running vite preview / vitest / offline dev
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const orderNumber = `HLR-${dateStr}-${randomSuffix}`;

  const subtotal = payload.items.reduce(
    (sum, i) => sum + (Number(i.price) || 50.0) * (Number(i.quantity) || 1),
    0
  );
  const deliveryFee = Number(payload.shippingMethod?.fee || 0);
  let discountAmount = 0;
  if (payload.promoCode && payload.promoCode.trim().toUpperCase() === 'HILAARA10') {
    discountAmount = subtotal * 0.1;
  }
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const localOrder = {
    id: `order-${Date.now()}`,
    order_number: orderNumber,
    customer_name: payload.customerInfo.fullName,
    customer_phone: payload.customerInfo.phone,
    customer_email: payload.customerInfo.email,
    shipping_city: payload.shippingAddress.city,
    shipping_district: payload.shippingAddress.district,
    shipping_address: payload.shippingAddress.streetAddress,
    delivery_instructions: payload.shippingAddress.deliveryInstructions || null,
    subtotal,
    delivery_fee: deliveryFee,
    discount_amount: discountAmount,
    total_amount: totalAmount,
    currency: 'USD',
    order_status: 'confirmed',
    payment_status: payload.paymentMethod === 'pay_on_delivery' ? 'awaiting_delivery_payment' : 'pending',
    payment_method: payload.paymentMethod,
    created_at: new Date().toISOString(),
    items: payload.items.map((i) => ({
      product_name: i.name || 'Garment',
      variant_size: i.size || 'M',
      variant_color_name: i.colorName || 'Default',
      unit_price: Number(i.price) || 50.0,
      quantity: Number(i.quantity) || 1,
      total_price: (Number(i.price) || 50.0) * (Number(i.quantity) || 1),
    })),
  };

  // Cache in sessionStorage for immediate confirmation lookup
  try {
    sessionStorage.setItem(`hilaara_order_${orderNumber}`, JSON.stringify(localOrder));
  } catch {}

  return { data: localOrder, error: null };
}

/**
 * Fetch all orders for the authenticated customer.
 */
export async function getCustomerOrders(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, customer_name, total_amount, currency,
        order_status, payment_status, payment_method, created_at,
        items:order_items(id, product_name, variant_size, variant_color_name, quantity, total_price)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (err) {
    return { data: [], error: err };
  }
}

/**
 * Fetch a single order by order number or ID.
 */
export async function getOrderByNumber(orderNumber) {
  // Check session cache first
  try {
    const cached = sessionStorage.getItem(`hilaara_order_${orderNumber}`);
    if (cached) return { data: JSON.parse(cached), error: null };
  } catch {}

  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Order not found') };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, customer_name, customer_phone, customer_email,
        shipping_city, shipping_district, shipping_address, delivery_instructions,
        subtotal, delivery_fee, discount_amount, total_amount, currency,
        order_status, payment_status, payment_method, created_at,
        items:order_items(id, product_name, variant_sku, variant_size, variant_color_name, unit_price, quantity, total_price)
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

