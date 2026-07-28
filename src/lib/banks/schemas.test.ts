import { describe, expect, test } from 'bun:test';

import { BankCreateRequestSchema } from './schemas';

const validBank = {
  name: ' Bank Principal ',
  currency: 'EUR',
  initialCash: 100,
  initialBonus: 20.5,
  initialFreebet: 10,
};

describe('BankCreateRequestSchema', () => {
  test('trims a valid bank name and accepts approved values', () => {
    const result = BankCreateRequestSchema.safeParse(validBank);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('Bank Principal');
    }
  });

  test('rejects unsupported currency, zero amounts, and values with more than two decimals', () => {
    expect(BankCreateRequestSchema.safeParse({ ...validBank, currency: 'GBP' }).success).toBe(false);
    expect(BankCreateRequestSchema.safeParse({ ...validBank, initialCash: 0 }).success).toBe(false);
    expect(BankCreateRequestSchema.safeParse({ ...validBank, initialBonus: 0.005 }).success).toBe(false);
  });
});
