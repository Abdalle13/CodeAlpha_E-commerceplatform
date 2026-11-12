import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock context providers
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, profile: null, isAdmin: false, loading: false }),
  AuthProvider: ({ children }) => children,
}));
vi.mock('../../../context/CartContext', () => ({
  useCart: () => ({ totalItems: 0, subtotal: 0, items: [], addItem: vi.fn(), removeItem: vi.fn(), clearCart: vi.fn() }),
  CartProvider: ({ children }) => children,
}));
vi.mock('../../../context/WishlistContext', () => ({
  useWishlist: () => ({ count: 0, toggle: vi.fn(), isWishlisted: () => false }),
  WishlistProvider: ({ children }) => children,
}));
vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
  ToastProvider: ({ children }) => children,
}));

// Mock Supabase — not configured, so components show empty states
vi.mock('../../../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { HomePage } from '../HomePage';

const renderInRouter = (component) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing in demo mode', () => {
    renderInRouter(<HomePage />);
    // Hero section is always rendered
    expect(document.body).toBeTruthy();
  });

  it('renders the brand hero headline', () => {
    renderInRouter(<HomePage />);
    expect(screen.getByText(/modern era/i)).toBeInTheDocument();
  });

  it('shows the Men\'s and Women\'s collection links', () => {
    renderInRouter(<HomePage />);
    const menLinks = screen.getAllByRole('link', { name: /men/i });
    expect(menLinks.length).toBeGreaterThan(0);
    const womenLinks = screen.getAllByRole('link', { name: /women/i });
    expect(womenLinks.length).toBeGreaterThan(0);
  });

  it('renders the brand story section', () => {
    renderInRouter(<HomePage />);
    expect(screen.getByText(/Fashion with intention/i)).toBeInTheDocument();
  });

  it('renders the newsletter form', () => {
    renderInRouter(<HomePage />);
    const emailInput = screen.getByRole('textbox', { name: /email address for newsletter/i });
    expect(emailInput).toBeInTheDocument();
  });

  it('shows empty state for featured products when Supabase is not configured', () => {
    renderInRouter(<HomePage />);
    expect(screen.getByText(/No featured products yet/i)).toBeInTheDocument();
  });

  it('shows empty state for new arrivals when Supabase is not configured', () => {
    renderInRouter(<HomePage />);
    expect(screen.getByText(/No new arrivals yet/i)).toBeInTheDocument();
  });

  it('shows the benefits strip with delivery information', () => {
    renderInRouter(<HomePage />);
    expect(screen.getByText(/Nationwide Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile Money Payments/i)).toBeInTheDocument();
  });
});

