import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpdateProfile = vi.fn().mockResolvedValue(true);

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'usr-1', email: 'customer@example.com' },
    profile: { full_name: 'Farah Abdi', phone: '+252 61 555 1234', role: 'customer' },
    updateProfile: mockUpdateProfile,
  }),
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../services/orderService', () => ({
  getCustomerOrders: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

vi.mock('../../../lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

import { ProfilePage } from '../ProfilePage';
import { OrdersPage } from '../OrdersPage';

describe('Account Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProfilePage', () => {
    it('renders customer profile information', () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      );

      expect(screen.getByText('Profile Information')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Farah Abdi')).toBeInTheDocument();
      expect(screen.getByDisplayValue('customer@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+252 61 555 1234')).toBeInTheDocument();
    });

    it('submits updated profile name and phone', async () => {
      render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      );

      const nameInput = screen.getByDisplayValue('Farah Abdi');
      fireEvent.change(nameInput, { target: { value: 'Farah Abdi Mohamed' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        full_name: 'Farah Abdi Mohamed',
        phone: '+252 61 555 1234',
      });
    });
  });

  describe('OrdersPage', () => {
    it('shows empty order state when customer has no orders', async () => {
      render(
        <MemoryRouter>
          <OrdersPage />
        </MemoryRouter>
      );

      expect(await screen.findByText('No Orders Placed Yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore catalog/i })).toHaveAttribute('href', '/shop');
    });
  });
});

