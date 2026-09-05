import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('laporgo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check Supabase session if configured
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          let userRole = session.user.user_metadata?.role;
          let userName = session.user.user_metadata?.full_name;

          // Fetch profile from database if available
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, full_name')
              .eq('id', session.user.id)
              .single();
            if (profile) {
              if (profile.role) userRole = profile.role;
              if (profile.full_name) userName = profile.full_name;
            }
          } catch (e) {}

          const inferredRole = userRole || (session.user.email.includes('admin') ? 'Admin' : 'Staff');
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            role: inferredRole,
            name: userName || session.user.email.split('@')[0]
          };
          setUser(userObj);
          localStorage.setItem('laporgo_user', JSON.stringify(userObj));
        }
      } catch (err) {
        console.log('Supabase session check skipped or failed, using local auth state');
      }
    };
    getSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (!error && data?.user) {
          let userRole = data.user.user_metadata?.role;
          let userName = data.user.user_metadata?.full_name;

          // Fetch profile detail safely from profiles table
          try {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('role, full_name')
              .eq('id', data.user.id);
            if (profiles && profiles.length > 0) {
              if (profiles[0].role) userRole = profiles[0].role;
              if (profiles[0].full_name) userName = profiles[0].full_name;
            }
          } catch (e) {}

          const inferredRole = userRole || (email.includes('admin') ? 'Admin' : 'Staff');
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            role: inferredRole,
            name: userName || email.split('@')[0]
          };
          setUser(userObj);
          localStorage.setItem('laporgo_user', JSON.stringify(userObj));
          setLoading(false);
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase auth failed, activating emergency bypass');
      }
    }

    // Emergency Bypass Fallback (Bisa masuk Admin/Staff langsung tanpa buat akun)
    const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Staff';
    const mockUser = {
      id: role === 'Admin' ? 'usr-admin-demo' : 'usr-staff-demo',
      email: email,
      role: role,
      name: role === 'Admin' ? 'Administrator LaporGo' : (email.split('@')[0] || 'User Kopswa')
    };
    setUser(mockUser);
    localStorage.setItem('laporgo_user', JSON.stringify(mockUser));
    setLoading(false);
    return { success: true };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('laporgo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
