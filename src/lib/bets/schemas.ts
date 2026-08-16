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

const BetFundingReservationSchema = z.object({
  pocketType: z.enum(['cash', 'bonus', 'freebet']),
  amount: PositiveMonetaryAmountSchema,
  transactionId: z.string().uuid(),
}).strict().openapi('BetFundingReservation');

const BetSchema = z.object({
  id: z.string().uuid(),
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

export type BetCreateInput = z.infer<typeof BetCreateRequestSchema>;
