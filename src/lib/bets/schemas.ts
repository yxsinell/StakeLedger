import { z } from '@/lib/openapi/registry';
import { fundingEqualsStake, hasAtMostDecimalPlaces } from './stake';

const MAX_MONETARY_AMOUNT = 999999999999.99;
const MAX_ODDS = 999999.9999;

const MonetaryAmountSchema = z
  .number()
  .finite('Amount must be a finite number')
  .max(MAX_MONETARY_AMOUNT, 'Amount is too large')
  .refine(value => hasAtMostDecimalPlaces(value, 2), 'Amount must have at most two decimal places')
  .openapi({ maximum: MAX_MONETARY_AMOUNT, multipleOf: 0.01 });

const PositiveMonetaryAmountSchema = MonetaryAmountSchema
  .positive('Amount must be greater than zero')
  .openapi({
    minimum: 0,
    exclusiveMinimum: true,
    maximum: MAX_MONETARY_AMOUNT,
    multipleOf: 0.01,
  });

const OddsSchema = z
  .number()
  .finite('Odds must be a finite number')
  .gt(1, 'Odds must be greater than one')
  .max(MAX_ODDS, 'Odds are too large')
  .refine(value => hasAtMostDecimalPlaces(value, 4), 'Odds must have at most four decimal places')
  .openapi({ minimum: 1, exclusiveMinimum: true, maximum: MAX_ODDS, multipleOf: 0.0001 });

const RequiredTextSchema = z.string().trim().min(1, 'Text is required').max(100);

export const IdempotencyKeySchema = z.string().uuid('Idempotency-Key must be a UUID');
export const BetIdSchema = z.string().uuid('Bet not found');
export const BetSettlementResultSchema = z.enum(['won', 'lost', 'void', 'half_won', 'half_lost']);
export const BetLifecycleStatusSchema = z.enum(['draft', 'open', 'settled', 'cashout']);

export const BetStakeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('amount'),
    amount: PositiveMonetaryAmountSchema,
  }).strict().openapi('BetStakeAmountInput'),
  z.object({
    type: z.literal('level'),
    level: z
      .number()
      .finite('Stake level must be a finite number')
      .min(0.1)
      .max(20)
      .refine(value => hasAtMostDecimalPlaces(value, 1), 'Stake level must use steps of 0.1')
      .openapi({ minimum: 0.1, maximum: 20, multipleOf: 0.1 }),
  }).strict().openapi('BetStakeLevelInput'),
]);

const NormalizedBetLegSchema = z.object({
  referenceType: z.literal('normalized'),
  eventId: z.string().uuid(),
  marketId: z.string().uuid(),
  selection: RequiredTextSchema,
  odds: OddsSchema,
}).strict().openapi('NormalizedBetLegInput');

const ManualBetLegSchema = z.object({
  referenceType: z.literal('manual'),
  eventName: RequiredTextSchema,
  marketName: RequiredTextSchema,
  selection: RequiredTextSchema,
  odds: OddsSchema,
}).strict().openapi('ManualBetLegInput');

export const BetLegSchema = z.discriminatedUnion('referenceType', [
  NormalizedBetLegSchema,
  ManualBetLegSchema,
]);

export const BetFundingSchema = z
  .object({
    cash: MonetaryAmountSchema.nonnegative(),
    bonus: MonetaryAmountSchema.nonnegative(),
    freebet: MonetaryAmountSchema.nonnegative(),
  })
  .strict()
  .refine(funding => funding.cash > 0 || funding.bonus > 0 || funding.freebet > 0, {
    message: 'At least one funding amount must be greater than zero',
  })
  .openapi('BetFundingInput', {
    description: 'At least one funding amount must be positive.',
    anyOf: [
      { properties: { cash: { type: 'number', minimum: 0, exclusiveMinimum: true } } },
      { properties: { bonus: { type: 'number', minimum: 0, exclusiveMinimum: true } } },
      { properties: { freebet: { type: 'number', minimum: 0, exclusiveMinimum: true } } },
    ],
  });

export const BetCreateRequestSchema = z
  .object({
    bankId: z.string().uuid('Bank not found'),
    goalId: z.string().uuid('Goal not found').optional(),
    legs: z.array(BetLegSchema).min(1).max(20),
    odds: OddsSchema,
    stake: BetStakeSchema,
    funding: BetFundingSchema,
  })
  .strict()
  .superRefine((input, context) => {
    if (input.stake.type === 'amount' && !fundingEqualsStake(input.funding, input.stake.amount)) {
      context.addIssue({
        code: 'custom',
        message: 'Funding sum must equal stake amount',
        path: ['funding'],
      });
    }
  })
  .openapi('BetCreateRequest');

export const BetSettleRequestSchema = z.object({
  result: BetSettlementResultSchema,
}).strict().openapi('BetSettleRequest');

export const BetCashoutRequestSchema = z.object({
  cashoutAmount: PositiveMonetaryAmountSchema,
  remainingStake: PositiveMonetaryAmountSchema,
}).strict().openapi('BetCashoutRequest');

const BetFundingReservationSchema = z.object({
  pocketType: z.enum(['cash', 'bonus', 'freebet']),
  amount: PositiveMonetaryAmountSchema,
  transactionId: z.string().uuid(),
}).strict().openapi('BetFundingReservation');

