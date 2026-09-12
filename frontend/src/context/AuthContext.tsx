import React, { createContext, useContext, useState, useEffect } from 'react';
import { setStoredToken, getStoredToken } from '../services/api';

export type UserRole = 'farmer' | 'buyer' | 'government';

export interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  isNewUser: boolean;
  name?: string;
  phone?: string;
  token?: string | null;
}

interface AuthContextType {
  user: AuthState;
  login: (
    role: UserRole,
    isNewUser?: boolean,
    details?: { name?: string; phone?: string; token?: string }
  ) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'fasalsetu_auth';

const defaultAuthState: AuthState = {
  isLoggedIn: false,
  role: null,
  isNewUser: false,
  token: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const token = getStoredToken();
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, token: token || parsed.token || null };
      }
    } catch (e) {
      console.error('Failed to parse auth state from localStorage:', e);
    }
    return defaultAuthState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (user.token) {
        setStoredToken(user.token);
      }
    } catch (e) {
      console.error('Failed to save auth state to localStorage:', e);
    }
  }, [user]);

  const login = (
    role: UserRole,
    isNewUser: boolean = false,
    details?: { name?: string; phone?: string; token?: string }
  ) => {
    const token = details?.token || getStoredToken();
    if (token) {
      setStoredToken(token);
    }
    const newState: AuthState = {
      isLoggedIn: true,
      role,
      isNewUser,
      name: details?.name || (role === 'farmer' ? 'Ramesh Ji' : role === 'buyer' ? 'Amit Sharma' : 'Officer T. Rao'),
      phone: details?.phone || '9876543210',
      token,
    };
    setUser(newState);
  };

  const completeOnboarding = () => {
    setUser((prev) => ({
      ...prev,
      isNewUser: false,
    }));
  };

  const logout = () => {
    setUser(defaultAuthState);
    setStoredToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth state from localStorage:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
