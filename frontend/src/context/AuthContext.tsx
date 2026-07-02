import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hrms_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('hrms_token');
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser({
        id: me.userId,
        email: me.email,
        role: me.role as 'employee' | 'admin',
        employeeId: me.employeeId,
        employee: me.employee as User['employee'] ?? undefined,
      });
    } catch {
      localStorage.removeItem('hrms_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (token) localStorage.setItem('hrms_token', token);
    else localStorage.removeItem('hrms_token');
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login(email, password);
    setToken(t);
    setUser({
      id: (u as { id: string }).id,
      email: (u as { email: string }).email,
      role: (u as { role: string }).role as 'employee' | 'admin',
      employeeId: (u as { employeeId?: string }).employeeId,
      employee: (u as { employee?: User['employee'] }).employee ?? undefined,
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