const BetSchema = z.object({
  id: z.string().uuid(),
  goalId: z.string().uuid().nullable(),
  status: z.literal('open'),
  fundingStatus: z.literal('reserved'),
  stakeAmount: PositiveMonetaryAmountSchema,
  stakeLevel: z.number().min(0.1).max(20).nullable(),
  odds: OddsSchema,
  legs: z.array(BetLegSchema).min(1).max(20),
  funding: z.array(BetFundingReservationSchema).min(1).max(3),
}).strict().openapi('Bet');

export const BetBalancesSchema = z.object({
  cash: MonetaryAmountSchema.nonnegative(),
  bonus: MonetaryAmountSchema.nonnegative(),
  freebet: MonetaryAmountSchema.nonnegative(),
}).strict().openapi('BetBalances');

export const BetResultSchema = z.object({
  bet: BetSchema,
  balances: BetBalancesSchema,
  replayed: z.boolean(),
}).strict();

export const BetResponseSchema = z.object({
  success: z.literal(true),
  bet: BetSchema,
  balances: BetBalancesSchema,
  replayed: z.boolean(),
}).strict().openapi('BetResponse');

export const BetLegViewSchema = z.object({
  id: z.string().uuid(),
  referenceType: z.enum(['normalized', 'manual', 'legacy']),
  eventId: z.string().uuid().nullable(),
  marketId: z.string().uuid().nullable(),
  eventName: z.string().nullable(),
  marketName: z.string(),
  selection: z.string(),
  odds: OddsSchema,
}).strict().openapi('BetLegView');

export const BetFundingViewSchema = z.object({
  pocketType: z.enum(['cash', 'bonus', 'freebet']),
  amount: PositiveMonetaryAmountSchema,
  transactionId: z.string().uuid(),
}).strict().openapi('BetFundingView');

export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['bank', 'transaction', 'bet', 'goal', 'recommendation', 'catalog', 'user']),
  entityId: z.string().uuid(),
  action: z.string(),
  actorId: z.string().uuid(),
  createdAt: z.string(),
}).strict().openapi('AuditEvent');

export const BetViewSchema = z.object({
  id: z.string().uuid(),
  bankId: z.string().uuid(),
  goalId: z.string().uuid().nullable(),
  status: z.string(),
  result: z.string().nullable(),
  fundingStatus: z.string(),
  stakeAmount: PositiveMonetaryAmountSchema,
  stakeLevel: z.number().nullable(),
  odds: OddsSchema,
  returnAmount: MonetaryAmountSchema.nullable(),
  profitAmount: MonetaryAmountSchema.nullable(),
  settledAt: z.string().nullable(),
  createdAt: z.string(),
  settlementEligible: z.boolean(),
  cashoutEligible: z.boolean(),
  legs: z.array(BetLegViewSchema),
  funding: z.array(BetFundingViewSchema),
}).strict().openapi('BetView');

export const BetListResponseSchema = z.object({
  success: z.literal(true),
  bets: z.array(BetViewSchema),
}).strict().openapi('BetListResponse');

export const BetDetailResponseSchema = z.object({
  success: z.literal(true),
  bet: BetViewSchema,
  audit: z.array(AuditEventSchema),
}).strict().openapi('BetDetailResponse');

const FinancialTransactionSchema = z.object({
  id: z.string().uuid(),
  pocketType: z.enum(['cash', 'bonus', 'freebet']),
  type: z.string(),
  amount: PositiveMonetaryAmountSchema,
}).strict();

export const BetSettlementResultResponseSchema = z.object({
  bet: z.object({
    id: z.string().uuid(),
    status: z.literal('settled'),
    result: BetSettlementResultSchema,
    returnAmount: MonetaryAmountSchema.nonnegative(),
    profitAmount: z.number().finite(),
  }).strict(),
  balances: BetBalancesSchema,
  transactions: z.array(FinancialTransactionSchema),
  replayed: z.boolean(),
  goalRecalculated: z.boolean().optional(),
  goalId: z.string().uuid().optional(),
}).strict().openapi('BetSettlementResult');

export const BetCashoutResultResponseSchema = z.object({
  sourceBet: z.object({
    id: z.string().uuid(),
    status: z.literal('cashout'),
    result: z.literal('cashout'),
    returnAmount: PositiveMonetaryAmountSchema,
    profitAmount: z.number().finite(),
  }).strict(),
  derivedBet: z.object({
    id: z.string().uuid(),
    status: z.literal('open'),
    fundingStatus: z.literal('reserved'),
    stakeAmount: PositiveMonetaryAmountSchema,
    odds: OddsSchema,
  }).strict(),
  cashout: z.object({
    id: z.string().uuid(),
    sourceBetId: z.string().uuid(),
    derivedBetId: z.string().uuid(),
    cashoutAmount: PositiveMonetaryAmountSchema,
    remainingStake: PositiveMonetaryAmountSchema,
    splitGroupId: z.string().uuid(),
  }).strict(),
  balances: z.object({ cash: MonetaryAmountSchema.nonnegative() }).strict(),
  transactions: z.array(FinancialTransactionSchema),
  replayed: z.boolean(),
}).strict().openapi('BetCashoutResult');

export const BetSettlementResponseSchema = BetSettlementResultResponseSchema.extend({
  success: z.literal(true),
}).openapi('BetSettlementResponse');

export const BetCashoutResponseSchema = BetCashoutResultResponseSchema.extend({
  success: z.literal(true),
}).openapi('BetCashoutResponse');

export type BetCreateInput = z.infer<typeof BetCreateRequestSchema>;
export type BetSettleInput = z.infer<typeof BetSettleRequestSchema>;
export type BetCashoutInput = z.infer<typeof BetCashoutRequestSchema>;
export type BetView = z.infer<typeof BetViewSchema>;
