import type { NextRequest } from 'next/server';

import { z } from 'zod';

import { getAuthenticatedUser } from '@/lib/api/auth';
import {
  errorResponse,
  serverError,
  successResponse,
  validationError,
} from '@/lib/api/responses';
import { createServerFromRequest } from '@/lib/supabase/server';

const CreateExampleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  currency: z.string().min(1, 'Currency is required').max(12),
});

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError) {
      return authError;
    }

    const supabase = await createServerFromRequest(request);
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API] Failed to fetch examples:', error);
      return serverError('Failed to fetch data');
    }

    return successResponse(data ?? []);
  }
  catch (error) {
    console.error('[API] Unexpected error:', error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError) {
      return authError;
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return errorResponse('Invalid JSON body');
    }

    const validation = CreateExampleSchema.safeParse(body);

    if (!validation.success) {
      const [firstError] = validation.error.issues;
      return validationError(firstError.path.join('.'), firstError.message);
    }

    const supabase = await createServerFromRequest(request);
    const { data, error } = await supabase
      .from('banks')
      .insert({
        user_id: user.id,
        name: validation.data.name,
        currency: validation.data.currency,
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Failed to create example:', error);
      return serverError('Failed to create');
    }

    return successResponse(data, 201);
  }
  catch (error) {
    console.error('[API] Unexpected error:', error);
    return serverError();
  }
}
