'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Role = 'ADMIN' | 'DRIVER' | 'CUSTOMER' | null;

interface User {
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ts_auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, providedRole: Role = null) => {
    let role = providedRole;
    if (!role) {
      if (email.includes('admin')) role = 'ADMIN';
      else if (email.includes('driver')) role = 'DRIVER';
      else role = 'CUSTOMER';
    }
    const newUser = { name: email.split('@')[0], email, role };
    setUser(newUser);
    localStorage.setItem('ts_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ts_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
