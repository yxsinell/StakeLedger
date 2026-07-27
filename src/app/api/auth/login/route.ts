import type { NextRequest } from 'next/server';

import { errorResponse, successResponse, validationError } from '@/lib/api/responses';
import { createAuthRouteClient } from '@/lib/auth/session';
import { LoginRequestSchema } from '@/lib/openapi/schemas/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return errorResponse('Invalid JSON body');
  }

  const validation = LoginRequestSchema.safeParse(body);

  if (!validation.success) {
    const [firstError] = validation.error.issues;
    return validationError(firstError.path.join('.'), firstError.message);
  }

  const response = successResponse({ success: true, message: 'Login successful' });
  const supabase = createAuthRouteClient(request, response);
  const { error } = await supabase.auth.signInWithPassword(validation.data);

  if (error) {
    return errorResponse('Invalid email or password', 401);
  }

  return response;
}
