'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center px-6" data-testid="globalError">
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">No se pudo cargar esta página</h1>
        <p className="text-sm text-muted-foreground">Inténtalo de nuevo. Si el problema continúa, vuelve más tarde.</p>
        <Button data-testid="global_error_retry_button" onClick={reset} type="button">Reintentar</Button>
      </section>
    </main>
  );
}
