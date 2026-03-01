'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';

function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

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
    <main className="page" data-testid="loginPage">
      <section className="card" data-testid="loginCard">
        <h1>Inicia sesion</h1>
        <p>Accede a tu dashboard con tus credenciales.</p>
        <form data-testid="loginForm" onSubmit={event => void handleSubmit(event)}>
          <label htmlFor="email">Email</label>
          <input
            data-testid="email_input"
            id="email"
            name="email"
            onChange={event => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            type="email"
            value={email}
          />
          <label htmlFor="password">Password</label>
          <input
            data-testid="password_input"
            id="password"
            name="password"
            onChange={event => setPassword(event.target.value)}
            placeholder="********"
            required
            type="password"
            value={password}
          />
          {formError
            ? (
                <div className="form-error" data-testid="form_error">
                  {formError}
                </div>
              )
            : null}
          {error
            ? (
                <div className="form-error" data-testid="auth_error">
                  {error}
                </div>
              )
            : null}
          <button className="button" data-testid="login_button" disabled={loading} type="submit">
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        <div className="helper" data-testid="signup_helper">
          No tienes cuenta?
          {' '}
          <Link data-testid="signup_link" href="/signup">
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={(
        <main className="page" data-testid="loginPage">
          <section className="card" data-testid="loginCard">
            <h1>Inicia sesion</h1>
            <p>Cargando formulario...</p>
          </section>
        </main>
      )}
    >
      <LoginForm />
    </Suspense>
  );
}
