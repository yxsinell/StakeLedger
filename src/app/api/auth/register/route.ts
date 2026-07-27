import type { NextRequest } from 'next/server';

import { errorResponse, serverError, successResponse, validationError } from '@/lib/api/responses';
import { createAuthRouteClient } from '@/lib/auth/session';
import { RegisterRequestSchema } from '@/lib/openapi/schemas/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return errorResponse('Invalid JSON body');
  }

  const validation = RegisterRequestSchema.safeParse(body);

  if (!validation.success) {
    const [firstError] = validation.error.issues;
    return validationError(firstError.path.join('.'), firstError.message);
  }

  const response = successResponse(
    {
      success: true,
      message: 'Registration accepted. Check your email to confirm your account.',
    },
    201,
  );
  const supabase = createAuthRouteClient(request, response);
  const { error } = await supabase.auth.signUp(validation.data);

  if (error) {
    if (error.code === 'user_already_exists') {
      return errorResponse('An account with this email already exists.');
    }

    return serverError('Unable to register account');
  }

  return response;
}
