'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({ reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <section className="grid min-h-64 place-items-center rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center" data-testid="dashboardError">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">No se pudo cargar el dashboard</h1>
        <p className="text-sm text-muted-foreground">Comprueba tu conexión e inténtalo otra vez.</p>
        <Button data-testid="dashboard_error_retry_button" onClick={reset} type="button">Reintentar</Button>
      </div>
    </section>
  );
}
