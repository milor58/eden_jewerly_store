import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, TOKEN_KEY } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const saveSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Load the user (name, role, favorites) whenever there is a token.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    apiFetch('/api/auth/me')
      .then((data) => alive && setUser(data.user))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  // Any 401 from the API -> log out.
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = useCallback(
    async (email, password) => saveSession(await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })),
    [saveSession]
  );

  const signup = useCallback(
    async (form) => saveSession(await apiFetch('/api/auth/signup', { method: 'POST', body: form })),
    [saveSession]
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      const isFav = user?.favorites?.includes(productId);
      const data = await apiFetch(`/api/favorites/${productId}`, { method: isFav ? 'DELETE' : 'POST' });
      setUser((u) => (u ? { ...u, favorites: data.favorites } : u));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      signup,
      logout,
      toggleFavorite,
    }),
    [token, user, loading, login, signup, logout, toggleFavorite]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
