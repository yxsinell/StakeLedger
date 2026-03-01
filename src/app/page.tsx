import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page" data-testid="homePage">
      <section className="card" data-testid="heroSection">
        <div className="badge">StakeLedger</div>
        <h1>Control real de tu bank</h1>
        <p>
          Gestiona tus banks, tickets y objetivos con trazabilidad completa y
          decisiones basadas en datos.
        </p>
        <div className="actions">
          <Link className="button" data-testid="login_link" href="/login">
            Iniciar sesion
          </Link>
          <Link className="button secondary" data-testid="signup_link" href="/signup">
            Crear cuenta
          </Link>
        </div>
      </section>
      <section className="card" data-testid="infoSection">
        <h2>Base lista para operar</h2>
        <ul>
          <li>Auth real con Supabase</li>
          <li>Ledger con bolsillos cash, bonus y freebet</li>
          <li>Auditoria y trazabilidad desde el dia uno</li>
        </ul>
      </section>
    </main>
  );
}
