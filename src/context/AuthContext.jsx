import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive admin status
  const isAdmin = profile?.role === 'admin';

  const loadUserProfile = useCallback(async (userId) => {
    try {
      const userProfile = await authService.getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        // Check local demo session
        const saved = localStorage.getItem('hilaara_demo_session');
        if (saved) {
          try {
            const { user: demoUser, profile: demoProfile } = JSON.parse(saved);
            if (mounted) {
              setUser(demoUser);
              setProfile(demoProfile);
              setSession({ access_token: 'demo-token' });
            }
          } catch {
            localStorage.removeItem('hilaara_demo_session');
          }
        }
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await loadUserProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Error checking active auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await loadUserProfile(newSession.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [loadUserProfile]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, profile: userProfile } = await authService.signIn({ email, password });
      setUser(data.user);
      setSession(data.session);
      setProfile(userProfile);
      return { user: data.user, profile: userProfile };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, fullName, phone }) => {
    setLoading(true);
    try {
      const { data, profile: userProfile } = await authService.signUp({ email, password, fullName, phone });
      setUser(data.user);
      setSession(data.session);
      setProfile(userProfile);
      return { user: data.user, profile: userProfile };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return authService.resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword) => {
    return authService.updatePassword(newPassword);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
