'use client';

import type { BankData } from '@/lib/banks/schemas';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/banks/balance';
import { BankResponseSchema } from '@/lib/banks/schemas';

export function BankDetail({ bankId }: { bankId: string }) {
  const [bank, setBank] = useState<BankData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    const loadBank = async () => {
      try {
        const response = await fetch(`/api/banks/${bankId}`);
        const payload: unknown = await response.json().catch(() => null);
        const parsed = BankResponseSchema.safeParse(payload);

        if (response.status === 404) {
          if (isCurrent) {
            setIsNotFound(true);
          }
          return;
        }

        if (!response.ok || !parsed.success) {
          const message = payload && typeof payload === 'object' && 'error' in payload
            && typeof payload.error === 'string'
            ? payload.error
            : 'No pudimos cargar el bank.';
          throw new Error(message);
        }

        if (isCurrent) {
          setBank(parsed.data.bank);
        }
      }
      catch (error) {
        if (isCurrent) {
          setError(error instanceof Error ? error.message : 'No pudimos cargar el bank.');
        }
      }
      finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadBank();

    return () => {
      isCurrent = false;
    };
  }, [bankId]);

  if (isLoading) {
    return (
      <main className="space-y-4" data-testid="bankDetailPage">
        <Skeleton className="h-28" data-testid="bank_loading" />
        <Skeleton className="h-40" />
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main data-testid="bankDetailPage">
        <Card data-testid="bank_not_found">
          <CardHeader>
            <CardTitle>Bank no encontrado</CardTitle>
            <CardDescription>No existe o no tienes acceso a este bank.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" data-testid="back_to_banks_link">
              <Link href="/dashboard/banks">Volver a Banks</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !bank) {
    return (
      <main data-testid="bankDetailPage">
        <Card data-testid="bank_error">
          <CardHeader>
            <CardTitle>No pudimos cargar el bank</CardTitle>
            <CardDescription>{error ?? 'Error inesperado.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" data-testid="back_to_banks_link">
              <Link href="/dashboard/banks">Volver a Banks</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const pockets = [
    ['Cash', bank.balances.cash, 'cash_balance'],
    ['Bonus', bank.balances.bonus, 'bonus_balance'],
    ['Freebet', bank.balances.freebet, 'freebet_balance'],
  ] as const;

  return (
    <main className="space-y-6" data-testid="bankDetailPage">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/dashboard/banks">
            Banks
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{bank.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{bank.currency}</p>
        </div>
        <Card className="min-w-56" data-testid="operative_balance">
          <CardHeader className="p-4">
            <CardDescription>Saldo operativo</CardDescription>
            <CardTitle>{formatMoney(bank.balances.operative, bank.currency)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3" data-testid="pocket_breakdown">
        {pockets.map(([label, amount, testId]) => (
          <Card key={label} data-testid={testId}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle>{formatMoney(amount, bank.currency)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  );
}
