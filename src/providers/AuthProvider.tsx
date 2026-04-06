'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '@/lib/api';
import { AUTH_CHANGED_EVENT } from '@/lib/auth-events';
import type { AuthUserProfile } from '@/types/user';

type AuthContextValue = {
  user: AuthUserProfile | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const res = await api.get<AuthUserProfile>('/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  }, [refresh]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, refresh, logout }),
    [user, ready, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export default AuthProvider;
