import {
  codedErrorResponse,
  serverError,
  successResponse,
} from '@/lib/api/responses';
import {
  BetCreateRequestSchema,
  IdempotencyKeySchema,
} from '@/lib/bets/schemas';
import { BetsServiceError, createBet, listBets } from '@/lib/bets/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

const mapBetError = (error: unknown) => {
  if (error instanceof BetsServiceError) {
    if (error.message === 'BANK_NOT_FOUND') {
      return codedErrorResponse('Bank not found', 'BANK_NOT_FOUND', 404);
    }

    if (error.message === 'CATALOG_REFERENCE_NOT_FOUND') {
      return codedErrorResponse('Catalog reference not found', 'CATALOG_REFERENCE_NOT_FOUND', 404);
    }

    if (error.message === 'GOAL_NOT_FOUND') {
      return codedErrorResponse('Goal not found', 'GOAL_NOT_FOUND', 404, 'goalId');
    }

    if (error.message === 'GOAL_NOT_ACTIVE') {
      return codedErrorResponse('Goal is not active', 'GOAL_NOT_ACTIVE', 409, 'goalId');
    }

    if (error.message === 'RISK_MAX_ODDS_EXCEEDED') {
      return codedErrorResponse('Ticket odds exceed your configured maximum', 'RISK_MAX_ODDS_EXCEEDED', 409, 'odds');
    }

    if (error.message === 'RISK_DAILY_LOSS_EXCEEDED') {
      return codedErrorResponse('Ticket exceeds your configured daily loss limit', 'RISK_DAILY_LOSS_EXCEEDED', 409, 'stake');
    }

    if (error.message === 'FUNDING_SUM_MISMATCH') {
      return codedErrorResponse('Funding sum must equal stake amount', 'FUNDING_SUM_MISMATCH', 400, 'funding');
    }

    if (error.message === 'STAKE_PRECISION_INVALID') {
      return codedErrorResponse('Calculated stake has more than two decimal places', 'STAKE_PRECISION_INVALID', 400, 'stake.level');
    }

    if (error.message === 'STAKE_CAP_EXCEEDED') {
      return codedErrorResponse('Stake exceeds the cash risk cap', 'STAKE_CAP_EXCEEDED', 409, 'stake');
    }

    if (error.message === 'INSUFFICIENT_POCKET_BALANCE') {
      return codedErrorResponse('Insufficient pocket balance', 'INSUFFICIENT_POCKET_BALANCE', 409, 'funding');
    }

    if (error.message === 'IDEMPOTENCY_KEY_REUSED') {
      return codedErrorResponse(
        'Idempotency key is already associated with a different request',
        'IDEMPOTENCY_KEY_REUSED',
        409,
        'Idempotency-Key',
      );
    }

    if (error.message === 'VALIDATION_ERROR' || error.code === '22023') {
      return codedErrorResponse('Invalid bet request', 'VALIDATION_ERROR', 400);
    }

    if (error.message === 'AUTHENTICATION_REQUIRED' || error.code === '28000') {
      return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }
  }

  return serverError();
};

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
  }

  const bankId = new URL(request.url).searchParams.get('bankId') ?? undefined;
  if (bankId && !IdempotencyKeySchema.safeParse(bankId).success) {
    return codedErrorResponse('Bank not found', 'BANK_NOT_FOUND', 404);
  }

  try {
    return successResponse({ success: true, bets: await listBets(supabase, bankId) });
  }
  catch (error) {
    return mapBetError(error);
  }
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
  }

  const idempotencyKeyHeader = request.headers.get('Idempotency-Key');

  if (!idempotencyKeyHeader) {
    return codedErrorResponse(
      'Idempotency-Key header is required',
      'VALIDATION_ERROR',
      400,
      'Idempotency-Key',
    );
  }

  const idempotencyKey = IdempotencyKeySchema.safeParse(idempotencyKeyHeader);

  if (!idempotencyKey.success) {
    return codedErrorResponse(
      idempotencyKey.error.issues[0]?.message ?? 'Idempotency-Key must be a UUID',
      'VALIDATION_ERROR',
      400,
      'Idempotency-Key',
    );
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return codedErrorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
  }

  const bet = BetCreateRequestSchema.safeParse(body);

  if (!bet.success) {
    const [firstError] = bet.error.issues;
    return codedErrorResponse(
      firstError.message,
      'VALIDATION_ERROR',
      400,
      firstError.path.join('.'),
    );
  }

  try {
    const result = await createBet(
      createServiceRoleClient(),
      user.id,
      bet.data,
      idempotencyKey.data,
    );
    return successResponse(
      {
        success: true,
        bet: result.bet,
        balances: result.balances,
        replayed: result.replayed,
      },
      result.replayed ? 200 : 201,
    );
  }
  catch (error) {
    return mapBetError(error);
  }
}
