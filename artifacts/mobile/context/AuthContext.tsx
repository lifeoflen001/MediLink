import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/utils/api';

export type UserRole =
  | 'superadmin'
  | 'customer'
  | 'hospital'
  | 'pharmacy'
  | 'supplier'
  | 'doctor'
  | 'institution';

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  customer: 'Patient / Customer',
  hospital: 'Hospital / Clinic',
  pharmacy: 'Pharmacy',
  supplier: 'Medical Supplier',
  doctor: 'Private Doctor',
  institution: 'Health Institution',
};

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  isActive: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  profile: Record<string, unknown>;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateLocalUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on startup
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('auth_user'),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Optionally validate token with /api/auth/me in background
          validateToken(storedToken);
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  async function validateToken(storedToken: string) {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ''}/api/auth/me`,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      if (!res.ok) {
        // Token invalid — clear auth
        await clearAuth();
      } else {
        const data = await res.json();
        const updatedUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          displayName: data.user.displayName,
          isActive: data.user.isActive,
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch {}
  }

  async function clearAuth() {
    await Promise.all([
      AsyncStorage.removeItem('auth_token'),
      AsyncStorage.removeItem('auth_user'),
    ]);
    setToken(null);
    setUser(null);
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? 'Login failed');

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      displayName: data.user.displayName,
      isActive: data.user.isActive,
    };
    await Promise.all([
      AsyncStorage.setItem('auth_token', data.token),
      AsyncStorage.setItem('auth_user', JSON.stringify(authUser)),
    ]);
    setToken(data.token);
    setUser(authUser);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result?.error ?? 'Registration failed');

    const authUser: AuthUser = {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      displayName: result.user.displayName,
      isActive: result.user.isActive,
    };
    await Promise.all([
      AsyncStorage.setItem('auth_token', result.token),
      AsyncStorage.setItem('auth_user', JSON.stringify(authUser)),
    ]);
    setToken(result.token);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
  }, []);

  const updateLocalUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
