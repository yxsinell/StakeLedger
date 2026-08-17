import { describe, expect, test } from 'bun:test';
import { GoalCloseRequestSchema, GoalCreateRequestSchema, GoalUpdateRequestSchema, RiskLimitsPatchSchema } from './schemas';

const validGoal = {
  bankId: '550e8400-e29b-41d4-a716-446655440000',
  baseAmount: 100,
  targetAmount: 130,
  deadline: '2026-12-31',
  stakePreference: 10,
  strategy: 'balanced',
};

describe('goal mutation schemas', () => {
  test('accepts canonical create data and rejects unknown, imprecise, or invalid target data', () => {
    expect(GoalCreateRequestSchema.safeParse(validGoal).success).toBe(true);
    expect(GoalCreateRequestSchema.safeParse({ ...validGoal, targetAmount: 100 }).success).toBe(false);
    expect(GoalCreateRequestSchema.safeParse({ ...validGoal, stakePreference: 1.001 }).success).toBe(false);
    expect(GoalCreateRequestSchema.safeParse({ ...validGoal, strategy: 'accelerated' }).success).toBe(false);
    expect(GoalCreateRequestSchema.safeParse({ ...validGoal, extra: true }).success).toBe(false);
  });

  test('allows only mutable fields in a non-empty patch', () => {
    expect(GoalUpdateRequestSchema.safeParse({ targetAmount: 140 }).success).toBe(true);
    expect(GoalUpdateRequestSchema.safeParse({}).success).toBe(false);
    expect(GoalUpdateRequestSchema.safeParse({ baseAmount: 90 }).success).toBe(false);
  });

  test('requires explicit closure status and confirmation', () => {
    expect(GoalCloseRequestSchema.safeParse({ status: 'completed', confirmed: true }).success).toBe(true);
    expect(GoalCloseRequestSchema.safeParse({ status: 'cancelled', confirmed: true, reason: 'Changed plan' }).success).toBe(true);
    expect(GoalCloseRequestSchema.safeParse({ status: 'completed', confirmed: false }).success).toBe(false);
  });
});

describe('risk limit schema', () => {
  test('accepts exact opt-in limits or null and rejects fixed stake-cap mutation', () => {
    expect(RiskLimitsPatchSchema.safeParse({ maxOdds: 2.5, maxDailyLoss: 20 }).success).toBe(true);
    expect(RiskLimitsPatchSchema.safeParse({ maxOdds: null }).success).toBe(true);
    expect(RiskLimitsPatchSchema.safeParse({ maxDailyLoss: null }).success).toBe(true);
    expect(RiskLimitsPatchSchema.safeParse({ maxOdds: 2.50001 }).success).toBe(false);
    expect(RiskLimitsPatchSchema.safeParse({ maxStakePercentage: 10 }).success).toBe(false);
  });
});
