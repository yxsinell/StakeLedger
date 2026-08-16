'use client';

import type { FormEvent } from 'react';
import type { z } from 'zod';
import type { CatalogEntityType } from '@/lib/catalog/schemas';
import { Edit3, Library, Plus, Search, Tags } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import {
  CatalogAdminListResponseSchema,
  CatalogAdminMutationResponseSchema,
  CatalogCompetitionAdminRequestSchema,
  CatalogTeamAdminRequestSchema,
} from '@/lib/catalog/schemas';

type CatalogAdminItem = z.infer<typeof CatalogAdminListResponseSchema>['items'][number];

interface FormState {
  name: string
  country: string
  sport: string
  provider: string
  externalId: string
  alias: string
}

interface ApiError {
  error?: string
  code?: string
}

const EMPTY_FORM: FormState = {
  name: '',
  country: '',
  sport: '',
  provider: '',
  externalId: '',
  alias: '',
};

const PAGE_SIZE = 25;

function getApiError(payload: unknown): ApiError {
  if (!payload || typeof payload !== 'object') { return {}; }
  return {
    error: 'error' in payload ? String(payload.error) : undefined,
    code: 'code' in payload ? String(payload.code) : undefined,
  };
}

export default function CatalogAdminPage() {
  const { profile } = useAuth();
  const [type, setType] = useState<CatalogEntityType>('team');
  const [items, setItems] = useState<CatalogAdminItem[]>([]);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [status, setStatus] = useState('');
  const latestRequest = useRef(0);

  const canEdit = profile?.role === 'admin' || profile?.role === 'editor';

  const loadItems = async (nextPageOffset: number, search = appliedQuery, entityType = type) => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(nextPageOffset),
    });
    if (search.trim().length >= 2) { params.set('q', search.trim()); }

    try {
      const endpoint = entityType === 'team' ? 'teams' : 'competitions';
      const response = await fetch(`/api/admin/catalog/${endpoint}?${params}`);
      const payload: unknown = await response.json().catch(() => null);
      if (requestId !== latestRequest.current) { return; }
      if (!response.ok) {
        setError(getApiError(payload).error ?? 'No se ha podido cargar el catálogo.');
        return;
      }
      const parsed = CatalogAdminListResponseSchema.safeParse(payload);
      if (!parsed.success) {
        setError('La respuesta del catálogo no es válida.');
        return;
      }
      setItems(parsed.data.items);
      setOffset(nextPageOffset);
      setNextOffset(parsed.data.nextOffset);
    }
    catch {
      if (requestId !== latestRequest.current) { return; }
      setError('No se ha podido conectar con el catálogo.');
    }
    finally {
      if (requestId === latestRequest.current) { setLoading(false); }
    }
  };

  useEffect(() => {
    if (canEdit) { void loadItems(0, '', type); }
  }, [canEdit, type]);

  const resetForm = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setAliasError('');
    setStatus('');
  };

  const selectItem = (item: CatalogAdminItem) => {
    setSelectedId(item.id);
    setForm({
      name: item.name,
      country: item.country ?? '',
      sport: item.sport ?? '',
      provider: item.provider ?? '',
      externalId: item.externalId ?? '',
      alias: '',
    });
    setAliasError('');
    setStatus('');
    document.getElementById('catalog-item-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateForm = (field: keyof FormState, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setAliasError('');
    setStatus('');

    const rawRequest = {
      name: form.name,
      country: form.country,
      provider: form.provider,
      externalId: form.externalId,
      alias: form.alias,
      ...(type === 'competition' ? { sport: form.sport } : {}),
    };
    const schema = type === 'team' ? CatalogTeamAdminRequestSchema : CatalogCompetitionAdminRequestSchema;
    const request = schema.safeParse(rawRequest);
    if (!request.success) {
      setError(request.error.issues[0]?.message ?? 'Revisa los datos del formulario.');
      return;
    }

    setSaving(true);
    const submittedType = type;
    const submittedId = selectedId;
    try {
      const endpoint = submittedType === 'team' ? 'teams' : 'competitions';
      const url = submittedId
        ? `/api/admin/catalog/${endpoint}/${submittedId}`
        : `/api/admin/catalog/${endpoint}`;
      const response = await fetch(url, {
        method: submittedId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.data),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const apiError = getApiError(payload);
        if (response.status === 409 && apiError.code === 'CATALOG_ALIAS_CONFLICT') {
          setAliasError('Este alias ya existe para la entidad. No se ha aplicado ningún cambio.');
        }
        else {
          setError(apiError.error ?? 'No se ha podido guardar el elemento.');
        }
        return;
      }
      const parsed = CatalogAdminMutationResponseSchema.safeParse(payload);
      if (!parsed.success) {
        setError('La respuesta del catálogo no es válida.');
        return;
      }

      setSelectedId(parsed.data.item.id);
      setStatus(parsed.data.created ? 'Elemento creado correctamente.' : 'Cambios guardados correctamente.');
      setForm(current => ({ ...current, alias: '' }));
      await loadItems(offset, appliedQuery, submittedType);
    }
    catch {
      setError('No se ha podido conectar con el catálogo.');
    }
    finally {
      setSaving(false);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim().length === 1) {
      setError('Escribe al menos 2 caracteres para buscar.');
      return;
    }
    setAppliedQuery(query.trim());
    void loadItems(0, query.trim());
  };

  if (!canEdit) {
    return (
      <main className="mx-auto w-full max-w-3xl" data-testid="catalogAdminPage">
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>Necesitas rol de editor o administrador para gestionar el catálogo.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6" data-testid="catalogAdminPage">
      <section className="flex flex-col gap-4 rounded-3xl border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">Editor de catálogo</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Catálogo y alias</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Crea y actualiza datos normalizados sin romper referencias existentes.</p>
        </div>
        <Button disabled={saving} onClick={resetForm}>
          <Plus className="mr-2 h-4 w-4" />
          {' '}
          Nuevo elemento
        </Button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              {' '}
              Elementos
            </CardTitle>
            <CardDescription>Busca y selecciona un elemento para editarlo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['team', 'competition'] as const).map(option => (
                <Button
                  disabled={saving}
                  key={option}
                  type="button"
                  variant={type === option ? 'default' : 'outline'}
                  onClick={() => {
                    setType(option);
                    setAppliedQuery('');
                    setQuery('');
                    resetForm();
                  }}
                >
                  {option === 'team' ? 'Equipos' : 'Competiciones'}
                </Button>
              ))}
            </div>
            <form className="flex gap-2" onSubmit={handleSearch}>
              <Input aria-label="Buscar catálogo" disabled={saving} placeholder="Buscar por nombre" value={query} onChange={event => setQuery(event.target.value)} />
              <Button aria-label="Buscar" disabled={saving} type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
            </form>
            {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p> : null}
            <div className="space-y-3" aria-busy={loading}>
              {loading ? <p className="py-8 text-center text-sm text-muted-foreground" role="status">Cargando catálogo…</p> : null}
              {!loading && items.length === 0 ? <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">No hay elementos en esta página.</p> : null}
              {!loading && items.map(item => (
                <article className="rounded-2xl border bg-background p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.country ?? 'Sin país'}
                        {item.sport ? ` · ${item.sport}` : ''}
                      </p>
                    </div>
                    <Badge variant={item.isNormalized ? 'default' : 'outline'}>{item.normalizationStatus}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.aliases.map(alias => <Badge key={alias.id} variant="secondary">{alias.alias}</Badge>)}
                    <Button className="ml-auto" disabled={saving} size="sm" type="button" variant="ghost" onClick={() => selectItem(item)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      {' '}
                      Editar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground">
                Página
                {Math.floor(offset / PAGE_SIZE) + 1}
              </span>
              <div className="flex gap-2">
                <Button disabled={offset === 0 || loading || saving} size="sm" variant="outline" onClick={() => void loadItems(Math.max(0, offset - PAGE_SIZE))}>Anterior</Button>
                <Button disabled={nextOffset === null || loading || saving} size="sm" variant="outline" onClick={() => void loadItems(nextOffset ?? offset)}>Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit xl:sticky xl:top-6" id="catalog-item-editor">
          <CardHeader>
            <CardTitle>{selectedId ? 'Editar elemento' : 'Nuevo elemento'}</CardTitle>
            <CardDescription>{type === 'team' ? 'Datos del equipo' : 'Datos de la competición'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" data-testid="catalog_item_form" onSubmit={(event) => { void handleSubmit(event); }}>
              <fieldset className="space-y-4" disabled={saving}>
                <div className="space-y-2">
                  <Label htmlFor="catalog-name">Nombre</Label>
                  <Input id="catalog-name" maxLength={100} required value={form.name} onChange={event => updateForm('name', event.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="catalog-country">País</Label>
                    <Input id="catalog-country" maxLength={100} value={form.country} onChange={event => updateForm('country', event.target.value)} />
                  </div>
                  {type === 'competition'
                    ? (
                        <div className="space-y-2">
                          <Label htmlFor="catalog-sport">Deporte</Label>
                          <Input id="catalog-sport" maxLength={50} required value={form.sport} onChange={event => updateForm('sport', event.target.value)} />
                        </div>
                      )
                    : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="catalog-provider">Proveedor</Label>
                    <Input id="catalog-provider" data-testid="provider_input" maxLength={50} value={form.provider} onChange={event => updateForm('provider', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catalog-external-id">ID externo</Label>
                    <Input id="catalog-external-id" data-testid="external_id_input" maxLength={100} value={form.externalId} onChange={event => updateForm('externalId', event.target.value)} />
                  </div>
                </div>
                <div className="space-y-2 rounded-2xl border bg-muted/30 p-4">
                  <Label className="flex items-center gap-2" htmlFor="catalog-alias">
                    <Tags className="h-4 w-4" />
                    {' '}
                    Añadir alias
                  </Label>
                  <Input id="catalog-alias" data-testid="alias_input" maxLength={100} placeholder="Opcional" value={form.alias} onChange={event => updateForm('alias', event.target.value)} />
                  <p className="text-xs text-muted-foreground">El alias se guarda junto al elemento cuando pulses Guardar.</p>
                  {aliasError ? <p className="text-sm text-destructive" data-testid="duplicate_alias_error" role="alert">{aliasError}</p> : null}
                </div>
                {status ? <p className="text-sm text-emerald-500" role="status">{status}</p> : null}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>Limpiar</Button>
                  <Button data-testid="save_catalog_item_button" disabled={saving} type="submit">
                    {saving ? 'Guardando…' : 'Guardar elemento'}
                  </Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
