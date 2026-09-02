import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'Staff',
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
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
    try {
      // Try real Supabase auth first
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error && data?.user) {
        const userObj = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || (email.includes('admin') ? 'Admin' : 'Staff'),
          name: data.user.user_metadata?.full_name || email.split('@')[0]
        };
        setUser(userObj);
        localStorage.setItem('laporgo_user', JSON.stringify(userObj));
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      console.warn("Supabase auth unavailable, falling back to mock login");
    }

    // Mock Login Fallback
    const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Staff';
    const mockUser = {
      id: role === 'Admin' ? 'usr-admin-demo' : 'usr-staff-demo',
      email: email,
      role: role,
      name: role === 'Admin' ? 'Administrator LaporGo' : 'Staff OMI-SMART'
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
