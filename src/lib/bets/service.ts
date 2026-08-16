import type { SupabaseClient } from '@supabase/supabase-js';

import type { BetCreateInput } from './schemas';
import type { Database, Json } from '@/types/supabase';
import { BetResultSchema } from './schemas';

type CreateBetRpcArgs = Database['public']['Functions']['create_bet_with_funding']['Args'];

export class BetsServiceError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'BetsServiceError';
  }
}

export const createBet = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  input: BetCreateInput,
  idempotencyKey: string,
) => {
  const args = {
    p_actor_user_id: actorUserId,
    p_bank_id: input.bankId,
    p_odds: input.odds,
    p_stake_type: input.stake.type,
    p_stake_amount: input.stake.type === 'amount' ? input.stake.amount : null,
    p_stake_level: input.stake.type === 'level' ? input.stake.level : null,
    p_legs: input.legs as Json,
    p_funding: input.funding as Json,
    p_idempotency_key: idempotencyKey,
  };

  // Generated RPC types cannot express nullable PostgreSQL function arguments.
  const { data, error } = await supabase.rpc(
    'create_bet_with_funding',
    args as CreateBetRpcArgs,
  );

  if (error) {
    throw new BetsServiceError(error.message, error.code);
  }

  return BetResultSchema.parse(data);
};
