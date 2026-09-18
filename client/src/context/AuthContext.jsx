import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.js';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    memory_enabled: true,
    custom_instructions: '',
    full_name: 'Explorer'
  });
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            localStorage.setItem('memai_auth_token', session.access_token);
            localStorage.setItem('memai_user_id', session.user.id);
            setUser(session.user);
          } else {
            // Setup default guest ID
            let guestId = localStorage.getItem('memai_user_id');
            if (!guestId) {
              guestId = '00000000-0000-0000-0000-000000000001';
              localStorage.setItem('memai_user_id', guestId);
            }
            setUser({ id: guestId, email: 'guest@example.com', isGuest: true });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              localStorage.setItem('memai_auth_token', session.access_token);
              localStorage.setItem('memai_user_id', session.user.id);
              setUser(session.user);
            } else {
              localStorage.removeItem('memai_auth_token');
              const guestId = '00000000-0000-0000-0000-000000000001';
              localStorage.setItem('memai_user_id', guestId);
              setUser({ id: guestId, email: 'guest@example.com', isGuest: true });
            }
          });
        } else {
          // No Supabase URL configured, pure guest demo mode
          const guestId = localStorage.getItem('memai_user_id') || '00000000-0000-0000-0000-000000000001';
          localStorage.setItem('memai_user_id', guestId);
          setUser({ id: guestId, email: 'guest@example.com', isGuest: true });
        }

        // Fetch user profile from backend
        try {
          const res = await api.getProfile();
          if (res && res.profile) {
            setProfile(res.profile);
          }
        } catch (profileErr) {
          console.warn('Profile fetch warning:', profileErr.message);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      localStorage.setItem('memai_auth_token', data.session.access_token);
      localStorage.setItem('memai_user_id', data.user.id);
      setUser(data.user);
      const res = await api.getProfile();
      if (res?.profile) setProfile(res.profile);
    }
    return data;
  };

  const signup = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('memai_auth_token');
    const guestId = '00000000-0000-0000-0000-000000000001';
    localStorage.setItem('memai_user_id', guestId);
    setUser({ id: guestId, email: 'guest@example.com', isGuest: true });
  };

  const updateProfileSettings = async (updates) => {
    try {
      const res = await api.updateProfile(updates);
      if (res?.profile) {
        setProfile(res.profile);
      }
      return res;
    } catch (err) {
      console.error('Failed to update profile settings:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      signup,
      logout,
      updateProfileSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
