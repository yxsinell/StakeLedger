import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, role, role_version, created_at')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) {
    return codedErrorResponse('Unable to load authenticated profile', 'INTERNAL_ERROR', 500);
  }
  if (!profile) {
    return codedErrorResponse('Authenticated profile required', 'AUTHENTICATED_PROFILE_REQUIRED', 401);
  }

  return successResponse({ success: true, profile });
}
