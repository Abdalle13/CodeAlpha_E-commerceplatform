import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../authService';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('signs up a new user and creates customer profile in demo/fallback mode', async () => {
    const res = await authService.signUp({
      email: 'test@hilaara.com',
      password: 'Password123!',
      fullName: 'Amina Warsame',
      phone: '+252 61 555 9999',
    });

    expect(res.error).toBeNull();
    expect(res.profile).toBeDefined();
    expect(res.profile.email).toBe('test@hilaara.com');
    expect(res.profile.full_name).toBe('Amina Warsame');
    expect(res.profile.role).toBe('customer');
  });

  it('authenticates demo customer and assigns customer role', async () => {
    const res = await authService.signIn({
      email: 'customer@hilaara.com',
      password: 'AnyPassword!',
    });

    expect(res.error).toBeNull();
    expect(res.profile.role).toBe('customer');
    expect(res.data.user.email).toBe('customer@hilaara.com');
  });

  it('authenticates demo admin and assigns admin role', async () => {
    const res = await authService.signIn({
      email: 'admin@hilaara.com',
      password: 'AnyPassword!',
    });

    expect(res.error).toBeNull();
    expect(res.profile.role).toBe('admin');
  });

  it('signs out cleanly by clearing local session', async () => {
    await authService.signIn({ email: 'test@hilaara.com', password: 'pass' });
    expect(localStorage.getItem('hilaara_demo_session')).not.toBeNull();

    await authService.signOut();
    expect(localStorage.getItem('hilaara_demo_session')).toBeNull();
  });

  it('strips role from client updateProfile payload to prevent privilege escalation', async () => {
    await authService.signIn({ email: 'customer@hilaara.com', password: 'pass' });
    
    // Attempt privilege escalation by passing role = 'admin'
    const res = await authService.updateProfile('demo-customer-id', {
      full_name: 'Updated Name',
      role: 'admin',
    });

    expect(res.data.full_name).toBe('Updated Name');
    expect(res.data.role).toBe('customer'); // Role should NOT be modified
  });
});
