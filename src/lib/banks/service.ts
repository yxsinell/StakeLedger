import type { SupabaseClient } from '@supabase/supabase-js';

import type { BankCreateInput, BankData, TransferCreateInput } from './schemas';
import type { Database } from '@/types/supabase';
import { calculateBankBalances } from './balance';
import {

  BankCurrencySchema,

  BankSchema,
  TransferResultSchema,
} from './schemas';

type BankRow = Database['public']['Tables']['banks']['Row'];
type BankPocketRow = Database['public']['Tables']['bank_pockets']['Row'];
type BankWithPockets = BankRow & {
  bank_pockets: Pick<BankPocketRow, 'pocket_type' | 'balance'>[]
};

export class BanksServiceError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'BanksServiceError';
  }
}

export class TransferServiceError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'TransferServiceError';
  }
}

const mapBank = (bank: BankWithPockets): BankData =>
  BankSchema.parse({
    id: bank.id,
    name: bank.name,
    currency: BankCurrencySchema.parse(bank.currency),
    balances: calculateBankBalances(bank.bank_pockets),
  });

export const listBanks = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from('banks')
    .select('id, name, currency, created_at, user_id, bank_pockets(pocket_type, balance)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new BanksServiceError('Unable to list banks', error.code);
  }

  return (data as BankWithPockets[]).map(mapBank);
};

export const getBank = async (
  supabase: SupabaseClient<Database>,
  bankId: string,
) => {
  const { data, error } = await supabase
    .from('banks')
    .select('id, name, currency, created_at, user_id, bank_pockets(pocket_type, balance)')
    .eq('id', bankId)
    .maybeSingle();

  if (error) {
    throw new BanksServiceError('Unable to load bank', error.code);
  }

  return data ? mapBank(data as BankWithPockets) : null;
};

export const createBank = async (
  supabase: SupabaseClient<Database>,
  input: BankCreateInput,
) => {
  const { data, error } = await supabase.rpc('create_bank_with_pockets', {
    p_name: input.name,
    p_currency: input.currency,
    p_initial_cash: input.initialCash,
    p_initial_bonus: input.initialBonus,
    p_initial_freebet: input.initialFreebet,
  });

  if (error) {
    throw new BanksServiceError('Unable to create bank', error.code);
  }

  return BankSchema.parse(data);
};

export const transferCash = async (
  supabase: SupabaseClient<Database>,
  actorUserId: string,
  sourceBankId: string,
  input: TransferCreateInput,
  idempotencyKey: string,
) => {
  const { data, error } = await supabase.rpc('record_cash_transfer', {
    p_actor_user_id: actorUserId,
    p_source_bank_id: sourceBankId,
    p_destination_bank_id: input.toBankId,
    p_amount: input.amount,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    throw new TransferServiceError(error.message, error.code);
  }

  return TransferResultSchema.parse(data);
};
