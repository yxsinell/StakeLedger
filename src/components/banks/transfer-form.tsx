'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMoney } from '@/lib/banks/balance';
import {
  BankListResponseSchema,
  TransferResponseSchema,
} from '@/lib/banks/schemas';

interface TransferFormProps {
  bankId: string
  bankName: string
  currency: 'EUR' | 'USD' | 'ARS'
  cash: number
  onTransferred: (sourceBalance: number) => void
}

interface PendingRequest {
  fingerprint: string
  idempotencyKey: string
}

export function TransferForm({
  bankId,
  bankName,
  currency,
  cash,
  onTransferred,
}: TransferFormProps) {
  const [destinations, setDestinations] = useState<{ id: string, name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingRequest = useRef<PendingRequest | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadDestinations = async () => {
      try {
        const response = await fetch('/api/banks');
        const payload: unknown = await response.json().catch(() => null);
        const parsed = BankListResponseSchema.safeParse(payload);

        if (!response.ok || !parsed.success || !isCurrent) {
          return;
        }

        setDestinations(
          parsed.data.banks
            .filter(bank => bank.id !== bankId && bank.currency === currency)
            .map(bank => ({ id: bank.id, name: bank.name })),
        );
      }
      catch {
        // Destination loading is optional until the user submits a transfer.
      }
    };

    void loadDestinations();

    return () => {
      isCurrent = false;
    };
  }, [bankId, currency]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInsufficientFunds(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      toBankId: formData.get('toBankId'),
      amount: Number(formData.get('amount')),
    };
    const fingerprint = JSON.stringify(payload);
    const idempotencyKey = pendingRequest.current?.fingerprint === fingerprint
      ? pendingRequest.current.idempotencyKey
      : crypto.randomUUID();

    pendingRequest.current = { fingerprint, idempotencyKey };

    try {
      const response = await fetch(`/api/banks/${bankId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      const responsePayload: unknown = await response.json().catch(() => null);
      const parsed = TransferResponseSchema.safeParse(responsePayload);

      if (!response.ok || !parsed.success) {
        const errorPayload = responsePayload && typeof responsePayload === 'object'
          ? responsePayload
          : null;
        const code = errorPayload && 'code' in errorPayload && typeof errorPayload.code === 'string'
          ? errorPayload.code
          : null;
        const message = errorPayload && 'error' in errorPayload && typeof errorPayload.error === 'string'
          ? errorPayload.error
          : 'No pudimos completar la transferencia.';

        setInsufficientFunds(code === 'INSUFFICIENT_CASH');
        setError(message);
        pendingRequest.current = null;
        return;
      }

      pendingRequest.current = null;
      form.reset();
      onTransferred(parsed.data.sourceBalance);
    }
    catch {
      setError('No pudimos completar la transferencia. Reinténtalo para usar la misma operación segura.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card data-testid="transferForm">
      <CardHeader>
        <CardTitle>Transferir cash</CardTitle>
        <CardDescription>
          {`Desde ${bankName}: ${formatMoney(cash, currency)} disponibles.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="transfer-destination">Destino</Label>
              <select
                id="transfer-destination"
                name="toBankId"
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                required
                disabled={destinations.length === 0 || isSubmitting}
                data-testid="to_bank_select"
              >
                <option value="">Selecciona un bank</option>
                {destinations.map(destination => (
                  <option key={destination.id} value={destination.id}>{destination.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transfer-amount">Importe</Label>
              <Input
                id="transfer-amount"
                name="amount"
                type="number"
                min="0.01"
                max="999999999999.99"
                step="0.01"
                required
                disabled={destinations.length === 0 || isSubmitting}
                data-testid="transfer_amount_input"
              />
            </div>
          </div>

          {destinations.length === 0
            ? (
                <p className="text-sm text-muted-foreground" data-testid="transfer_no_destinations">
                  {`No hay otro bank propio con divisa ${currency}.`}
                </p>
              )
            : null}
          {error ? <p className="text-sm text-destructive" data-testid="transfer_error">{error}</p> : null}
          {insufficientFunds ? <p className="text-sm text-destructive" data-testid="insufficient_funds_error">Saldo cash insuficiente.</p> : null}

          <Button type="submit" disabled={isSubmitting || destinations.length === 0} data-testid="submit_transfer_button">
            {isSubmitting ? 'Transfiriendo...' : 'Transferir cash'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
