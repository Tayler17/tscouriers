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
    id:    profile.id    as string,
    name:  (profile.name  as string) || (profile.email as string)?.split('@')[0] || 'User',
    email: profile.email as string,
    role:  (profile.role as string)?.toUpperCase() as Role,
    permissions: {
      canAccessAccounting: !!(profile.can_access_accounting),
      canAccessHR:         !!(profile.can_access_hr),
      canAccessShipments:  !!(profile.can_access_shipments),
      canAccessContainers: !!(profile.can_access_containers),
      canAccessAnalytics:  !!(profile.can_access_analytics),
      canAccessSettings:   !!(profile.can_access_settings),
      canAccessUsers:      !!(profile.can_access_users),
    },
  };
}

function buildFallbackProfile(supabaseUser: SupabaseUser): Record<string, unknown> {
  const meta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const role = ((meta.role as string)?.toUpperCase() as Role) || 'CUSTOMER';
  return {
    id:    supabaseUser.id,
    name:  (meta.name as string) || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email!,
    role,
    can_access_accounting: role === 'ADMIN',
    can_access_hr:         role === 'ADMIN',
    can_access_shipments:  role === 'ADMIN' || role === 'STAFF',
    can_access_containers: role === 'ADMIN' || role === 'STAFF',
    can_access_analytics:  role === 'ADMIN',
    can_access_settings:   role === 'ADMIN',
    can_access_users:      role === 'ADMIN',
  };
}

async function fetchProfile(supabaseUser: SupabaseUser): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (data) return profileToUser(data);

    // PGRST116 = "0 rows" — row genuinely doesn't exist, safe to create.
    // Any other error (RLS, network, etc.) → use session fallback WITHOUT touching the DB.
    if (error?.code !== 'PGRST116') {
      return profileToUser(buildFallbackProfile(supabaseUser));
    }

    // Row doesn't exist — create it from session metadata
    const fallback = buildFallbackProfile(supabaseUser);
    await supabase.from('profiles').insert(fallback);

    const { data: refetched } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (refetched) return profileToUser(refetched);

    return profileToUser(fallback);
  } catch {
    return profileToUser(buildFallbackProfile(supabaseUser));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Safety net: after 6 seconds always unblock loading regardless of Supabase state
    const safetyTimer = setTimeout(() => setIsLoading(false), 6000);

    // Official Supabase v2 pattern: use onAuthStateChange as single source of truth.
    // INITIAL_SESSION fires immediately on mount with the stored session (no network needed).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }

        // Unblock loading on first auth event (INITIAL_SESSION or SIGNED_IN/OUT)
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          clearTimeout(safetyTimer);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const profile = await fetchProfile(data.user);
    setUser(profile);
    return { success: true, user: profile };
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut({ scope: 'local' });
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
