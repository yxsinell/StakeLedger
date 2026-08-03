import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { describe, expect, test } from 'bun:test';

import { transferCash, TransferServiceError } from './service';

const sourceBankId = '550e8400-e29b-41d4-a716-446655440000';
const destinationBankId = '550e8400-e29b-41d4-a716-446655440001';
const idempotencyKey = '550e8400-e29b-41d4-a716-446655440002';

describe('transferCash', () => {
  test('calls the transfer RPC and returns its validated result', async () => {
    const supabase = {
      rpc: async (name: string, args: unknown) => {
        expect(name).toBe('record_cash_transfer');
        expect(args).toEqual({
          p_source_bank_id: sourceBankId,
          p_destination_bank_id: destinationBankId,
          p_amount: 10.5,
          p_idempotency_key: idempotencyKey,
        });

        return {
          data: {
            transferId: '550e8400-e29b-41d4-a716-446655440003',
            sourceBalance: 89.5,
            destinationBalance: 10.5,
            replayed: false,
          },
          error: null,
        };
      },
    } as unknown as SupabaseClient<Database>;

    const result = await transferCash(
      supabase,
      sourceBankId,
      { toBankId: destinationBankId, amount: 10.5 },
      idempotencyKey,
    );

    expect(result).toEqual({
      transferId: '550e8400-e29b-41d4-a716-446655440003',
      sourceBalance: 89.5,
      destinationBalance: 10.5,
      replayed: false,
    });
  });

  test('surfaces RPC failures as a typed service error', async () => {
    const supabase = {
      rpc: async () => ({
        data: null,
        error: { message: 'BANK_FORBIDDEN', code: 'P0001' },
      }),
    } as unknown as SupabaseClient<Database>;

    try {
      await transferCash(
        supabase,
        sourceBankId,
        { toBankId: destinationBankId, amount: 10.5 },
        idempotencyKey,
      );
      throw new Error('Expected transferCash to fail');
    }
    catch (error) {
      expect(error).toBeInstanceOf(TransferServiceError);
    }
  });
});
