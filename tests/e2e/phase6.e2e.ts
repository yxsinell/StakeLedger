import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

interface State {
  competitionId: string
  concurrencyBetBankId: string
  eventId: string
  fundingBankId: string
  ledgerDestinationBankId: string
  ledgerSourceBankId: string
  metricsBoundaryBankId: string
  marketId: string
  publishedRecommendationIds: string[]
  secondaryBankId: string
}

interface ApiResult<T> {
  status: number
  body: T
}

interface BetBody {
  balances: { cash: number, bonus: number, freebet: number }
  bet: { id: string, funding: unknown[] }
  bets: unknown[]
  replayed: boolean
}

interface FeedBody {
  nextCursor: string | null
  recommendations: Array<{
    id: string
    odds: number
    selection: string
    event: { id: string, league: { id: string } }
    market: { id: string }
  }>
}

interface MetricsBody {
  metrics: { settledCount: number, yieldCash: number, yieldOperative: number, winRate: number }
}

const readState = async () => JSON.parse(await readFile('.playwright/phase4i-state.json', 'utf8')) as State;

async function api<T = Record<string, unknown>>(page: Page, path: string, init?: RequestInit): Promise<ApiResult<T>> {
  return page.evaluate(async ({ requestPath, requestInit }: { requestPath: string, requestInit?: RequestInit }) => {
    const response = await fetch(requestPath, requestInit);
    return { status: response.status, body: await response.json() };
  }, { requestPath: path, requestInit: init }) as Promise<ApiResult<T>>;
}

const manualBet = (bankId: string, stake: number, funding: { cash: number, bonus: number, freebet: number }, selection = 'Home') => ({
  bankId,
  odds: 1.01,
  stake: { type: 'amount', amount: stake },
  funding,
  legs: [{ referenceType: 'manual', eventName: 'Phase 6 event', marketName: 'Winner', selection, odds: 1.01 }],
});

test('Phase 6 auth, recovery, mobile navigation, and protected deep links', async ({ browser, page }) => {
  const anonymous = await browser.newContext({
    baseURL: 'http://127.0.0.1:3001',
    storageState: { cookies: [], origins: [] },
  });
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto('/dashboard/bets/not-owned');
  await expect(anonymousPage).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fbets%2Fnot-owned$/);
  const unauthorized = await anonymousPage.evaluate(async () => {
    const response = await fetch('/api/bets');
    return { status: response.status, body: await response.json() };
  });
  expect(unauthorized).toMatchObject({ status: 401, body: { code: 'AUTHENTICATION_REQUIRED' } });

  await anonymousPage.goto('/auth/callback');
  await expect(anonymousPage).toHaveURL(/\/reset-password\?error=recovery_link_invalid$/);
  await anonymousPage.goto('/forgot-password');
  await anonymousPage.getByTestId('email_input').fill(`phase6-missing-${Date.now()}@example.com`);
  await anonymousPage.getByTestId('reset_request_button').click();
  await expect(anonymousPage.getByTestId('form_message')).toContainText('Si existe una cuenta');
  await anonymous.close();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');
  await page.getByTestId('sidebar_toggle').click();
  await expect(page.getByTestId('appSidebar')).toBeVisible();
  await page.getByTestId('banks_nav').click();
  await expect(page).toHaveURL('/dashboard/banks');
});

test('SL-12 and SL-13 API, DB, ownership, idempotency, and concurrency', async ({ page }) => {
  test.setTimeout(120_000);
  const state = await readState();
  await page.goto('/dashboard');
  const mixedPayload = manualBet(state.fundingBankId, 15, { cash: 5, bonus: 5, freebet: 5 });
  const idempotencyKey = crypto.randomUUID();
  const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey };

  const missingHeader = await api(page, '/api/bets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mixedPayload) });
  expect(missingHeader).toMatchObject({ status: 400, body: { code: 'VALIDATION_ERROR' } });

  const created = await api<BetBody>(page, '/api/bets', { method: 'POST', headers, body: JSON.stringify(mixedPayload) });
  expect(created.status, JSON.stringify(created.body)).toBe(201);
  expect(created.body.bet.funding).toHaveLength(3);
  expect(created.body.balances).toEqual({ cash: 95, bonus: 95, freebet: 95 });

  const replay = await api<BetBody>(page, '/api/bets', { method: 'POST', headers, body: JSON.stringify(mixedPayload) });
  expect(replay.status).toBe(200);
  expect(replay.body.bet.id).toBe(created.body.bet.id);
  expect(replay.body.replayed).toBe(true);

  const conflict = await api(page, '/api/bets', { method: 'POST', headers, body: JSON.stringify({ ...mixedPayload, legs: [{ ...mixedPayload.legs[0], selection: 'Away' }] }) });
  expect(conflict).toMatchObject({ status: 409, body: { code: 'IDEMPOTENCY_KEY_REUSED' } });

  const crossOwner = await api(page, '/api/bets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify(manualBet(state.secondaryBankId, 5, { cash: 5, bonus: 0, freebet: 0 })),
  });
  expect(crossOwner).toMatchObject({ status: 404, body: { code: 'BANK_NOT_FOUND' } });

  const concurrentPayload = manualBet(state.concurrencyBetBankId, 20, { cash: 20, bonus: 0, freebet: 0 });
  const concurrentKey = crypto.randomUUID();
  const sameKeyResults = await page.evaluate(async ({ body, key }) => Promise.all([0, 1].map(async () => {
    const response = await fetch('/api/bets', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  })), { body: concurrentPayload, key: concurrentKey });
  expect(sameKeyResults.map(result => result.status).sort()).toEqual([200, 201]);
  expect(new Set(sameKeyResults.map(result => result.body.bet.id)).size).toBe(1);

  const competingPayload = manualBet(state.concurrencyBetBankId, 10, { cash: 10, bonus: 0, freebet: 0 });
  const competingStatuses = await page.evaluate(async body => Promise.all([crypto.randomUUID(), crypto.randomUUID()].map(async key => (await fetch('/api/bets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(body),
  })).status)), competingPayload);
  expect(competingStatuses.sort()).toEqual([201, 409]);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) { throw new Error('Supabase test configuration is required'); }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: fundingRows, error: fundingError } = await supabase.from('bet_funding').select('pocket_type,amount,reserved_transaction_id').eq('bet_id', created.body.bet.id);
  if (fundingError) { throw fundingError; }
  expect(fundingRows).toHaveLength(3);
  expect(fundingRows.every(row => Boolean(row.reserved_transaction_id))).toBe(true);
  const { data: pockets, error: pocketsError } = await supabase.from('bank_pockets').select('balance').eq('bank_id', state.concurrencyBetBankId);
  if (pocketsError) { throw pocketsError; }
  expect(pockets.every(pocket => Number(pocket.balance) >= 0)).toBe(true);
});

