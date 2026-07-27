import type { NextRequest } from 'next/server';

import { errorResponse, serverError, successResponse, validationError } from '@/lib/api/responses';
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
  const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email);

  if (error) {
    return serverError('Unable to process password reset request');
  }

  return response;
}
