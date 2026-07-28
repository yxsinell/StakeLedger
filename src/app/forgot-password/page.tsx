'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';

export default function ForgotPasswordPage() {
  const { loading, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const atIndex = normalizedEmail.indexOf('@');
    const dotIndex = normalizedEmail.lastIndexOf('.');
    const isEmailValid = normalizedEmail.length <= 254
      && atIndex > 0
      && atIndex === normalizedEmail.lastIndexOf('@')
      && dotIndex > atIndex + 1
      && dotIndex < normalizedEmail.length - 1
      && !normalizedEmail.includes(' ');
    const nextEmailError = !normalizedEmail
      ? 'Introduce tu email.'
      : !isEmailValid
          ? 'Introduce un email válido.'
          : null;

    setEmailError(nextEmailError);

    if (nextEmailError) {
      return;
    }

    const result = await resetPassword(normalizedEmail);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setFormMessage(result.message ?? 'Revisa tu correo para continuar.');
  };

  return (
    <main className="min-h-svh px-6 py-12" data-testid="forgotPasswordPage">
      <Card className="mx-auto w-full max-w-md" data-testid="forgotPasswordCard">
        <CardHeader>
          <CardTitle>Recupera tu contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Te enviaremos instrucciones para restablecer el acceso.
          </p>
          <form
            className="grid gap-4"
            data-testid="forgotPasswordForm"
            noValidate
            onSubmit={event => void handleSubmit(event)}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                aria-describedby={emailError ? 'forgot-password-email-error' : undefined}
                aria-invalid={Boolean(emailError)}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                data-testid="email_input"
                id="email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError(null);
                }}
                required
                spellCheck={false}
                type="email"
                value={email}
              />
              {emailError
                ? <p className="text-xs text-destructive" data-testid="email_error" id="forgot-password-email-error">{emailError}</p>
                : null}
            </div>
            {formError
              ? (
                  <div
                    className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    data-testid="form_error"
                    aria-live="assertive"
                    role="alert"
                  >
                    {formError}
                  </div>
                )
              : null}
            {formMessage
              ? (
                  <div
                    aria-live="polite"
                    className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
                    data-testid="form_message"
                    role="status"
                  >
                    {formMessage}
                  </div>
                )
              : null}
            <Button data-testid="reset_request_button" disabled={loading} type="submit">
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </Button>
          </form>
          <Button asChild className="px-0" variant="link">
            <Link data-testid="login_link" href="/login">Volver a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
