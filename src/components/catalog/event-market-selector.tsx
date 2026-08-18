'use client';

import type { z } from 'zod';

import { RefreshCw } from 'lucide-react';
import { useDeferredValue, useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CatalogEventListResponseSchema,
  CatalogMarketListResponseSchema,
} from '@/lib/catalog/schemas';

type CatalogEvent = z.infer<typeof CatalogEventListResponseSchema>['events'][number];
type CatalogMarket = z.infer<typeof CatalogMarketListResponseSchema>['markets'][number];

interface CatalogEventMarketSelectorProps {
  eventId: string
  marketId: string
  disabled?: boolean
  onChange: (reference: { eventId: string, marketId: string }) => void
  eventTestId?: string
  marketTestId?: string
}

const eventLabel = (event: CatalogEvent) =>
  `${event.name} · ${event.competition.name} · ${new Date(event.startsAt).toLocaleString()}`;

export function CatalogEventMarketSelector({
  eventId,
  marketId,
  disabled = false,
  onChange,
  eventTestId = 'catalog_event_select',
  marketTestId = 'catalog_market_select',
}: CatalogEventMarketSelectorProps) {
  const instanceId = useId();
  const searchId = `${instanceId}-event-search`;
  const eventSelectId = `${instanceId}-event`;
  const marketSelectId = `${instanceId}-market`;
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [events, setEvents] = useState<CatalogEvent[]>([]);
  const [markets, setMarkets] = useState<CatalogMarket[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [marketsLoading, setMarketsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [marketsError, setMarketsError] = useState('');
  const [eventsRetry, setEventsRetry] = useState(0);
  const [marketsRetry, setMarketsRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadEvents = async () => {
      setEventsLoading(true);
      setEventsError('');
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (deferredQuery.trim().length >= 2) { params.set('q', deferredQuery.trim()); }
        const response = await fetch(`/api/catalog/events?${params}`, {
          credentials: 'same-origin',
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        const parsed = CatalogEventListResponseSchema.safeParse(payload);
        if (!response.ok || !parsed.success) {
          throw new Error('catalog-events-request-failed');
        }
        if (!controller.signal.aborted) { setEvents(parsed.data.events); }
      }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') { return; }
        setEventsError('No se han podido cargar los eventos normalizados.');
      }
      finally {
        if (!controller.signal.aborted) { setEventsLoading(false); }
      }
    };

    void loadEvents();
    return () => controller.abort();
  }, [deferredQuery, eventsRetry]);

  useEffect(() => {
    if (!eventId) {
      setMarkets([]);
      setMarketsError('');
      setMarketsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadMarkets = async () => {
      setMarketsLoading(true);
      setMarketsError('');
      try {
        const response = await fetch(`/api/catalog/events/${eventId}/markets`, {
          credentials: 'same-origin',
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        const parsed = CatalogMarketListResponseSchema.safeParse(payload);
        if (!response.ok || !parsed.success) {
          throw new Error('catalog-markets-request-failed');
        }
        if (!controller.signal.aborted) { setMarkets(parsed.data.markets); }
      }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') { return; }
        setMarketsError('No se han podido cargar los mercados activos.');
      }
      finally {
        if (!controller.signal.aborted) { setMarketsLoading(false); }
      }
    };

    void loadMarkets();
    return () => controller.abort();
  }, [eventId, marketsRetry]);

  return (
    <section className="grid gap-4 sm:col-span-2" data-testid="catalogEventMarketSelector">
      <div className="grid gap-2">
        <Label htmlFor={searchId}>Buscar evento normalizado</Label>
        <Input
          id={searchId}
          data-testid="catalog_event_search_input"
          disabled={disabled}
          maxLength={100}
          placeholder="Equipos, competición o deporte"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={eventSelectId}>Evento</Label>
        <select
          id={eventSelectId}
          className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          data-testid={eventTestId}
          disabled={disabled || eventsLoading || Boolean(eventsError)}
          value={eventId}
          onChange={event => onChange({ eventId: event.target.value, marketId: '' })}
        >
          <option value="">
            {eventsLoading ? 'Cargando eventos...' : 'Selecciona un evento'}
          </option>
          {events.map(event => <option key={event.id} value={event.id}>{eventLabel(event)}</option>)}
        </select>
        {eventsError
          ? (
              <div className="flex items-center gap-2 text-sm text-destructive" role="alert" data-testid="catalog_events_error">
                <span>{eventsError}</span>
                <Button type="button" size="sm" variant="outline" data-testid="retry_catalog_events_button" onClick={() => setEventsRetry(value => value + 1)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            )
          : null}
        {!eventsLoading && !eventsError && events.length === 0
          ? <p className="text-sm text-muted-foreground" data-testid="catalog_events_empty">No hay eventos normalizados scheduled o live.</p>
          : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={marketSelectId}>Mercado</Label>
        <select
          id={marketSelectId}
          className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
          data-testid={marketTestId}
          disabled={disabled || !eventId || marketsLoading || Boolean(marketsError)}
          value={marketId}
          onChange={event => onChange({ eventId, marketId: event.target.value })}
        >
          <option value="">
            {marketsLoading ? 'Cargando mercados...' : 'Selecciona un mercado'}
          </option>
          {markets.map(market => <option key={market.id} value={market.id}>{market.name}</option>)}
        </select>
        {marketsError
          ? (
              <div className="flex items-center gap-2 text-sm text-destructive" role="alert" data-testid="catalog_markets_error">
                <span>{marketsError}</span>
                <Button type="button" size="sm" variant="outline" data-testid="retry_catalog_markets_button" onClick={() => setMarketsRetry(value => value + 1)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
              </div>
            )
          : null}
        {!marketsLoading && eventId && !marketsError && markets.length === 0
          ? <p className="text-sm text-muted-foreground" data-testid="catalog_markets_empty">No hay mercados activos para este evento.</p>
          : null}
      </div>
    </section>
  );
}
