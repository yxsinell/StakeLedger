import { Skeleton } from '@/components/ui/skeleton';

export default function BanksLoading() {
  return (
    <main className="space-y-6" data-testid="banks_route_loading">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-44" />
    </main>
  );
}
