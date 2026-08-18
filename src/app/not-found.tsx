import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6" data-testid="notFoundPage">
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground">La dirección no existe o ya no está disponible.</p>
        <Button asChild data-testid="not_found_home_link">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </section>
    </main>
  );
}
