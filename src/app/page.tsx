import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const highlights = [
  {
    title: 'Ledger multi-bank',
    description: 'Tres bolsillos cash, bonus y freebet con auditoria completa.',
  },
  {
    title: 'Stake disciplinado',
    description: 'Calculo 0-20 con cap 40% sobre cash disponible.',
  },
  {
    title: 'Catalogo normalizado',
    description: 'Autocompletado deportivo y fallback manual marcado.',
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
              <Link href="/login">Iniciar sesion</Link>
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
              Gestiona tu bank con datos reales y protecciones de riesgo
            </h1>
            <p className="text-base text-muted-foreground">
              StakeLedger centraliza cash, bonus y freebet con trazabilidad
              completa. Registra tickets, metas y recomendaciones sin perder
              el contexto de rendimiento.
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
              <CardTitle>KPIs del MVP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">200 usuarios activos</p>
                <p className="text-xs text-muted-foreground">
                  Meta en 60 dias con 3 tickets registrados.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">40% WAU/MAU</p>
                <p className="text-xs text-muted-foreground">
                  Retencion semanal en el primer trimestre.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-sm font-semibold">20% con metas activas</p>
                <p className="text-xs text-muted-foreground">
                  Uso minimo de 5 dias por meta.
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
              title: 'Banks & balances',
              description: 'Saldos por bolsillo y transferencias internas.',
            },
            {
              title: 'Bets ledger',
              description: 'Tickets con legs, cashout parcial y auditoria.',
            },
            {
              title: 'Goals advisor',
              description: 'Metas con mision diaria y recalculo automatico.',
            },
            {
              title: 'Feed & insights',
              description: 'Recomendaciones filtrables con adhesion rapida.',
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
              <CardTitle>Flujo operativo en 4 pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Crear bank con bolsillos y riesgo',
                'Registrar ticket con stake sugerido',
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
                <CardTitle>Layout moderno y flexible</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sidebar collapsible, encabezados dinamicos y tarjetas en grid.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold">Dashboard compacto</p>
                    <Skeleton className="mt-3 h-2 w-full" />
                    <Skeleton className="mt-2 h-2 w-2/3" />
                  </div>
                  <div className="rounded-2xl border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold">Panel de riesgo</p>
                    <Skeleton className="mt-3 h-2 w-full" />
                    <Skeleton className="mt-2 h-2 w-1/2" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" data-testid="layout_cta_secondary">
                    Ver layout
                  </Button>
                  <Button variant="outline" data-testid="layout_cta_outline">
                    Explorar modulos
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Psicologia de color aplicada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Azul para confianza, verde para crecimiento y teal para control
                  tecnico. Todo alineado al logotipo.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </section>
    </main>
  );
}
