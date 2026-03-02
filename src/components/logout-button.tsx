'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export function LogoutButton() {
  const { logout, loading } = useAuth();

  return (
    <Button
      data-testid="logout_button"
      disabled={loading}
      onClick={() => void logout()}
      type="button"
      variant="secondary"
    >
      Salir
    </Button>
  );
}
