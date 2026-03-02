'use client';

import type { FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';

function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  useEffect(() => {
    const clearFields = () => {
      setEmail('');
      setPassword('');
    };

    clearFields();
    const timer = setTimeout(clearFields, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const result = await login(email, password);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    router.push(redirectTo);
  };

  return (
    <main className="min-h-svh space-y-12 px-6 py-12" data-testid="loginPage">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative h-24 w-24">
              <Image
                src="/imageSL.png"
                alt="StakeLedger"
                fill
                sizes="96px"
                className="rounded-[28px] object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold">StakeLedger</p>
              <p className="text-xs text-muted-foreground">Ledger inteligente</p>
            </div>
          </div>
          <Badge variant="secondary">Acceso seguro</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Control real de tu bank
          </h1>
          <p className="text-base text-muted-foreground">
            Centraliza cash, bonus y freebet con trazabilidad completa y reglas
            de riesgo.
          </p>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Stake sugerido</p>
              <p className="text-xs text-muted-foreground">
                Cap automatico del 40% sobre cash disponible.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Normalizacion deportiva</p>
              <p className="text-xs text-muted-foreground">
                Catalogos con autocompletado y fallback manual.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-border" data-testid="loginCard">
          <CardHeader>
            <CardTitle>Inicia sesion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-4"
              data-testid="loginForm"
              autoComplete="off"
              onSubmit={event => void handleSubmit(event)}
            >
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  data-testid="email_input"
                  id="email"
                  name="stakeledger-email"
                  onChange={event => setEmail(event.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="new-password"
                  spellCheck={false}
                  required
                  type="email"
                  value={email}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  data-testid="password_input"
                  id="password"
                  name="stakeledger-password"
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="new-password"
                  spellCheck={false}
                  required
                  type="password"
                  value={password}
                />
              </div>
              {formError
                ? (
                    <div
                      className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                      data-testid="form_error"
                    >
                      {formError}
                    </div>
                  )
                : null}
              {error
                ? (
                    <div
                      className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                      data-testid="auth_error"
                    >
                      {error}
                    </div>
                  )
                : null}
              <Button
                data-testid="login_button"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Cargando...' : 'Ingresar'}
              </Button>
            </form>
            <div className="text-sm text-muted-foreground" data-testid="signup_helper">
              No tienes cuenta?
              {' '}
              <Button asChild variant="link" className="px-0">
                <Link data-testid="signup_link" href="/signup">
                  Crear cuenta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="mx-auto w-full max-w-6xl" />

      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-3" data-testid="loginFeatureGrid">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metas dinamicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Proyeccion diaria con protecciones automaticas de riesgo.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feed con ICP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recomendaciones filtrables con adhesion en dos pasos.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auditoria viva</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Historial inmutable de movimientos y ajustes del ledger.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={(
        <main className="min-h-svh px-6 py-12" data-testid="loginPage">
          <Card className="mx-auto w-full max-w-md" data-testid="loginCard">
            <CardHeader>
              <CardTitle>Inicia sesion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Cargando formulario...</p>
            </CardContent>
          </Card>
        </main>
      )}
    >
      <LoginForm />
    </Suspense>
  );
}
