import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { mapBetsError } from '@/lib/bets/http';
import { BetIdSchema } from '@/lib/bets/schemas';
import { getBet } from '@/lib/bets/service';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(_request: Request, context: { params: Promise<{ betId: string }> }) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }

  const { betId } = await context.params;
  if (!BetIdSchema.safeParse(betId).success) { return codedErrorResponse('Bet not found', 'BET_NOT_FOUND', 404); }

  try {
    const detail = await getBet(supabase, betId);
    if (!detail) { return codedErrorResponse('Bet not found', 'BET_NOT_FOUND', 404); }
    return successResponse({ success: true, ...detail });
  }
  catch (error) {
    return mapBetsError(error);
  }
}
