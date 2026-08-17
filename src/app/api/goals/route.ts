import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { mapGoalsError } from '@/lib/goals/http';
import { GoalCreateRequestSchema } from '@/lib/goals/schemas';
import { createGoal, getGoal, listGoals } from '@/lib/goals/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }
  try { return successResponse({ success: true, goals: await listGoals(supabase) }); }
  catch (caught) { return mapGoalsError(caught); }
}

export async function POST(request: Request) {
  const session = await createServerClient();
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }
  const parsed = GoalCreateRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return codedErrorResponse(issue?.message ?? 'Invalid goal', 'VALIDATION_ERROR', 400, issue?.path.join('.'));
  }
  try {
    const result = await createGoal(createServiceRoleClient(), user.id, parsed.data) as { goalId?: string };
    const goal = result.goalId ? await getGoal(session, result.goalId) : null;
    if (!goal) { return codedErrorResponse('Goal not found', 'GOAL_NOT_FOUND', 404); }
    return successResponse({ success: true, goal }, 201);
  }
  catch (caught) { return mapGoalsError(caught); }
}
