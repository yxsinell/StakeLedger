import { describe, expect, test } from 'bun:test';

import { MetricsOverviewQuerySchema } from './schemas';

const bankId = '550e8400-e29b-41d4-a716-446655440000';

describe('MetricsOverviewQuerySchema', () => {
  test('accepts valid ISO date ranges up to 366 inclusive days', () => {
    expect(MetricsOverviewQuerySchema.safeParse({
      bankId,
      from: '2024-01-01',
      to: '2024-12-31',
    }).success).toBe(true);
    expect(MetricsOverviewQuerySchema.safeParse({
      bankId,
      from: '2026-08-17',
      to: '2026-08-17',
    }).success).toBe(true);
  });

  test('rejects reversed ranges with the domain error code', () => {
    const result = MetricsOverviewQuerySchema.safeParse({
      bankId,
      from: '2026-08-18',
      to: '2026-08-17',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('METRICS_RANGE_INVALID');
    }
  });

  test('rejects ranges over 366 inclusive days', () => {
    const result = MetricsOverviewQuerySchema.safeParse({
      bankId,
      from: '2024-01-01',
      to: '2025-01-01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('METRICS_RANGE_MAX');
    }
  });

  test('requires a UUID and real ISO calendar dates', () => {
    expect(MetricsOverviewQuerySchema.safeParse({
      bankId: 'not-a-uuid',
      from: '2026-02-01',
      to: '2026-02-28',
    }).success).toBe(false);
    expect(MetricsOverviewQuerySchema.safeParse({
      bankId,
      from: '2026-02-30',
      to: '2026-03-01',
    }).success).toBe(false);
    expect(MetricsOverviewQuerySchema.safeParse({ bankId }).success).toBe(false);
  });
});
