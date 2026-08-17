import { hasAtMostDecimalPlaces } from '@/lib/bets/stake';
import { z } from '@/lib/openapi/registry';

const MAX_MONEY = 999999999999.99;
const MAX_ODDS = 999999.9999;
const money = z.number().finite().min(0).max(MAX_MONEY).refine(value => hasAtMostDecimalPlaces(value, 2), 'Amount must have at most two decimal places');
const positiveMoney = money.positive('Amount must be greater than zero');
const odds = z.number().finite().gt(1).max(MAX_ODDS).refine(value => hasAtMostDecimalPlaces(value, 4), 'Odds must have at most four decimal places');
const deadline = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be an ISO date');

export const GoalIdSchema = z.string().uuid('Goal not found');
export const GoalStrategySchema = z.enum(['conservative', 'balanced', 'aggressive']);
export const GoalStatusSchema = z.enum(['active', 'completed', 'cancelled']);

export const GoalCreateRequestSchema = z.object({
  bankId: z.string().uuid('Bank not found'),
  baseAmount: money,
  targetAmount: positiveMoney,
  deadline,
  stakePreference: positiveMoney,
  strategy: GoalStrategySchema,
}).strict().superRefine((value, context) => {
  if (value.targetAmount <= value.baseAmount) {
    context.addIssue({ code: 'custom', path: ['targetAmount'], message: 'Target amount must be greater than base amount' });
  }
});

export const GoalUpdateRequestSchema = z.object({
  targetAmount: positiveMoney.optional(),
  deadline: deadline.optional(),
  stakePreference: positiveMoney.optional(),
  strategy: GoalStrategySchema.optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'At least one field is required');

export const GoalCloseRequestSchema = z.object({
  status: z.enum(['completed', 'cancelled']),
  confirmed: z.literal(true),
  reason: z.string().trim().min(1).max(500).optional(),
}).strict();

export const RiskLimitsPatchSchema = z.object({
  maxOdds: odds.nullable().optional(),
  maxDailyLoss: positiveMoney.nullable().optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'At least one field is required');

export const RiskLimitsSchema = z.object({
  maxOdds: odds.nullable(),
  maxStakePercentage: z.literal(40),
  maxDailyLoss: positiveMoney.nullable(),
}).strict().openapi('RiskLimits');

const GoalHistorySchema = z.object({
  id: z.string().uuid(),
  betId: z.string().uuid().nullable(),
  missionDate: z.string().nullable(),
  eventType: z.enum(['created', 'daily_snapshot', 'recalculated', 'closed']),
  currentAmount: money.nullable(),
  remainingAmount: money.nullable(),
  dailyProfit: money.nullable(),
  suggestedOdds: z.number().min(1).nullable(),
  createdAt: z.string(),
}).strict();

const GoalRiskAssessmentSchema = z.object({
  status: z.enum(['ok', 'blocked']),
  maxOdds: odds.nullable(),
  alternatives: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('increase_stake'), requiredStake: z.number().finite(), formula: z.literal('dailyProfit / (maxOdds - 1)') }),
    z.object({ type: z.literal('extend_deadline') }),
    z.object({ type: z.literal('reduce_target') }),
  ])),
}).strict();

export const GoalSchema = z.object({
  id: z.string().uuid(),
  bank: z.object({ id: z.string().uuid(), name: z.string(), currency: z.string() }).strict(),
  baseAmount: money,
  targetAmount: positiveMoney,
  deadline,
  stakePreference: positiveMoney,
  strategy: GoalStrategySchema,
  status: GoalStatusSchema,
  closedAt: z.string().nullable(),
  closureReason: z.string().nullable(),
  currentCash: money,
  remainingAmount: money,
  calendarDays: z.number().int().positive(),
  dailyProfit: money,
  suggestedOdds: z.number().min(1),
  progressPct: z.number().min(0).max(100),
  history: z.array(GoalHistorySchema),
  riskAssessment: GoalRiskAssessmentSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
}).strict().openapi('Goal');

export const GoalListResponseSchema = z.object({ success: z.literal(true), goals: z.array(GoalSchema) }).strict().openapi('GoalListResponse');
export const GoalResponseSchema = z.object({ success: z.literal(true), goal: GoalSchema }).strict().openapi('GoalResponse');
export const RiskLimitsResponseSchema = z.object({ success: z.literal(true), riskLimits: RiskLimitsSchema }).strict().openapi('RiskLimitsResponse');

export type GoalCreateInput = z.infer<typeof GoalCreateRequestSchema>;
export type GoalUpdateInput = z.infer<typeof GoalUpdateRequestSchema>;
export type GoalCloseInput = z.infer<typeof GoalCloseRequestSchema>;
export type RiskLimitsPatchInput = z.infer<typeof RiskLimitsPatchSchema>;
export type Goal = z.infer<typeof GoalSchema>;
