import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { describe, expect, test } from 'bun:test';

import {
  CatalogServiceError,
  createCatalogAlias,
  createManualCatalogItem,
  listActiveCatalogMarkets,
  listCatalogEvents,
  searchCatalog,
  upsertCatalogItem,
} from './service';

const actorUserId = '550e8400-e29b-41d4-a716-446655440000';
const itemId = '550e8400-e29b-41d4-a716-446655440001';
const aliasId = '550e8400-e29b-41d4-a716-446655440002';

const clientWithRpc = (
  rpc: (name: string, args: unknown) => Promise<{ data: unknown, error: unknown }>,
) => ({ rpc }) as unknown as SupabaseClient<Database>;

const eventId = '550e8400-e29b-41d4-a716-446655440003';
const marketId = '550e8400-e29b-41d4-a716-446655440004';

const clientWithEvents = (data: unknown) => ({
  from: (table: string) => {
    expect(table).toBe('catalog_events');
    return {
      select: () => ({
        in: (column: string, values: string[]) => {
          expect(column).toBe('status');
          expect(values).toEqual(['scheduled', 'live']);
          return {
            order: () => ({
              order: () => ({
                range: async () => ({ data, error: null }),
              }),
            }),
          };
        },
      }),
    };
  },
}) as unknown as SupabaseClient<Database>;

const clientWithMarkets = (data: unknown, event: { id: string } | null = { id: eventId }) => ({
  from: (table: string) => {
    if (table === 'catalog_events') {
      return {
        select: () => ({
          eq: () => ({
            in: () => ({
              maybeSingle: async () => ({ data: event, error: null }),
            }),
          }),
        }),
      };
    }
    expect(table).toBe('catalog_markets');
    return {
      select: () => ({
        eq: (column: string, value: string) => {
          expect(column).toBe('event_id');
          expect(value).toBe(eventId);
          return {
            eq: (statusColumn: string, status: string) => {
              expect(statusColumn).toBe('status');
              expect(status).toBe('active');
              return {
                order: () => ({
                  order: async () => ({ data, error: null }),
                }),
              };
            },
          };
        },
      }),
    };
  },
}) as unknown as SupabaseClient<Database>;

