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
import { BankListResponseSchema } from '@/lib/banks/schemas';

export function BanksList() {
  const [banks, setBanks] = useState<BankData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadBanks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/banks');
        const payload: unknown = await response.json().catch(() => null);
        const parsed = BankListResponseSchema.safeParse(payload);

        if (!response.ok || !parsed.success) {
          const message = payload && typeof payload === 'object' && 'error' in payload
            && typeof payload.error === 'string'
            ? payload.error
            : 'No pudimos cargar los banks.';
          throw new Error(message);
        }

        if (isCurrent) {
          setBanks(parsed.data.banks);
        }
      }
      catch (error) {
        if (isCurrent) {
          setError(error instanceof Error ? error.message : 'No pudimos cargar los banks.');
        }
      }
      finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadBanks();

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  return (
    <main className="space-y-6" data-testid="banksListPage">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Banks</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saldo operativo disponible y desglose por bolsillo.
          </p>
        </div>
        <Button asChild data-testid="new_bank_link">
          <Link href="/dashboard/banks/new">Nuevo bank</Link>
        </Button>
      </section>

      {isLoading
        ? (
            <section className="grid gap-4 md:grid-cols-2" data-testid="banks_loading">
              <Skeleton className="h-44" />
              <Skeleton className="h-44" />
            </section>
          )
        : null}

      {!isLoading && error
        ? (
            <Card data-testid="banks_error">
              <CardHeader>
                <CardTitle>No pudimos cargar los banks</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  data-testid="retry_banks_button"
                  onClick={() => setReloadKey(value => value + 1)}
                >
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          )
        : null}

      {!isLoading && !error && banks.length === 0
        ? (
            <Card data-testid="banks_empty">
              <CardHeader>
                <CardTitle>Aún no tienes banks</CardTitle>
                <CardDescription>
                  Crea tu primer bank para registrar cash, bonus y freebet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild data-testid="create_first_bank_button">
                  <Link href="/dashboard/banks/new">Crear bank</Link>
                </Button>
              </CardContent>
            </Card>
          )
        : null}

      {!isLoading && !error && banks.length > 0
        ? (
            <ul className="grid gap-4 md:grid-cols-2" data-testid="banksList">
              {banks.map(bank => (
                <li key={bank.id} data-testid="bankCard">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{bank.name}</CardTitle>
                          <CardDescription>{bank.currency}</CardDescription>
                        </div>
                        <p className="text-right text-sm font-semibold" data-testid="operative_balance">
                          {formatMoney(bank.balances.operative, bank.currency)}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <span>
                          Cash:
                          {formatMoney(bank.balances.cash, bank.currency)}
                        </span>
                        <span>
                          Bonus:
                          {formatMoney(bank.balances.bonus, bank.currency)}
                        </span>
                        <span>
                          Freebet:
                          {formatMoney(bank.balances.freebet, bank.currency)}
                        </span>
                      </div>
                      <Button asChild variant="outline" data-testid="view_bank_link">
                        <Link href={`/dashboard/banks/${bank.id}`}>Ver detalle</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )
        : null}
    </main>
  );
}
