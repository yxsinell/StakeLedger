import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  return (
    <header
      aria-label="Cabecera de la aplicación"
      className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-4 backdrop-blur"
      data-testid="appHeader"
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="sidebar_toggle" />
        <div>
          <p className="text-xl font-semibold">StakeLedger</p>
          <p className="text-sm text-muted-foreground">
            Control de banks y saldo operativo.
          </p>
        </div>
      </div>
    </header>
  );
}
