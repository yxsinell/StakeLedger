'use client';

import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type UserProfile = Database['public']['Tables']['users']['Row'];

type AuthResult
  = | {
    ok: true
    message?: string
  }
  | {
    ok: false
    message: string
  };

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code !== 'PGRST116') {
          setError(profileError.message);
        }
        setProfile(null);
        return;
      }

      setProfile(data);
    },
    [supabase],
  );

  const syncUserRecord = useCallback(
    async (authUser: User) => {
      if (!authUser.email) { return; }

      const { error: upsertError } = await supabase.from('users').upsert(
        {
          id: authUser.id,
          email: authUser.email,
          role: 'user',
        },
        { onConflict: 'id' },
      );

      if (upsertError) {
        setError(upsertError.message);
      }
    },
    [supabase],
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) { return; }

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await syncUserRecord(data.session.user);
        await loadProfile(data.session.user.id);
      }

      setLoading(false);
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) { return; }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await syncUserRecord(newSession.user);
          await loadProfile(newSession.user.id);
        }
        else {
          setProfile(null);
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, loadProfile, syncUserRecord]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setError(null);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return { ok: false, message: loginError.message };
      }

      if (data.user) {
        await syncUserRecord(data.user);
        await loadProfile(data.user.id);
      }

      return { ok: true };
    },
    [supabase, loadProfile, syncUserRecord],
  );

  const signup = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setError(null);
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        setError(signupError.message);
        return { ok: false, message: signupError.message };
      }

      if (data.session?.user) {
        await syncUserRecord(data.session.user);
        await loadProfile(data.session.user.id);
        return { ok: true };
      }

      return {
        ok: true,
        message: 'Revisa tu correo para confirmar la cuenta y luego inicia sesion.',
      };
    },
    [supabase, loadProfile, syncUserRecord],
  );

  const logout = useCallback(async () => {
    setError(null);
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
