'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function profileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    name: profile.name as string,
    email: profile.email as string,
    role: profile.role as Role,
    permissions: {
      canAccessAccounting: profile.can_access_accounting as boolean,
      canAccessHR: profile.can_access_hr as boolean,
      canAccessShipments: profile.can_access_shipments as boolean,
      canAccessContainers: profile.can_access_containers as boolean,
      canAccessAnalytics: profile.can_access_analytics as boolean,
      canAccessSettings: profile.can_access_settings as boolean,
      canAccessUsers: profile.can_access_users as boolean,
    },
  };
}

async function fetchProfile(supabaseUser: SupabaseUser): Promise<User | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();
  return data ? profileToUser(data) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const profile = await fetchProfile(data.user);
    if (profile) setUser(profile);
    return { success: true, user: profile ?? undefined };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
