import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ican_token');
    const savedUser = localStorage.getItem('ican_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('ican_token', data.token);
    localStorage.setItem('ican_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithCode = useCallback(async (code) => {
    const { data } = await API.post('/auth/login-code', { code });
    localStorage.setItem('ican_token', data.token);
    localStorage.setItem('ican_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ican_token');
    localStorage.removeItem('ican_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithCode, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
