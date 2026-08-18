import type { NextRequest } from 'next/server';

import { codedErrorResponse, successResponse, validationError } from '@/lib/api/responses';
import { createAuthRouteClient } from '@/lib/auth/session';

const isValidPassword = (password: string) =>
  password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : null;

  if (!password || !isValidPassword(password)) {
    return validationError(
      'password',
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
    );
  }

  const response = successResponse({ success: true, message: 'Password updated' });
  const supabase = createAuthRouteClient(request, response);
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return codedErrorResponse('Recovery session required', 'RECOVERY_SESSION_REQUIRED', 401);
  }

  return response;
}
