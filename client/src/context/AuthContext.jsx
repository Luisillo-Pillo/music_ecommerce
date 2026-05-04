import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import './AuthContext.css';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'music_token';
const USER_KEY = 'music_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            profileImage: data.profileImage,
            role: data.role,
          });
        }
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    const { data } = await api.get('/auth/me');
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      profileImage: data.profileImage,
      role: data.role,
    });
  };

  const updateProfile = async (payload) => {
    const { data } = await api.patch('/auth/me', payload);
    setUser((u) => ({ ...u, ...data }));
    return data;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth fuera de AuthProvider');
  }
  return ctx;
}
