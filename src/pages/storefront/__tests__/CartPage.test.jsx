import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpdateQuantity = vi.fn();
const mockRemoveItem = vi.fn();
const mockClearCart = vi.fn();

const sampleItems = [
  {
    variantId: 'var-1',
    productId: 'prod-1',
    sku: 'HLR-LNN-WHT-M',
    name: 'Somali Coastal Linen Shirt',
    slug: 'somali-coastal-linen-shirt',
    size: 'M',
    colorName: 'Ivory White',
    colorHex: '#F7F5EF',
    price: 65.0,
    image: '/images/shirt.jpg',
    quantity: 2,
  },
  {
    variantId: 'var-2',
    productId: 'prod-2',
    sku: 'HLR-BLZ-CHR-40',
    name: 'Charcoal Tailored Suit Jacket',
    slug: 'charcoal-tailored-suit-jacket',
    size: '40R',
    colorName: 'Charcoal',
    colorHex: '#191A17',
    price: 180.0,
    image: '/images/jacket.jpg',
    quantity: 1,
  },
];

let mockCartState = {
  items: sampleItems,
  totalItems: 3,
  subtotal: 310.0,
  updateQuantity: mockUpdateQuantity,
  removeItem: mockRemoveItem,
  clearCart: mockClearCart,
};

vi.mock('../../../context/CartContext', () => ({
  useCart: () => mockCartState,
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../lib/imagekit', () => ({
  buildImageUrl: (url) => url || '/placeholder.svg',
}));

import { CartPage } from '../CartPage';

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartState = {
      items: sampleItems,
      totalItems: 3,
      subtotal: 310.0,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    };
  });

  it('renders cart items with name, size, color and line prices', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Somali Coastal Linen Shirt')).toBeInTheDocument();
    expect(screen.getByText('Charcoal Tailored Suit Jacket')).toBeInTheDocument();
    expect(screen.getByText('Ivory White')).toBeInTheDocument();
    expect(screen.getByText('Charcoal')).toBeInTheDocument();
    expect(screen.getByText('$130.00')).toBeInTheDocument(); // 65 * 2
    expect(screen.getByText('$180.00')).toBeInTheDocument(); // 180 * 1
    expect(screen.getAllByText('$310.00').length).toBe(2); // Subtotal and Estimated Total
  });

  it('triggers updateQuantity when plus or minus buttons are clicked', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const minusButtons = screen.getAllByRole('button', { name: /decrease quantity/i });
    fireEvent.click(minusButtons[0]);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('var-1', 1);

    const plusButtons = screen.getAllByRole('button', { name: /increase quantity/i });
    fireEvent.click(plusButtons[0]);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('var-1', 3);
  });

  it('triggers removeItem when remove button is clicked', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove somali coastal linen shirt/i });
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveItem).toHaveBeenCalledWith('var-1');
  });

  it('applies promotional discount code HILAARA10', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const promoInput = screen.getByPlaceholderText(/enter code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(promoInput, { target: { value: 'HILAARA10' } });
    fireEvent.click(applyButton);

    expect(screen.getByText(/10% promotional discount applied/i)).toBeInTheDocument();
    expect(screen.getByText('-$31.00')).toBeInTheDocument();
    expect(screen.getByText('$279.00')).toBeInTheDocument(); // 310 - 31
  });

  it('displays error for invalid promo code', () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    const promoInput = screen.getByPlaceholderText(/enter code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(promoInput, { target: { value: 'INVALID' } });
    fireEvent.click(applyButton);

    expect(screen.getByText(/invalid or expired promotional code/i)).toBeInTheDocument();
  });

  it('renders empty cart state when no items exist', () => {
    mockCartState = {
      items: [],
      totalItems: 0,
      subtotal: 0,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    };

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/your cart is currently empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore all products/i })).toHaveAttribute('href', '/shop');
  });
});

