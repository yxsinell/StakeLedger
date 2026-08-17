import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

interface Phase4hState {
  email: string
  password: string
  settleBetId: string
  cashoutBetId: string
}

test('SL-14 and SL-15: settle and partially cash out owned tickets', async ({ page }) => {
  const state = JSON.parse(await readFile('.playwright/phase4h-state.json', 'utf8')) as Phase4hState;
  await page.goto('/login');
  await page.waitForTimeout(200);
  await page.getByTestId('email_input').fill(state.email);
  await page.getByTestId('password_input').fill(state.password);
  await page.getByTestId('login_button').click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto(`/dashboard/bets/${state.settleBetId}`);
  await page.getByTestId('settlement_result_select').selectOption('won');
  await page.getByTestId('confirm_settlement_button').click();
  await expect(page.getByTestId('confirm_settlement_button')).toHaveText('Aplicar liquidación');
  await page.getByTestId('confirm_settlement_button').click();
  await expect(page.getByTestId('bet_action_success')).toContainText('Ticket liquidado');
  await expect(page.getByTestId('auditHistory')).toContainText('settled');

  await page.goto(`/dashboard/bets/${state.cashoutBetId}`);
  await page.getByTestId('cashout_amount_input').fill('8');
  await page.getByTestId('remaining_stake_input').fill('4');
  await page.getByTestId('confirm_cashout_button').click();
  await expect(page.getByTestId('confirm_cashout_button')).toHaveText('Aplicar cashout');
  await page.getByTestId('confirm_cashout_button').click();
  await expect(page.getByTestId('bet_action_success')).toContainText('Cashout aplicado');
  await expect(page.getByTestId('auditHistory')).toContainText('cashout');
});
