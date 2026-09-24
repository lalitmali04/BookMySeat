import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  quickLoginDemoUser: () => Promise<void>;
  quickLoginAdmin: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bms_auth_token'));

  useEffect(() => {
    if (token) {
      api.getProfile()
        .then(res => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('bms_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token expired
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('bms_auth_token', res.token);
    localStorage.setItem('bms_user', JSON.stringify(res.user));
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.register({ name, email, password, phone });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('bms_auth_token', res.token);
    localStorage.setItem('bms_user', JSON.stringify(res.user));
  };

  const quickLoginDemoUser = async () => {
    await login('user@bookmyseat.com', 'User@123');
  };

  const quickLoginAdmin = async () => {
    await login('admin@bookmyseat.com', 'Admin@123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bms_auth_token');
    localStorage.removeItem('bms_user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.getProfile();
      setUser(res.user);
      localStorage.setItem('bms_user', JSON.stringify(res.user));
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        quickLoginDemoUser,
        quickLoginAdmin,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
