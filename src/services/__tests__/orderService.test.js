import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, getOrderByNumber } from '../orderService';

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('creates order with valid order number format HLR-YYYYMMDD-XXXX', async () => {
    const payload = {
      customerInfo: { fullName: 'Hassan Mohamed', phone: '+252 61 500 0000', email: 'hassan@example.com' },
      shippingAddress: { city: 'Mogadishu', district: 'Hodan', streetAddress: 'KM4' },
      shippingMethod: { id: 'm-1', name: 'Mogadishu Standard', fee: 3.0 },
      items: [
        { variantId: 'v1', name: 'Linen Shirt', size: 'M', colorName: 'White', price: 60.0, quantity: 2 },
      ],
      paymentMethod: 'evc_plus',
    };

    const { data: order, error } = await createOrder(payload);

    expect(error).toBeNull();
    expect(order).toBeTruthy();
    expect(order.order_number).toMatch(/^HLR-\d{8}-[A-Z0-9]+$/);
    expect(order.subtotal).toBe(120.0);
    expect(order.delivery_fee).toBe(3.0);
    expect(order.total_amount).toBe(123.0);
    expect(order.order_status).toBe('confirmed');
    expect(order.payment_method).toBe('evc_plus');
  });

  it('retrieves cached order from session storage', async () => {
    const dummyOrder = { order_number: 'HLR-20261113-TEST1', total_amount: 150.0 };
    sessionStorage.setItem('hilaara_order_HLR-20261113-TEST1', JSON.stringify(dummyOrder));

    const { data, error } = await getOrderByNumber('HLR-20261113-TEST1');
    expect(error).toBeNull();
    expect(data.order_number).toBe('HLR-20261113-TEST1');
    expect(data.total_amount).toBe(150.0);
  });
});

