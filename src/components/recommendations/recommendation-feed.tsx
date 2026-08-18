'use client';

import type { BankData } from '@/lib/banks/schemas';
import type { Recommendation } from '@/lib/recommendations/schemas';
import { ArrowRight, CalendarClock, Filter, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BankListResponseSchema } from '@/lib/banks/schemas';
import {
  RecommendationFollowResponseSchema,
  RecommendationListResponseSchema,
} from '@/lib/recommendations/schemas';
import { RECOMMENDATION_PREFILL_STORAGE_KEY } from './recommendation-prefill';

interface Filters {
  type: '' | 'pre' | 'live'
  sport: string
  leagueId: string
}

const EMPTY_FILTERS: Filters = { type: '', sport: '', leagueId: '' };

function apiError(payload: unknown, fallback: string) {
  return payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
    ? payload.error
    : fallback;
}

function formatDate(value: string | null) {
  if (!value) { return 'Sin fecha'; }
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function RecommendationFeed() {
  const router = useRouter();
  const [banks, setBanks] = useState<BankData[]>([]);
  const [bankId, setBankId] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followingId, setFollowingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const requestNumber = useRef(0);

  const loadRecommendations = async (nextFilters: Filters, cursor?: string) => {
    const currentRequest = requestNumber.current + 1;
    requestNumber.current = currentRequest;
    cursor ? setLoadingMore(true) : setLoading(true);
    setError('');

    const params = new URLSearchParams({ limit: '20' });
    if (nextFilters.type) { params.set('type', nextFilters.type); }
    if (nextFilters.sport.trim()) { params.set('sport', nextFilters.sport.trim()); }
    if (nextFilters.leagueId.trim()) { params.set('leagueId', nextFilters.leagueId.trim()); }
    if (cursor) { params.set('cursor', cursor); }

    try {
      const response = await fetch(`/api/recommendations?${params}`, { credentials: 'same-origin' });
      const payload: unknown = await response.json().catch(() => null);
      if (currentRequest !== requestNumber.current) { return; }
      const parsed = RecommendationListResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        setError(apiError(payload, 'No se pudieron cargar las recomendaciones.'));
        return;
      }
      setRecommendations(current => cursor ? [...current, ...parsed.data.recommendations] : parsed.data.recommendations);
      setNextCursor(parsed.data.nextCursor);
    }
    catch {
      if (currentRequest === requestNumber.current) { setError('No se pudo conectar con recomendaciones.'); }
    }
    finally {
      if (currentRequest === requestNumber.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch('/api/banks', { credentials: 'same-origin' }),
      loadRecommendations(EMPTY_FILTERS),
    ]).then(async ([banksResponse]) => {
      const payload: unknown = await banksResponse.json().catch(() => null);
      const parsed = BankListResponseSchema.safeParse(payload);
      if (!active) { return; }
      if (!banksResponse.ok || !parsed.success) {
        setError(apiError(payload, 'No se pudieron cargar los banks.'));
        return;
      }
      setBanks(parsed.data.banks);
      setBankId(parsed.data.banks[0]?.id ?? '');
    }).catch(() => {
      if (active) { setError('No se pudo cargar la información necesaria.'); }
    });
    return () => { active = false; };
  }, []);

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { ...filters, sport: filters.sport.trim(), leagueId: filters.leagueId.trim() };
    setAppliedFilters(next);
    setRecommendations([]);
    setNextCursor(null);
    void loadRecommendations(next);
  };

  const follow = async (recommendationId: string) => {
    if (!bankId) {
      setError('Selecciona un bank antes de seguir una recomendación.');
      return;
    }
    setFollowingId(recommendationId);
    setError('');
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}/follow`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const parsed = RecommendationFollowResponseSchema.safeParse(payload);
      if (!response.ok || !parsed.success) {
        setError(apiError(payload, 'No se pudo seguir la recomendación.'));
        return;
      }
      sessionStorage.setItem(RECOMMENDATION_PREFILL_STORAGE_KEY, JSON.stringify(parsed.data.prefill));
      router.push('/dashboard/bets/new');
    }
    catch {
      setError('No se pudo conectar para seguir la recomendación.');
    }
    finally {
      setFollowingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6" data-testid="recommendationFeed">
      <header className="rounded-3xl border bg-gradient-to-br from-card via-card to-primary/10 p-6 sm:p-8">
        <Badge variant="secondary">Feed publicado</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Recomendaciones</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Picks normalizados ordenados por publicación. El ICP explica cada propuesta, nunca altera el ranking.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar feed
          </CardTitle>
          <CardDescription>Cambiar filtros reinicia la paginación.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" data-testid="recommendationFilters" onSubmit={applyFilters}>
            <div className="grid gap-2">
              <Label htmlFor="recommendation-type">Momento</Label>
              <select id="recommendation-type" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" value={filters.type} data-testid="recommendation_type_select" onChange={event => setFilters(current => ({ ...current, type: event.target.value as Filters['type'] }))}>
                <option value="">Todos</option>
                <option value="pre">Pre</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recommendation-sport">Deporte</Label>
              <Input id="recommendation-sport" maxLength={100} value={filters.sport} data-testid="recommendation_sport_input" onChange={event => setFilters(current => ({ ...current, sport: event.target.value }))} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="recommendation-league">UUID de liga</Label>
              <Input id="recommendation-league" value={filters.leagueId} data-testid="recommendation_league_input" onChange={event => setFilters(current => ({ ...current, leagueId: event.target.value }))} />
            </div>
            <Button className="self-end" type="submit" disabled={loading} data-testid="apply_recommendation_filters_button">Aplicar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] sm:items-end">
        <div>
          <h2 className="text-xl font-semibold">Picks disponibles</h2>
          <p className="text-sm text-muted-foreground">Seguir solo prepara el formulario. No crea ticket ni reserva fondos.</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="follow-bank">Bank para seguir</Label>
          <select id="follow-bank" className="h-11 rounded-xl border border-input bg-background px-4 text-sm" value={bankId} disabled={banks.length === 0} data-testid="follow_bank_select" onChange={event => setBankId(event.target.value)}>
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
      </div>

      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert" data-testid="recommendation_error">{error}</p> : null}
      {loading
        ? (
            <div className="grid gap-4 lg:grid-cols-2" data-testid="recommendation_loading">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          )
        : null}
      {!loading && recommendations.length === 0 && !error
        ? (
            <Card data-testid="recommendation_empty">
              <CardHeader>
                <CardTitle>Sin coincidencias</CardTitle>
                <CardDescription>No hay recomendaciones publicadas para estos filtros.</CardDescription>
              </CardHeader>
            </Card>
          )
        : null}

      <section className="grid gap-4 lg:grid-cols-2" data-testid="recommendation_list">
        {recommendations.map(recommendation => (
          <Card className="overflow-hidden" key={recommendation.id} data-testid="recommendationCard">
            <CardHeader className="border-b bg-muted/25">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge>{recommendation.type === 'pre' ? 'Pre' : 'Live'}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDate(recommendation.publishedAt)}
                </span>
              </div>
              <CardTitle className="pt-2 text-xl">{recommendation.event.name}</CardTitle>
              <CardDescription>
                {recommendation.event.sport}
                {' '}
                ·
                {' '}
                {recommendation.event.league.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl border bg-background p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{recommendation.market.name}</p>
                  <p className="mt-1 font-semibold">{recommendation.selection}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Cuota</p>
                  <p className="text-2xl font-semibold tabular-nums">{recommendation.odds}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{recommendation.rationale}</p>
              <div className="rounded-2xl bg-primary/8 p-4" data-testid="recommendation_icp">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Target className="h-4 w-4" />
                    ICP v
                    {recommendation.icp.version}
                  </span>
                  <strong className="text-lg">
                    {recommendation.icp.score}
                    /100
                  </strong>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {recommendation.icp.factors.map(factor => (
                    <li key={factor}>
                      ·
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full" disabled={!bankId || followingId !== null} data-testid="follow_recommendation_button" onClick={() => void follow(recommendation.id)}>
                {followingId === recommendation.id ? 'Preparando ticket...' : 'Seguir y revisar ticket'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
      {nextCursor ? <Button className="w-full sm:w-auto" variant="outline" disabled={loadingMore} data-testid="load_more_recommendations_button" onClick={() => void loadRecommendations(appliedFilters, nextCursor)}>{loadingMore ? 'Cargando...' : 'Cargar más'}</Button> : null}
    </main>
  );
}
