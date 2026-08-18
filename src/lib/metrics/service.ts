import type { SupabaseClient } from '@supabase/supabase-js';

import type { MetricsOverview, MetricsOverviewQuery } from './schemas';
import type { Database } from '@/types/supabase';
import { MetricsOverviewSchema } from './schemas';

interface RpcClient {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: unknown
    error: { message: string, code?: string } | null
  }>
}

export class MetricsServiceError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'MetricsServiceError';
  }
}

export const parseMetricsOverview = (value: unknown): MetricsOverview =>
  MetricsOverviewSchema.parse(value);

export const getMetricsOverview = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  query: MetricsOverviewQuery,
) => {
  const { data, error } = await (supabase as unknown as RpcClient).rpc(
    'get_metrics_overview',
    {
      p_actor_user_id: actorUserId,
      p_bank_id: query.bankId,
      p_from: query.from,
      p_to: query.to,
    },
  );

  if (error) {
    throw new MetricsServiceError(error.message, error.code);
  }

  return parseMetricsOverview(data);
};
