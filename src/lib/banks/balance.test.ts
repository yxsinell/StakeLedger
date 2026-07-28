import { describe, expect, test } from 'bun:test';

import { calculateBankBalances } from './balance';

describe('calculateBankBalances', () => {
  test('uses cash as the operative balance while preserving every pocket', () => {
    expect(calculateBankBalances([
      { pocket_type: 'cash', balance: 100 },
      { pocket_type: 'bonus', balance: 20 },
      { pocket_type: 'freebet', balance: 10 },
    ])).toEqual({
      cash: 100,
      bonus: 20,
      freebet: 10,
      operative: 100,
    });
  });

  test('returns zeroes when a legacy bank has no pocket rows', () => {
    expect(calculateBankBalances([])).toEqual({
      cash: 0,
      bonus: 0,
      freebet: 0,
      operative: 0,
    });
  });
});
