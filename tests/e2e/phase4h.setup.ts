import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const statePath = '.playwright/phase4h-state.json';

export default async function setup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { throw new Error('Supabase test configuration is required'); }

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const email = `phase4h-${suffix}@example.com`;
  const password = `Phase4H-${crypto.randomUUID()}!`;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !created.user) { throw createError ?? new Error('Test user was not created'); }

  const userId = created.user.id;
  try {
    const bankId = crypto.randomUUID();
    const settleBetId = crypto.randomUUID();
    const cashoutBetId = crypto.randomUUID();
    const settleReserveId = crypto.randomUUID();
    const cashoutReserveId = crypto.randomUUID();

    const { error } = await supabase.from('banks').insert({ id: bankId, user_id: userId, name: `Phase 4H ${suffix}`, currency: 'EUR' });
    if (error) { throw error; }
    const { error: pocketsError } = await supabase.from('bank_pockets').insert([
      { bank_id: bankId, pocket_type: 'cash', balance: 80 },
      { bank_id: bankId, pocket_type: 'bonus', balance: 0 },
      { bank_id: bankId, pocket_type: 'freebet', balance: 0 },
    ]);
    if (pocketsError) { throw pocketsError; }
    const { error: transactionsError } = await supabase.from('transactions').insert([
      { id: settleReserveId, bank_id: bankId, pocket_type: 'cash', type: 'bet_reserve', amount: 10 },
      { id: cashoutReserveId, bank_id: bankId, pocket_type: 'cash', type: 'bet_reserve', amount: 10 },
    ]);
    if (transactionsError) { throw transactionsError; }
    const { error: betsError } = await supabase.from('bets').insert([
      { id: settleBetId, bank_id: bankId, stake_amount: 10, status: 'open', odds: 2, funding_status: 'reserved', idempotency_key: crypto.randomUUID() },
      { id: cashoutBetId, bank_id: bankId, stake_amount: 10, status: 'open', odds: 2, funding_status: 'reserved', idempotency_key: crypto.randomUUID() },
    ]);
    if (betsError) { throw betsError; }
    const { error: legsError } = await supabase.from('bet_legs').insert([
      { bet_id: settleBetId, market: 'Winner', selection: 'Home', odds: 2, reference_type: 'manual', event_name: 'Phase 4H settlement' },
      { bet_id: cashoutBetId, market: 'Winner', selection: 'Away', odds: 2, reference_type: 'manual', event_name: 'Phase 4H cashout' },
    ]);
    if (legsError) { throw legsError; }
    const { error: fundingError } = await supabase.from('bet_funding').insert([
      { bet_id: settleBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: settleReserveId },
      { bet_id: cashoutBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: cashoutReserveId },
    ]);
    if (fundingError) { throw fundingError; }

    await mkdir('.playwright', { recursive: true });
    await writeFile(statePath, JSON.stringify({ email, password, userId, settleBetId, cashoutBetId }), 'utf8');
  }
  catch (error) {
    await supabase.auth.admin.deleteUser(userId);
    throw error;
  }
}
