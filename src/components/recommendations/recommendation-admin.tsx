'use client';

import type { Recommendation } from '@/lib/recommendations/schemas';
import { Edit3, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import {
  RecommendationAdminListResponseSchema,
  RecommendationCreateRequestSchema,
  RecommendationResponseSchema,
  RecommendationUpdateRequestSchema,
} from '@/lib/recommendations/schemas';

interface RecommendationForm {
  eventId: string
  marketId: string
  selection: string
  odds: string
  type: 'pre' | 'live'
  rationale: string
  score: string
  factors: string
}

const EMPTY_FORM: RecommendationForm = {
  eventId: '',
  marketId: '',
  selection: '',
  odds: '',
  type: 'pre',
  rationale: '',
  score: '',
  factors: '',
};
const PAGE_SIZE = 25;

function apiError(payload: unknown, fallback: string) {
  return payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
    ? payload.error
    : fallback;
}

function statusLabel(status: Recommendation['status']) {
  if (status === 'published') { return 'Publicada'; }
  if (status === 'inactive') { return 'Inactiva'; }
  return 'Borrador';
}

export function RecommendationAdmin() {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'admin' || profile?.role === 'editor';
  const [items, setItems] = useState<Recommendation[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [form, setForm] = useState<RecommendationForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const latestRequest = useRef(0);

  const loadItems = async (nextOffsetValue = 0) => {
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(nextOffsetValue) });
    if (statusFilter) { params.set('status', statusFilter); }
    if (typeFilter) { params.set('type', typeFilter); }
    try {
      const response = await fetch(`/api/admin/recommendations?${params}`, { credentials: 'same-origin' });
      const payload: unknown = await response.json().catch(() => null);
      if (request !== latestRequest.current) { return; }
      const parsed = RecommendationAdminListResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        setError(apiError(payload, 'No se pudieron cargar las recomendaciones.'));
        return;
      }
      setItems(parsed.data.recommendations);
      setOffset(nextOffsetValue);
      setNextOffset(parsed.data.nextOffset);
    }
    catch {
      if (request === latestRequest.current) { setError('No se pudo conectar con recomendaciones.'); }
    }
    finally {
      if (request === latestRequest.current) { setLoading(false); }
    }
  };

  useEffect(() => {
    if (canEdit) { void loadItems(0); }
  }, [canEdit, statusFilter, typeFilter]);

  const clearEditor = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccess('');
  };

  const edit = (item: Recommendation) => {
    setSelected(item);
    setForm({
      eventId: item.event.id,
      marketId: item.market.id,
      selection: item.selection,
      odds: String(item.odds),
      type: item.type,
      rationale: item.rationale,
      score: String(item.icp.score),
      factors: item.icp.factors.join('\n'),
    });
    setError('');
    setSuccess('');
    document.getElementById('recommendation-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateForm = (field: keyof RecommendationForm, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const formPayload = () => ({
    eventId: form.eventId.trim(),
    marketId: form.marketId.trim(),
    selection: form.selection.trim(),
    odds: Number(form.odds),
    type: form.type,
    rationale: form.rationale.trim(),
    icp: {
      version: 1 as const,
      score: Number(form.score),
      factors: form.factors.split('\n').map(factor => factor.trim()).filter(Boolean),
    },
  });

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const raw = formPayload();
    const parsed = selected
      ? RecommendationUpdateRequestSchema.safeParse(raw)
      : RecommendationCreateRequestSchema.safeParse({ ...raw, status: 'draft' });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos de la recomendación.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(selected ? `/api/recommendations/${selected.id}` : '/api/recommendations', {
        method: selected ? 'PATCH' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const payload: unknown = await response.json().catch(() => null);
      const result = RecommendationResponseSchema.safeParse(payload);
      if (!response.ok || !result.success) {
        setError(apiError(payload, 'No se pudo guardar la recomendación.'));
        return;
      }
      edit(result.data.recommendation);
      setSuccess(selected ? 'Cambios guardados.' : 'Borrador creado.');
      await loadItems(offset);
    }
    catch {
      setError('No se pudo conectar para guardar la recomendación.');
    }
    finally {
      setSaving(false);
    }
  };

  const changeStatus = async (item: Recommendation, action: 'publish' | 'inactivate') => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/recommendations/${item.id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'publish' ? 'published' : 'inactive' }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const parsed = RecommendationResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        setError(apiError(payload, `No se pudo ${action === 'publish' ? 'publicar' : 'inactivar'} la recomendación.`));
        return;
      }
      if (selected?.id === item.id) { edit(parsed.data.recommendation); }
      setSuccess(action === 'publish' ? 'Recomendación publicada.' : 'Recomendación inactivada.');
      await loadItems(offset);
    }
    catch {
      setError('No se pudo conectar para cambiar el estado.');
    }
    finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <main className="mx-auto w-full max-w-3xl" data-testid="recommendationAdmin">
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>Necesitas rol editor o admin para gestionar recomendaciones.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6" data-testid="recommendationAdmin">
      <header className="flex flex-col gap-4 rounded-3xl border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="secondary">Mesa editorial</Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Gestionar recomendaciones</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Crea borradores, publica datos normalizados e inactiva sin borrar historial.</p>
        </div>
        <Button type="button" disabled={saving} data-testid="new_recommendation_button" onClick={clearEditor}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva recomendación
        </Button>
      </header>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert" data-testid="recommendation_admin_error">{error}</p> : null}
      {success ? <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600" role="status" data-testid="recommendation_admin_success">{success}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Contenido editorial</CardTitle>
            <CardDescription>Ordenado por última actualización.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <select className="h-11 rounded-xl border border-input bg-background px-4 text-sm" aria-label="Filtrar por estado" value={statusFilter} data-testid="admin_recommendation_status_filter" onChange={event => setStatusFilter(event.target.value)}>
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="published">Publicada</option>
                <option value="inactive">Inactiva</option>
              </select>
              <select className="h-11 rounded-xl border border-input bg-background px-4 text-sm" aria-label="Filtrar por tipo" value={typeFilter} data-testid="admin_recommendation_type_filter" onChange={event => setTypeFilter(event.target.value)}>
                <option value="">Todos los tipos</option>
                <option value="pre">Pre</option>
                <option value="live">Live</option>
              </select>
              <Button type="button" variant="outline" disabled={loading} data-testid="refresh_recommendations_button" onClick={() => void loadItems(offset)}>
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Actualizar</span>
              </Button>
            </div>
            <div className="space-y-3" aria-busy={loading} data-testid="admin_recommendation_list">
              {loading ? <p className="py-8 text-center text-sm text-muted-foreground" role="status">Cargando recomendaciones...</p> : null}
              {!loading && items.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No hay recomendaciones en esta página.</p> : null}
              {!loading && items.map(item => (
                <article className="rounded-2xl border bg-background p-4" key={item.id} data-testid="adminRecommendationCard">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.market.name}
                        {' '}
                        ·
                        {' '}
                        {item.selection}
                        {' '}
                        @
                        {' '}
                        {item.odds}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>{statusLabel(item.status)}</Badge>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.rationale}</p>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button type="button" size="sm" variant="ghost" disabled={saving || item.status === 'inactive'} data-testid="edit_recommendation_button" onClick={() => edit(item)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    {item.status === 'draft' ? <Button type="button" size="sm" disabled={saving} data-testid="publish_recommendation_button" onClick={() => void changeStatus(item, 'publish')}>Publicar</Button> : null}
                    {item.status !== 'inactive' ? <Button type="button" size="sm" variant="outline" disabled={saving} data-testid="inactivate_recommendation_button" onClick={() => void changeStatus(item, 'inactivate')}>Inactivar</Button> : null}
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
                <Button type="button" size="sm" variant="outline" disabled={offset === 0 || loading} data-testid="previous_recommendations_button" onClick={() => void loadItems(Math.max(0, offset - PAGE_SIZE))}>Anterior</Button>
                <Button type="button" size="sm" variant="outline" disabled={nextOffset === null || loading} data-testid="next_recommendations_button" onClick={() => void loadItems(nextOffset ?? offset)}>Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit xl:sticky xl:top-6" id="recommendation-editor">
          <CardHeader>
            <CardTitle>{selected ? 'Editar recomendación' : 'Nuevo borrador'}</CardTitle>
            <CardDescription className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Solo referencias normalizadas. Catálogo no expone búsqueda de eventos/mercados: introduce UUID válidos y relacionados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" data-testid="recommendationForm" onSubmit={event => void save(event)}>
              <fieldset className="space-y-4" disabled={saving || selected?.status === 'inactive'}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="recommendation-event-id">UUID de evento normalizado</Label>
                    <Input id="recommendation-event-id" required value={form.eventId} data-testid="recommendation_event_id_input" onChange={event => updateForm('eventId', event.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recommendation-market-id">UUID de mercado normalizado</Label>
                    <Input id="recommendation-market-id" required value={form.marketId} data-testid="recommendation_market_id_input" onChange={event => updateForm('marketId', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="recommendation-selection">Selección</Label>
                    <Input id="recommendation-selection" maxLength={100} required value={form.selection} data-testid="recommendation_selection_input" onChange={event => updateForm('selection', event.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recommendation-odds">Cuota</Label>
                    <Input id="recommendation-odds" type="number" min="1.0001" step="0.0001" required value={form.odds} data-testid="recommendation_odds_input" onChange={event => updateForm('odds', event.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recommendation-kind">Tipo</Label>
                  <select id="recommendation-kind" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" value={form.type} data-testid="recommendation_kind_select" onChange={event => updateForm('type', event.target.value)}>
                    <option value="pre">Pre</option>
                    <option value="live">Live</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recommendation-rationale">Justificación</Label>
                  <Textarea id="recommendation-rationale" maxLength={2000} required rows={5} value={form.rationale} data-testid="recommendation_rationale_input" onChange={event => updateForm('rationale', event.target.value)} />
                </div>
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="mb-4 text-sm font-semibold">ICP visible · versión 1</p>
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                    <div className="grid gap-2">
                      <Label htmlFor="recommendation-score">Score 0-100</Label>
                      <Input id="recommendation-score" type="number" min="0" max="100" step="1" required value={form.score} data-testid="recommendation_icp_score_input" onChange={event => updateForm('score', event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="recommendation-factors">Factores, uno por línea</Label>
                      <Textarea id="recommendation-factors" maxLength={4000} required rows={5} value={form.factors} data-testid="recommendation_icp_factors_input" onChange={event => updateForm('factors', event.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" data-testid="clear_recommendation_form_button" onClick={clearEditor}>Limpiar</Button>
                  <Button type="submit" disabled={saving} data-testid="save_recommendation_button">{saving ? 'Guardando...' : selected ? 'Guardar cambios' : 'Crear borrador'}</Button>
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
