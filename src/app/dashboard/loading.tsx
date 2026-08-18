import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <section className="grid gap-6" data-testid="dashboardLoading" role="status">
      <span className="sr-only">Cargando dashboard</span>
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </section>
  );
}
