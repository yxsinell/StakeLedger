import type { Database } from '@/types/supabase';
import { LogoutButton } from '@/components/logout-button';
import { createServerClient } from '@/lib/supabase/server';

type BankRow = Database['public']['Tables']['banks']['Row'];
type BankPocketRow = Database['public']['Tables']['bank_pockets']['Row'];
type BankWithPockets = BankRow & {
  bank_pockets: Array<Pick<BankPocketRow, 'pocket_type' | 'balance'>>
};
type BetRow = Database['public']['Tables']['bets']['Row'];

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="page" data-testid="dashboardPage">
        <section className="card" data-testid="dashboardCard">
          <h1>Dashboard</h1>
          <p>Inicia sesion para ver tus datos.</p>
        </section>
      </main>
    );
  }

  const { data: banks, error: banksError } = await supabase
    .from('banks')
    .select('id, name, currency, created_at, bank_pockets(pocket_type, balance)')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<BankWithPockets[]>();

  const { data: bets, error: betsError } = await supabase
    .from('bets')
    .select('id, stake_amount, status, odds, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<BetRow[]>();

  const hasError = banksError || betsError;

  return (
    <main className="page" data-testid="dashboardPage">
      <section className="card" data-testid="dashboardCard">
        <div className="header-row">
          <div>
            <h1>Dashboard</h1>
            <p>
              Bienvenido,
              {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
        {hasError
          ? (
              <div className="form-error" data-testid="dashboard_error">
                No pudimos cargar los datos. Revisa tu conexion e intenta de nuevo.
              </div>
            )
          : null}
        <div className="grid">
          <section className="panel" data-testid="banksSection">
            <h2>Banks recientes</h2>
            {banks?.length
              ? (
                  <ul className="list" data-testid="banksList">
                    {banks.map(bank => (
                      <li key={bank.id} data-testid="bankItem">
                        <div className="list-title">{bank.name}</div>
                        <div className="list-meta">{bank.currency}</div>
                        <div className="pockets">
                          {bank.bank_pockets.map(pocket => (
                            <div key={pocket.pocket_type} className="chip" data-testid="pocketItem">
                              {pocket.pocket_type}
                              :
                              {pocket.balance}
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              : (
                  <p data-testid="banksEmpty">Aun no tienes banks creados.</p>
                )}
          </section>
          <section className="panel" data-testid="betsSection">
            <h2>Tickets recientes</h2>
            {bets?.length
              ? (
                  <ul className="list" data-testid="betsList">
                    {bets.map(bet => (
                      <li key={bet.id} data-testid="betItem">
                        <div className="list-title">
                          Stake
                          {bet.stake_amount}
                        </div>
                        <div className="list-meta">
                          {bet.status}
                          {' '}
                          - Cuota
                          {bet.odds}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              : (
                  <p data-testid="betsEmpty">Aun no hay tickets registrados.</p>
                )}
          </section>
        </div>
      </section>
    </main>
  );
}
