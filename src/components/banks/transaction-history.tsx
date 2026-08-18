'use client';

import type { BankCurrency } from '@/lib/banks/schemas';
import type { LedgerTransaction } from '@/lib/transactions/schemas';
import Link from 'next/link';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/banks/balance';
import { TransactionListResponseSchema } from '@/lib/transactions/schemas';

interface TransactionHistoryProps {
  bankId: string
  currency: BankCurrency
  refreshKey: number
}

const TYPE_LABELS: Record<LedgerTransaction['type'], string> = {
  initial_deposit: 'Saldo inicial',
  deposit: 'Depósito',
  withdraw: 'Retirada',
  transfer_debit: 'Transferencia enviada',
  transfer_credit: 'Transferencia recibida',
  bet_reserve: 'Reserva de ticket',
  bet_return: 'Retorno de ticket',
  bet_carryover: 'Carryover de cashout',
  cashout_return: 'Retorno de cashout',
  adjustment: 'Ajuste',
};

const DEBIT_TYPES = new Set<LedgerTransaction['type']>(['withdraw', 'transfer_debit', 'bet_reserve']);

function apiError(payload: unknown) {
  return payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
    ? payload.error
    : 'No pudimos cargar el historial.';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function TransactionHistory({ bankId, currency, refreshKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestNumber = useRef(0);

  const loadTransactions = async (cursor?: string) => {
    const currentRequest = requestNumber.current + 1;
    requestNumber.current = currentRequest;
    cursor ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ bankId, limit: '20' });
    if (cursor) { params.set('cursor', cursor); }

    try {
      const response = await fetch(`/api/transactions?${params}`, { credentials: 'same-origin' });
      const payload: unknown = await response.json().catch(() => null);
      if (currentRequest !== requestNumber.current) { return; }
      const parsed = TransactionListResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        setError(apiError(payload));
        return;
      }
      setTransactions(current => cursor ? [...current, ...parsed.data.transactions] : parsed.data.transactions);
      setNextCursor(parsed.data.nextCursor);
    }
    catch {
      if (currentRequest === requestNumber.current) { setError('No se pudo conectar con el historial.'); }
    }
    finally {
      if (currentRequest === requestNumber.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    setTransactions([]);
    setNextCursor(null);
    void loadTransactions();
  }, [bankId, refreshKey]);

  return (
    <Card data-testid="transactionHistory">
      <CardHeader>
        <CardTitle>Historial del ledger</CardTitle>
        <CardDescription>Asientos inmutables de este bank, ordenados del más reciente al más antiguo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error
          ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert" data-testid="transaction_history_error">
                <p>{error}</p>
                <Button className="mt-3" variant="outline" onClick={() => void loadTransactions()} data-testid="retry_transaction_history_button">
                  Reintentar
                </Button>
              </div>
            )
          : null}
        {isLoading
          ? (
              <div className="space-y-3" data-testid="transaction_history_loading">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            )
          : null}
        {!isLoading && !error && transactions.length === 0
          ? (
              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground" data-testid="transaction_history_empty">
                Este bank todavía no tiene movimientos.
              </p>
            )
          : null}
        {!isLoading && transactions.length > 0
          ? (
              <ul className="divide-y rounded-xl border" data-testid="transaction_history_list">
                {transactions.map((transaction) => {
                  const isDebit = DEBIT_TYPES.has(transaction.type);
                  return (
                    <li className="space-y-3 p-4 sm:flex sm:items-start sm:justify-between sm:gap-4 sm:space-y-0" key={transaction.id} data-testid="transaction_history_item">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong>{TYPE_LABELS[transaction.type]}</strong>
                          <Badge variant="secondary">{transaction.pocketType}</Badge>
                          {transaction.method ? <span className="text-xs text-muted-foreground">{transaction.method}</span> : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {transaction.betId ? <Link className="underline" href={`/dashboard/bets/${transaction.betId}`}>Ticket</Link> : null}
                          {transaction.cashoutId
                            ? (
                                <span>
                                  Cashout:
                                  {transaction.cashoutId}
                                </span>
                              )
                            : null}
                          {transaction.transferId
                            ? (
                                <span>
                                  Transferencia:
                                  {transaction.transferId}
                                </span>
                              )
                            : null}
                          {transaction.relatedTransactionId
                            ? (
                                <span>
                                  Asiento relacionado:
                                  {transaction.relatedTransactionId}
                                </span>
                              )
                            : null}
                        </div>
                      </div>
                      <strong className={isDebit ? 'text-destructive tabular-nums' : 'text-emerald-700 tabular-nums'}>
                        {isDebit ? '−' : '+'}
                        {formatMoney(transaction.amount, currency)}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            )
          : null}
        {nextCursor && !error
          ? (
              <Button variant="outline" disabled={isLoadingMore} onClick={() => void loadTransactions(nextCursor)} data-testid="load_more_transactions_button">
                {isLoadingMore ? 'Cargando...' : 'Cargar más'}
              </Button>
            )
          : null}
      </CardContent>
    </Card>
  );
}
