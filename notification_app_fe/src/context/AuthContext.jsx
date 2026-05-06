import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login with demo user on mount
    async function autoLogin() {
      try {
        const res = await getAuthToken({
          userId: 'user-123',
          email: 'demo@afford.com',
          role: 'user',
        });
        const { token: t, userId, email, role } = res.data;
        localStorage.setItem('token', t);
        setToken(t);
        setUser({ userId, email, role });
      } catch (err) {
        console.error('Auth failed:', err);
      } finally {
        setLoading(false);
      }
    }
    autoLogin();
  }, []);

  const value = { user, token, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
