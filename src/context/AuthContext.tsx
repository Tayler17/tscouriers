'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Role = 'ADMIN' | 'STAFF' | 'DRIVER' | 'CUSTOMER' | null;

export interface UserPermissions {
  canAccessAccounting: boolean;
  canAccessHR: boolean;
  canAccessShipments: boolean;
  canAccessContainers: boolean;
  canAccessAnalytics: boolean;
  canAccessSettings: boolean;
  canAccessUsers: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: UserPermissions;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  name: 'Master Admin',
  email: 'admin@tscouriers.com',
  role: 'ADMIN',
  permissions: {
    canAccessAccounting: true,
    canAccessHR: true,
    canAccessShipments: true,
    canAccessContainers: true,
    canAccessAnalytics: true,
    canAccessSettings: true,
    canAccessUsers: true,
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize user database if empty
    const savedDb = localStorage.getItem('ts_users_db');
    if (!savedDb) {
      localStorage.setItem('ts_users_db', JSON.stringify([DEFAULT_ADMIN]));
    }

    const savedUser = localStorage.getItem('ts_auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password?: string) => {
    const usersDb: User[] = JSON.parse(localStorage.getItem('ts_users_db') || '[]');
    
    // Simulate login logic: if match email, login. 
    // In a real app, we verify password here.
    const foundUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('ts_auth_user', JSON.stringify(foundUser));
      return true;
    }

    // Fallback for demo: auto-create if it matches standard patterns
    if (email.includes('admin') || email.includes('driver')) {
      const role: Role = email.includes('admin') ? 'ADMIN' : 'DRIVER';
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
        permissions: role === 'ADMIN' ? DEFAULT_ADMIN.permissions : {
           canAccessAccounting: false,
           canAccessHR: false,
           canAccessShipments: true,
           canAccessContainers: true,
           canAccessAnalytics: false,
           canAccessSettings: false,
           canAccessUsers: false
        }
      };
      
      // Save to db
      const newDb = [...usersDb, newUser];
      localStorage.setItem('ts_users_db', JSON.stringify(newDb));
      
      setUser(newUser);
      localStorage.setItem('ts_auth_user', JSON.stringify(newUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ts_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
