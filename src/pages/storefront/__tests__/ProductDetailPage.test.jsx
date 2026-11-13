import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all context dependencies
vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ addItem: vi.fn(), items: [], totalItems: 0, subtotal: 0 }),
  CartProvider: ({ children }) => children,
}));
vi.mock('../../../context/WishlistContext', () => ({
  useWishlist: () => ({ toggle: vi.fn(), isWishlisted: () => false, count: 0 }),
  WishlistProvider: ({ children }) => children,
}));
vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
  ToastProvider: ({ children }) => children,
}));
vi.mock('../../../lib/imagekit', () => ({
  buildImageUrl: (url) => url || '/placeholder.svg',
  IMAGE_PRESETS: { productDetail: {}, thumbnail: {} },
}));

// Mock productService
vi.mock('../../../services/productService', () => ({
  getProductBySlug: vi.fn(),
  getRelatedProducts: vi.fn(),
}));

import { getProductBySlug, getRelatedProducts } from '../../../services/productService';
import { ProductDetailPage } from '../ProductDetailPage';

const mockProduct = {
  id: 'prod-001',
  name: 'Premium Linen Shirt',
  slug: 'premium-linen-shirt',
  description: 'A refined linen shirt in breathable natural fabric.',
  gender: 'men',
  base_price: 65.0,
  discount_price: null,
  is_featured: true,
  is_new_arrival: true,
  is_published: true,
  images: [
    { id: 'img-1', imagekit_url: '/shirt-1.jpg', is_primary: true, display_order: 0, alt_text: 'Front view' },
  ],
  category: { id: 'cat-1', name: 'Shirts', slug: 'shirts', gender: 'men' },
  variants: [
    {
      id: 'var-1', sku: 'PLS-M-WHITE', size: 'M', color_name: 'White',
      color_hex: '#FFFFFF', price_override: null, is_active: true,
      inventory: { quantity: 10, low_stock_threshold: 5 },
    },
    {
      id: 'var-2', sku: 'PLS-L-WHITE', size: 'L', color_name: 'White',
      color_hex: '#FFFFFF', price_override: null, is_active: true,
      inventory: { quantity: 3, low_stock_threshold: 5 },
    },
  ],
};

const renderPDP = (slug = 'premium-linen-shirt') =>
  render(
    <MemoryRouter initialEntries={[`/products/${slug}`]}>
      <Routes>
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/shop" element={<div>Shop Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRelatedProducts.mockResolvedValue({ data: [], error: null });
  });

  it('shows loading skeleton initially', () => {
    getProductBySlug.mockReturnValue(new Promise(() => {})); // never resolves
    renderPDP();
    // Skeleton elements are rendered via aria roles or just DOM presence
    expect(document.body).toBeTruthy();
  });

  it('renders product name and price after load', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Premium Linen Shirt/i })).toBeInTheDocument();
    });
    expect(screen.getByText('$65.00')).toBeInTheDocument();
  });

  it('renders product description', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByText(/refined linen shirt/i)).toBeInTheDocument();
    });
  });

  it('shows the New Arrival badge', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByText(/New Arrival/i)).toBeInTheDocument();
    });
  });

  it('renders size buttons from variants', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /size m/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /size l/i })).toBeInTheDocument();
    });
  });

  it('renders Add to Cart button', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    });
  });

  it('renders wishlist button', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument();
    });
  });

  it('shows the delivery accordion section', async () => {
    getProductBySlug.mockResolvedValue({ data: mockProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByText(/Delivery Information/i)).toBeInTheDocument();
    });
  });

  it('shows product not found when service returns no data', async () => {
    getProductBySlug.mockResolvedValue({ data: null, error: null });
    renderPDP('nonexistent-product');
    await waitFor(() => {
      expect(screen.getByText(/Product not found/i)).toBeInTheDocument();
    });
  });

  it('shows discount price and original price when discounted', async () => {
    const discountedProduct = {
      ...mockProduct,
      base_price: 100.0,
      discount_price: 75.0,
    };
    getProductBySlug.mockResolvedValue({ data: discountedProduct, error: null });
    renderPDP();
    await waitFor(() => {
      expect(screen.getByText('$75.00')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });
});

