import { z } from 'zod';
import { AdminRoleUpdateSchema } from '@/lib/admin/schemas';
import { requireAdmin } from '@/lib/api/auth';
import { codedErrorResponse, serverError, successResponse } from '@/lib/api/responses';
import { createServiceRoleClient } from '@/lib/supabase/server';

const UserIdSchema = z.string().uuid();
export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { profile } = await requireAdmin(request);
    const userId = UserIdSchema.safeParse((await params).userId);
    const body = AdminRoleUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!userId.success || !body.success) { return codedErrorResponse('Invalid role update', 'VALIDATION_ERROR', 400); }
    const { data, error } = await createServiceRoleClient().rpc('change_user_role', { p_actor_user_id: profile.id, p_target_user_id: userId.data, p_role: body.data.role, p_expected_role_version: body.data.expectedRoleVersion });
    if (error) {
      const codes: Record<string, [string, number]> = { SELF_ROLE_CHANGE_FORBIDDEN: ['Self role changes are forbidden', 403], ADMIN_REQUIRED: ['Admin required', 403], USER_NOT_FOUND: ['User not found', 404], ROLE_VERSION_CONFLICT: ['Role changed concurrently', 409], INVALID_ROLE: ['Invalid role', 400] };
      const mapped = codes[error.message];
      if (mapped) { return codedErrorResponse(mapped[0], error.message, mapped[1]); }
      throw error;
    }
    return successResponse({ success: true, user: data?.[0] });
  }
  catch (error) {
    if (error instanceof Response) { return error; }
    return serverError();
  }
}
