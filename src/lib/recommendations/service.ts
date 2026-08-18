import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  Recommendation,
  RecommendationAdminQuery,
  RecommendationCreateInput,
  RecommendationFeedQuery,
  RecommendationUpdateInput,
} from './schemas';
import type { Database } from '@/types/supabase';
import { z } from '@/lib/openapi/registry';
import {
  decodeRecommendationCursor,
  encodeRecommendationCursor,
  RecommendationIcpSchema,
  RecommendationPrefillSchema,
  RecommendationSchema,
} from './schemas';

type RecommendationServiceErrorCode
  = | 'AUTHENTICATION_REQUIRED'
    | 'RECOMMENDATION_EDITOR_REQUIRED'
    | 'RECOMMENDATION_NOT_FOUND'
    | 'RECOMMENDATION_NOT_PUBLISHED'
    | 'RECOMMENDATION_INACTIVE'
    | 'RECOMMENDATION_INACTIVE_TERMINAL'
    | 'RECOMMENDATION_STATUS_TRANSITION_INVALID'
    | 'RECOMMENDATION_PREFILL_INVALID'
    | 'CATALOG_REFERENCE_NOT_NORMALIZED'
    | 'EVENT_NOT_FOUND'
    | 'EVENT_NOT_NORMALIZED'
    | 'MARKET_NOT_FOUND'
    | 'MARKET_EVENT_MISMATCH'
    | 'MARKET_NOT_ACTIVE'
    | 'BANK_NOT_FOUND'
    | 'BANK_OWNERSHIP_REQUIRED'
    | 'PROFILE_NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR';

export class RecommendationsServiceError extends Error {
  constructor(readonly code: RecommendationServiceErrorCode, readonly databaseCode?: string) {
    super(code);
    this.name = 'RecommendationsServiceError';
  }
}

interface RpcClient {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{
    data: unknown
    error: { code?: string, message?: string } | null
  }>
}

const rpcClient = (supabase: SupabaseClient<Database>) => supabase as unknown as RpcClient;

const RawRecommendationSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  market_id: z.string().uuid(),
  selection: z.string(),
  odds: z.coerce.number(),
  type: z.enum(['pre', 'live']),
  status: z.enum(['draft', 'published', 'inactive']),
  rationale: z.string().nullable(),
  icp: z.unknown(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  event: z.object({
    id: z.string().uuid(),
    starts_at: z.string(),
    status: z.enum(['scheduled', 'live', 'finished', 'cancelled']),
    competition: z.object({
      id: z.string().uuid(),
      name: z.string(),
      sport: z.string(),
      normalization_status: z.enum(['normalized', 'manual', 'pending', 'deprecated']),
    }),
    home_team: z.object({ id: z.string().uuid(), name: z.string(), normalization_status: z.enum(['normalized', 'manual', 'pending', 'deprecated']) }),
    away_team: z.object({ id: z.string().uuid(), name: z.string(), normalization_status: z.enum(['normalized', 'manual', 'pending', 'deprecated']) }),
  }),
  market: z.object({
    id: z.string().uuid(),
    event_id: z.string().uuid(),
    name: z.string(),
    status: z.enum(['active', 'settled', 'void']),
  }),
}).strict();

const recommendationSelect = `
  id, event_id, market_id, selection, odds, type, status, rationale, icp,
  published_at, created_at, updated_at,
  event:catalog_events!inner(
    id, starts_at, status,
    competition:catalog_competitions!inner(id, name, sport, normalization_status),
    home_team:catalog_teams!catalog_events_home_team_id_fkey(id, name, normalization_status),
    away_team:catalog_teams!catalog_events_away_team_id_fkey(id, name, normalization_status)
  ),
  market:catalog_markets!inner(id, event_id, name, status)
`;

