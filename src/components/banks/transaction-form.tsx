'use client';

import type { BankCurrency } from '@/lib/banks/schemas';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMoney } from '@/lib/banks/balance';
import { TRANSACTION_METHODS, TransactionResponseSchema } from '@/lib/transactions/schemas';

interface TransactionFormProps {
  bankId: string
  currency: BankCurrency
  cash: number
  onRecorded: (balance: number) => void
}

interface PendingRequest {
  fingerprint: string
  idempotencyKey: string
}

export function TransactionForm({ bankId, currency, cash, onRecorded }: TransactionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingRequest = useRef<PendingRequest | null>(null);
  const cashLabel = formatMoney(cash, currency);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInsufficientFunds(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      bankId,
      type: formData.get('type'),
      amount: Number(formData.get('amount')),
      method: formData.get('method'),
    };
    const fingerprint = JSON.stringify(payload);
    const idempotencyKey = pendingRequest.current?.fingerprint === fingerprint
      ? pendingRequest.current.idempotencyKey
      : crypto.randomUUID();

    pendingRequest.current = { fingerprint, idempotencyKey };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      const responsePayload: unknown = await response.json().catch(() => null);
      const parsed = TransactionResponseSchema.safeParse(responsePayload);

      if (!response.ok || !parsed.success) {
        const errorPayload = responsePayload && typeof responsePayload === 'object'
          ? responsePayload
          : null;
        const code = errorPayload && 'code' in errorPayload && typeof errorPayload.code === 'string'
          ? errorPayload.code
          : null;
        const message = errorPayload && 'error' in errorPayload && typeof errorPayload.error === 'string'
          ? errorPayload.error
          : 'No pudimos registrar el movimiento.';

        setInsufficientFunds(code === 'INSUFFICIENT_CASH');
        setError(message);
        pendingRequest.current = null;
        return;
      }

      pendingRequest.current = null;
      form.reset();
      onRecorded(parsed.data.balance);
    }
    catch {
      setError('No pudimos registrar el movimiento. Reinténtalo para usar la misma operación segura.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card data-testid="transactionForm">
      <CardHeader>
        <CardTitle>Registrar movimiento</CardTitle>
        <CardDescription>
          Solo afecta a cash. Disponible:
          {' '}
          {cashLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="transaction-type">Tipo</Label>
              <select
                id="transaction-type"
                name="type"
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                defaultValue="deposit"
                data-testid="transaction_type_select"
              >
                <option value="deposit">Depósito</option>
                <option value="withdraw">Retirada</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transaction-amount">Importe</Label>
              <Input
                id="transaction-amount"
                name="amount"
                type="number"
                min="0.01"
                max="999999999999.99"
                step="0.01"
                required
                data-testid="transaction_amount_input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transaction-method">Método</Label>
              <select
                id="transaction-method"
                name="method"
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                defaultValue="bank_transfer"
                data-testid="transaction_method_select"
              >
                {TRANSACTION_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {insufficientFunds ? <p className="text-sm text-destructive" data-testid="withdraw_insufficient_funds_error">Saldo cash insuficiente.</p> : null}

          <Button type="submit" disabled={isSubmitting} data-testid="submit_transaction_button">
            {isSubmitting ? 'Registrando...' : 'Registrar movimiento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
