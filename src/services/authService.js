import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  /**
   * Register new customer account
   */
  async signUp({ email, password, fullName, phone }) {
    if (!isSupabaseConfigured) {
      // Local development simulation fallback if Supabase not configured
      const mockId = 'demo-user-' + Math.random().toString(36).substring(2, 9);
      const mockUser = {
        id: mockId,
        email,
        user_metadata: { full_name: fullName, phone },
      };
      const mockProfile = {
        id: mockId,
        email,
        full_name: fullName,
        phone: phone || '',
        role: 'customer',
      };
      localStorage.setItem('hilaara_demo_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { data: { user: mockUser, session: { access_token: 'demo-token' } }, profile: mockProfile, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          role: 'customer',
        },
      },
    });

    if (error) throw error;

    let profile = null;
    if (data.user) {
      // Fetch or insert profile
      profile = await this.getProfile(data.user.id);
      if (!profile) {
        const { data: newProfile, error: profileErr } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            phone: phone || null,
            role: 'customer',
          })
          .select()
          .single();
        if (!profileErr) profile = newProfile;
      }
    }

    return { data, profile, error: null };
  },

  /**
   * Authenticate customer or administrator
   */
  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      // Local simulation: allow demo login
      const isDemoAdmin = email.toLowerCase().includes('admin');
      const mockId = isDemoAdmin ? 'demo-admin-id' : 'demo-customer-id';
      const mockUser = {
        id: mockId,
        email,
        user_metadata: { full_name: isDemoAdmin ? 'HILAARA Admin' : 'Demo Customer' },
      };
      const mockProfile = {
        id: mockId,
        email,
        full_name: isDemoAdmin ? 'HILAARA Admin' : 'Demo Customer',
        role: isDemoAdmin ? 'admin' : 'customer',
      };
      localStorage.setItem('hilaara_demo_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { data: { user: mockUser, session: { access_token: 'demo-token' } }, profile: mockProfile, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const profile = await this.getProfile(data.user.id);
    return { data, profile, error: null };
  },

  /**
   * Terminate active session
   */
  async signOut() {
    localStorage.removeItem('hilaara_demo_session');
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  },

  /**
   * Request password reset link
   */
  async resetPasswordForEmail(email) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Update authenticated user password
   */
  async updatePassword(newPassword) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { data, error: null };
  },

  /**
   * Fetch profile from public.profiles table
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('hilaara_demo_session');
      if (saved) {
        try {
          return JSON.parse(saved).profile;
        } catch {
          return null;
        }
      }
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  /**
   * Update profile details (except role)
   */
  async updateProfile(userId, updates) {
    // Exclude role to protect against privilege escalation on client side
    const { role, ...safeUpdates } = updates;
    safeUpdates.updated_at = new Date().toISOString();

    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('hilaara_demo_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updatedProfile = { ...parsed.profile, ...safeUpdates };
        localStorage.setItem('hilaara_demo_session', JSON.stringify({ ...parsed, profile: updatedProfile }));
        return { data: updatedProfile, error: null };
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },
};
