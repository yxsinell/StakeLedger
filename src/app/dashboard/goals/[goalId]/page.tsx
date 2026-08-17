import { GoalDetail } from '@/components/goals/goal-detail';

export default async function GoalPage({ params }: { params: Promise<{ goalId: string }> }) { const { goalId } = await params; return <GoalDetail goalId={goalId} />; }
