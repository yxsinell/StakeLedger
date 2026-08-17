import { BetDetail } from '@/components/bets/bet-detail';

export default async function BetDetailPage({ params }: { params: Promise<{ betId: string }> }) {
  const { betId } = await params;
  return <BetDetail betId={betId} />;
}