const mapRecommendation = (value: unknown): Recommendation => {
  const raw = RawRecommendationSchema.parse(value);
  if (raw.market.event_id !== raw.event_id) {
    throw new RecommendationsServiceError('INTERNAL_ERROR');
  }

  const parsedIcp = RecommendationIcpSchema.safeParse(raw.icp);
  if (!parsedIcp.success && raw.status !== 'inactive') {
    throw new RecommendationsServiceError('INTERNAL_ERROR');
  }

  return RecommendationSchema.parse({
    id: raw.id,
    event: {
      id: raw.event.id,
      name: `${raw.event.home_team.name} vs ${raw.event.away_team.name}`,
      startsAt: raw.event.starts_at,
      status: raw.event.status,
      homeTeam: { id: raw.event.home_team.id, name: raw.event.home_team.name },
      awayTeam: { id: raw.event.away_team.id, name: raw.event.away_team.name },
      sport: raw.event.competition.sport,
      league: { id: raw.event.competition.id, name: raw.event.competition.name },
    },
    market: { id: raw.market.id, name: raw.market.name },
    selection: raw.selection,
    odds: raw.odds,
    type: raw.type,
    rationale: raw.rationale ?? '',
    icp: parsedIcp.success
      ? parsedIcp.data
      : { version: 1, score: 0, factors: ['Legacy recommendation without ICP v1'] },
    status: raw.status,
    publishedAt: raw.published_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  });
};

const mapRpcError = (error: { code?: string, message?: string }) => {
  const knownCodes: RecommendationServiceErrorCode[] = [
    'AUTHENTICATION_REQUIRED',
    'RECOMMENDATION_EDITOR_REQUIRED',
    'RECOMMENDATION_NOT_FOUND',
    'RECOMMENDATION_NOT_PUBLISHED',
    'RECOMMENDATION_INACTIVE',
    'RECOMMENDATION_INACTIVE_TERMINAL',
    'RECOMMENDATION_STATUS_TRANSITION_INVALID',
    'RECOMMENDATION_PREFILL_INVALID',
    'CATALOG_REFERENCE_NOT_NORMALIZED',
    'EVENT_NOT_FOUND',
    'EVENT_NOT_NORMALIZED',
    'MARKET_NOT_FOUND',
    'MARKET_EVENT_MISMATCH',
    'MARKET_NOT_ACTIVE',
    'BANK_NOT_FOUND',
    'BANK_OWNERSHIP_REQUIRED',
    'PROFILE_NOT_FOUND',
    'VALIDATION_ERROR',
  ];
  if (error.message && knownCodes.includes(error.message as RecommendationServiceErrorCode)) {
    return new RecommendationsServiceError(error.message as RecommendationServiceErrorCode, error.code);
  }
  if (error.code === '28000') { return new RecommendationsServiceError('AUTHENTICATION_REQUIRED', error.code); }
  if (error.code === '42501') { return new RecommendationsServiceError('RECOMMENDATION_EDITOR_REQUIRED', error.code); }
  if (error.code === '22023') { return new RecommendationsServiceError('VALIDATION_ERROR', error.code); }
  return new RecommendationsServiceError('INTERNAL_ERROR', error.code);
};

const callRpc = async (supabase: SupabaseClient<Database>, name: string, args: Record<string, unknown>) => {
  const { data, error } = await rpcClient(supabase).rpc(name, args);
  if (error) { throw mapRpcError(error); }
  return data;
};

export const listRecommendations = async (
  supabase: SupabaseClient<Database>,
  query: RecommendationFeedQuery,
) => {
  let request = supabase
    .from('recommendations')
    .select(recommendationSelect)
    .eq('status', 'published')
    .eq('event.competition.normalization_status', 'normalized')
    .eq('event.home_team.normalization_status', 'normalized')
    .eq('event.away_team.normalization_status', 'normalized')
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(query.limit + 1);

  if (query.type) { request = request.eq('type', query.type); }
  if (query.sport) { request = request.eq('event.competition.sport', query.sport); }
  if (query.leagueId) { request = request.eq('event.competition.id', query.leagueId); }
  if (query.cursor) {
    const cursor = decodeRecommendationCursor(query.cursor);
    request = request.or(`published_at.lt.${cursor.publishedAt},and(published_at.eq.${cursor.publishedAt},id.lt.${cursor.id})`);
  }

  const { data, error } = await request;
  if (error) { throw new RecommendationsServiceError('INTERNAL_ERROR', error.code); }
  const rows = z.array(z.unknown()).parse(data);
  const recommendations = rows.slice(0, query.limit).map(mapRecommendation);
  const last = recommendations.at(-1);
  return {
    recommendations,
    nextCursor: rows.length > query.limit && last?.publishedAt
      ? encodeRecommendationCursor({ publishedAt: last.publishedAt, id: last.id })
      : null,
  };
};

