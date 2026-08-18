import type { NextRequest } from 'next/server';

import { errorResponse, successResponse, validationError } from '@/lib/api/responses';
import { createAuthRouteClient } from '@/lib/auth/session';
import { ResetPasswordRequestSchema } from '@/lib/openapi/schemas/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return errorResponse('Invalid JSON body');
  }

  const validation = ResetPasswordRequestSchema.safeParse(body);

  if (!validation.success) {
    const [firstError] = validation.error.issues;
    return validationError(firstError.path.join('.'), firstError.message);
  }

  const response = successResponse({
    success: true,
    message: 'If an account exists, a password reset email has been sent.',
  });
  const supabase = createAuthRouteClient(request, response);
  await supabase.auth.resetPasswordForEmail(validation.data.email, {
    redirectTo: new URL('/auth/callback', request.nextUrl.origin).toString(),
  });

  return response;
}
