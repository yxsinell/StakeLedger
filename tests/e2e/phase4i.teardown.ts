import { readFile, rm } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const statePath = '.playwright/phase4i-state.json';

export default async function teardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { throw new Error('Supabase test configuration is required'); }
  const state = JSON.parse(await readFile(statePath, 'utf8')) as { userIds: string[] };
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  for (const userId of state.userIds) {
    const { data: banks, error: banksError } = await supabase.from('banks').select('id').eq('user_id', userId);
    if (banksError) { throw banksError; }
    const bankIds = banks.map(bank => bank.id);
    const { data: goals, error: goalsError } = await supabase.from('goals').select('id').eq('user_id', userId);
    if (goalsError) { throw goalsError; }
    const goalIds = goals.map(goal => goal.id);
    if (goalIds.length) {
      const { error } = await supabase.from('goal_history').delete().in('goal_id', goalIds); if (error) { throw error; }
    }
    if (bankIds.length) {
      const { data: bets, error: betsError } = await supabase.from('bets').select('id').in('bank_id', bankIds);
      if (betsError) { throw betsError; }
      const betIds = bets.map(bet => bet.id);
      for (const table of ['settlement_idempotencies', 'cashout_idempotencies', 'bet_idempotencies'] as const) {
        const { error } = await supabase.from(table).delete().eq('user_id', userId); if (error) { throw error; }
      }
      if (betIds.length) {
        for (const table of ['bet_funding', 'bet_legs'] as const) { const { error } = await supabase.from(table).delete().in('bet_id', betIds); if (error) { throw error; } }
        const { error: transactionsError } = await supabase.from('transactions').delete().in('bank_id', bankIds); if (transactionsError) { throw transactionsError; }
        const { error: cashoutsError } = await supabase.from('bet_cashouts').delete().in('bet_id', betIds); if (cashoutsError) { throw cashoutsError; }
        const { error: betsDeleteError } = await supabase.from('bets').delete().in('id', betIds); if (betsDeleteError) { throw betsDeleteError; }
      }
      if (goalIds.length) { const { error } = await supabase.from('goals').delete().in('id', goalIds); if (error) { throw error; } }
      const { error: riskError } = await supabase.from('risk_limits').delete().eq('user_id', userId); if (riskError) { throw riskError; }
      const { error: banksDeleteError } = await supabase.from('banks').delete().in('id', bankIds); if (banksDeleteError) { throw banksDeleteError; }
    }
    // Soft-delete auth access while retaining immutable audit rows and actor profile evidence.
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId, true);
    if (deleteUserError) { throw deleteUserError; }
  }
  await rm(statePath, { force: true });
}
