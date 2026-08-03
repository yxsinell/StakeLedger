import { describe, expect, test } from 'bun:test';

import { BankCreateRequestSchema, TransferCreateRequestSchema } from './schemas';

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

describe('TransferCreateRequestSchema', () => {
  const validTransfer = {
    toBankId: '550e8400-e29b-41d4-a716-446655440000',
    amount: 10.5,
  };

  test('accepts a positive amount with at most two decimals', () => {
    expect(TransferCreateRequestSchema.safeParse(validTransfer).success).toBe(true);
  });

  test('rejects invalid destination IDs, amounts, and unknown fields', () => {
    expect(TransferCreateRequestSchema.safeParse({ ...validTransfer, toBankId: 'invalid' }).success).toBe(false);
    expect(TransferCreateRequestSchema.safeParse({ ...validTransfer, amount: 0 }).success).toBe(false);
    expect(TransferCreateRequestSchema.safeParse({ ...validTransfer, amount: 10.001 }).success).toBe(false);
    expect(TransferCreateRequestSchema.safeParse({ ...validTransfer, pocketType: 'cash' }).success).toBe(false);
  });
});
