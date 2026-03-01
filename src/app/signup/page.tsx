'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const { signup, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const router = useRouter();

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
    <main className="page" data-testid="signupPage">
      <section className="card" data-testid="signupCard">
        <h1>Crea tu cuenta</h1>
        <p>Configura tu acceso inicial en segundos.</p>
        <form data-testid="signupForm" onSubmit={event => void handleSubmit(event)}>
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
            placeholder="Minimo 8 caracteres"
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
          {formMessage
            ? (
                <div className="form-message" data-testid="form_message">
                  {formMessage}
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
          <button className="button" data-testid="signup_button" disabled={loading} type="submit">
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="helper" data-testid="login_helper">
          Ya tienes cuenta?
          {' '}
          <Link data-testid="login_link" href="/login">
            Iniciar sesion
          </Link>
        </div>
      </section>
    </main>
  );
}
