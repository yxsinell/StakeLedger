import type { SupabaseClient } from '@supabase/supabase-js';

import type { BetCashoutInput, BetCreateInput, BetSettleInput, BetView } from './schemas';
import type { Database, Json } from '@/types/supabase';
import { z } from '@/lib/openapi/registry';
import {
  AuditEventSchema,
  BetCashoutResultResponseSchema,
  BetResultSchema,
  BetSettlementResultResponseSchema,
  BetViewSchema,
} from './schemas';
import { fundingEqualsStake } from './stake';

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
    p_goal_id: input.goalId ?? null,
    p_odds: input.odds,
    p_stake_type: input.stake.type,
    p_stake_amount: input.stake.type === 'amount' ? input.stake.amount : null,
    p_stake_level: input.stake.type === 'level' ? input.stake.level : null,
    p_legs: input.legs as Json,
    p_funding: input.funding as Json,
    p_idempotency_key: idempotencyKey,
  };

  // Generated RPC types cannot express nullable PostgreSQL function arguments.
  const { data, error } = await (supabase as unknown as RpcClient).rpc('create_bet_with_funding', args);

  if (error) {
    throw new BetsServiceError(error.message, error.code);
  }

  return BetResultSchema.parse(data);
};

const RawLegSchema = z.object({
  id: z.string().uuid(),
  reference_type: z.string().nullable(),
  event_id: z.string().uuid().nullable(),
  market_id: z.string().uuid().nullable(),
  event_name: z.string().nullable(),
  market: z.string(),
  selection: z.string(),
  odds: z.number(),
});

const RawFundingSchema = z.object({
  pocket_type: z.enum(['cash', 'bonus', 'freebet']),
  amount: z.number(),
  reserved_transaction_id: z.string().uuid(),
});

const RawBetSchema = z.object({
  id: z.string().uuid(),
  bank_id: z.string().uuid(),
  goal_id: z.string().uuid().nullable(),
  status: z.string(),
  result: z.string().nullable(),
  funding_status: z.string(),
  stake_amount: z.number(),
  stake_level: z.number().nullable(),
  odds: z.number(),
  return_amount: z.number().nullable(),
  profit_amount: z.number().nullable(),
  settled_at: z.string().nullable(),
  created_at: z.string(),
  bet_legs: z.array(RawLegSchema),
  bet_funding: z.array(RawFundingSchema),
});

const betSelect = `
  id, bank_id, goal_id, status, result, funding_status, stake_amount, stake_level, odds,
  return_amount, profit_amount, settled_at, created_at,
  bet_legs(id, reference_type, event_id, market_id, event_name, market, selection, odds),
  bet_funding(pocket_type, amount, reserved_transaction_id)
`;

const mapBet = (raw: z.infer<typeof RawBetSchema>): BetView => {
  const funding = {
    cash: raw.bet_funding.find(item => item.pocket_type === 'cash')?.amount ?? 0,
    bonus: raw.bet_funding.find(item => item.pocket_type === 'bonus')?.amount ?? 0,
    freebet: raw.bet_funding.find(item => item.pocket_type === 'freebet')?.amount ?? 0,
  };
  const fullyFunded = raw.funding_status === 'reserved'
    && raw.bet_funding.length > 0
    && fundingEqualsStake(funding, raw.stake_amount);
  const cashoutEligible = fullyFunded
    && raw.bet_funding.length === 1
    && funding.cash === raw.stake_amount;

  return BetViewSchema.parse({
    id: raw.id,
    bankId: raw.bank_id,
    goalId: raw.goal_id,
    status: raw.status,
    result: raw.result,
    fundingStatus: raw.funding_status,
    stakeAmount: raw.stake_amount,
    stakeLevel: raw.stake_level,
    odds: raw.odds,
    returnAmount: raw.return_amount,
    profitAmount: raw.profit_amount,
    settledAt: raw.settled_at,
    createdAt: raw.created_at,
    settlementEligible: raw.status === 'open' && fullyFunded,
    cashoutEligible: raw.status === 'open' && cashoutEligible,
    legs: raw.bet_legs.map(leg => ({
      id: leg.id,
      referenceType: leg.reference_type === 'normalized' || leg.reference_type === 'manual'
        ? leg.reference_type
        : 'legacy',
      eventId: leg.event_id,
      marketId: leg.market_id,
      eventName: leg.event_name,
      marketName: leg.market,
      selection: leg.selection,
      odds: leg.odds,
    })),
    funding: raw.bet_funding.map(item => ({
      pocketType: item.pocket_type,
      amount: item.amount,
      transactionId: item.reserved_transaction_id,
    })),
  });
};

export const listBets = async (supabase: SupabaseClient<Database>, bankId?: string) => {
  let query = supabase.from('bets').select(betSelect).order('created_at', { ascending: false });
  if (bankId) { query = query.eq('bank_id', bankId); }
  const { data, error } = await query;
  if (error) { throw new BetsServiceError(error.message, error.code); }
  return z.array(RawBetSchema).parse(data).map(mapBet);
};

export const getBet = async (supabase: SupabaseClient<Database>, betId: string) => {
  const { data, error } = await supabase.from('bets').select(betSelect).eq('id', betId).maybeSingle();
  if (error) { throw new BetsServiceError(error.message, error.code); }
  if (!data) { return null; }

  const { data: auditData, error: auditError } = await supabase
    .from('audit_logs')
    .select('id, entity_type, entity_id, action, actor_id, created_at')
    .eq('entity_type', 'bet')
    .eq('entity_id', betId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (auditError) { throw new BetsServiceError(auditError.message, auditError.code); }

  const audit = z.array(z.object({
    id: z.string().uuid(),
    entity_type: z.string(),
    entity_id: z.string().uuid(),
    action: z.string(),
    actor_id: z.string().uuid(),
    created_at: z.string(),
  })).parse(auditData).map(event => AuditEventSchema.parse({
    id: event.id,
    entityType: event.entity_type,
    entityId: event.entity_id,
    action: event.action,
    actorId: event.actor_id,
    createdAt: event.created_at,
  }));

  return { bet: mapBet(RawBetSchema.parse(data)), audit };
};

interface RpcError { message: string, code?: string }
interface RpcClient {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown, error: RpcError | null }>
}

const asRpcClient = (supabase: SupabaseClient<Database>) => supabase as unknown as RpcClient;

export const settleBet = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  betId: string,
  input: BetSettleInput,
  idempotencyKey: string,
) => {
  const { data, error } = await asRpcClient(supabase).rpc('settle_bet', {
    p_actor_user_id: actorUserId,
    p_bet_id: betId,
    p_result: input.result,
    p_idempotency_key: idempotencyKey,
  });
  if (error) { throw new BetsServiceError(error.message, error.code); }
  return BetSettlementResultResponseSchema.parse(data);
};

export const cashoutBet = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  betId: string,
  input: BetCashoutInput,
  idempotencyKey: string,
) => {
  const { data, error } = await asRpcClient(supabase).rpc('partial_cashout_bet', {
    p_actor_user_id: actorUserId,
    p_bet_id: betId,
    p_cashout_amount: input.cashoutAmount,
    p_remaining_stake: input.remainingStake,
    p_idempotency_key: idempotencyKey,
  });
  if (error) { throw new BetsServiceError(error.message, error.code); }
  return BetCashoutResultResponseSchema.parse(data);
};
