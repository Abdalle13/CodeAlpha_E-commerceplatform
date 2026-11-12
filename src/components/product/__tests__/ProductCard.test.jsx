import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../context/WishlistContext', () => ({
  useWishlist: () => ({
    toggle: vi.fn(),
    isWishlisted: () => false,
    count: 0,
  }),
}));
vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));
vi.mock('../../../lib/imagekit', () => ({
  buildImageUrl: (url) => url || '/brand/hilaara-mark-dark.svg',
}));

import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: 'prod-001',
  name: 'Classic White Shirt',
  slug: 'classic-white-shirt',
  gender: 'men',
  base_price: 45.0,
  discount_price: null,
  is_featured: false,
  is_new_arrival: true,
  images: [],
  category: { name: 'Shirts', slug: 'shirts' },
};

const mockProductWithDiscount = {
  ...mockProduct,
  id: 'prod-002',
  name: 'Tailored Blazer',
  slug: 'tailored-blazer',
  base_price: 120.0,
  discount_price: 90.0,
  is_new_arrival: false,
};

const renderCard = (product) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the product name', () => {
    renderCard(mockProduct);
    expect(screen.getByText('Classic White Shirt')).toBeInTheDocument();
  });

  it('renders the product base price when no discount', () => {
    renderCard(mockProduct);
    expect(screen.getByText('$45.00')).toBeInTheDocument();
  });

  it('renders the discount price and original price when discounted', () => {
    renderCard(mockProductWithDiscount);
    expect(screen.getByText('$90.00')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
  });

  it('shows the New badge for new arrivals', () => {
    renderCard(mockProduct);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('shows the sale badge with discount percentage when discounted', () => {
    renderCard(mockProductWithDiscount);
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('renders the wishlist toggle button', () => {
    renderCard(mockProduct);
    expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument();
  });

  it('links to the correct product page', () => {
    renderCard(mockProduct);
    const links = screen.getAllByRole('link');
    const productLink = links.find((el) => el.getAttribute('href') === '/products/classic-white-shirt');
    expect(productLink).toBeTruthy();
  });

  it('shows category label', () => {
    renderCard(mockProduct);
    expect(screen.getByText('Shirts')).toBeInTheDocument();
  });

  it('returns null when no product is passed', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={null} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});

