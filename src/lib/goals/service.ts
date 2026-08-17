import type { SupabaseClient } from '@supabase/supabase-js';
import type { Goal, GoalCloseInput, GoalCreateInput, GoalUpdateInput, RiskLimitsPatchInput } from './schemas';
import type { Database } from '@/types/supabase';
import { z } from '@/lib/openapi/registry';
import { assessGoalRisk, calculateGoalMission, GoalCalculationError } from './calculations';
import { GoalSchema, RiskLimitsSchema } from './schemas';

export class GoalsServiceError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
    this.name = 'GoalsServiceError';
  }
}

interface RpcClient {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown, error: { message: string, code?: string } | null }>
}
const rpcClient = (supabase: SupabaseClient<Database>) => supabase as unknown as RpcClient;

const callRpc = async (supabase: SupabaseClient<Database>, name: string, args: Record<string, unknown>) => {
  const { data, error } = await rpcClient(supabase).rpc(name, args);
  if (error) { throw new GoalsServiceError(error.message, error.code); }
  return data;
};

const RawGoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  bank_id: z.string().uuid(),
  base_amount: z.number(),
  target_amount: z.number(),
  deadline: z.string(),
  stake_preference: z.number(),
  strategy: z.enum(['conservative', 'balanced', 'aggressive']),
  daily_profit: z.number(),
  suggested_odds: z.number(),
  status: z.enum(['active', 'completed', 'cancelled']),
  closed_at: z.string().nullable(),
  closure_reason: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  banks: z.object({ id: z.string().uuid(), name: z.string(), currency: z.string(), bank_pockets: z.array(z.object({ pocket_type: z.string(), balance: z.number() })) }),
  goal_history: z.array(z.object({
    id: z.string().uuid(),
    bet_id: z.string().uuid().nullable(),
    mission_date: z.string().nullable(),
    event_type: z.string(),
    current_amount: z.number().nullable(),
    remaining_amount: z.number().nullable(),
    daily_profit: z.number().nullable(),
    suggested_odds: z.number().nullable(),
    created_at: z.string(),
  })),
});

const goalSelect = `
  id, user_id, bank_id, base_amount, target_amount, deadline, stake_preference, strategy,
  daily_profit, suggested_odds, status, closed_at, closure_reason, created_at, updated_at,
  banks!inner(id, name, currency, bank_pockets(pocket_type, balance)),
  goal_history(id, bet_id, mission_date, event_type, current_amount, remaining_amount, daily_profit, suggested_odds, created_at)
`;

const daysUntil = (deadline: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return Math.max(1, Math.round((Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000));
};

const mapGoal = (rawValue: unknown, maxOdds: number | null): Goal => {
  const raw = RawGoalSchema.parse(rawValue);
  const currentCash = raw.banks.bank_pockets.find(pocket => pocket.pocket_type === 'cash')?.balance ?? 0;
  let mission;
  if (raw.status === 'active') {
    try {
      mission = calculateGoalMission({
        baseAmount: raw.base_amount,
        targetAmount: raw.target_amount,
        currentCash,
        stakePreference: raw.stake_preference,
        calendarDays: daysUntil(raw.deadline),
      });
    }
    catch (error) {
      if (error instanceof GoalCalculationError) { throw new GoalsServiceError(error.code); }
      throw error;
    }
  }
  else {
    const denominator = raw.target_amount - raw.base_amount;
    mission = {
      remainingAmount: Math.max(raw.target_amount - currentCash, 0),
      calendarDays: daysUntil(raw.deadline),
      dailyProfit: raw.daily_profit,
      suggestedOdds: raw.suggested_odds,
      progressPct: Math.min(100, Math.max(0, denominator > 0 ? ((currentCash - raw.base_amount) / denominator) * 100 : 0)),
    };
  }

  return GoalSchema.parse({
    id: raw.id,
    bank: { id: raw.banks.id, name: raw.banks.name, currency: raw.banks.currency },
    baseAmount: raw.base_amount,
    targetAmount: raw.target_amount,
    deadline: raw.deadline,
    stakePreference: raw.stake_preference,
    strategy: raw.strategy,
    status: raw.status,
    closedAt: raw.closed_at,
    closureReason: raw.closure_reason,
    currentCash,
    ...mission,
    history: [...raw.goal_history].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(item => ({
      id: item.id,
      betId: item.bet_id,
      missionDate: item.mission_date,
      eventType: item.event_type,
      currentAmount: item.current_amount,
      remainingAmount: item.remaining_amount,
      dailyProfit: item.daily_profit,
      suggestedOdds: item.suggested_odds,
      createdAt: item.created_at,
    })),
    riskAssessment: assessGoalRisk(mission.dailyProfit, mission.suggestedOdds, maxOdds),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  });
};

const readMaxOdds = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase.from('risk_limits').select('max_odds').maybeSingle();
  if (error) { throw new GoalsServiceError(error.message, error.code); }
  return data?.max_odds ?? null;
};

