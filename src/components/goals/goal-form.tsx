'use client';

import type { BankData } from '@/lib/banks/schemas';
import type { Goal } from '@/lib/goals/schemas';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BankListResponseSchema } from '@/lib/banks/schemas';
import { GoalResponseSchema } from '@/lib/goals/schemas';

interface GoalFormProps { goal?: Goal, onUpdated?: (goal: Goal) => void }

const apiError = (payload: unknown) => payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
  ? payload.error
  : 'No se pudo guardar la meta.';

export function GoalForm({ goal, onUpdated }: GoalFormProps) {
  const router = useRouter();
  const [banks, setBanks] = useState<BankData[]>([]);
  const [bankId, setBankId] = useState(goal?.bank.id ?? '');
  const [baseAmount, setBaseAmount] = useState(goal ? String(goal.baseAmount) : '');
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : '');
  const [deadline, setDeadline] = useState(goal?.deadline ?? '');
  const [stakePreference, setStakePreference] = useState(goal ? String(goal.stakePreference) : '');
  const [strategy, setStrategy] = useState<Goal['strategy']>(goal?.strategy ?? 'balanced');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goal) { return; }
    let active = true;
    void fetch('/api/banks').then(async (response) => {
      const payload: unknown = await response.json().catch(() => null);
      const parsed = BankListResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) { throw new Error(apiError(payload)); }
      if (active) { setBanks(parsed.data.banks); setBankId(parsed.data.banks[0]?.id ?? ''); }
    }).catch((caught: unknown) => { if (active) { setError(caught instanceof Error ? caught.message : 'No se pudieron cargar los banks.'); } });
    return () => { active = false; };
  }, [goal]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = goal
      ? { targetAmount: Number(targetAmount), deadline, stakePreference: Number(stakePreference), strategy }
      : { bankId, baseAmount: Number(baseAmount), targetAmount: Number(targetAmount), deadline, stakePreference: Number(stakePreference), strategy };
    try {
      const response = await fetch(goal ? `/api/goals/${goal.id}` : '/api/goals', {
        method: goal ? 'PATCH' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responsePayload: unknown = await response.json().catch(() => null);
      const parsed = GoalResponseSchema.safeParse(responsePayload);
      if (!response.ok || !parsed.success) { throw new Error(apiError(responsePayload)); }
      if (goal) { onUpdated?.(parsed.data.goal); }
      else { router.push(`/dashboard/goals/${parsed.data.goal.id}`); }
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'No se pudo guardar la meta.'); }
    finally { setSubmitting(false); }
  };

  const minDeadline = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return (
    <form className="space-y-5" data-testid={goal ? 'goalForm' : 'createGoalForm'} onSubmit={event => void submit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>{goal ? 'Actualizar meta' : 'Nueva meta'}</CardTitle>
          <CardDescription>Todos los cálculos monetarios deben ser exactos; nunca se redondean.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="goal-bank">Bank</Label>
            <select id="goal-bank" className="h-11 rounded-xl border bg-background px-4" value={bankId} disabled={Boolean(goal)} data-testid="bank_id_select" onChange={event => setBankId(event.target.value)}>
              {!goal && banks.length === 0 ? <option value="">Sin banks disponibles</option> : null}
              {goal
                ? <option value={goal.bank.id}>{goal.bank.name}</option>
                : banks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                      {' '}
                      ·
                      {' '}
                      {bank.currency}
                    </option>
                  ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-base">Capital base</Label>
            <Input id="goal-base" type="number" min="0" step="0.01" value={baseAmount} disabled={Boolean(goal)} data-testid="base_amount_input" onChange={event => setBaseAmount(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-target">Objetivo</Label>
            <Input id="goal-target" type="number" min="0.01" step="0.01" value={targetAmount} data-testid="target_amount_input" onChange={event => setTargetAmount(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-deadline">Fecha límite</Label>
            <Input id="goal-deadline" type="date" min={minDeadline} value={deadline} data-testid="deadline_input" onChange={event => setDeadline(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-stake">Stake habitual</Label>
            <Input id="goal-stake" type="number" min="0.01" step="0.01" value={stakePreference} data-testid="stake_preference_input" onChange={event => setStakePreference(event.target.value)} />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="goal-strategy">Estrategia</Label>
            <select id="goal-strategy" className="h-11 rounded-xl border bg-background px-4" value={strategy} data-testid="strategy_select" onChange={event => setStrategy(event.target.value as Goal['strategy'])}>
              <option value="conservative">Conservadora</option>
              <option value="balanced">Equilibrada</option>
              <option value="aggressive">Agresiva</option>
            </select>
          </div>
        </CardContent>
      </Card>
      {error ? <p role="alert" className="text-sm text-destructive" data-testid="goal_validation_error">{error}</p> : null}
      <Button type="submit" disabled={submitting || !bankId} data-testid="create_goal_button">{submitting ? 'Guardando...' : goal ? 'Actualizar meta' : 'Crear meta'}</Button>
    </form>
  );
}
