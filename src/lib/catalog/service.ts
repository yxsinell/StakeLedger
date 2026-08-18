import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  CatalogAdminInput,
  CatalogAdminListQuery,
  CatalogAliasInput,
  CatalogEntityType,
  CatalogEventListQuery,
  CatalogManualInput,
  CatalogSearchQuery,
} from './schemas';
import type { Database } from '@/types/supabase';
import {
  CatalogAdminListResponseSchema,
  CatalogAdminMutationResponseSchema,
  CatalogAliasResponseSchema,
  CatalogEventListResponseSchema,
  CatalogItemResponseSchema,
  CatalogListResponseSchema,
  CatalogMarketListResponseSchema,
} from './schemas';

type CatalogServiceErrorCode
  = | 'AUTHENTICATION_REQUIRED'
    | 'CATALOG_ALIAS_CONFLICT'
    | 'CATALOG_EDITOR_REQUIRED'
    | 'CATALOG_ITEM_NOT_FOUND'
    | 'CATALOG_PROVIDER_CONFLICT'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR';

type CatalogAliasRow = Pick<
  Database['public']['Tables']['catalog_aliases']['Row'],
  'id' | 'alias' | 'normalized_alias'
>;
type CatalogTeamRow = Database['public']['Tables']['catalog_teams']['Row'] & {
  catalog_aliases: CatalogAliasRow[]
};
type CatalogCompetitionRow = Database['public']['Tables']['catalog_competitions']['Row'] & {
  catalog_aliases: CatalogAliasRow[]
};
interface CatalogEventRow {
  id: string
  starts_at: string
  status: string
  catalog_competitions: { id: string, name: string, sport: string | null, normalization_status: string } | null
  catalog_teams: { id: string, name: string, normalization_status: string } | null
  catalog_teams_away: { id: string, name: string, normalization_status: string } | null
}

export class CatalogServiceError extends Error {
  constructor(
    readonly code: CatalogServiceErrorCode,
    readonly databaseCode?: string,
  ) {
    super(code);
    this.name = 'CatalogServiceError';
  }
}

const mapRpcError = (
  error: { code?: string, message?: string },
  operation: 'read' | 'upsert' | 'alias',
) => {
  if (error.message === 'AUTHENTICATION_REQUIRED' || error.code === '28000') {
    return new CatalogServiceError('AUTHENTICATION_REQUIRED', error.code);
  }

  if (error.message === 'CATALOG_EDITOR_REQUIRED' || error.code === '42501') {
    return new CatalogServiceError('CATALOG_EDITOR_REQUIRED', error.code);
  }

  if (error.message === 'CATALOG_ITEM_NOT_FOUND') {
    return new CatalogServiceError('CATALOG_ITEM_NOT_FOUND', error.code);
  }

  if (error.message === 'CATALOG_ALIAS_CONFLICT') {
    return new CatalogServiceError('CATALOG_ALIAS_CONFLICT', error.code);
  }

  if (error.message === 'VALIDATION_ERROR' || error.code === '22023') {
    return new CatalogServiceError('VALIDATION_ERROR', error.code);
  }

  if (error.code === '23505') {
    return new CatalogServiceError(
      operation === 'alias' ? 'CATALOG_ALIAS_CONFLICT' : 'CATALOG_PROVIDER_CONFLICT',
      error.code,
    );
  }

  return new CatalogServiceError('INTERNAL_ERROR', error.code);
};

const parseRpcResponse = <T>(schema: { parse: (value: unknown) => T }, data: unknown): T => {
  try {
    return schema.parse(data);
  }
  catch {
    throw new CatalogServiceError('INTERNAL_ERROR');
  }
};

export const searchCatalog = async (
  supabase: SupabaseClient<Database>,
  entityType: CatalogEntityType,
  query: CatalogSearchQuery,
) => {
  const { data, error } = await supabase.rpc('search_catalog', {
    p_entity_type: entityType,
    p_query: query.q,
    p_limit: query.limit,
    p_offset: query.offset,
  });

  if (error) {
    throw mapRpcError(error, 'read');
  }

  const result = parseRpcResponse(CatalogListResponseSchema, data);
  return {
    ...result,
    nextOffset: result.nextOffset !== null && result.nextOffset <= 10000
      ? result.nextOffset
      : null,
  };
};

