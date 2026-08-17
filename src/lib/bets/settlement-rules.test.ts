import { describe, expect, test } from 'bun:test';
import { calculateFundingSettlement } from './settlement-rules';

describe('calculateFundingSettlement', () => {
  test.each([
    ['won', [{ pocketType: 'cash', amount: 250 }], 150],
    ['lost', [], -100],
    ['void', [{ pocketType: 'cash', amount: 100 }], 0],
    ['half_won', [{ pocketType: 'cash', amount: 175 }], 75],
    ['half_lost', [{ pocketType: 'cash', amount: 50 }], -50],
  ] as const)('settles cash result %s', (result, credits, profit) => {
    expect(calculateFundingSettlement('cash', 100, 2.5, result)).toEqual({ credits: [...credits], profit });
  });

  test('credits only freebet profit to cash on win', () => {
    expect(calculateFundingSettlement('freebet', 100, 2.5, 'won')).toEqual({
      credits: [{ pocketType: 'cash', amount: 150 }],
      profit: 150,
    });
  });

  test('splits half-won freebet between void stake and cash profit', () => {
    expect(calculateFundingSettlement('freebet', 100, 2.5, 'half_won')).toEqual({
      credits: [
        { pocketType: 'freebet', amount: 50 },
        { pocketType: 'cash', amount: 75 },
      ],
      profit: 75,
    });
  });

  test('rejects calculations requiring fractional cents', () => {
    expect(calculateFundingSettlement('cash', 0.01, 1.5, 'half_lost')).toBeNull();
    expect(calculateFundingSettlement('freebet', 0.01, 2, 'half_won')).toBeNull();
  });
});
