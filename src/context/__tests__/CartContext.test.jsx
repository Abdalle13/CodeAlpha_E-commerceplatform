import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../CartContext';

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

const TestConsumer = () => {
  const { items, totalItems, subtotal, addItem, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="subtotal">{subtotal}</div>
      <div data-testid="item-count">{items.length}</div>
      <button
        onClick={() =>
          addItem(
            { id: 'p1', name: 'Linen Shirt', slug: 'linen-shirt', base_price: 50.0 },
            { id: 'v1', sku: 'SKU1', size: 'M', color_name: 'White', color_hex: '#fff', price_override: null },
            1
          )
        }
      >
        Add Item
      </button>
      <button onClick={() => updateQuantity('v1', 3)}>Update Qty</button>
      <button onClick={() => removeItem('v1')}>Remove Item</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides empty default cart state', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId('total-items').textContent).toBe('0');
    expect(screen.getByTestId('subtotal').textContent).toBe('0');
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('adds item and computes subtotal and totalItems', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Item').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('1');
    expect(screen.getByTestId('subtotal').textContent).toBe('50');
    expect(screen.getByTestId('item-count').textContent).toBe('1');
  });

  it('updates quantity and recalculates totals', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Item').click();
    });
    act(() => {
      screen.getByText('Update Qty').click();
    });

    expect(screen.getByTestId('total-items').textContent).toBe('3');
    expect(screen.getByTestId('subtotal').textContent).toBe('150');
  });

  it('removes item from cart', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Item').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('1');

    act(() => {
      screen.getByText('Remove Item').click();
    });
    expect(screen.getByTestId('item-count').textContent).toBe('0');
  });

  it('clears all items in cart', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Item').click();
    });
    act(() => {
      screen.getByText('Clear Cart').click();
    });

    expect(screen.getByTestId('item-count').textContent).toBe('0');
    expect(screen.getByTestId('total-items').textContent).toBe('0');
  });
});

