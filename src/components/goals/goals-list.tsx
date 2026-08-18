'use client';

import type { Goal } from '@/lib/goals/schemas';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoalListResponseSchema, RiskLimitsResponseSchema } from '@/lib/goals/schemas';

export function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [maxOdds, setMaxOdds] = useState('');
  const [maxDailyLoss, setMaxDailyLoss] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalsResponse, riskResponse] = await Promise.all([fetch('/api/goals'), fetch('/api/risk-limits')]);
      const [goalsPayload, riskPayload]: unknown[] = await Promise.all([goalsResponse.json(), riskResponse.json()]);
      const parsedGoals = GoalListResponseSchema.safeParse(goalsPayload);
      const parsedRisk = RiskLimitsResponseSchema.safeParse(riskPayload);
      if (!goalsResponse.ok || !riskResponse.ok || !parsedGoals.success || !parsedRisk.success) {
        throw new Error('No se pudieron cargar metas y límites.');
      }
      setGoals(parsedGoals.data.goals);
      setMaxOdds(parsedRisk.data.riskLimits.maxOdds?.toString() ?? '');
      setMaxDailyLoss(parsedRisk.data.riskLimits.maxDailyLoss?.toString() ?? '');
    }
    catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudieron cargar las metas.');
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGoals();
  }, []);

  const saveRisk = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setSaved(false);
    const response = await fetch('/api/risk-limits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxOdds: maxOdds === '' ? null : Number(maxOdds), maxDailyLoss: maxDailyLoss === '' ? null : Number(maxDailyLoss) }),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'No se pudieron guardar los límites.');
      return;
    }
    setSaved(true);
  };

  return (
    <main className="space-y-6" aria-busy={loading} data-testid="goalsList">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Plan de crecimiento</p>
          <h1 className="text-3xl font-semibold">Metas</h1>
        </div>
        <Button asChild data-testid="new_goal_link"><Link href="/dashboard/goals/new">Nueva meta</Link></Button>
      </header>
      {error
        ? (
            <div className="flex flex-wrap items-center gap-3" role="alert" data-testid="goals_load_error">
              <p className="text-sm text-destructive">{error}</p>
              <Button type="button" variant="outline" data-testid="retry_goals_button" onClick={() => void loadGoals()}>Reintentar</Button>
            </div>
          )
        : null}
      <section className="grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-sm text-muted-foreground" role="status" data-testid="goals_loading">Cargando metas...</p> : null}
        {!loading && goals.map(goal => (
          <Card key={goal.id} data-testid="goalCard">
            <CardHeader>
              <CardTitle>{goal.bank.name}</CardTitle>
              <CardDescription>
                {goal.status}
                {' '}
                · objetivo
                {' '}
                {goal.targetAmount.toFixed(2)}
                {' '}
                {goal.bank.currency}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Progreso:
                {goal.progressPct.toFixed(2)}
                %
              </p>
              <Button asChild variant="outline" data-testid="view_goal_link"><Link href={`/dashboard/goals/${goal.id}`}>Ver meta</Link></Button>
            </CardContent>
          </Card>
        ))}
        {!loading && goals.length === 0
          ? (
              <Card data-testid="goals_empty_state">
                <CardHeader>
                  <CardTitle>Sin metas</CardTitle>
                  <CardDescription>Crea una meta para convertir tu objetivo en una misión diaria.</CardDescription>
                </CardHeader>
              </Card>
            )
          : null}
      </section>
      <form className="space-y-4" data-testid="riskLimitsForm" onSubmit={event => void saveRisk(event)}>
        <Card>
          <CardHeader>
            <CardTitle>Protecciones de riesgo</CardTitle>
            <CardDescription>El stake máximo sigue fijo en 40% del cash. Cuota y pérdida diaria son opcionales.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="max-odds">Cuota máxima</Label>
              <Input id="max-odds" type="number" min="1.0001" step="0.0001" value={maxOdds} data-testid="max_odds_input" onChange={event => setMaxOdds(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-loss">Pérdida diaria máxima</Label>
              <Input id="max-loss" type="number" min="0.01" step="0.01" value={maxDailyLoss} data-testid="max_daily_loss_input" onChange={event => setMaxDailyLoss(event.target.value)} />
            </div>
          </CardContent>
        </Card>
        {saved ? <p role="status" className="text-sm text-emerald-600">Límites guardados.</p> : null}
        <Button type="submit" data-testid="save_risk_limits_button">Guardar límites</Button>
      </form>
    </main>
  );
}
