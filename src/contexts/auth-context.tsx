'use client';

import type { UserProfile } from '@/lib/types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (email: string, password: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(
    async () => {
      const response = await fetch('/api/auth/profile', { credentials: 'same-origin' });
      const payload = await response.json().catch(() => null) as { profile?: UserProfile } | null;

      if (!response.ok || !payload?.profile) {
        setProfile(null);
        return false;
      }

      setProfile(payload.profile);
      return true;
    },
    [],
  );

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
    void loadProfile();
  }, [loadProfile]);

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

        void loadProfile();
        return { ok: true };
      }
      finally {
        setLoading(false);
      }
    },
    [loadProfile, requestAuth],
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

        if (await loadProfile()) {
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
    [loadProfile, requestAuth],
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

      setProfile(null);
    }
    finally {
      setLoading(false);
    }
  }, [requestAuth]);

  const value: AuthContextValue = {
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
