import { AdminUsersQuerySchema } from '@/lib/admin/schemas';
import { requireAdmin } from '@/lib/api/auth';
import { codedErrorResponse, serverError, successResponse } from '@/lib/api/responses';
import { createServerFromRequest } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const query = AdminUsersQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!query.success) { return codedErrorResponse('Invalid pagination', 'VALIDATION_ERROR', 400); }
    const { limit, offset } = query.data;
    const supabase = await createServerFromRequest(request);
    const { data, error } = await supabase.from('users').select('id, email, role, role_version, created_at').order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + limit);
    if (error) { throw error; }
    return successResponse({ success: true, users: data.slice(0, limit), nextOffset: data.length > limit ? offset + limit : null });
  }
  catch (error) {
    if (error instanceof Response) { return error; }
    return serverError();
  }
}
