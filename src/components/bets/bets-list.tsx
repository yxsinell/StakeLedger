'use client';

import type { BetView } from '@/lib/bets/schemas';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BetListResponseSchema } from '@/lib/bets/schemas';

export function BetsList() {
  const [bets, setBets] = useState<BetView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    void fetch('/api/bets').then(async (response) => {
      const payload: unknown = await response.json().catch(() => null);
      const parsed = BetListResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) { throw new Error('No pudimos cargar los tickets.'); }
      if (current) { setBets(parsed.data.bets); }
    }).catch((error: unknown) => {
      if (current) { setError(error instanceof Error ? error.message : 'No pudimos cargar los tickets.'); }
    }).finally(() => {
      if (current) { setLoading(false); }
    });
    return () => { current = false; };
  }, []);

  return (
    <main className="space-y-6" data-testid="betsList">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Ledger de apuestas</p>
          <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
        </div>
        <Button asChild data-testid="new_bet_link"><Link href="/dashboard/bets/new">Nuevo ticket</Link></Button>
      </header>
      {loading && <Skeleton className="h-40" data-testid="bets_loading" />}
      {error && (
        <Card data-testid="bets_error">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}
      {!loading && !error && bets.length === 0 && (
        <Card data-testid="bets_empty">
          <CardHeader>
            <CardTitle>Sin tickets</CardTitle>
            <CardDescription>Crea tu primer ticket financiado.</CardDescription>
          </CardHeader>
        </Card>
      )}
      <section className="grid gap-4 md:grid-cols-2" data-testid="bets_list">
        {bets.map(bet => (
          <Card key={bet.id} data-testid="betCard">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>
                  Ticket
                  {bet.id.slice(0, 8)}
                </span>
                <span className="text-sm uppercase text-muted-foreground">{bet.status}</span>
              </CardTitle>
              <CardDescription>
                Stake
                {bet.stakeAmount.toFixed(2)}
                {' '}
                · Cuota
                {bet.odds}
              </CardDescription>
            </CardHeader>
            <CardContent><Button asChild variant="outline" data-testid="view_bet_link"><Link href={`/dashboard/bets/${bet.id}`}>Ver detalle</Link></Button></CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
