import type { SupabaseClient } from '@supabase/supabase-js';

import type { TransactionCreateInput } from './schemas';
import type { Database } from '@/types/supabase';
import { TransactionResultSchema } from './schemas';

export class TransactionsServiceError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'TransactionsServiceError';
  }
}

export const recordTransaction = async (
  supabase: SupabaseClient<Database>,
  input: TransactionCreateInput,
  idempotencyKey: string,
) => {
  const { data, error } = await supabase.rpc('record_cash_transaction', {
    p_bank_id: input.bankId,
    p_type: input.type,
    p_amount: input.amount,
    p_method: input.method,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    throw new TransactionsServiceError(error.message, error.code);
  }

  return TransactionResultSchema.parse(data);
};
