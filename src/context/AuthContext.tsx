/**
 * Contexto de Autenticação e Perfil de Acesso do Usuário
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { storageService, DEFAULT_USER } from '../services/storage';

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string, company: string) => boolean;
  loginAsDemo: () => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserAccount>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    // Check if user session exists in local storage
    const stored = storageService.getUser();
    return stored || DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('planoroxo_auth_active');
  });

  useEffect(() => {
    // If first visit, activate demo session automatically so user can immediately experience the app
    if (localStorage.getItem('planoroxo_auth_active') === null) {
      localStorage.setItem('planoroxo_auth_active', 'true');
      setIsAuthenticated(true);
      setUser(DEFAULT_USER);
    }
  }, []);

  const login = (email: string, _pass: string): boolean => {
    if (!email.trim()) return false;
    const existing = storageService.getUser();
    const activeUser: UserAccount = {
      ...existing,
      email: email.trim(),
      name: existing.email === email.trim() ? existing.name : email.split('@')[0],
    };
    storageService.setUser(activeUser);
    setUser(activeUser);
    setIsAuthenticated(true);
    localStorage.setItem('planoroxo_auth_active', 'true');
    return true;
  };

  const register = (name: string, email: string, _pass: string, company: string): boolean => {
    if (!name.trim() || !email.trim() || !company.trim()) return false;
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      companyName: company.trim(),
      role: 'Administrador / Gestor',
    };
    storageService.setUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('planoroxo_auth_active', 'true');
    return true;
  };

  const loginAsDemo = (): void => {
    storageService.setUser(DEFAULT_USER);
    setUser(DEFAULT_USER);
    setIsAuthenticated(true);
    localStorage.setItem('planoroxo_auth_active', 'true');
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    localStorage.removeItem('planoroxo_auth_active');
  };

  const updateProfile = (updated: Partial<UserAccount>): void => {
    if (!user) return;
    const modified = { ...user, ...updated };
    storageService.setUser(modified);
    setUser(modified);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
