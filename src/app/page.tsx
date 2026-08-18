import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const highlights = [
  {
    title: 'Ledger multi-bank',
    description: 'Bolsillos cash, bonus y freebet con auditoría completa.',
  },
  {
    title: 'Stake disciplinado',
    description: 'Límites de riesgo configurables sobre cash disponible.',
  },
  {
    title: 'Catálogo normalizado',
    description: 'Autocompletado deportivo y entrada manual explícita.',
  },
];

export default function HomePage() {
  return (
    <main className="px-6 py-12" data-testid="homePage">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-24 w-24">
              <Image
                src="/imageSL.png"
                alt="StakeLedger"
                fill
                sizes="96px"
                className="rounded-[28px] object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold">StakeLedger</p>
              <p className="text-xs text-muted-foreground">Ledger inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" data-testid="login_link">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild data-testid="signup_link">
              <Link href="/signup">Crear cuenta</Link>
            </Button>
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge variant="secondary">Control de bank</Badge>
            <h1 className="text-4xl font-semibold md:text-5xl">
              Gestiona tu bank con trazabilidad y protecciones de riesgo
            </h1>
            <p className="text-base text-muted-foreground">
              Centraliza movimientos, tickets y metas. Mantén contexto sobre tu
              operativa sin convertir previsiones en resultados.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild data-testid="primary_cta">
                <Link href="/signup">Empezar ahora</Link>
              </Button>
              <Button asChild variant="outline" data-testid="secondary_cta">
                <Link href="/dashboard">Ver dashboard</Link>
              </Button>
            </div>
          </div>
          <Card className="surface-grid">
            <CardHeader>
              <CardTitle>Empieza con tu operativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">Crea tu primer bank</p>
                <p className="text-xs text-muted-foreground">
                  Define moneda y bolsillos para separar tu saldo operativo.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">Registra movimientos</p>
                <p className="text-xs text-muted-foreground">
                  Conserva historial trazable de depósitos, retiradas y tickets.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">Revisa tus límites</p>
                <p className="text-xs text-muted-foreground">
                  Configura protecciones de riesgo antes de registrar apuestas.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3" data-testid="infoSection">
          {highlights.map(item => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator />

        <section className="grid gap-4 lg:grid-cols-4" data-testid="modulesSection">
          {[
            {
              title: 'Banks y saldos',
              description: 'Saldos por bolsillo y transferencias internas.',
            },
            {
              title: 'Ledger de tickets',
              description: 'Tickets, cashout parcial y auditoría.',
            },
            {
              title: 'Metas y riesgo',
              description: 'Metas con misión diaria y recálculo automático.',
            },
            {
              title: 'Feed y métricas',
              description: 'Recomendaciones filtrables y métricas trazables.',
            },
          ].map(item => (
            <Card key={item.title}>
              <CardHeader>
                <Badge variant="outline">Modulo</Badge>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]" data-testid="flowSection">
          <Card className="surface-grid">
            <CardHeader>
              <CardTitle>Flujo operativo en cuatro pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Crear un bank con bolsillos y riesgo',
                'Registrar un ticket con stake sugerido',
                'Liquidar ticket y ajustar ledger',
                'Recalcular metas con protecciones',
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-background/70 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    0
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Acceso a tu espacio de trabajo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Consulta tu dashboard, banks, tickets, metas y métricas desde un mismo lugar.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold">Dashboard</p>
                    <p className="mt-3 text-xs text-muted-foreground">Consulta tus banks y saldos.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold">Panel de riesgo</p>
                    <p className="mt-3 text-xs text-muted-foreground">Configura límites para tu operativa.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" data-testid="layout_cta_secondary">
                    <Link href="/dashboard">Ir al dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" data-testid="layout_cta_outline">
                    <Link href="/signup">Crear cuenta</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Decisiones con contexto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registra resultados y revisa tu historial antes de ajustar tu estrategia.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </section>
    </main>
  );
}
