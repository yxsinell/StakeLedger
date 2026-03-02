import type { BankWithPockets, BetSummary } from '@/lib/types';
import { QuickActionsPanel } from '@/components/dashboard/quick-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="space-y-6" data-testid="dashboardPage">
        <Card data-testid="dashboardCard">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Inicia sesion para ver tus datos en tiempo real.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const { data: banks, error: banksError } = await supabase
    .from('banks')
    .select('id, name, currency, created_at, bank_pockets(pocket_type, balance)')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<BankWithPockets[]>();

  const { data: bets, error: betsError } = await supabase
    .from('bets')
    .select('id, stake_amount, status, odds, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<BetSummary[]>();

  const hasError = banksError || betsError;
  const bankCount = banks?.length ?? 0;
  const betCount = bets?.length ?? 0;

  const highlights = [
    {
      label: 'Banks activos',
      value: bankCount,
      note: 'Multi-bolsillo y control de saldo',
    },
    {
      label: 'Tickets recientes',
      value: betCount,
      note: 'Stake sugerido con cap 40%',
    },
    {
      label: 'Yield operativo',
      value: '7.2%',
      note: 'Demo en base a historico',
    },
  ];

  const goals = [
    {
      title: 'Meta 10 dias',
      progress: '62%',
      note: 'Mision diaria: +14.2 EUR',
    },
    {
      title: 'Meta agresiva',
      progress: '34%',
      note: 'Cuota sugerida: 1.78',
    },
  ];

  const recommendations = [
    {
      title: 'Premier League',
      detail: 'Arsenal vs Chelsea · ICP 82',
    },
    {
      title: 'LaLiga',
      detail: 'Betis vs Sevilla · ICP 74',
    },
    {
      title: 'Serie A',
      detail: 'Roma vs Lazio · ICP 71',
    },
  ];

  return (
    <main className="space-y-6" data-testid="dashboardPage">
      {hasError
        ? (
            <Card data-testid="dashboard_error">
              <CardHeader>
                <CardTitle>No pudimos cargar los datos</CardTitle>
                <CardDescription>
                  Revisa tu conexion e intenta de nuevo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" type="button">
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          )
        : null}

      <section className="grid gap-4 lg:grid-cols-3" data-testid="highlightsSection">
        {highlights.map(item => (
          <Card key={item.label}>
            <CardHeader className="space-y-2">
              <Badge variant="outline">KPI</Badge>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2" data-testid="dataSection">
        <Card>
          <CardHeader>
            <CardTitle>Banks recientes</CardTitle>
            <CardDescription>
              Saldos por bolsillo y ultima actividad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {banks?.length
              ? (
                  <ul className="grid gap-4" data-testid="banksList">
                    {banks.map(bank => (
                      <li
                        key={bank.id}
                        className="rounded-xl border border-border bg-background/60 p-4"
                        data-testid="bankItem"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{bank.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {bank.currency}
                            </p>
                          </div>
                          <Badge variant="secondary">Activo</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {bank.bank_pockets.map(pocket => (
                            <Badge
                              key={pocket.pocket_type}
                              variant="outline"
                              data-testid="pocketItem"
                            >
                              {pocket.pocket_type}
                              :
                              {pocket.balance}
                            </Badge>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              : (
                  <p className="text-sm text-muted-foreground" data-testid="banksEmpty">
                    Aun no tienes banks creados.
                  </p>
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets recientes</CardTitle>
            <CardDescription>
              Estado, stake y cuota de los ultimos tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bets?.length
              ? (
                  <ul className="grid gap-4" data-testid="betsList">
                    {bets.map(bet => (
                      <li
                        key={bet.id}
                        className="rounded-xl border border-border bg-background/60 p-4"
                        data-testid="betItem"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              Stake
                              {bet.stake_amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cuota
                              {' '}
                              {bet.odds}
                            </p>
                          </div>
                          <Badge variant="outline">{bet.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              : (
                  <p className="text-sm text-muted-foreground" data-testid="betsEmpty">
                    Aun no hay tickets registrados.
                  </p>
                )}
          </CardContent>
        </Card>
      </section>

      <QuickActionsPanel />

      <Separator />

      <section className="grid gap-4 lg:grid-cols-3" data-testid="goalsSection">
        {goals.map(goal => (
          <Card key={goal.title}>
            <CardHeader>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <CardDescription>{goal.note}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Progreso</span>
                <span>{goal.progress}</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: goal.progress }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="surface-grid">
          <CardHeader>
            <CardTitle className="text-lg">Riesgo activo</CardTitle>
            <CardDescription>Alertas y cortafuegos en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border bg-background/70 p-3 text-sm">
              Cuota 2.55 supera limite sugerido.
            </div>
            <div className="rounded-xl border border-border bg-background/70 p-3 text-sm">
              Cash disponible bajo en Bank principal.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" data-testid="feedSection">
        <Card>
          <CardHeader>
            <CardTitle>Feed de recomendaciones</CardTitle>
            <CardDescription>Pre-match y live con adhesion rapida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map(item => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <Button size="sm" data-testid="follow_tip_button">
                  Seguir
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Insights en construccion</CardTitle>
            <CardDescription>Preview de los dashboards analiticos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
