'use client';

import type { FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const { signup, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const router = useRouter();

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
    setFormMessage(null);

    const result = await signup(email, password);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    if (result.message) {
      setFormMessage(result.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="min-h-svh space-y-12 px-6 py-12" data-testid="signupPage">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
        <Card className="order-2 lg:order-1" data-testid="signupCard">
          <CardHeader>
            <CardTitle>Crea tu cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-4"
              data-testid="signupForm"
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
              {formMessage
                ? (
                    <div
                      className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
                      data-testid="form_message"
                    >
                      {formMessage}
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
                data-testid="signup_button"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Creando...' : 'Crear cuenta'}
              </Button>
            </form>
            <div className="text-sm text-muted-foreground" data-testid="login_helper">
              Ya tienes cuenta?
              {' '}
              <Button asChild variant="link" className="px-0">
                <Link data-testid="login_link" href="/login">
                  Iniciar sesion
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="order-1 space-y-6 lg:order-2">
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
              <p className="text-xs text-muted-foreground">Nuevo control</p>
            </div>
          </div>
          <Badge variant="secondary">Onboarding guiado</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Tu ledger listo en minutos
          </h1>
          <p className="text-base text-muted-foreground">
            Crea banks, metas y tickets con reglas claras. Mantendras trazabilidad
            desde el primer registro.
          </p>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Metas dinamicas</p>
              <p className="text-xs text-muted-foreground">
                Misiones diarias con cuota sugerida.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Feed recomendado</p>
              <p className="text-xs text-muted-foreground">
                Adhesion rapida desde picks normalizados.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Separator className="mx-auto w-full max-w-6xl" />

      <section className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="signupFeatureGrid">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bolsillos operativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Separa cash, bonus y freebet con control de saldo.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riesgo disciplinado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cortafuegos y alertas en cuotas fuera de limite.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial auditable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Movimientos con trazabilidad completa por ticket.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