export const listAdminRecommendations = async (
  supabase: SupabaseClient<Database>,
  query: RecommendationAdminQuery,
) => {
  let request = supabase
    .from('recommendations')
    .select(recommendationSelect)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .range(query.offset, query.offset + query.limit);
  if (query.status) { request = request.eq('status', query.status); }
  if (query.type) { request = request.eq('type', query.type); }

  const { data, error } = await request;
  if (error) { throw new RecommendationsServiceError('INTERNAL_ERROR', error.code); }
  const rows = z.array(z.unknown()).parse(data);
  return {
    recommendations: rows.slice(0, query.limit).map(mapRecommendation),
    nextOffset: rows.length > query.limit ? query.offset + query.limit : null,
  };
};

export const getRecommendation = async (supabase: SupabaseClient<Database>, recommendationId: string) => {
  const { data, error } = await supabase
    .from('recommendations')
    .select(recommendationSelect)
    .eq('id', recommendationId)
    .maybeSingle();
  if (error) { throw new RecommendationsServiceError('INTERNAL_ERROR', error.code); }
  return data ? mapRecommendation(data) : null;
};

export const createRecommendation = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  input: RecommendationCreateInput,
) => {
  const result = z.object({ recommendationId: z.string().uuid() }).passthrough().parse(
    await callRpc(supabase, 'create_recommendation', {
      p_actor_user_id: actorUserId,
      p_event_id: input.eventId,
      p_market_id: input.marketId,
      p_selection: input.selection,
      p_odds: input.odds,
      p_type: input.type,
      p_rationale: input.rationale,
      p_icp: input.icp,
    }),
  );
  return result;
};

export const updateRecommendation = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  recommendationId: string,
  input: RecommendationUpdateInput,
) => callRpc(supabase, 'update_recommendation', {
  p_actor_user_id: actorUserId,
  p_recommendation_id: recommendationId,
  p_event_id: input.eventId ?? null,
  p_market_id: input.marketId ?? null,
  p_selection: input.selection ?? null,
  p_odds: input.odds ?? null,
  p_type: input.type ?? null,
  p_rationale: input.rationale ?? null,
  p_icp: input.icp ?? null,
  p_status: input.status ?? null,
});

const FollowRpcResultSchema = z.object({
  followId: z.string().uuid(),
  created: z.boolean(),
  createdAt: z.string(),
  recommendationId: z.string().uuid(),
  bankId: z.string().uuid(),
  prefill: RecommendationPrefillSchema,
}).passthrough();

export const followRecommendation = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  recommendationId: string,
  bankId: string,
) => FollowRpcResultSchema.parse(await callRpc(supabase, 'follow_recommendation', {
  p_actor_user_id: actorUserId,
  p_recommendation_id: recommendationId,
  p_bank_id: bankId,
}));

export const getRecommendationFollow = async (
  supabase: SupabaseClient<Database>,
  followId: string,
) => {
  const { data, error } = await supabase
    .from('recommendation_follows')
    .select('id, recommendation_id, bank_id, created_at')
    .eq('id', followId)
    .maybeSingle();
  if (error) { throw new RecommendationsServiceError('INTERNAL_ERROR', error.code); }
  return data
    ? z.object({
        id: z.string().uuid(),
        recommendation_id: z.string().uuid(),
        bank_id: z.string().uuid(),
        created_at: z.string(),
      }).parse(data)
    : null;
};

export const buildRecommendationPrefill = (recommendation: Recommendation, bankId: string) =>
  RecommendationPrefillSchema.parse({
    recommendationId: recommendation.id,
    bankId,
    odds: recommendation.odds,
    legs: [{
      referenceType: 'normalized',
      eventId: recommendation.event.id,
      marketId: recommendation.market.id,
      selection: recommendation.selection,
      odds: recommendation.odds,
    }],
  });
