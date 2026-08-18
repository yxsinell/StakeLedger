'use client';

import type { BankData } from '@/lib/banks/schemas';
import type { BetView } from '@/lib/bets/schemas';
import type { Goal, RiskLimitsPatchInput } from '@/lib/goals/schemas';
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
import { BetListResponseSchema } from '@/lib/bets/schemas';
import { GoalListResponseSchema, RiskLimitsResponseSchema } from '@/lib/goals/schemas';

interface DashboardData {
  banks: BankData[]
  bets: BetView[]
  goals: Goal[]
  riskLimits: RiskLimitsPatchInput & { maxStakePercentage: number }
}

const DASHBOARD_ERROR = 'No pudimos cargar el resumen operativo.';

const getErrorMessage = (payload: unknown) => (
  payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
    ? payload.error
    : DASHBOARD_ERROR
);

const loadDashboard = async (signal: AbortSignal): Promise<DashboardData> => {
  const [banksResponse, betsResponse, goalsResponse, riskResponse] = await Promise.all([
    fetch('/api/banks', { signal }),
    fetch('/api/bets', { signal }),
    fetch('/api/goals', { signal }),
    fetch('/api/risk-limits', { signal }),
  ]);

  const [banksPayload, betsPayload, goalsPayload, riskPayload]: unknown[] = await Promise.all([
    banksResponse.json().catch(() => null),
    betsResponse.json().catch(() => null),
    goalsResponse.json().catch(() => null),
    riskResponse.json().catch(() => null),
  ]);

  const banks = BankListResponseSchema.safeParse(banksPayload);
  const bets = BetListResponseSchema.safeParse(betsPayload);
  const goals = GoalListResponseSchema.safeParse(goalsPayload);
  const riskLimits = RiskLimitsResponseSchema.safeParse(riskPayload);

  if (!banksResponse.ok || !banks.success) {
    throw new Error(getErrorMessage(banksPayload));
  }
  if (!betsResponse.ok || !bets.success) {
    throw new Error(getErrorMessage(betsPayload));
  }
  if (!goalsResponse.ok || !goals.success) {
    throw new Error(getErrorMessage(goalsPayload));
  }
  if (!riskResponse.ok || !riskLimits.success) {
    throw new Error(getErrorMessage(riskPayload));
  }

  return {
    banks: banks.data.banks,
    bets: bets.data.bets,
    goals: goals.data.goals,
    riskLimits: riskLimits.data.riskLimits,
  };
};

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextData = await loadDashboard(controller.signal);
        if (!controller.signal.aborted) {
          setData(nextData);
        }
      }
      catch (caught) {
        if (!controller.signal.aborted) {
          setData(null);
          setError(caught instanceof Error ? caught.message : DASHBOARD_ERROR);
        }
      }
      finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [reloadKey]);

  const activeGoals = data?.goals.filter(goal => goal.status === 'active') ?? [];
  const openBets = data?.bets.filter(bet => bet.status === 'open') ?? [];

  return (
    <main className="space-y-6" data-testid="dashboardOverview" aria-busy={isLoading}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Vista operativa</p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Saldo disponible, actividad abierta y límites de riesgo actuales.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Crear registros operativos">
          <Button asChild size="sm" variant="outline" data-testid="create_bank_link">
            <Link href="/dashboard/banks/new">Crear bank</Link>
          </Button>
          <Button asChild size="sm" variant="outline" data-testid="create_ticket_link">
            <Link href="/dashboard/bets/new">Crear ticket</Link>
          </Button>
          <Button asChild size="sm" data-testid="create_goal_link">
            <Link href="/dashboard/goals/new">Crear meta</Link>
          </Button>
        </div>
      </header>

      {isLoading
        ? (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="dashboard_loading" aria-label="Cargando resumen operativo">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </section>
          )
        : null}

      {!isLoading && error
        ? (
            <Card data-testid="dashboard_error" role="alert">
              <CardHeader>
                <CardTitle>No pudimos cargar el dashboard</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" variant="outline" data-testid="retry_dashboard_button" onClick={() => setReloadKey(value => value + 1)}>
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          )
        : null}

      {!isLoading && !error && data
        ? (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="dashboard_summary">
              <Card data-testid="dashboardBanks">
                <CardHeader>
                  <CardTitle>Saldo operativo</CardTitle>
                  <CardDescription>Cash disponible por bank y divisa.</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.banks.length === 0
                    ? (
                        <p className="text-sm text-muted-foreground" data-testid="dashboard_banks_empty">Crea un bank para registrar saldo.</p>
                      )
                    : (
                        <ul className="space-y-2 text-sm" data-testid="dashboard_banks_list">
                          {data.banks.map(bank => (
                            <li key={bank.id} className="flex items-baseline justify-between gap-3">
                              <span className="truncate">{bank.name}</span>
                              <strong className="shrink-0">{formatMoney(bank.balances.operative, bank.currency)}</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                </CardContent>
              </Card>

              <Card data-testid="dashboardTickets">
                <CardHeader>
                  <CardTitle>Tickets abiertos</CardTitle>
                  <CardDescription>Tickets con financiación reservada pendientes de resultado.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold" data-testid="open_tickets_count">{openBets.length}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {openBets.length === 0 ? 'No tienes tickets abiertos.' : 'Revisa o liquida tus tickets activos.'}
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="dashboardGoals">
                <CardHeader>
                  <CardTitle>Metas activas</CardTitle>
                  <CardDescription>Objetivos de crecimiento en seguimiento.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold" data-testid="active_goals_count">{activeGoals.length}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeGoals.length === 0 ? 'No tienes metas activas.' : 'Tus misiones diarias están disponibles en Metas.'}
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="dashboardRisk">
                <CardHeader>
                  <CardTitle>Límites de riesgo</CardTitle>
                  <CardDescription>Protecciones aplicadas al crear tickets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Stake máximo:
                    <strong>
                      {data.riskLimits.maxStakePercentage}
                      % del cash
                    </strong>
                  </p>
                  <p>
                    Cuota máxima:
                    <strong>{data.riskLimits.maxOdds ?? 'Sin límite'}</strong>
                  </p>
                  <p>
                    Pérdida diaria:
                    <strong>{data.riskLimits.maxDailyLoss?.toFixed(2) ?? 'Sin límite'}</strong>
                  </p>
                </CardContent>
              </Card>
            </section>
          )
        : null}

      <p className="sr-only" role="status" aria-live="polite">
        {isLoading ? 'Cargando resumen operativo.' : error ? 'Error al cargar resumen operativo.' : 'Resumen operativo actualizado.'}
      </p>
    </main>
  );
}
