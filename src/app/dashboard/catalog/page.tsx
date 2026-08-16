'use client';

import type { z } from 'zod';
import type { CatalogEntityType, CatalogItemResponseSchema } from '@/lib/catalog/schemas';
import { BadgeCheck, BookOpen, SearchCheck } from 'lucide-react';

import { useState } from 'react';
import { CatalogAutocomplete } from '@/components/catalog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type CatalogItem = z.infer<typeof CatalogItemResponseSchema>['item'];

export default function CatalogPage() {
  const [type, setType] = useState<CatalogEntityType>('team');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  const changeType = (nextType: CatalogEntityType) => {
    setType(nextType);
    setQuery('');
    setSelected(null);
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6" data-testid="catalogPage">
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl space-y-3">
          <Badge variant="secondary">Catálogo local</Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Encuentra equipos y competiciones</h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Usa datos normalizados para mantener tus registros consistentes. Si no encuentras una coincidencia, añade una entrada manual.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="min-h-[340px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchCheck className="h-5 w-5 text-primary" />
              {' '}
              Buscar en catálogo
            </CardTitle>
            <CardDescription>Selecciona un tipo y escribe al menos dos caracteres.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <fieldset className="space-y-2">
              <Label asChild><legend>Tipo de entidad</legend></Label>
              <div className="grid grid-cols-2 gap-2">
                {(['team', 'competition'] as const).map(option => (
                  <button
                    aria-pressed={type === option}
                    className={type === option
                      ? 'rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-medium text-primary'
                      : 'rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground hover:bg-accent'}
                    data-testid={option === 'team' ? 'catalog_team_type_button' : 'catalog_competition_type_button'}
                    key={option}
                    type="button"
                    onClick={() => changeType(option)}
                  >
                    {option === 'team' ? 'Equipo' : 'Competición'}
                  </button>
                ))}
              </div>
            </fieldset>
            <CatalogAutocomplete
              type={type}
              value={query}
              onSelect={setSelected}
              onValueChange={(value) => {
                setQuery(value);
                if (value !== selected?.name) { setSelected(null); }
              }}
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {' '}
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selected
              ? (
                  <div className="space-y-4" data-testid="catalog_selected_summary" role="status" aria-live="polite">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{selected.name}</p>
                        <p className="text-sm text-muted-foreground">{selected.type === 'team' ? 'Equipo' : 'Competición'}</p>
                      </div>
                      <Badge variant={selected.isNormalized ? 'default' : 'outline'}>
                        {selected.isNormalized ? 'Normalizado' : 'Manual'}
                      </Badge>
                    </div>
                    <dl className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">País</dt>
                        <dd>{selected.country ?? 'Sin especificar'}</dd>
                      </div>
                      {selected.sport
                        ? (
                            <div className="flex justify-between gap-4">
                              <dt className="text-muted-foreground">Deporte</dt>
                              <dd>{selected.sport}</dd>
                            </div>
                          )
                        : null}
                    </dl>
                    <p className="flex gap-2 text-xs leading-5 text-muted-foreground">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      Selección guardada en esta vista. La integración con tickets llegará cuando su payload admita referencias de catálogo.
                    </p>
                  </div>
                )
              : (
                  <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                    Selecciona una sugerencia o crea una entrada manual para ver su resumen.
                  </p>
                )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
