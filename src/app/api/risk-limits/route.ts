import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { mapGoalsError } from '@/lib/goals/http';
import { RiskLimitsPatchSchema } from '@/lib/goals/schemas';
import { getRiskLimits, updateRiskLimits } from '@/lib/goals/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

const sessionUser = async () => {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
};

export async function GET() {
  const { supabase, user } = await sessionUser();
  if (!user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }
  try { return successResponse({ success: true, riskLimits: await getRiskLimits(supabase) }); }
  catch (caught) { return mapGoalsError(caught); }
}

export async function PATCH(request: Request) {
  const { user } = await sessionUser();
  if (!user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }
  const parsed = RiskLimitsPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return codedErrorResponse(issue?.message ?? 'Invalid risk limits', 'VALIDATION_ERROR', 400, issue?.path.join('.'));
  }
  try {
    return successResponse({ success: true, riskLimits: await updateRiskLimits(createServiceRoleClient(), user.id, parsed.data) });
  }
  catch (caught) { return mapGoalsError(caught); }
}
