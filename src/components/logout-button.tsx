'use client';

import { useAuth } from '@/contexts/auth-context';

export function LogoutButton() {
  const { logout, loading } = useAuth();

  return (
    <button
      className="button secondary"
      data-testid="logout_button"
      disabled={loading}
      onClick={() => void logout()}
      type="button"
    >
      Salir
    </button>
  );
}