describe('catalog RPC services', () => {
  test('lists only normalized scheduled or live events matching the search', async () => {
    const result = await listCatalogEvents(clientWithEvents([
      {
        id: eventId,
        starts_at: '2026-08-20T18:00:00.000Z',
        status: 'scheduled',
        catalog_competitions: { id: itemId, name: 'La Liga', sport: 'football', normalization_status: 'normalized' },
        catalog_teams: { id: itemId, name: 'Barcelona', normalization_status: 'normalized' },
        catalog_teams_away: { id: aliasId, name: 'Valencia', normalization_status: 'normalized' },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        starts_at: '2026-08-20T20:00:00.000Z',
        status: 'live',
        catalog_competitions: { id: itemId, name: 'La Liga', sport: 'football', normalization_status: 'manual' },
        catalog_teams: { id: itemId, name: 'Barcelona', normalization_status: 'normalized' },
        catalog_teams_away: { id: aliasId, name: 'Valencia', normalization_status: 'normalized' },
      },
    ]), { q: 'barc', limit: 25, offset: 0 });

    expect(result.events).toEqual([expect.objectContaining({
      id: eventId,
      name: 'Barcelona vs. Valencia',
      status: 'scheduled',
    })]);
  });

  test('lists active markets scoped to the selected event', async () => {
    const result = await listActiveCatalogMarkets(clientWithMarkets([
      { id: marketId, event_id: eventId, name: 'Match winner' },
    ]), eventId);

    expect(result.markets).toEqual([{ id: marketId, eventId, name: 'Match winner' }]);
  });

  test('rejects markets lookup for a missing event', async () => {
    expect(listActiveCatalogMarkets(clientWithMarkets([], null), eventId)).rejects.toMatchObject({
      code: 'CATALOG_ITEM_NOT_FOUND',
    });
  });

  test('uses the extra row only to determine the next event page', async () => {
    const result = await listCatalogEvents(clientWithEvents([
      {
        id: eventId,
        starts_at: '2026-08-20T18:00:00.000Z',
        status: 'scheduled',
        catalog_competitions: { id: itemId, name: 'La Liga', sport: 'football', normalization_status: 'normalized' },
        catalog_teams: { id: itemId, name: 'Barcelona', normalization_status: 'normalized' },
        catalog_teams_away: { id: aliasId, name: 'Valencia', normalization_status: 'normalized' },
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        starts_at: '2026-08-20T20:00:00.000Z',
        status: 'scheduled',
        catalog_competitions: { id: itemId, name: 'La Liga', sport: 'football', normalization_status: 'normalized' },
        catalog_teams: { id: itemId, name: 'Madrid', normalization_status: 'normalized' },
        catalog_teams_away: { id: aliasId, name: 'Sevilla', normalization_status: 'normalized' },
      },
    ]), { limit: 1, offset: 0 });

    expect(result.events).toHaveLength(1);
    expect(result.nextOffset).toBe(1);
  });

  test('calls search_catalog and validates its response', async () => {
    const client = clientWithRpc(async (name, args) => {
      expect(name).toBe('search_catalog');
      expect(args).toEqual({
        p_entity_type: 'team',
        p_query: 'bar',
        p_limit: 10,
        p_offset: 0,
      });
      return {
        data: {
          success: true,
          items: [{
            id: itemId,
            type: 'team',
            name: 'Barcelona',
            country: 'ES',
            sport: null,
            normalizationStatus: 'normalized',
            isNormalized: true,
            matchedBy: 'name',
          }],
          nextOffset: null,
        },
        error: null,
      };
    });

    const result = await searchCatalog(client, 'team', {
      q: 'bar',
      limit: 10,
      offset: 0,
    });
    expect(result.items[0]?.name).toBe('Barcelona');
  });

  test('clamps nextOffset at the public pagination boundary', async () => {
    const client = clientWithRpc(async () => ({
      data: {
        success: true,
        items: [],
        nextOffset: 10025,
      },
      error: null,
    }));

    const result = await searchCatalog(client, 'team', {
      q: 'bar',
      limit: 25,
      offset: 10000,
    });
    expect(result.nextOffset).toBeNull();
  });

  test('creates manual competitions without a sport argument', async () => {
    const client = clientWithRpc(async (name, args) => {
      expect(name).toBe('create_manual_catalog_item');
      expect(args).toEqual({
        p_actor_user_id: actorUserId,
        p_entity_type: 'competition',
        p_name: 'Liga Profesional',
        p_country: undefined,
      });
      return {
        data: {
          success: true,
          item: {
            id: itemId,
            type: 'competition',
            name: 'Liga Profesional',
            country: null,
            sport: null,
            normalizationStatus: 'manual',
            isNormalized: false,
            matchedBy: 'manual',
          },
        },
        error: null,
      };
    });

    const result = await createManualCatalogItem(client, actorUserId, {
      type: 'competition',
      rawText: 'Liga Profesional',
    });
    expect(result.item.sport).toBeNull();
    expect(result.item.isNormalized).toBe(false);
  });

  test('rejects malformed RPC JSON as an internal service error', async () => {
    const client = clientWithRpc(async () => ({ data: { success: true }, error: null }));

    expect(
      searchCatalog(client, 'team', { q: 'bar', limit: 10, offset: 0 }),
    )
      .rejects
      .toMatchObject({ code: 'INTERNAL_ERROR' });
  });

  test('maps provider unique violations without exposing database messages', async () => {
    const client = clientWithRpc(async () => ({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    }));

    try {
      await upsertCatalogItem(client, actorUserId, 'team', null, {
        name: 'Barcelona',
        provider: 'opta',
        externalId: 'OPTA-1',
      });
      throw new Error('Expected upsertCatalogItem to fail');
    }
    catch (error) {
      expect(error).toBeInstanceOf(CatalogServiceError);
      expect(error).toMatchObject({ code: 'CATALOG_PROVIDER_CONFLICT' });
      expect((error as Error).message).not.toContain('duplicate key');
    }
  });

  test('sends alias through the atomic admin RPC', async () => {
    const client = clientWithRpc(async (name, args) => {
      expect(name).toBe('upsert_catalog_item_with_alias');
      expect(args).toMatchObject({ p_alias: 'Barça' });
      return {
        data: {
          success: true,
          created: true,
          item: {
            id: itemId,
            type: 'team',
            name: 'Barcelona',
            country: null,
            sport: null,
            provider: null,
            externalId: null,
            normalizationStatus: 'normalized',
            isNormalized: true,
          },
        },
        error: null,
      };
    });

    const result = await upsertCatalogItem(client, actorUserId, 'team', null, {
      name: 'Barcelona',
      alias: 'Barça',
    });
    expect(result.created).toBe(true);
  });

  test('maps duplicate aliases to CATALOG_ALIAS_CONFLICT', async () => {
    const client = clientWithRpc(async () => ({
      data: null,
      error: { code: '23505', message: 'CATALOG_ALIAS_CONFLICT' },
    }));

    expect(
      createCatalogAlias(client, actorUserId, 'team', itemId, { alias: 'Barca' }),
    )
      .rejects
      .toMatchObject({ code: 'CATALOG_ALIAS_CONFLICT' });
  });

  test('maps expired authentication from RPCs', async () => {
    const client = clientWithRpc(async () => ({
      data: null,
      error: { code: '28000', message: 'AUTHENTICATION_REQUIRED' },
    }));

    expect(
      createManualCatalogItem(client, actorUserId, {
        type: 'team',
        rawText: 'Barcelona',
      }),
    )
      .rejects
      .toMatchObject({ code: 'AUTHENTICATION_REQUIRED' });
  });

  test('maps revoked catalog editor permissions', async () => {
    const client = clientWithRpc(async () => ({
      data: null,
      error: { code: '42501', message: 'CATALOG_EDITOR_REQUIRED' },
    }));

    expect(
      upsertCatalogItem(client, actorUserId, 'team', null, { name: 'Barcelona' }),
    )
      .rejects
      .toMatchObject({ code: 'CATALOG_EDITOR_REQUIRED' });
  });

  test('validates alias RPC responses', async () => {
    const client = clientWithRpc(async () => ({
      data: {
        success: true,
        alias: { id: aliasId, alias: 'Barca', normalizedAlias: 'barca' },
      },
      error: null,
    }));

    const result = await createCatalogAlias(
      client,
      actorUserId,
      'team',
      itemId,
      { alias: 'Barca' },
    );
    expect(result.alias.normalizedAlias).toBe('barca');
  });
});