export const listCatalogEvents = async (
  supabase: SupabaseClient<Database>,
  query: CatalogEventListQuery,
) => {
  const { data, error } = await supabase
    .from('catalog_events')
    .select('id, starts_at, status, catalog_competitions!catalog_events_competition_id_fkey(id, name, sport, normalization_status), catalog_teams!catalog_events_home_team_id_fkey(id, name, normalization_status), catalog_teams_away:catalog_teams!catalog_events_away_team_id_fkey(id, name, normalization_status)')
    .in('status', ['scheduled', 'live'])
    .order('starts_at', { ascending: true })
    .order('id', { ascending: true })
    .range(query.offset, query.offset + query.limit);

  if (error) {
    throw new CatalogServiceError('INTERNAL_ERROR', error.code);
  }

  const rows = (data ?? []) as unknown as CatalogEventRow[];
  const normalizedEvents = rows.flatMap((row) => {
    const competition = row.catalog_competitions;
    const homeTeam = row.catalog_teams;
    const awayTeam = row.catalog_teams_away;
    const sport = competition?.sport?.trim();
    if (
      !competition
      || !homeTeam
      || !awayTeam
      || competition.normalization_status !== 'normalized'
      || homeTeam.normalization_status !== 'normalized'
      || awayTeam.normalization_status !== 'normalized'
      || !sport
    ) {
      return [];
    }

    const event = {
      id: row.id,
      name: `${homeTeam.name} vs. ${awayTeam.name}`,
      startsAt: row.starts_at,
      status: row.status,
      sport,
      competition: { id: competition.id, name: competition.name },
      homeTeam: { id: homeTeam.id, name: homeTeam.name },
      awayTeam: { id: awayTeam.id, name: awayTeam.name },
    };
    const searchable = `${event.name} ${event.competition.name} ${event.sport}`.toLowerCase();
    return !query.q || searchable.includes(query.q.toLowerCase()) ? [event] : [];
  });

  return parseRpcResponse(CatalogEventListResponseSchema, {
    success: true,
    events: normalizedEvents.slice(0, query.limit),
    nextOffset: rows.length > query.limit && query.offset + query.limit <= 10000
      ? query.offset + query.limit
      : null,
  });
};

export const listActiveCatalogMarkets = async (
  supabase: SupabaseClient<Database>,
  eventId: string,
) => {
  const { data, error } = await supabase
    .from('catalog_markets')
    .select('id, event_id, name')
    .eq('event_id', eventId)
    .eq('status', 'active')
    .order('normalized_name', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw new CatalogServiceError('INTERNAL_ERROR', error.code);
  }

  return parseRpcResponse(CatalogMarketListResponseSchema, {
    success: true,
    markets: (data ?? []).map(market => ({
      id: market.id,
      eventId: market.event_id,
      name: market.name,
    })),
  });
};

export const createManualCatalogItem = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  input: CatalogManualInput,
) => {
  const { data, error } = await supabase.rpc('create_manual_catalog_item', {
    p_actor_user_id: actorUserId,
    p_entity_type: input.type,
    p_name: input.rawText,
    p_country: input.country,
  });

  if (error) {
    throw mapRpcError(error, 'read');
  }

  return parseRpcResponse(CatalogItemResponseSchema, data);
};

const mapAliases = (aliases: CatalogAliasRow[]) => aliases.map(alias => ({
  id: alias.id,
  alias: alias.alias,
  normalizedAlias: alias.normalized_alias ?? alias.alias.toLowerCase(),
}));

export const listAdminCatalog = async (
  supabase: SupabaseClient<Database>,
  entityType: CatalogEntityType,
  query: CatalogAdminListQuery,
) => {
  const table = entityType === 'team' ? 'catalog_teams' : 'catalog_competitions';
  let request = supabase
    .from(table)
    .select('*, catalog_aliases(id, alias, normalized_alias)')
    .order('updated_at', { ascending: false })
    .order('id', { ascending: true })
    .range(query.offset, query.offset + query.limit);

  if (query.q) {
    request = request.ilike('normalized_name', `${query.q.toLowerCase()}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw new CatalogServiceError('INTERNAL_ERROR', error.code);
  }

  const rows = data as unknown as (CatalogTeamRow | CatalogCompetitionRow)[];
  const hasNext = rows.length > query.limit;
  const items = rows.slice(0, query.limit).map(row => ({
    id: row.id,
    type: entityType,
    name: row.name,
    country: row.country,
    sport: entityType === 'competition' ? (row as CatalogCompetitionRow).sport : null,
    provider: row.provider,
    externalId: row.external_id,
    normalizationStatus: row.normalization_status,
    isNormalized: row.normalization_status === 'normalized',
    aliases: mapAliases(row.catalog_aliases),
  }));

  return parseRpcResponse(CatalogAdminListResponseSchema, {
    success: true,
    items,
    nextOffset: hasNext && query.offset + query.limit <= 10000
      ? query.offset + query.limit
      : null,
  });
};

export const upsertCatalogItem = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  entityType: CatalogEntityType,
  itemId: string | null,
  input: CatalogAdminInput,
) => {
  const sport = entityType === 'competition' && 'sport' in input ? input.sport : undefined;
  const { data, error } = await supabase.rpc('upsert_catalog_item_with_alias', {
    p_actor_user_id: actorUserId,
    p_entity_type: entityType,
    p_item_id: itemId ?? (null as unknown as string),
    p_name: input.name,
    p_sport: sport,
    p_country: input.country,
    p_provider: input.provider,
    p_external_id: input.externalId,
    p_alias: input.alias,
  });

  if (error) {
    throw mapRpcError(error, 'upsert');
  }

  return parseRpcResponse(CatalogAdminMutationResponseSchema, data);
};

export const createCatalogAlias = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  entityType: CatalogEntityType,
  itemId: string,
  input: CatalogAliasInput,
) => {
  const { data, error } = await supabase.rpc('create_catalog_alias', {
    p_actor_user_id: actorUserId,
    p_entity_type: entityType,
    p_item_id: itemId,
    p_alias: input.alias,
  });

  if (error) {
    throw mapRpcError(error, 'alias');
  }

  return parseRpcResponse(CatalogAliasResponseSchema, data);
};
