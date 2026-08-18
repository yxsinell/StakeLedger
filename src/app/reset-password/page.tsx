'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';

export default function ResetPasswordPage() {
  const { loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormMessage(null);

    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setFormError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }

    if (password !== confirmation) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    const result = await updatePassword(password);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setFormMessage(result.message ?? 'Contraseña actualizada.');
    setPassword('');
    setConfirmation('');
  };

  return (
    <main className="min-h-svh px-6 py-12" data-testid="resetPasswordPage">
      <Card className="mx-auto w-full max-w-md" data-testid="resetPasswordCard">
        <CardHeader>
          <CardTitle>Actualiza tu contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Elige una contraseña nueva para recuperar el acceso.
          </p>
          <form className="grid gap-4" data-testid="resetPasswordForm" noValidate onSubmit={event => void handleSubmit(event)}>
            <div className="grid gap-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input data-testid="password_input" id="password" autoComplete="new-password" onChange={event => setPassword(event.target.value)} required type="password" value={password} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmation">Repite la contraseña</Label>
              <Input data-testid="confirm_password_input" id="confirmation" autoComplete="new-password" onChange={event => setConfirmation(event.target.value)} required type="password" value={confirmation} />
            </div>
            {formError ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="form_error" role="alert">{formError}</p> : null}
            {formMessage ? <p className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground" data-testid="form_message" role="status">{formMessage}</p> : null}
            <Button data-testid="reset_password_button" disabled={loading} type="submit">
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
          <Button asChild className="px-0" variant="link">
            <Link data-testid="forgot_password_link" href="/forgot-password">Solicitar un enlace nuevo</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
