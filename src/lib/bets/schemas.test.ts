import { describe, expect, test } from 'bun:test';

import { BetCreateRequestSchema, IdempotencyKeySchema } from './schemas';

const validRequest = {
  bankId: '550e8400-e29b-41d4-a716-446655440000',
  odds: 2.3456,
  stake: { type: 'amount', amount: 20 },
  funding: { cash: 5, bonus: 5, freebet: 10 },
  legs: [{
    referenceType: 'manual',
    eventName: '  Team A vs Team B  ',
    marketName: '  Match winner  ',
    selection: '  Team A  ',
    odds: 1.0001,
  }],
};

describe('BetCreateRequestSchema', () => {
  test('accepts and trims a valid manual bet', () => {
    const result = BetCreateRequestSchema.parse(validRequest);

    expect(result.legs[0]).toEqual({
      referenceType: 'manual',
      eventName: 'Team A vs Team B',
      marketName: 'Match winner',
      selection: 'Team A',
      odds: 1.0001,
    });
  });

  test('accepts normalized legs and rejects mixed or unknown fields', () => {
    const normalized = {
      ...validRequest,
      legs: [{
        referenceType: 'normalized',
        eventId: '550e8400-e29b-41d4-a716-446655440001',
        marketId: '550e8400-e29b-41d4-a716-446655440002',
        selection: 'Team A',
        odds: 2,
      }],
    };

    expect(BetCreateRequestSchema.safeParse(normalized).success).toBe(true);
    expect(BetCreateRequestSchema.safeParse({
      ...normalized,
      legs: [{ ...normalized.legs[0], eventName: 'Forbidden' }],
    }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({ ...validRequest, unexpected: true }).success).toBe(false);
  });

  test('enforces leg count, text length, and odds precision', () => {
    expect(BetCreateRequestSchema.safeParse({ ...validRequest, legs: [] }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      legs: Array.from({ length: 21 }, () => validRequest.legs[0]),
    }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({ ...validRequest, odds: 1 }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({ ...validRequest, odds: 2.34567 }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      legs: [{ ...validRequest.legs[0], selection: 'x'.repeat(101) }],
    }).success).toBe(false);
  });

  test('discriminates stake and validates amount and level precision', () => {
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      stake: { type: 'level', level: 0.1 },
    }).success).toBe(true);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      stake: { type: 'amount', amount: 20, level: 10 },
    }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      stake: { type: 'amount', amount: 20.001 },
    }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      stake: { type: 'level', level: 10.01 },
    }).success).toBe(false);
  });

  test('requires exact, non-zero funding with monetary precision', () => {
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      funding: { cash: 0, bonus: 0, freebet: 0 },
    }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      funding: { cash: 5.001, bonus: 5, freebet: 9.999 },
    }).success).toBe(false);
    expect(BetCreateRequestSchema.safeParse({
      ...validRequest,
      funding: { cash: 5, bonus: 5, freebet: 9.99 },
    }).success).toBe(false);
  });

  test('accepts only UUID idempotency keys', () => {
    expect(IdempotencyKeySchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    expect(IdempotencyKeySchema.safeParse('retry-1').success).toBe(false);
  });
});
