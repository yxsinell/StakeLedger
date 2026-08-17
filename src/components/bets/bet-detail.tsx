'use client';

import type { BetView } from '@/lib/bets/schemas';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BetDetailResponseSchema } from '@/lib/bets/schemas';

const results = ['won', 'lost', 'void', 'half_won', 'half_lost'] as const;

export function BetDetail({ betId }: { betId: string }) {
  const [bet, setBet] = useState<BetView | null>(null);
  const [audit, setAudit] = useState<{ id: string, action: string, createdAt: string }[]>([]);
  const [result, setResult] = useState<(typeof results)[number]>('won');
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [remainingStake, setRemainingStake] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<'settle' | 'cashout' | null>(null);

  const load = async () => {
    setLoading(true);
    const response = await fetch(`/api/bets/${betId}`);
    const payload: unknown = await response.json().catch(() => null);
    const parsed = BetDetailResponseSchema.safeParse(payload);
    if (!response.ok || !parsed.success) { throw new Error(response.status === 404 ? 'Ticket no encontrado.' : 'No pudimos cargar el ticket.'); }
    setBet(parsed.data.bet);
    setAudit(parsed.data.audit);
    setLoading(false);
  };

  useEffect(() => {
    void load().catch((error: unknown) => {
      setError(error instanceof Error ? error.message : 'No pudimos cargar el ticket.');
      setLoading(false);
    });
  }, [betId]);

  const submit = async (kind: 'settle' | 'cashout') => {
    if (!bet || submitting) { return; }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const body = kind === 'settle'
        ? { result }
        : { cashoutAmount: Number(cashoutAmount), remainingStake: Number(remainingStake) };
      const response = await fetch(`/api/bets/${bet.id}/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'La operación no pudo completarse.';
        throw new Error(message);
      }
      setSuccess(kind === 'settle' ? 'Ticket liquidado.' : 'Cashout aplicado y ticket derivado creado.');
      setPendingAction(null);
      await load();
    }
    catch (error) {
      setError(error instanceof Error ? error.message : 'La operación no pudo completarse.');
    }
    finally {
      setSubmitting(false);
    }
  };

  if (loading) { return <main data-testid="betDetail"><Skeleton className="h-64" data-testid="bet_loading" /></main>; }
  if (!bet) {
    return (
      <main data-testid="betDetail">
        <Card>
          <CardHeader>
            <CardTitle>Ticket no disponible</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6" data-testid="betDetail">
      <header>
        <Link className="text-sm text-muted-foreground" href="/dashboard/bets" data-testid="back_to_bets_link">Tickets</Link>
        <h1 className="mt-2 text-3xl font-semibold">
          Ticket
          {' '}
          {bet.id.slice(0, 8)}
        </h1>
        <p className="text-muted-foreground">
          {bet.status}
          {bet.result ? ` · ${bet.result}` : ''}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Stake</CardDescription>
            <CardTitle>{bet.stakeAmount.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cuota</CardDescription>
            <CardTitle>{bet.odds}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Retorno</CardDescription>
            <CardTitle>{bet.returnAmount?.toFixed(2) ?? 'Pendiente'}</CardTitle>
          </CardHeader>
        </Card>
      </section>
      <Card data-testid="bet_funding">
        <CardHeader><CardTitle>Financiación</CardTitle></CardHeader>
        <CardContent>
          {bet.funding.length
            ? bet.funding.map(item => (
                <p key={item.pocketType}>
                  {item.pocketType}
                  :
                  {' '}
                  {item.amount.toFixed(2)}
                </p>
              ))
            : <p>Ticket legacy sin reservas trazables.</p>}
        </CardContent>
      </Card>
      <Card data-testid="bet_legs">
        <CardHeader><CardTitle>Selecciones</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {bet.legs.map(leg => (
            <p key={leg.id}>
              {leg.eventName ? `${leg.eventName} · ` : ''}
              {leg.marketName}
              :
              {leg.selection}
              {' '}
              @
              {leg.odds}
            </p>
          ))}
        </CardContent>
      </Card>
      {bet.settlementEligible && (
        <Card data-testid="settleBetForm">
          <CardHeader>
            <CardTitle>Liquidar ticket</CardTitle>
            <CardDescription>El retorno se calcula en servidor por pocket.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="settlement-result">Resultado</Label>
            <select id="settlement-result" className="h-10 w-full rounded-md border bg-background px-3" value={result} onChange={event => setResult(event.target.value as typeof result)} data-testid="settlement_result_select">{results.map(value => <option key={value} value={value}>{value}</option>)}</select>
            <Button
              disabled={submitting}
              onClick={() => pendingAction === 'settle' ? void submit('settle') : setPendingAction('settle')}
              data-testid="confirm_settlement_button"
            >
              {submitting ? 'Liquidando…' : pendingAction === 'settle' ? 'Aplicar liquidación' : 'Revisar liquidación'}
            </Button>
          </CardContent>
        </Card>
      )}
      {bet.cashoutEligible && (
        <Card data-testid="cashoutForm">
          <CardHeader>
            <CardTitle>Cashout parcial</CardTitle>
            <CardDescription>Solo disponible para financiación 100% cash.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="cashout-amount">Importe recibido</Label>
              <Input id="cashout-amount" type="number" min="0.01" step="0.01" value={cashoutAmount} onChange={event => setCashoutAmount(event.target.value)} data-testid="cashout_amount_input" />
            </div>
            <div>
              <Label htmlFor="remaining-stake">Stake restante</Label>
              <Input id="remaining-stake" type="number" min="0.01" max={bet.stakeAmount - 0.01} step="0.01" value={remainingStake} onChange={event => setRemainingStake(event.target.value)} data-testid="remaining_stake_input" />
            </div>
            <Button
              className="md:col-span-2"
              disabled={submitting || !(Number(cashoutAmount) > 0 && Number(remainingStake) > 0 && Number(remainingStake) < bet.stakeAmount)}
              onClick={() => pendingAction === 'cashout' ? void submit('cashout') : setPendingAction('cashout')}
              data-testid="confirm_cashout_button"
            >
              {submitting ? 'Procesando…' : pendingAction === 'cashout' ? 'Aplicar cashout' : 'Revisar cashout'}
            </Button>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-sm text-destructive" data-testid="bet_action_error">{error}</p>}
      {success && <p className="text-sm text-emerald-600" data-testid="bet_action_success">{success}</p>}
      <Card data-testid="auditHistory">
        <CardHeader>
          <CardTitle>Auditoría</CardTitle>
          <CardDescription>Historial append-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {audit.length
            ? audit.map(event => (
                <p key={event.id} data-testid="audit_event_item">
                  {event.action}
                  {' '}
                  ·
                  {' '}
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              ))
            : <p data-testid="audit_empty_state">Sin eventos.</p>}
        </CardContent>
      </Card>
    </main>
  );
}
