'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BankResponseSchema } from '@/lib/banks/schemas';

const currencies = ['EUR', 'USD', 'ARS'] as const;

export function BankForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          currency: formData.get('currency'),
          initialCash: Number(formData.get('initialCash')),
          initialBonus: Number(formData.get('initialBonus')),
          initialFreebet: Number(formData.get('initialFreebet')),
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const parsed = BankResponseSchema.safeParse(payload);

      if (!response.ok || !parsed.success) {
        const message = payload && typeof payload === 'object' && 'error' in payload
          && typeof payload.error === 'string'
          ? payload.error
          : 'No pudimos crear el bank.';
        setError(message);
        return;
      }

      router.push(`/dashboard/banks/${parsed.data.bank.id}`);
    }
    catch {
      setError('No pudimos crear el bank. Revisa tu conexión e inténtalo de nuevo.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl" data-testid="createBankPage">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo bank</CardTitle>
          <CardDescription>
            Se crearán pockets cash, bonus y freebet con un depósito inicial positivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            data-testid="createBankForm"
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="bank-name">Nombre del bank</Label>
              <Input
                id="bank-name"
                name="name"
                required
                maxLength={100}
                data-testid="bank_name_input"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank-currency">Moneda</Label>
              <select
                id="bank-currency"
                name="currency"
                className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                defaultValue="EUR"
                data-testid="bank_currency_select"
              >
                {currencies.map(currency => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <AmountInput id="initial-cash" name="initialCash" label="Cash inicial" testId="initial_cash_input" />
              <AmountInput id="initial-bonus" name="initialBonus" label="Bonus inicial" testId="initial_bonus_input" />
              <AmountInput id="initial-freebet" name="initialFreebet" label="Freebet inicial" testId="initial_freebet_input" />
            </div>

            {error ? <p className="text-sm text-destructive" data-testid="create_bank_error">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting} data-testid="confirm_bank_button">
                {isSubmitting ? 'Creando...' : 'Crear bank'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                data-testid="cancel_bank_button"
                onClick={() => router.push('/dashboard/banks')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function AmountInput({
  id,
  label,
  name,
  testId,
}: {
  id: string
  label: string
  name: string
  testId: string
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        min="0.01"
        max="999999999999.99"
        step="0.01"
        required
        data-testid={testId}
      />
    </div>
  );
}
