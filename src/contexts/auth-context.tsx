'use client';

import type { Session, User } from '@supabase/supabase-js';

import type { UserProfile } from '@/lib/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (email: string, password: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        setProfile(null);
        return;
      }

      setProfile(data);
    },
    [supabase],
  );

  const syncSession = useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return false;
    }

    setSession(data.session);
    setUser(data.session?.user ?? null);

    if (data.session?.user) {
      await loadProfile(data.session.user.id);
      return true;
    }

    setProfile(null);
    return false;
  }, [loadProfile, supabase]);

  const requestAuth = useCallback(async (path: string, body: Record<string, string>) => {
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
      const payload = await response.json().catch(() => null) as {
        error?: string
        message?: string
      } | null;

      if (!response.ok) {
        return {
          ok: false as const,
          message: payload?.error ?? 'No se ha podido procesar la solicitud.',
        };
      }

      return { ok: true as const, message: payload?.message };
    }
    catch {
      return {
        ok: false as const,
        message: 'El servicio ha tardado demasiado. Inténtalo de nuevo.',
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await syncSession();
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) { return; }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
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
  }, [supabase, loadProfile, syncSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setLoading(true);

      try {
        const result = await requestAuth('/api/auth/login', {
          email,
          password,
        });

        if (!result.ok) {
          const message = 'Email o contraseña no válidos.';
          return { ok: false, message };
        }

        return { ok: true };
      }
      finally {
        setLoading(false);
      }
    },
    [requestAuth],
  );

  const signup = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setLoading(true);

      try {
        const result = await requestAuth('/api/auth/register', {
          email,
          password,
        });

        if (!result.ok) {
          const message = result.message === 'An account with this email already exists.'
            ? 'Ya existe una cuenta con este email.'
            : 'No se ha podido crear la cuenta. Inténtalo de nuevo.';
          return { ok: false, message };
        }

        if (await syncSession()) {
          return { ok: true };
        }

        return {
          ok: true,
          message: 'Revisa tu correo para confirmar la cuenta y luego inicia sesión.',
        };
      }
      finally {
        setLoading(false);
      }
    },
    [requestAuth, syncSession],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<AuthResult> => {
      setLoading(true);

      try {
        const result = await requestAuth('/api/auth/reset-password', { email });

        if (!result.ok) {
          const message = 'No se ha podido solicitar el restablecimiento. Inténtalo de nuevo.';
          return { ok: false, message };
        }

        return {
          ok: true,
          message: 'Si existe una cuenta con ese email, recibirás un correo para restablecer tu contraseña.',
        };
      }
      finally {
        setLoading(false);
      }
    },
    [requestAuth],
  );

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      const result = await requestAuth('/api/auth/logout', {});

      if (!result.ok) {
        return;
      }

      setSession(null);
      setUser(null);
      setProfile(null);
    }
    finally {
      setLoading(false);
    }
  }, [requestAuth]);

  const value: AuthContextValue = {
    session,
    user,
    profile,
    loading,
    login,
    signup,
    resetPassword,
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
