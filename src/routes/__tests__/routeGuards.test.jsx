import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AdminRoute } from '../AdminRoute';
import * as AuthModule from '../../context/AuthContext';

describe('Route Guards', () => {
  it('ProtectedRoute redirects unauthenticated visitors to login', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account" element={<ProtectedRoute><div>Private Account</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Private Account')).not.toBeInTheDocument();
  });

  it('ProtectedRoute renders protected content when user is logged in', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: { id: 'user-1', email: 'customer@hilaara.com' },
      isAdmin: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account" element={<ProtectedRoute><div>Private Account</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Private Account')).toBeInTheDocument();
  });

  it('AdminRoute blocks authenticated customers who are not admins', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: { id: 'cust-1', email: 'regular@hilaara.com' },
      isAdmin: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Secret Admin Area</div></AdminRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Administrative Access Denied/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Area')).not.toBeInTheDocument();
  });

  it('AdminRoute grants access when user has admin role', () => {
    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      user: { id: 'admin-1', email: 'admin@hilaara.com' },
      isAdmin: true,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Secret Admin Area</div></AdminRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Admin Area')).toBeInTheDocument();
  });
});
