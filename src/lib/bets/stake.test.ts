import { describe, expect, test } from 'bun:test';

import {
  calculateStakeFromLevel,
  fundingEqualsStake,
  hasAtMostDecimalPlaces,
  hasValidLevelStakePrecision,
} from './stake';

describe('bet stake decimal helpers', () => {
  test('checks decimal precision without rounding', () => {
    expect(hasAtMostDecimalPlaces(20, 2)).toBe(true);
    expect(hasAtMostDecimalPlaces(20.01, 2)).toBe(true);
    expect(hasAtMostDecimalPlaces(20.001, 2)).toBe(false);
    expect(hasAtMostDecimalPlaces(Number.POSITIVE_INFINITY, 2)).toBe(false);
  });

  test('calculates stake level using the canonical formula', () => {
    expect(calculateStakeFromLevel(100, 0.1)).toBe(0.2);
    expect(calculateStakeFromLevel(100, 10)).toBe(20);
    expect(calculateStakeFromLevel(100, 20)).toBe(40);
    expect(calculateStakeFromLevel(10.01, 10)).toBe(2.002);
  });

  test('rejects level results requiring sub-cent rounding', () => {
    expect(hasValidLevelStakePrecision(100, 10)).toBe(true);
    expect(hasValidLevelStakePrecision(10.01, 10)).toBe(false);
  });

  test('compares funding and stake in integer cents', () => {
    expect(fundingEqualsStake({ cash: 0.1, bonus: 0.2, freebet: 0 }, 0.3)).toBe(true);
    expect(fundingEqualsStake({ cash: 5, bonus: 5, freebet: 9.99 }, 20)).toBe(false);
    expect(fundingEqualsStake({ cash: 5.001, bonus: 5, freebet: 9.999 }, 20)).toBe(false);
  });
});
