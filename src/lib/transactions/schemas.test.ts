import { describe, expect, test } from 'bun:test';

import {
  decodeTransactionCursor,
  encodeTransactionCursor,
  IdempotencyKeySchema,
  TransactionCreateRequestSchema,
  TransactionListQuerySchema,
} from './schemas';

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

describe('transaction history query', () => {
  test('applies pagination defaults and validates the bank identifier', () => {
    expect(TransactionListQuerySchema.parse({ bankId: validTransaction.bankId })).toEqual({
      bankId: validTransaction.bankId,
      limit: 20,
    });
    expect(TransactionListQuerySchema.safeParse({ bankId: 'invalid' }).success).toBe(false);
    expect(TransactionListQuerySchema.safeParse({ bankId: validTransaction.bankId, limit: 101 }).success).toBe(false);
  });

  test('round-trips only canonical transaction cursors', () => {
    const cursor = encodeTransactionCursor({
      createdAt: '2026-08-18T10:30:00.000Z',
      id: validTransaction.bankId,
    });
    expect(decodeTransactionCursor(cursor)).toEqual({
      createdAt: '2026-08-18T10:30:00.000Z',
      id: validTransaction.bankId,
    });
    expect(TransactionListQuerySchema.safeParse({ bankId: validTransaction.bankId, cursor }).success).toBe(true);
    expect(TransactionListQuerySchema.safeParse({ bankId: validTransaction.bankId, cursor: 'invalid' }).success).toBe(false);
  });
});
