import { readFile, rm } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const statePath = '.playwright/phase4h-state.json';

export default async function teardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { throw new Error('Supabase test configuration is required'); }

  const state = JSON.parse(await readFile(statePath, 'utf8')) as { userId: string };
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: banks, error: banksError } = await supabase.from('banks').select('id').eq('user_id', state.userId);
  if (banksError) { throw banksError; }
  const bankIds = banks.map(bank => bank.id);

  if (bankIds.length > 0) {
    const { data: bets, error: betsError } = await supabase.from('bets').select('id').in('bank_id', bankIds);
    if (betsError) { throw betsError; }
    const betIds = bets.map(bet => bet.id);

    if (betIds.length > 0) {
      for (const table of ['settlement_idempotencies', 'cashout_idempotencies'] as const) {
        const { error } = await supabase.from(table).delete().eq('user_id', state.userId);
        if (error) { throw error; }
      }
      for (const table of ['bet_funding', 'bet_legs'] as const) {
        const { error } = await supabase.from(table).delete().in('bet_id', betIds);
        if (error) { throw error; }
      }

      const { error: transactionsError } = await supabase.from('transactions').delete().in('bank_id', bankIds);
      if (transactionsError) { throw transactionsError; }
      const { error: cashoutsError } = await supabase.from('bet_cashouts').delete().in('bet_id', betIds);
      if (cashoutsError) { throw cashoutsError; }
      const { error: deleteBetsError } = await supabase.from('bets').delete().in('id', betIds);
      if (deleteBetsError) { throw deleteBetsError; }
    }

    const { error: deleteBanksError } = await supabase.from('banks').delete().in('id', bankIds);
    if (deleteBanksError) { throw deleteBanksError; }
  }

  // Audit rows intentionally retain their actor profile, so revoke test access without deleting that evidence.
  const { error } = await supabase.auth.admin.deleteUser(state.userId, true);
  if (error) { throw error; }
  await rm(statePath, { force: true });
}
