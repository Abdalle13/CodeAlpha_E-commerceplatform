import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'adm-1', email: 'admin@hilaara.so' },
    profile: { full_name: 'Store Administrator', role: 'admin' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

import { AdminLayout } from '../AdminLayout';
import { AdminOverviewPage } from '../AdminOverviewPage';
import { AdminInventoryPage } from '../AdminInventoryPage';

describe('Admin Console Views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AdminLayout with dark sidebar and navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminLayout />
      </MemoryRouter>
    );

    expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inventory').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Orders').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Live Storefront').length).toBeGreaterThan(0);
  });

  it('renders AdminOverviewPage with live KPI metrics', async () => {
    render(
      <MemoryRouter>
        <AdminOverviewPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Paid Revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Orders/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Orders/i)).toBeInTheDocument();
      expect(screen.getByText(/Low Stock Alerts/i)).toBeInTheDocument();
      expect(screen.getByText(/Recent Customer Orders/i)).toBeInTheDocument();
    });
  });

  it('renders AdminInventoryPage with variant stock levels', async () => {
    render(
      <MemoryRouter>
        <AdminInventoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Variant Inventory Matrix/i)).toBeInTheDocument();
      expect(screen.getByText(/Stock Levels by SKU/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Adjust/i).length).toBeGreaterThan(0);
    });
  });
});