test('SL-28 to SL-31 lifecycle, cursor, follow prefill, RBAC, ranges, and ownership', async ({ browser, page }) => {
  test.setTimeout(180_000);
  const state = await readState();
  test.skip(state.publishedRecommendationIds.length < 3, 'Three immutable published recommendations are required');
  const [followRecommendationId, , crossOwnerRecommendationId] = state.publishedRecommendationIds;
  await page.goto('/dashboard');

  const unfilteredFirst = await api<FeedBody>(page, '/api/recommendations?limit=1');
  expect(unfilteredFirst.status).toBe(200);
  expect(unfilteredFirst.body.nextCursor).toBeTruthy();
  const leagueId = unfilteredFirst.body.recommendations[0].event.league.id;
  const leagueFeed = await api<FeedBody>(page, `/api/recommendations?limit=50&leagueId=${leagueId}`);
  expect(leagueFeed.status).toBe(200);
  expect(leagueFeed.body.recommendations.length).toBeGreaterThan(0);
  expect(leagueFeed.body.recommendations.every(recommendation => recommendation.event.league.id === leagueId)).toBe(true);
  const feedSecond = await api<FeedBody>(page, `/api/recommendations?limit=1&cursor=${encodeURIComponent(unfilteredFirst.body.nextCursor!)}`);
  expect(feedSecond.status).toBe(200);
  expect(feedSecond.body.recommendations[0].id).not.toBe(unfilteredFirst.body.recommendations[0].id);
  expect((await api(page, '/api/recommendations?cursor=invalid')).status).toBe(400);

  const invalidDraft = await api(page, '/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: crypto.randomUUID(),
      marketId: crypto.randomUUID(),
      selection: 'Home',
      odds: 2,
      type: 'pre',
      rationale: 'Phase 6 lifecycle',
      status: 'draft',
      icp: { version: 1, score: 50, factors: ['Traceable'] },
    }),
  });
  expect(invalidDraft.status).toBe(404);

  const userContext = await browser.newContext({ baseURL: 'http://127.0.0.1:3001', storageState: '.playwright/phase6-secondary-auth.json' });
  const userPage = await userContext.newPage();
  await userPage.goto('/dashboard');
  const forbidden = await userPage.evaluate(async () => {
    const response = await fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    return response.status;
  });
  expect(forbidden).toBe(403);
  await userContext.close();

  const crossOwnerFollow = await api(page, `/api/recommendations/${crossOwnerRecommendationId}/follow`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bankId: state.secondaryBankId }) });
  expect(crossOwnerFollow.status).toBe(404);

  const betsBefore = (await api<BetBody>(page, `/api/bets?bankId=${state.fundingBankId}`)).body.bets.length;
  const recommendation = unfilteredFirst.body.recommendations[0];
  await page.route(`**/api/recommendations/${followRecommendationId}/follow`, async route => route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      follow: { id: crypto.randomUUID(), recommendationId: followRecommendationId, bankId: state.fundingBankId, createdAt: new Date().toISOString() },
      prefill: {
        recommendationId: followRecommendationId,
        bankId: state.fundingBankId,
        odds: recommendation.odds,
        legs: [{ referenceType: 'normalized', eventId: recommendation.event.id, marketId: recommendation.market.id, selection: recommendation.selection, odds: recommendation.odds }],
      },
    }),
  }));
  await page.goto('/dashboard/recommendations');
  await page.getByTestId('follow_bank_select').selectOption(state.fundingBankId);
  await page.getByTestId('follow_recommendation_button').first().click();
  await expect(page).toHaveURL('/dashboard/bets/new');
  await expect(page.getByTestId('recommendation_prefill_notice')).toBeVisible();
  await expect(page.getByTestId('bank_select')).toHaveValue(state.fundingBankId);
  expect((await api<BetBody>(page, `/api/bets?bankId=${state.fundingBankId}`)).body.bets).toHaveLength(betsBefore);

  const crossOwnerMetrics = await api(page, `/api/metrics/overview?bankId=${state.secondaryBankId}&from=2026-08-01&to=2026-08-01`);
  expect(crossOwnerMetrics.status).toBe(404);
  const tooLong = await api(page, `/api/metrics/overview?bankId=${state.metricsBoundaryBankId}&from=2025-01-01&to=2026-01-02`);
  expect(tooLong.status).toBe(400);
  const empty = await api<MetricsBody>(page, `/api/metrics/overview?bankId=${state.metricsBoundaryBankId}&from=2099-01-01&to=2099-01-01`);
  expect(empty.status).toBe(200);
  expect(empty.body.metrics).toMatchObject({ settledCount: 0, yieldCash: 0, yieldOperative: 0, winRate: 0 });
});
