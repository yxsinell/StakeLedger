import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { describe, expect, test } from 'bun:test';

import { getMetricsOverview, MetricsServiceError, parseMetricsOverview } from './service';

const bankId = '550e8400-e29b-41d4-a716-446655440000';
const actorUserId = '550e8400-e29b-41d4-a716-446655440001';
const metrics = {
  bankId,
  currency: 'USD',
  from: '2026-01-01',
  to: '2026-01-31',
  yieldCash: 12.5,
  yieldOperative: -2,
  winRate: 0.5,
  settledCount: 3,
  decisiveCount: 2,
  totalStake: 40,
  cashStake: 20,
  totalProfit: 2.5,
};

describe('metrics service', () => {
  test('calls service-role RPC with actor and range and parses its result', async () => {
    const supabase = {
      rpc: async (name: string, args: unknown) => {
        expect(name).toBe('get_metrics_overview');
        expect(args).toEqual({
          p_actor_user_id: actorUserId,
          p_bank_id: bankId,
          p_from: '2026-01-01',
          p_to: '2026-01-31',
        });
        return { data: metrics, error: null };
      },
    } as unknown as SupabaseClient<Database>;

    const result = await getMetricsOverview(supabase, actorUserId, {
      bankId,
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(result).toEqual(metrics);
  });

  test('rejects non-finite and additional response fields', () => {
    expect(() => parseMetricsOverview({ ...metrics, yieldCash: Number.POSITIVE_INFINITY })).toThrow();
    expect(() => parseMetricsOverview({ ...metrics, winRate: -0.1 })).toThrow();
    expect(() => parseMetricsOverview({ ...metrics, winRate: 1.1 })).toThrow();
    expect(() => parseMetricsOverview({ ...metrics, internalValue: 1 })).toThrow();
  });

  test('surfaces RPC failures as typed service errors', async () => {
    const supabase = {
      rpc: async () => ({
        data: null,
        error: { message: 'BANK_NOT_FOUND', code: 'P0001' },
      }),
    } as unknown as SupabaseClient<Database>;

    try {
      await getMetricsOverview(supabase, actorUserId, {
        bankId,
        from: '2026-01-01',
        to: '2026-01-31',
      });
      throw new Error('Expected metrics RPC to fail');
    }
    catch (error) {
      expect(error).toBeInstanceOf(MetricsServiceError);
    }
  });
});
