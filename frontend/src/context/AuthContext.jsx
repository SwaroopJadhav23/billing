import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthTokens, clearAuthTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (localStorage.getItem('token')) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore
    }
    clearAuthTokens();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me').then(({ data }) => {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    }).catch(() => logout());
  }, [token, logout]);

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuthTokens({ accessToken: data.accessToken || data.token, refreshToken: data.refreshToken });
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.accessToken || data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(token && user)
  }), [user, token, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
