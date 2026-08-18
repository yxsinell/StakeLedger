import type { SupabaseClient } from '@supabase/supabase-js';
import { readFile, rm } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const statePath = '.playwright/phase4i-state.json';
const authStatePath = '.playwright/phase4i-auth.json';
const secondaryAuthStatePath = '.playwright/phase6-secondary-auth.json';
const logoutAuthStatePath = '.playwright/phase6-logout-auth.json';

export interface Phase4iCleanupState {
  userIds: string[]
  competitionId: string
  homeTeamId: string
  awayTeamId: string
  eventId: string
  marketId: string
}

export async function cleanupPhase4iState(supabase: SupabaseClient, state: Phase4iCleanupState) {
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
      for (const table of ['settlement_idempotencies', 'cashout_idempotencies', 'bet_idempotencies', 'transaction_idempotencies'] as const) {
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
  }

  const { error: marketError } = await supabase.from('catalog_markets').delete().eq('id', state.marketId);
  if (marketError) { throw marketError; }
  const { error: eventError } = await supabase.from('catalog_events').delete().eq('id', state.eventId);
  if (eventError) { throw eventError; }
  const { error: teamsError } = await supabase.from('catalog_teams').delete().in('id', [state.homeTeamId, state.awayTeamId]);
  if (teamsError) { throw teamsError; }
  const { error: competitionError } = await supabase.from('catalog_competitions').delete().eq('id', state.competitionId);
  if (competitionError) { throw competitionError; }

  for (const userId of state.userIds) {
    const residueChecks = await Promise.all([
      supabase.from('banks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('risk_limits').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    ]);
    const residueError = residueChecks.find(result => result.error)?.error;
    if (residueError) { throw residueError; }
    if (residueChecks.some(result => result.count !== 0)) {
      throw new Error(`Phase 6 cleanup left mutable residue for user ${userId}`);
    }
    // Soft-delete auth access while retaining immutable audit rows and actor profile evidence.
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId, true);
    if (deleteUserError) { throw deleteUserError; }
  }
}

export default async function teardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { throw new Error('Supabase test configuration is required'); }
  const stateFile = await readFile(statePath, 'utf8').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') { return null; }
    throw error;
  });
  if (!stateFile) { return; }
  const state = JSON.parse(stateFile) as Phase4iCleanupState;
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  await cleanupPhase4iState(supabase, state);
  await rm(statePath, { force: true });
  await rm(authStatePath, { force: true });
  await rm(secondaryAuthStatePath, { force: true });
  await rm(logoutAuthStatePath, { force: true });
}
