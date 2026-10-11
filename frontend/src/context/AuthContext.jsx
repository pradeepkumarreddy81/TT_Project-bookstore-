import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '@/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and verify user on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await client.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    }

    loadUser();

    // Listen to 401 logout events
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    const { token: jwtToken, user: authUser } = res.data;
    setToken(jwtToken);
    setUser(authUser);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    return authUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await client.post('/auth/register', { name, email, password });
    const { token: jwtToken, user: authUser } = res.data;
    setToken(jwtToken);
    setUser(authUser);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    return authUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