export const listGoals = async (supabase: SupabaseClient<Database>) => {
  const [{ data, error }, maxOdds] = await Promise.all([
    supabase.from('goals').select(goalSelect).order('created_at', { ascending: false }),
    readMaxOdds(supabase),
  ]);
  if (error) { throw new GoalsServiceError(error.message, error.code); }
  return z.array(z.unknown()).parse(data).map(goal => mapGoal(goal, maxOdds));
};

export const getGoal = async (supabase: SupabaseClient<Database>, goalId: string) => {
  const [{ data, error }, maxOdds] = await Promise.all([
    supabase.from('goals').select(goalSelect).eq('id', goalId).maybeSingle(),
    readMaxOdds(supabase),
  ]);
  if (error) { throw new GoalsServiceError(error.message, error.code); }
  return data ? mapGoal(data, maxOdds) : null;
};

export const createGoal = async (supabase: SupabaseClient<Database>, actorUserId: string, input: GoalCreateInput) =>
  callRpc(supabase, 'create_goal', {
    p_actor_user_id: actorUserId,
    p_bank_id: input.bankId,
    p_base_amount: input.baseAmount,
    p_target_amount: input.targetAmount,
    p_deadline: input.deadline,
    p_stake_preference: input.stakePreference,
    p_strategy: input.strategy,
  });

export const updateGoal = async (supabase: SupabaseClient<Database>, actorUserId: string, goalId: string, input: GoalUpdateInput) =>
  callRpc(supabase, 'update_goal', {
    p_actor_user_id: actorUserId,
    p_goal_id: goalId,
    p_target_amount: input.targetAmount ?? null,
    p_deadline: input.deadline ?? null,
    p_stake_preference: input.stakePreference ?? null,
    p_strategy: input.strategy ?? null,
  });

export const closeGoal = async (supabase: SupabaseClient<Database>, actorUserId: string, goalId: string, input: GoalCloseInput) =>
  callRpc(supabase, 'close_goal', {
    p_actor_user_id: actorUserId,
    p_goal_id: goalId,
    p_status: input.status,
    p_confirmed: input.confirmed,
    p_reason: input.reason ?? null,
  });

export const getRiskLimits = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase.from('risk_limits').select('max_odds, max_daily_loss').maybeSingle();
  if (error) { throw new GoalsServiceError(error.message, error.code); }
  return RiskLimitsSchema.parse({ maxOdds: data?.max_odds ?? null, maxStakePercentage: 40, maxDailyLoss: data?.max_daily_loss ?? null });
};

export const updateRiskLimits = async (supabase: SupabaseClient<Database>, actorUserId: string, input: RiskLimitsPatchInput) => {
  const data = await callRpc(supabase, 'configure_risk_limits', {
    p_actor_user_id: actorUserId,
    p_set_max_odds: Object.hasOwn(input, 'maxOdds'),
    p_max_odds: input.maxOdds ?? null,
    p_set_max_daily_loss: Object.hasOwn(input, 'maxDailyLoss'),
    p_max_daily_loss: input.maxDailyLoss ?? null,
  });
  return RiskLimitsSchema.parse(data);
};
