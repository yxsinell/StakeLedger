import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

interface State {
  email: string
  password: string
  metricsBankId: string
  metricsBankName: string
  metricsDate: string
  catalogSport: string
}

interface BetListResponse {
  bets?: unknown[]
  error?: string
}

const readState = async () => JSON.parse(await readFile('.playwright/phase4i-state.json', 'utf8')) as State;

test('SL-28 to SL-31: isolated recommendation surfaces and traceable metrics', async ({ page }) => {
  test.setTimeout(300_000);
  const state = await readState();

  await page.goto('/dashboard');
  await expect(page.getByTestId('appSidebar')).toBeVisible();

  const countBets = async () => page.evaluate(async (bankId) => {
    const response = await fetch(`/api/bets?bankId=${bankId}`);
    const payload = await response.json() as BetListResponse;
    if (!response.ok || !payload.bets) { throw new Error(payload.error ?? 'Could not count bets'); }
    return payload.bets.length;
  }, state.metricsBankId);
  const betsBefore = await countBets();
  expect(betsBefore).toBe(1);

  await page.goto('/dashboard/recommendations');
  await expect(page.getByTestId('recommendationFeed')).toBeVisible();
  await expect(page.getByText('El ICP explica cada propuesta, nunca altera el ranking.')).toBeVisible();
  await page.getByTestId('recommendation_type_select').selectOption('pre');
  await page.getByTestId('recommendation_sport_input').fill(state.catalogSport);
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/recommendations?') && response.request().method() === 'GET'),
    page.getByTestId('apply_recommendation_filters_button').click(),
  ]);
  await expect(page.getByTestId('recommendation_empty')).toBeVisible();
  await page.getByTestId('follow_bank_select').selectOption(state.metricsBankId);
  await expect(page.getByTestId('follow_bank_select')).toHaveValue(state.metricsBankId);

  await page.goto('/dashboard/metrics');
  await page.getByTestId('metrics_bank_select').selectOption(state.metricsBankId);
  await page.getByTestId('metrics_from_input').fill(state.metricsDate);
  await page.getByTestId('metrics_to_input').fill(state.metricsDate);
  const metricsResponse = page.waitForResponse(response => response.url().includes('/api/metrics/overview?') && response.request().method() === 'GET');
  await page.getByTestId('load_metrics_button').click();
  const metricsPayload = await (await metricsResponse).json() as {
    metrics: {
      settledCount: number
      decisiveCount: number
      cashStake: number
      totalStake: number
      totalProfit: number
      yieldCash: number
      yieldOperative: number
      winRate: number
    }
  };
  expect(metricsPayload.metrics).toMatchObject({
    settledCount: 1,
    decisiveCount: 1,
    cashStake: 10,
    totalStake: 10,
    totalProfit: 10,
    yieldCash: 1,
    yieldOperative: 1,
    winRate: 1,
  });
  await expect(page.getByTestId('metrics_results')).toBeVisible();
  await expect(page.getByTestId('metrics_results')).toContainText('100');
  await expect(page.getByTestId('metrics_results')).toContainText('Tickets settled');
  await expect(page.getByTestId('metrics_results')).toContainText('10');

  const adminApiStatus = await page.evaluate(async () => (await fetch('/api/admin/recommendations?limit=1&offset=0')).status);
  expect(adminApiStatus).toBe(200);
  await page.goto('/dashboard/admin/recommendations');
  await expect(page.getByTestId('recommendationAdmin')).toBeVisible();
  await expect(page.getByTestId('recommendationForm')).toBeVisible();
  await page.getByTestId('recommendation_event_id_input').fill(crypto.randomUUID());
  await page.getByTestId('recommendation_market_id_input').fill(crypto.randomUUID());
  await page.getByTestId('recommendation_selection_input').fill('Home');
  await page.getByTestId('recommendation_odds_input').fill('2');
  await page.getByTestId('recommendation_rationale_input').fill('Phase 4J invalid reference check');
  await page.getByTestId('recommendation_icp_score_input').fill('80');
  await page.getByTestId('recommendation_icp_factors_input').fill('Traceable factor');
  const invalidRecommendationResponse = page.waitForResponse(response =>
    response.url().endsWith('/api/recommendations') && response.request().method() === 'POST',
  );
  await page.getByTestId('save_recommendation_button').click();
  expect((await invalidRecommendationResponse).status()).toBe(404);
  await expect(page.getByTestId('recommendation_admin_error')).toContainText('Event not found', { timeout: 15_000 });

  expect(await countBets()).toBe(betsBefore);
});
