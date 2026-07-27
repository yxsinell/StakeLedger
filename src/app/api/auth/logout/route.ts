import type { NextRequest } from 'next/server';

import { successResponse } from '@/lib/api/responses';
import { createAuthRouteClient } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const response = successResponse({ success: true, message: 'Logout successful' });
  const supabase = createAuthRouteClient(request, response);

  await supabase.auth.signOut();

  return response;
}
