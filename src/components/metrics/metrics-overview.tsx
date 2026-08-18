'use client';

import type { BankData } from '@/lib/banks/schemas';
import type { MetricsOverview as MetricsData } from '@/lib/metrics/schemas';
import { Activity, Banknote, CirclePercent, Scale, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BankListResponseSchema } from '@/lib/banks/schemas';
import { MetricsOverviewResponseSchema } from '@/lib/metrics/schemas';

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function apiError(payload: unknown, fallback: string) {
  return payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
    ? payload.error
    : fallback;
}

function formatRatio(value: number) {
  return new Intl.NumberFormat('es', { style: 'percent', maximumFractionDigits: 2 }).format(value);
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export function MetricsOverview() {
  const today = isoDate(new Date());
  const initialFrom = new Date();
  initialFrom.setUTCDate(initialFrom.getUTCDate() - 29);
  const [banks, setBanks] = useState<BankData[]>([]);
  const [bankId, setBankId] = useState('');
  const [from, setFrom] = useState(isoDate(initialFrom));
  const [to, setTo] = useState(today);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void fetch('/api/banks', { credentials: 'same-origin' }).then(async (response) => {
      const payload: unknown = await response.json().catch(() => null);
      const parsed = BankListResponseSchema.safeParse(payload);
      if (!active) { return; }
      if (!response.ok || !parsed.success) {
        setError(apiError(payload, 'No se pudieron cargar los banks.'));
        return;
      }
      setBanks(parsed.data.banks);
      setBankId(parsed.data.banks[0]?.id ?? '');
    }).catch(() => {
      if (active) { setError('No se pudo conectar con banks.'); }
    }).finally(() => {
      if (active) { setLoadingBanks(false); }
    });
    return () => { active = false; };
  }, []);

  const loadMetrics = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bankId) {
      setError('Selecciona un bank.');
      return;
    }
    setLoadingMetrics(true);
    setError('');
    setMetrics(null);
    try {
      const params = new URLSearchParams({ bankId, from, to });
      const response = await fetch(`/api/metrics/overview?${params}`, { credentials: 'same-origin' });
      const payload: unknown = await response.json().catch(() => null);
      const parsed = MetricsOverviewResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        setError(apiError(payload, 'No se pudieron calcular las métricas.'));
        return;
      }
      setMetrics(parsed.data.metrics);
    }
    catch {
      setError('No se pudo conectar con métricas.');
    }
    finally {
      setLoadingMetrics(false);
    }
  };

  const kpis = metrics
    ? [
        { label: 'Yield cash', value: formatRatio(metrics.yieldCash), detail: `${formatMoney(metrics.cashStake, metrics.currency)} de stake cash`, icon: Banknote },
        { label: 'Yield operativo', value: formatRatio(metrics.yieldOperative), detail: `${formatMoney(metrics.totalStake, metrics.currency)} de stake total`, icon: Activity },
        { label: 'Win rate', value: formatRatio(metrics.winRate), detail: `${metrics.decisiveCount} resultados decisivos`, icon: Trophy },
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6" data-testid="metricsOverview">
      <header className="rounded-3xl border bg-gradient-to-r from-card to-emerald-500/10 p-6 sm:p-8">
        <Badge variant="secondary">Rendimiento liquidado</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Métricas</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Analiza tickets settled por bank y rango UTC. Cashout queda fuera; void no altera el win rate.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Consulta</CardTitle>
          <CardDescription>Rango inclusivo de hasta 366 días.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="metricsFilters" onSubmit={event => void loadMetrics(event)}>
            <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="metrics-bank">Bank</Label>
              <select id="metrics-bank" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" value={bankId} disabled={loadingBanks || banks.length === 0} data-testid="metrics_bank_select" onChange={event => setBankId(event.target.value)}>
                {banks.length === 0 ? <option value="">Sin banks disponibles</option> : null}
                {banks.map(bank => (
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
              <Label htmlFor="metrics-from">Desde (UTC)</Label>
              <Input id="metrics-from" type="date" value={from} max={to} data-testid="metrics_from_input" onChange={event => setFrom(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metrics-to">Hasta (UTC)</Label>
              <Input id="metrics-to" type="date" value={to} min={from} max={today} data-testid="metrics_to_input" onChange={event => setTo(event.target.value)} />
            </div>
            <Button className="self-end" type="submit" disabled={!bankId || loadingMetrics} data-testid="load_metrics_button">{loadingMetrics ? 'Calculando...' : 'Calcular métricas'}</Button>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert" data-testid="metrics_error">{error}</p> : null}
      {loadingMetrics
        ? (
            <div className="grid gap-4 md:grid-cols-3" data-testid="metrics_loading">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          )
        : null}
      {!metrics && !loadingMetrics && !error
        ? (
            <Card data-testid="metrics_empty">
              <CardHeader>
                <CardTitle>Define tu corte</CardTitle>
                <CardDescription>Selecciona bank y rango para consultar datos reales.</CardDescription>
              </CardHeader>
            </Card>
          )
        : null}

      {metrics
        ? (
            <section className="space-y-4" data-testid="metrics_results">
              <div className="grid gap-4 md:grid-cols-3">
                {kpis.map(kpi => (
                  <Card key={kpi.label} data-testid="metricCard">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <kpi.icon className="h-4 w-4" />
                        {kpi.label}
                      </CardDescription>
                      <CardTitle className="text-3xl tabular-nums">{kpi.value}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{kpi.detail}</p></CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets settled</p>
                      <p className="text-xl font-semibold tabular-nums">{metrics.settledCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CirclePercent className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Beneficio total</p>
                      <p className="text-xl font-semibold tabular-nums">{formatMoney(metrics.totalProfit, metrics.currency)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rango UTC</p>
                    <p className="font-medium">
                      {metrics.from}
                      {' '}
                      →
                      {' '}
                      {metrics.to}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )
        : null}
    </main>
  );
}
