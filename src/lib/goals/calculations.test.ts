import { describe, expect, test } from 'bun:test';
import { assessGoalRisk, calculateGoalMission, GoalCalculationError } from './calculations';

describe('goal mission calculations', () => {
  test('calculates exact daily profit, suggested odds, and clamped progress', () => {
    expect(calculateGoalMission({ baseAmount: 100, targetAmount: 130, currentCash: 100, stakePreference: 10, calendarDays: 10 })).toEqual({
      remainingAmount: 30,
      calendarDays: 10,
      dailyProfit: 3,
      suggestedOdds: 1.3,
      progressPct: 0,
    });
    expect(calculateGoalMission({ baseAmount: 100, targetAmount: 130, currentCash: 140, stakePreference: 10, calendarDays: 0 })).toEqual({
      remainingAmount: 0,
      calendarDays: 1,
      dailyProfit: 0,
      suggestedOdds: 1,
      progressPct: 100,
    });
  });

  test('rejects daily profit instead of rounding money', () => {
    expect(() => calculateGoalMission({ baseAmount: 0, targetAmount: 10, currentCash: 0, stakePreference: 5, calendarDays: 3 }))
      .toThrow(new GoalCalculationError('GOAL_DAILY_PROFIT_PRECISION'));
  });

  test('rejects suggested odds instead of rounding four decimals', () => {
    expect(() => calculateGoalMission({ baseAmount: 0, targetAmount: 1, currentCash: 0, stakePreference: 3, calendarDays: 1 }))
      .toThrow(new GoalCalculationError('GOAL_SUGGESTED_ODDS_PRECISION'));
  });
});

describe('goal risk assessment', () => {
  test('allows odds at the configured boundary and blocks above it', () => {
    expect(assessGoalRisk(3, 2.5, 2.5).status).toBe('ok');
    const blocked = assessGoalRisk(3, 2.5001, 2.5);
    expect(blocked.status).toBe('blocked');
    expect(blocked.alternatives).toEqual([
      { type: 'increase_stake', requiredStake: 2, formula: 'dailyProfit / (maxOdds - 1)' },
      { type: 'extend_deadline' },
      { type: 'reduce_target' },
    ]);
  });

  test('does not invent maximum odds when opt-in limit is null', () => {
    expect(assessGoalRisk(50, 9, null)).toEqual({ status: 'ok', maxOdds: null, alternatives: [] });
  });
});
