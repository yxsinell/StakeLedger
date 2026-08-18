import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

interface State {
  email: string
  password: string
  goalBankId: string
  goalBankName: string
  concurrencyBankId: string
  deadline: string
  secondaryGoalId: string
  settleBetId: string
  cashoutBetId: string
}

const readState = async () => JSON.parse(await readFile('.playwright/phase4i-state.json', 'utf8')) as State;

test('SL-14, SL-15, and SL-22 to SL-26: settlement, goals, risk, security, and concurrency', async ({ page }) => {
  test.setTimeout(90_000);
  const state = await readState();
  await page.goto('/dashboard');
  await expect(page.getByTestId('appSidebar')).toBeVisible();

  await page.goto(`/dashboard/bets/${state.settleBetId}`);
  await page.getByTestId('settlement_result_select').selectOption('won');
  await page.getByTestId('confirm_settlement_button').click();
  await page.getByTestId('confirm_settlement_button').click();
  await expect(page.getByTestId('bet_action_success')).toContainText('Ticket liquidado');

  await page.goto(`/dashboard/bets/${state.cashoutBetId}`);
  await page.getByTestId('cashout_amount_input').fill('8');
  await page.getByTestId('remaining_stake_input').fill('4');
  await page.getByTestId('confirm_cashout_button').click();
  await page.getByTestId('confirm_cashout_button').click();
  await expect(page.getByTestId('bet_action_success')).toContainText('Cashout aplicado');

  await page.goto('/dashboard/goals/new');
  await page.getByTestId('bank_id_select').selectOption({ label: `${state.goalBankName} · EUR` });
  await page.getByTestId('base_amount_input').fill('100');
  await page.getByTestId('target_amount_input').fill('120');
  await page.getByTestId('deadline_input').fill(state.deadline);
  await page.getByTestId('stake_preference_input').fill('10');
  await page.getByTestId('strategy_select').selectOption('balanced');
  await page.getByTestId('create_goal_button').click();
  await expect(page).toHaveURL(/\/dashboard\/goals\/[0-9a-f-]+/);
  const goalId = page.url().split('/').at(-1)!;
  await expect(page.getByTestId('dailyMissionCard')).toBeVisible();

  await page.getByTestId('target_amount_input').fill('110');
  await page.getByTestId('create_goal_button').click();
  await expect(page.getByTestId('daily_profit_value')).toHaveText('1.00');
  await expect(page.getByTestId('suggested_odds_value')).toHaveText('1.1000');

  const betId = await page.evaluate(async ({ bankId, linkedGoalId }) => {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        bankId,
        goalId: linkedGoalId,
        odds: 2,
        stake: { type: 'amount', amount: 10 },
        funding: { cash: 10, bonus: 0, freebet: 0 },
        legs: [{ referenceType: 'manual', eventName: 'Phase 4I event', marketName: 'Winner', selection: 'Home', odds: 2 }],
      }),
    });
    const body = await response.json();
    if (!response.ok) { throw new Error(body.error); }
    return body.bet.id as string;
  }, { bankId: state.goalBankId, linkedGoalId: goalId });

  await page.goto('/dashboard/goals');
  await page.getByTestId('max_odds_input').fill('1.05');
  await page.getByTestId('save_risk_limits_button').click();
  await expect(page.getByText('Límites guardados.')).toBeVisible();
  await page.goto(`/dashboard/goals/${goalId}`);
  await expect(page.getByTestId('riskAlert')).toBeVisible();

  const riskBlockedStatus = await page.evaluate(async ({ bankId, linkedGoalId }) => {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({
        bankId,
        goalId: linkedGoalId,
        odds: 2,
        stake: { type: 'amount', amount: 5 },
        funding: { cash: 5, bonus: 0, freebet: 0 },
        legs: [{ referenceType: 'manual', eventName: 'Phase 4I risk', marketName: 'Winner', selection: 'Home', odds: 2 }],
      }),
    });
    return { status: response.status, body: await response.json() };
  }, { bankId: state.goalBankId, linkedGoalId: goalId });
  expect(riskBlockedStatus.status).toBe(409);
  expect(riskBlockedStatus.body.code).toBe('RISK_MAX_ODDS_EXCEEDED');

  await page.goto(`/dashboard/bets/${betId}`);
  await page.getByTestId('settlement_result_select').selectOption('won');
  await page.getByTestId('confirm_settlement_button').click();
  await page.getByTestId('confirm_settlement_button').click();
  await expect(page.getByTestId('bet_action_success')).toContainText('Ticket liquidado');
  await page.goto(`/dashboard/goals/${goalId}`);
  await expect(page.getByTestId('goal_history_list')).toContainText('recalculated');
  await expect(page.getByTestId('daily_profit_value')).toHaveText('0.00');
  await page.getByTestId('close_goal_button').click();
  await page.getByTestId('confirm_close_goal_button').click();
  await expect(page.getByTestId('closed_goal_state')).toBeVisible();

  const crossStatus = await page.evaluate(async goalId => (await fetch(`/api/goals/${goalId}`)).status, state.secondaryGoalId);
  expect(crossStatus).toBe(404);

  const payload = { bankId: state.concurrencyBankId, baseAmount: 100, targetAmount: 110, deadline: state.deadline, stakePreference: 10, strategy: 'balanced' };
  const statuses = await page.evaluate(async body => Promise.all([
    fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(response => response.status),
    fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(response => response.status),
  ]), payload);
  expect(statuses.sort()).toEqual([201, 409]);
});
