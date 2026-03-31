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

  const login = (email: string, providedRole: Role = null) => {
    let role = providedRole;
    if (!role) {
      if (email.includes('admin')) role = 'ADMIN';
      else if (email.includes('driver')) role = 'DRIVER';
      else role = 'CUSTOMER';
    }
    setUser({ name: email.split('@')[0], email, role });
  };

  const logout = () => {
    setUser(null);
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
