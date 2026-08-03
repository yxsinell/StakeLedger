import { describe, expect, test } from 'bun:test';

import { IdempotencyKeySchema, TransactionCreateRequestSchema } from './schemas';

const validTransaction = {
  bankId: '550e8400-e29b-41d4-a716-446655440000',
  type: 'deposit',
  amount: 100.5,
  method: 'card',
};

describe('TransactionCreateRequestSchema', () => {
  test('accepts a cash-only deposit or withdrawal request', () => {
    expect(TransactionCreateRequestSchema.safeParse(validTransaction).success).toBe(true);
    expect(TransactionCreateRequestSchema.safeParse({ ...validTransaction, type: 'withdraw' }).success).toBe(true);
  });

  test('rejects invalid amounts, methods, types, and unknown fields', () => {
    expect(TransactionCreateRequestSchema.safeParse({ ...validTransaction, amount: 0 }).success).toBe(false);
    expect(TransactionCreateRequestSchema.safeParse({ ...validTransaction, amount: 10.001 }).success).toBe(false);
    expect(TransactionCreateRequestSchema.safeParse({ ...validTransaction, method: 'bank' }).success).toBe(false);
    expect(TransactionCreateRequestSchema.safeParse({ ...validTransaction, type: 'transfer' }).success).toBe(false);
    expect(TransactionCreateRequestSchema.safeParse({ ...validTransaction, pocketType: 'cash' }).success).toBe(false);
  });

  test('accepts only UUID idempotency keys', () => {
    expect(IdempotencyKeySchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    expect(IdempotencyKeySchema.safeParse('retry-1').success).toBe(false);
  });
});
