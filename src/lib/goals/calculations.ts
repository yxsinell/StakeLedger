const MONEY_SCALE = 100;
const ODDS_SCALE = 10_000;

export class GoalCalculationError extends Error {
  constructor(readonly code: 'GOAL_DAILY_PROFIT_PRECISION' | 'GOAL_SUGGESTED_ODDS_PRECISION') {
    super(code);
    this.name = 'GoalCalculationError';
  }
}

const toScaledInteger = (value: number, scale: number): number => {
  const scaled = value * scale;
  if (!Number.isSafeInteger(scaled)) {
    throw new GoalCalculationError('GOAL_DAILY_PROFIT_PRECISION');
  }
  return scaled;
};

export interface GoalMissionInput {
  baseAmount: number
  targetAmount: number
  currentCash: number
  stakePreference: number
  calendarDays: number
}

export interface GoalMission {
  remainingAmount: number
  calendarDays: number
  dailyProfit: number
  suggestedOdds: number
  progressPct: number
}

export const calculateGoalMission = (input: GoalMissionInput): GoalMission => {
  const baseCents = toScaledInteger(input.baseAmount, MONEY_SCALE);
  const targetCents = toScaledInteger(input.targetAmount, MONEY_SCALE);
  const cashCents = toScaledInteger(input.currentCash, MONEY_SCALE);
  const stakeCents = toScaledInteger(input.stakePreference, MONEY_SCALE);
  const calendarDays = Math.max(1, Math.trunc(input.calendarDays));
  const remainingCents = Math.max(targetCents - cashCents, 0);

  if (remainingCents % calendarDays !== 0) {
    throw new GoalCalculationError('GOAL_DAILY_PROFIT_PRECISION');
  }

  const dailyProfitCents = remainingCents / calendarDays;
  let suggestedOdds = 1;
  if (dailyProfitCents > 0) {
    const oddsNumerator = dailyProfitCents * ODDS_SCALE;
    if (oddsNumerator % stakeCents !== 0) {
      throw new GoalCalculationError('GOAL_SUGGESTED_ODDS_PRECISION');
    }
    suggestedOdds = (ODDS_SCALE + oddsNumerator / stakeCents) / ODDS_SCALE;
  }

  const progressDenominator = targetCents - baseCents;
  const rawProgress = progressDenominator > 0
    ? ((cashCents - baseCents) / progressDenominator) * 100
    : 0;

  return {
    remainingAmount: remainingCents / MONEY_SCALE,
    calendarDays,
    dailyProfit: dailyProfitCents / MONEY_SCALE,
    suggestedOdds,
    progressPct: Math.min(100, Math.max(0, rawProgress)),
  };
};

export const assessGoalRisk = (dailyProfit: number, suggestedOdds: number, maxOdds: number | null) => {
  const blocked = maxOdds !== null && suggestedOdds > maxOdds;
  const requiredStake = blocked ? dailyProfit / (maxOdds - 1) : null;

  return {
    status: blocked ? 'blocked' as const : 'ok' as const,
    maxOdds,
    alternatives: blocked
      ? [
          { type: 'increase_stake' as const, requiredStake, formula: 'dailyProfit / (maxOdds - 1)' },
          { type: 'extend_deadline' as const },
          { type: 'reduce_target' as const },
        ]
      : [],
  };
};
