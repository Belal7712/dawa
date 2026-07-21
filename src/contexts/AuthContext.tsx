import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

export type Profile = Tables<'profiles'>;

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function applySession(session: Session | null, { gate }: { gate: boolean }) {
      if (gate) setLoading(true);
      try {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) {
          // Defer DB call so we never deadlock inside onAuthStateChange
          const p = await fetchProfile(sessionUser.id);
          if (!cancelled) setProfile(p);
        } else if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled && gate) setLoading(false);
      }
    }

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await applySession(data.session, { gate: true });
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION is covered by getSession above — avoid double-resolve races
      if (event === 'INITIAL_SESSION') return;
      // Token refresh shouldn't flip loading / re-fetch profile
      if (event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        return;
      }

      // Defer to avoid supabase-js deadlock when querying inside the callback
      setTimeout(() => {
        if (cancelled) return;
        void applySession(session, { gate: true });
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      isAdmin: profile?.role === 'admin',
      signOut,
    }),
    [user, profile, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
