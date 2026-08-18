import type { SupabaseClient } from '@supabase/supabase-js';

import type { TransactionCreateInput, TransactionListQuery } from './schemas';
import type { Database } from '@/types/supabase';
import {
  decodeTransactionCursor,
  encodeTransactionCursor,
  LedgerTransactionSchema,
  TransactionResultSchema,
} from './schemas';

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

export const listTransactions = async (
  supabase: SupabaseClient<Database>,
  query: TransactionListQuery,
) => {
  let request = supabase
    .from('transactions')
    .select('id, type, pocket_type, amount, method, created_at, bet_id, cashout_id, transfer_id, related_transaction_id')
    .eq('bank_id', query.bankId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(query.limit + 1);

  if (query.cursor) {
    const cursor = decodeTransactionCursor(query.cursor);
    request = request.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);
  }

  const { data, error } = await request;
  if (error) { throw new TransactionsServiceError('Unable to list transactions', error.code); }

  const rows = data.slice(0, query.limit).map(row => LedgerTransactionSchema.parse({
    id: row.id,
    type: row.type,
    pocketType: row.pocket_type,
    amount: row.amount,
    method: row.method,
    createdAt: row.created_at,
    betId: row.bet_id,
    cashoutId: row.cashout_id,
    transferId: row.transfer_id,
    relatedTransactionId: row.related_transaction_id,
  }));
  const last = rows.at(-1);

  return {
    transactions: rows,
    nextCursor: data.length > query.limit && last
      ? encodeTransactionCursor({ createdAt: last.createdAt, id: last.id })
      : null,
  };
};
