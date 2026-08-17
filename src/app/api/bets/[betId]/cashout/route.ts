import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { mapBetsError } from '@/lib/bets/http';
import { BetCashoutRequestSchema, BetIdSchema, IdempotencyKeySchema } from '@/lib/bets/schemas';
import { cashoutBet } from '@/lib/bets/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ betId: string }> }) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }

  const { betId } = await context.params;
  if (!BetIdSchema.safeParse(betId).success) { return codedErrorResponse('Bet not found', 'BET_NOT_FOUND', 404); }
  const key = IdempotencyKeySchema.safeParse(request.headers.get('Idempotency-Key'));
  if (!key.success) { return codedErrorResponse('Idempotency-Key header must be a UUID', 'VALIDATION_ERROR', 400, 'Idempotency-Key'); }
  const body = BetCashoutRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) { return codedErrorResponse(body.error.issues[0]?.message ?? 'Invalid cashout', 'VALIDATION_ERROR', 400, body.error.issues[0]?.path.join('.')); }

  try {
    const result = await cashoutBet(createServiceRoleClient(), user.id, betId, body.data, key.data);
    return successResponse({ success: true, ...result });
  }
  catch (error) {
    return mapBetsError(error);
  }
}
