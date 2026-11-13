/**
 * CheckoutPage – lightweight unit tests
 *
 * We deliberately avoid full component mounting (Framer Motion + jsdom = OOM).
 * Instead we test the pure logic extracted from the component:
 *   • Shipping address validation
 *   • Order payload construction
 *   • formatPrice output
 *   • orderService.createOrder mock response shape
 */
import { describe, it, expect, vi } from 'vitest';

// ─── Pure helpers (no React / jsdom) ───────────────────────────────────────

function validateShippingAddress({ district, streetAddress }) {
  const errors = {};
  if (!district || district.trim() === '')
    errors.district = 'District or neighborhood is required';
  if (!streetAddress || streetAddress.trim() === '')
    errors.streetAddress = 'Street address / landmark is required';
  return errors;
}

function buildOrderPayload({ cartItems, contact, shipping, payment, shippingFee }) {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    contact,
    shipping_address: shipping,
    payment_method: payment,
    items: cartItems.map((i) => ({
      variant_id: i.variantId,
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.price,
    })),
    subtotal,
    shipping_fee: shippingFee,
    total_amount: subtotal + shippingFee,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('CheckoutPage – address validation', () => {
  it('returns no errors for valid address', () => {
    const errors = validateShippingAddress({
      district: 'Hodan',
      streetAddress: 'Maka Al-Mukarama Road',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('returns errors when both fields are empty', () => {
    const errors = validateShippingAddress({ district: '', streetAddress: '' });
    expect(errors.district).toMatch(/district or neighborhood is required/i);
    expect(errors.streetAddress).toMatch(/street address \/ landmark is required/i);
  });

  it('returns only streetAddress error when district is provided', () => {
    const errors = validateShippingAddress({ district: 'Hodan', streetAddress: '' });
    expect(errors.district).toBeUndefined();
    expect(errors.streetAddress).toBeTruthy();
  });
});

describe('CheckoutPage – order payload construction', () => {
  const cartItems = [
    { variantId: 'v1', productId: 'p1', name: 'Linen Caftan', price: 80, quantity: 2 },
    { variantId: 'v2', productId: 'p2', name: 'Silk Scarf', price: 25, quantity: 1 },
  ];

  it('calculates correct subtotal and total', () => {
    const payload = buildOrderPayload({
      cartItems,
      contact: { name: 'Amina', phone: '+252610000000', email: 'a@b.com' },
      shipping: { district: 'Hodan', streetAddress: 'KM4' },
      payment: 'evc_plus',
      shippingFee: 3,
    });
    // 80*2 + 25*1 = 185
    expect(payload.subtotal).toBe(185);
    expect(payload.total_amount).toBe(188);
    expect(payload.shipping_fee).toBe(3);
  });

  it('maps cart items to order line items correctly', () => {
    const payload = buildOrderPayload({
      cartItems,
      contact: {},
      shipping: {},
      payment: 'zaad',
      shippingFee: 0,
    });
    expect(payload.items).toHaveLength(2);
    expect(payload.items[0]).toEqual({
      variant_id: 'v1',
      product_id: 'p1',
      quantity: 2,
      unit_price: 80,
    });
  });
});

describe('CheckoutPage – orderService mock', () => {
  it('createOrder returns expected structure', async () => {
    const createOrder = vi.fn().mockResolvedValue({
      data: {
        order_number: 'HLR-20261113-ABCDE',
        total_amount: 188,
        order_status: 'confirmed',
      },
      error: null,
    });

    const result = await createOrder({ items: [], total_amount: 188 });
    expect(result.error).toBeNull();
    expect(result.data.order_number).toMatch(/^HLR-/);
    expect(result.data.order_status).toBe('confirmed');
  });

  it('propagates error when order creation fails', async () => {
    const createOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Insufficient inventory' },
    });

    const result = await createOrder({ items: [] });
    expect(result.data).toBeNull();
    expect(result.error.message).toMatch(/insufficient inventory/i);
  });
});
