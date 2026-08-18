import { mkdir, writeFile } from 'node:fs/promises';
import { createServerClient as createSsrServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cleanupPhase4iState } from './phase4i.teardown';

const statePath = '.playwright/phase4i-state.json';
const authStatePath = '.playwright/phase4i-auth.json';

export default async function setup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey || !anonKey) { throw new Error('Supabase test configuration is required'); }
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const password = `Phase4I-${crypto.randomUUID()}!`;
  const secondaryPassword = `Phase4I-${crypto.randomUUID()}!`;
  const email = `phase4i-${suffix}@example.com`;
  const secondaryEmail = `phase4i-owner-${suffix}@example.com`;
  const createdUsers: string[] = [];
  const competitionId = crypto.randomUUID();
  const homeTeamId = crypto.randomUUID();
  const awayTeamId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const marketId = crypto.randomUUID();
  const catalogSport = `phase4j-${suffix}`;
  const fixtureNow = new Date();

  try {
    const { data: primary, error: primaryError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (primaryError || !primary.user) { throw primaryError ?? new Error('Primary test user was not created'); }
    createdUsers.push(primary.user.id);
    const { data: secondary, error: secondaryError } = await supabase.auth.admin.createUser({ email: secondaryEmail, password: secondaryPassword, email_confirm: true });
    if (secondaryError || !secondary.user) { throw secondaryError ?? new Error('Secondary test user was not created'); }
    createdUsers.push(secondary.user.id);

    const { error: roleError } = await supabase.from('users').update({ role: 'editor' }).eq('id', primary.user.id);
    if (roleError) { throw roleError; }

    const { data: link, error: linkError } = await supabase.auth.admin.generateLink({ type: 'magiclink', email });
    if (linkError || !link.properties.hashed_token) { throw linkError ?? new Error('Test session link was not created'); }
    const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: verified, error: verifyError } = await authClient.auth.verifyOtp({
      token_hash: link.properties.hashed_token,
      type: 'email',
    });
    if (verifyError || !verified.session) { throw verifyError ?? new Error('Test session was not created'); }
    const cookieJar = new Map<string, string>();
    const sessionClient = createSsrServerClient(url, anonKey, {
      cookies: {
        getAll: () => [...cookieJar].map(([name, value]) => ({ name, value })),
        setAll: cookies => cookies.forEach(cookie => cookieJar.set(cookie.name, cookie.value)),
      },
    });
    const { error: sessionError } = await sessionClient.auth.setSession({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
    });
    if (sessionError) { throw sessionError; }
    const authCookies = [...cookieJar].map(([name, value]) => ({
      name,
      value,
      domain: '127.0.0.1',
      path: '/',
      expires: verified.session!.expires_at,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax' as const,
    }));

    const settlementBankId = crypto.randomUUID();
    const goalBankId = crypto.randomUUID();
    const concurrencyBankId = crypto.randomUUID();
    const secondaryBankId = crypto.randomUUID();
    const metricsBankId = crypto.randomUUID();
    const ledgerSourceBankId = crypto.randomUUID();
    const ledgerDestinationBankId = crypto.randomUUID();
    const goalBankName = `Goal bank ${suffix}`;
    const metricsBankName = `Metrics bank ${suffix}`;
    const { error: bankError } = await supabase.from('banks').insert([
      { id: settlementBankId, user_id: primary.user.id, name: `Settlement bank ${suffix}`, currency: 'EUR' },
      { id: goalBankId, user_id: primary.user.id, name: goalBankName, currency: 'EUR' },
      { id: concurrencyBankId, user_id: primary.user.id, name: `Concurrency bank ${suffix}`, currency: 'EUR' },
      { id: secondaryBankId, user_id: secondary.user.id, name: `Secondary bank ${suffix}`, currency: 'EUR' },
      { id: metricsBankId, user_id: primary.user.id, name: metricsBankName, currency: 'EUR' },
      { id: ledgerSourceBankId, user_id: primary.user.id, name: `Ledger source ${suffix}`, currency: 'EUR' },
      { id: ledgerDestinationBankId, user_id: primary.user.id, name: `Ledger destination ${suffix}`, currency: 'EUR' },
    ]);
    if (bankError) { throw bankError; }
    const { error: pocketsError } = await supabase.from('bank_pockets').insert([
      ...[settlementBankId, goalBankId, concurrencyBankId, secondaryBankId, metricsBankId, ledgerSourceBankId, ledgerDestinationBankId].flatMap(bankId => [
        { bank_id: bankId, pocket_type: 'cash', balance: bankId === settlementBankId ? 80 : bankId === ledgerDestinationBankId ? 0 : 100 },
        { bank_id: bankId, pocket_type: 'bonus', balance: 0 },
        { bank_id: bankId, pocket_type: 'freebet', balance: 0 },
      ]),
    ]);
    if (pocketsError) { throw pocketsError; }

    const settleBetId = crypto.randomUUID();
    const cashoutBetId = crypto.randomUUID();
    const metricsBetId = crypto.randomUUID();
    const settleReserveId = crypto.randomUUID();
    const cashoutReserveId = crypto.randomUUID();
    const metricsReserveId = crypto.randomUUID();
    const { error: transactionError } = await supabase.from('transactions').insert([
      { id: settleReserveId, bank_id: settlementBankId, pocket_type: 'cash', type: 'bet_reserve', amount: 10 },
      { id: cashoutReserveId, bank_id: settlementBankId, pocket_type: 'cash', type: 'bet_reserve', amount: 10 },
    ]);
    if (transactionError) { throw transactionError; }
    const { error: betsError } = await supabase.from('bets').insert([
      { id: settleBetId, bank_id: settlementBankId, stake_amount: 10, status: 'open', odds: 2, funding_status: 'reserved', idempotency_key: crypto.randomUUID() },
      { id: cashoutBetId, bank_id: settlementBankId, stake_amount: 10, status: 'open', odds: 2, funding_status: 'reserved', idempotency_key: crypto.randomUUID() },
      {
        id: metricsBetId,
        bank_id: metricsBankId,
        stake_amount: 10,
        status: 'settled',
        odds: 2,
        funding_status: 'returned',
        result: 'won',
        return_amount: 20,
        settlement_amount: 20,
        profit_amount: 10,
        settled_at: fixtureNow.toISOString(),
        idempotency_key: crypto.randomUUID(),
      },
    ]);
    if (betsError) { throw betsError; }
    const { error: metricsTransactionError } = await supabase.from('transactions').insert({
      id: metricsReserveId,
      bank_id: metricsBankId,
      bet_id: metricsBetId,
      pocket_type: 'cash',
      type: 'bet_reserve',
      amount: 10,
    });
    if (metricsTransactionError) { throw metricsTransactionError; }
    const { error: legsError } = await supabase.from('bet_legs').insert([
      { bet_id: settleBetId, market: 'Winner', selection: 'Home', odds: 2, reference_type: 'manual', event_name: 'Phase 4I settlement' },
      { bet_id: cashoutBetId, market: 'Winner', selection: 'Away', odds: 2, reference_type: 'manual', event_name: 'Phase 4I cashout' },
      { bet_id: metricsBetId, market: 'Winner', selection: 'Home', odds: 2, reference_type: 'manual', event_name: 'Phase 4J metrics' },
    ]);
    if (legsError) { throw legsError; }
    const { error: fundingError } = await supabase.from('bet_funding').insert([
      { bet_id: settleBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: settleReserveId },
      { bet_id: cashoutBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: cashoutReserveId },
      { bet_id: metricsBetId, pocket_type: 'cash', amount: 10, reserved_transaction_id: metricsReserveId },
    ]);
    if (fundingError) { throw fundingError; }

    const { error: competitionError } = await supabase.from('catalog_competitions').insert({
      id: competitionId,
      name: `Phase 4J competition ${suffix}`,
      normalization_status: 'normalized',
      sport: catalogSport,
      created_by: primary.user.id,
    });
    if (competitionError) { throw competitionError; }
    const { error: teamsError } = await supabase.from('catalog_teams').insert([
      { id: homeTeamId, name: `Phase 4J home ${suffix}`, normalization_status: 'normalized', created_by: primary.user.id },
      { id: awayTeamId, name: `Phase 4J away ${suffix}`, normalization_status: 'normalized', created_by: primary.user.id },
    ]);
    if (teamsError) { throw teamsError; }
    const { error: eventError } = await supabase.from('catalog_events').insert({
      id: eventId,
      competition_id: competitionId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      starts_at: new Date(Date.now() + 86_400_000).toISOString(),
      status: 'scheduled',
      created_by: primary.user.id,
    });
    if (eventError) { throw eventError; }
    const { error: marketError } = await supabase.from('catalog_markets').insert({
      id: marketId,
      event_id: eventId,
      name: 'Winner',
      status: 'active',
      created_by: primary.user.id,
    });
    if (marketError) { throw marketError; }

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
    await writeFile(authStatePath, JSON.stringify({ cookies: authCookies, origins: [] }), 'utf8');
    await writeFile(statePath, JSON.stringify({
      email,
      password,
      userId: primary.user.id,
      secondaryEmail,
      secondaryPassword,
      secondaryUserId: secondary.user.id,
      settleBetId,
      cashoutBetId,
      metricsBetId,
      metricsBankId,
      metricsBankName,
      ledgerSourceBankId,
      ledgerDestinationBankId,
      metricsDate: fixtureNow.toISOString().slice(0, 10),
      goalBankId,
      goalBankName,
      concurrencyBankId,
      deadline,
      secondaryGoalId: (secondaryGoal as { goalId: string }).goalId,
      competitionId,
      homeTeamId,
      awayTeamId,
      eventId,
      marketId,
      catalogSport,
      userIds: createdUsers,
    }), 'utf8');
  }
  catch (error) {
    try {
      await cleanupPhase4iState(supabase, {
        userIds: createdUsers,
        competitionId,
        homeTeamId,
        awayTeamId,
        eventId,
        marketId,
      });
    }
    catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Phase 4I/4J setup and rollback failed');
    }
    throw error;
  }
}
