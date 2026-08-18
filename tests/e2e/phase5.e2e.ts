import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

interface State {
  eventId: string
  marketId: string
  ledgerDestinationBankId: string
  ledgerSourceBankId: string
}

const readState = async () => JSON.parse(await readFile('.playwright/phase4i-state.json', 'utf8')) as State;

test.describe.serial('Phase 5: connected MVP journeys', () => {
  test('ledger records deposit, withdrawal, transfer, and refreshed traceable entries', async ({ page }) => {
    test.setTimeout(90_000);
    const state = await readState();

    await page.goto(`/dashboard/banks/${state.ledgerSourceBankId}`);
    await expect(page.getByTestId('bankDetailPage')).toBeVisible();

    await page.getByTestId('transaction_amount_input').fill('25');
    await page.getByTestId('submit_transaction_button').click();
    await expect(page.getByTestId('operative_balance')).toContainText('125,00');

    await page.getByTestId('transaction_type_select').selectOption('withdraw');
    await page.getByTestId('transaction_amount_input').fill('5');
    await page.getByTestId('submit_transaction_button').click();
    await expect(page.getByTestId('operative_balance')).toContainText('120,00');

    await page.getByTestId('to_bank_select').selectOption(state.ledgerDestinationBankId);
    await page.getByTestId('transfer_amount_input').fill('10');
    await page.getByTestId('submit_transfer_button').click();
    await expect(page.getByTestId('operative_balance')).toContainText('110,00');
    await expect(page.getByTestId('transaction_history_list')).toContainText('Depósito');
    await expect(page.getByTestId('transaction_history_list')).toContainText('Retirada');
    await expect(page.getByTestId('transaction_history_list')).toContainText('Transferencia enviada');

    await page.goto(`/dashboard/banks/${state.ledgerDestinationBankId}`);
    await expect(page.getByTestId('operative_balance')).toContainText('10,00');
    await expect(page.getByTestId('transaction_history_list')).toContainText('Transferencia recibida');
  });

  test('catalog selection creates a normalized ticket without manual UUID entry', async ({ page }) => {
    test.setTimeout(90_000);
    const state = await readState();

    await page.goto('/dashboard/bets/new');
    await page.getByTestId('bank_select').selectOption(state.ledgerSourceBankId);
    await page.getByTestId('leg_reference_type_select').selectOption('normalized');
    await page.getByTestId('leg_event_select').selectOption(state.eventId);
    await page.getByTestId('leg_market_select').selectOption(state.marketId);
    await expect(page.getByTestId('leg_reference_type_select')).toHaveValue('normalized');
    await expect(page.getByTestId('leg_event_select')).toHaveValue(state.eventId);
    await expect(page.getByTestId('leg_market_select')).toHaveValue(state.marketId);

    await page.getByTestId('leg_selection_input').fill('Home');
    await page.getByTestId('leg_odds_input').fill('1.01');
    await page.getByTestId('ticket_odds_input').fill('1.01');
    await page.getByTestId('stake_amount_input').fill('10');
    await page.getByTestId('cash_amount_input').fill('10');
    await page.getByTestId('submit_bet_button').click();
    await expect(page.getByTestId('bet_success')).toContainText('creado correctamente');
  });

  test('dashboard exposes live summary and restricts admin-only management', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard_summary')).toBeVisible();
    await expect(page.getByTestId('dashboard_banks_list')).toBeVisible();
    await expect(page.getByTestId('open_tickets_count')).not.toHaveText('0');

    await page.goto('/dashboard/admin/users');
    await expect(page.getByTestId('admin_users_restricted_state')).toBeVisible();
  });

  test('logout ends current session and returns user to login', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:3001',
      storageState: '.playwright/phase6-logout-auth.json',
    });
    const logoutPage = await context.newPage();
    await logoutPage.goto('/dashboard');
    await expect(logoutPage.getByTestId('logout_button')).toBeVisible();
    const logoutResponse = logoutPage.waitForResponse(response => response.url().endsWith('/api/auth/logout'));
    await logoutPage.getByTestId('logout_button').click();
    expect((await logoutResponse).status()).toBe(200);
    await expect.poll(async () => (await context.cookies()).filter(cookie => cookie.name.startsWith('sb-')).length).toBe(0);
    await expect(logoutPage).toHaveURL('/login');
    await expect(logoutPage.getByTestId('loginForm')).toBeVisible();
    await context.close();
  });
});
