import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const statePath = '.playwright/phase4i-state.json';

export default async function setup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { throw new Error('Supabase test configuration is required'); }
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const password = `Phase4I-${crypto.randomUUID()}!`;
  const secondaryPassword = `Phase4I-${crypto.randomUUID()}!`;
  const email = `phase4i-${suffix}@example.com`;
  const secondaryEmail = `phase4i-owner-${suffix}@example.com`;
  const createdUsers: string[] = [];

  try {
    const { data: primary, error: primaryError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (primaryError || !primary.user) { throw primaryError ?? new Error('Primary test user was not created'); }
    createdUsers.push(primary.user.id);
    const { data: secondary, error: secondaryError } = await supabase.auth.admin.createUser({ email: secondaryEmail, password: secondaryPassword, email_confirm: true });
    if (secondaryError || !secondary.user) { throw secondaryError ?? new Error('Secondary test user was not created'); }
    createdUsers.push(secondary.user.id);

    const settlementBankId = crypto.randomUUID();
    const goalBankId = crypto.randomUUID();
    const concurrencyBankId = crypto.randomUUID();
    const secondaryBankId = crypto.randomUUID();
    const goalBankName = `Goal bank ${suffix}`;
    const { error: bankError } = await supabase.from('banks').insert([
      { id: settlementBankId, user_id: primary.user.id, name: `Settlement bank ${suffix}`, currency: 'EUR' },
      { id: goalBankId, user_id: primary.user.id, name: goalBankName, currency: 'EUR' },
      { id: concurrencyBankId, user_id: primary.user.id, name: `Concurrency bank ${suffix}`, currency: 'EUR' },
      { id: secondaryBankId, user_id: secondary.user.id, name: `Secondary bank ${suffix}`, currency: 'EUR' },
    ]);
    if (bankError) { throw bankError; }
    const { error: pocketsError } = await supabase.from('bank_pockets').insert([
      ...[settlementBankId, goalBankId, concurrencyBankId, secondaryBankId].flatMap(bankId => [
        { bank_id: bankId, pocket_type: 'cash', balance: bankId === settlementBankId ? 80 : 100 },
        { bank_id: bankId, pocket_type: 'bonus', balance: 0 },
        { bank_id: bankId, pocket_type: 'freebet', balance: 0 },
      ]),
    ]);
    if (pocketsError) { throw pocketsError; }

    const settleBetId = crypto.randomUUID();
    const cashoutBetId = crypto.randomUUID();
    const settleReserveId = crypto.randomUUID();
    const cashoutReserveId = crypto.randomUUID();
    const { error: transactionError } = await supabase.from('transactions').insert([
      { id: settleReserveId, bank_id: settlementBankId, pocket_type: 'cash', type: 'bet_reserve', amount: 10 },
      { id: cashoutReserveId, bank_id: settlementBankId, pocket_type: 'cash', type: 'bet_reserve', amount: 10 },
    ]);
    if (transactionError) { throw transactionError; }
    const { error: betsError } = await supabase.from('bets').insert([
      { id: settleBetId, bank_id: settlementBankId, stake_amount: 10, status: 'open', odds: 2, funding_status: 'reserved', idempotency_key: crypto.randomUUID() },
      { id: cashoutBetId, bank_id: settlementBankId, stake_amount: 10, status: 'open', odds: 2, funding_status: 'reserved', idempotency_key: crypto.randomUUID() },
    ]);
    if (betsError) { throw betsError; }
    const { error: legsError } = await supabase.from('bet_legs').insert([
      { bet_id: settleBetId, market: 'Winner', selection: 'Home', odds: 2, reference_type: 'manual', event_name: 'Phase 4I settlement' },
      { bet_id: cashoutBetId, market: 'Winner', selection: 'Away', odds: 2, reference_type: 'manual', event_name: 'Phase 4I cashout' },
    ]);
    if (legsError) { throw legsError; }
    const { error: fundingError } = await supabase.from('bet_funding').insert([
      { bet_id: settleBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: settleReserveId },
      { bet_id: cashoutBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: cashoutReserveId },
    ]);
    if (fundingError) { throw fundingError; }

    const deadline = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
    const { data: secondaryGoal, error: goalError } = await supabase.rpc('create_goal', {
      p_actor_user_id: secondary.user.id,
      p_bank_id: secondaryBankId,
      p_base_amount: 100,
      p_target_amount: 110,
      p_deadline: deadline,
      p_stake_preference: 10,
      p_strategy: 'balanced',
    });
    if (goalError) { throw goalError; }

    await mkdir('.playwright', { recursive: true });
    await writeFile(statePath, JSON.stringify({
      email,
      password,
      userId: primary.user.id,
      secondaryEmail,
      secondaryPassword,
      secondaryUserId: secondary.user.id,
      settleBetId,
      cashoutBetId,
      goalBankId,
      goalBankName,
      concurrencyBankId,
      deadline,
      secondaryGoalId: (secondaryGoal as { goalId: string }).goalId,
      userIds: createdUsers,
    }), 'utf8');
  }
  catch (error) {
    for (const userId of createdUsers.reverse()) { await supabase.auth.admin.deleteUser(userId); }
    throw error;
  }
}
