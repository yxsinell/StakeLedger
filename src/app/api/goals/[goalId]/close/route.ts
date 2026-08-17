import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { mapGoalsError } from '@/lib/goals/http';
import { GoalCloseRequestSchema, GoalIdSchema } from '@/lib/goals/schemas';
import { closeGoal, getGoal } from '@/lib/goals/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ goalId: string }> }) {
  const session = await createServerClient();
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }
  const { goalId } = await context.params;
  if (!GoalIdSchema.safeParse(goalId).success) { return codedErrorResponse('Goal not found', 'GOAL_NOT_FOUND', 404); }
  const parsed = GoalCloseRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return codedErrorResponse(issue?.message ?? 'Invalid closure', 'VALIDATION_ERROR', 400, issue?.path.join('.'));
  }
  try {
    await closeGoal(createServiceRoleClient(), user.id, goalId, parsed.data);
    const goal = await getGoal(session, goalId);
    return goal ? successResponse({ success: true, goal }) : codedErrorResponse('Goal not found', 'GOAL_NOT_FOUND', 404);
  }
  catch (caught) { return mapGoalsError(caught); }
}
