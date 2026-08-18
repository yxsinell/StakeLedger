'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export function LogoutButton() {
  const { logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Button
      data-testid="logout_button"
      disabled={loading}
      onClick={() => void handleLogout()}
      type="button"
      variant="secondary"
    >
      Salir
    </Button>
  );
}
