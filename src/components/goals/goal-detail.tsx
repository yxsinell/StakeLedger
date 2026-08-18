'use client';

import type { Goal } from '@/lib/goals/schemas';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoalResponseSchema } from '@/lib/goals/schemas';
import { GoalForm } from './goal-form';

export function GoalDetail({ goalId }: { goalId: string }) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<'completed' | 'cancelled'>('completed');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGoal = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/goals/${goalId}`);
      const payload: unknown = await response.json().catch(() => null);
      const parsed = GoalResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) { throw new Error('No se pudo cargar la meta.'); }
      setGoal(parsed.data.goal);
    }
    catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar la meta.');
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGoal();
  }, [goalId]);

  const close = async () => {
    if (!confirming) { setConfirming(true); return; }
    const response = await fetch(`/api/goals/${goalId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, confirmed: true, ...(reason.trim() ? { reason: reason.trim() } : {}) }),
    });
    const payload: unknown = await response.json().catch(() => null);
    const parsed = GoalResponseSchema.safeParse(payload);
    if (!response.ok || !parsed.success) {
      setError(payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'No se pudo cerrar la meta.');
      return;
    }
    setGoal(parsed.data.goal); setConfirming(false);
  };

  if (loading) { return <main aria-busy="true" data-testid="goalDetail"><p role="status" data-testid="goal_detail_loading">Cargando meta...</p></main>; }
  if (error && !goal) {
    return (
      <main className="space-y-3" data-testid="goalDetail">
        <p role="alert" className="text-destructive" data-testid="goal_detail_load_error">{error}</p>
        <Button type="button" variant="outline" data-testid="retry_goal_detail_button" onClick={() => void loadGoal()}>Reintentar</Button>
      </main>
    );
  }
  if (!goal) { return null; }
  return (
    <main className="space-y-6" aria-busy={loading} data-testid="goalDetail">
      <header>
        <p className="text-sm text-muted-foreground">{goal.bank.name}</p>
        <h1 className="text-3xl font-semibold">
          Meta
          {goal.targetAmount.toFixed(2)}
          {' '}
          {goal.bank.currency}
        </h1>
      </header>
      {goal.status === 'active' && goal.stakePreference > 0
        ? (
            <Card data-testid="dailyMissionCard">
              <CardHeader>
                <CardTitle>Misión diaria</CardTitle>
                <CardDescription>
                  {goal.calendarDays}
                  {' '}
                  días naturales restantes
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  Beneficio diario
                  <strong className="block text-2xl" data-testid="daily_profit_value">{goal.dailyProfit.toFixed(2)}</strong>
                </div>
                <div>
                  Cuota sugerida
                  <strong className="block text-2xl" data-testid="suggested_odds_value">{goal.suggestedOdds.toFixed(4)}</strong>
                </div>
                <div>
                  Progreso
                  <strong className="block text-2xl" data-testid="goal_progress_value">
                    {goal.progressPct.toFixed(2)}
                    %
                  </strong>
                </div>
              </CardContent>
            </Card>
          )
        : goal.status !== 'active'
          ? (
              <Card data-testid="closed_goal_state">
                <CardHeader>
                  <CardTitle>Meta cerrada</CardTitle>
                  <CardDescription>
                    {goal.status}
                    {' '}
                    ·
                    {' '}
                    {goal.closedAt}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          : <p data-testid="missing_goal_params_message">Completa el stake habitual para calcular la misión.</p>}
      {goal.status === 'active' && goal.riskAssessment.status === 'blocked'
        ? (
            <Card className="border-destructive" data-testid="riskAlert">
              <CardHeader>
                <CardTitle>Cuota bloqueada por riesgo</CardTitle>
                <CardDescription>
                  Supera tu cuota máxima
                  {goal.riskAssessment.maxOdds}
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5" data-testid="reconfiguration_suggestions">
                  <li>
                    Aumenta el stake hasta
                    {goal.riskAssessment.alternatives[0]?.type === 'increase_stake' ? goal.riskAssessment.alternatives[0].requiredStake : '—'}
                    .
                  </li>
                  <li>Amplía la fecha límite.</li>
                  <li>Reduce el objetivo.</li>
                </ul>
              </CardContent>
            </Card>
          )
        : null}
      <Card>
        <CardHeader><CardTitle>Historial</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2" data-testid="goal_history_list">
            {goal.history.map(item => (
              <li key={item.id} className="rounded border p-3 text-sm">
                {item.eventType}
                {' '}
                ·
                {' '}
                {item.createdAt}
                {item.betId ? ` · ticket ${item.betId.slice(0, 8)}` : ''}
              </li>
            ))}
          </ul>
          {goal.history.length === 0 ? <p className="text-sm text-muted-foreground" data-testid="goal_history_empty_state">Aún no hay eventos en el historial.</p> : null}
        </CardContent>
      </Card>
      {goal.status === 'active' ? <GoalForm goal={goal} onUpdated={setGoal} /> : null}
      {goal.status === 'active'
        ? (
            <Card>
              <CardHeader>
                <CardTitle>Cerrar meta</CardTitle>
                <CardDescription>Completar exige alcanzar el objetivo. Cancelar conserva historial sin exigirlo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Estado final</Label>
                  <select className="h-11 rounded-xl border bg-background px-4" value={status} data-testid="goal_close_status_select" onChange={(event) => { setStatus(event.target.value as typeof status); setConfirming(false); }}>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="closure-reason">Motivo (opcional)</Label>
                  <Input id="closure-reason" maxLength={500} value={reason} data-testid="goal_closure_reason_input" onChange={event => setReason(event.target.value)} />
                </div>
                {confirming ? <p role="alert">Confirma una segunda vez. Esta acción no se puede revertir.</p> : null}
                <Button variant="destructive" data-testid={confirming ? 'confirm_close_goal_button' : 'close_goal_button'} onClick={() => void close()}>{confirming ? 'Confirmar cierre' : 'Cerrar meta'}</Button>
              </CardContent>
            </Card>
          )
        : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </main>
  );
}
