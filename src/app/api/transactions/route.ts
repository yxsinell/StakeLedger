import {
  codedErrorResponse,
  serverError,
  successResponse,
} from '@/lib/api/responses';
import { createServerClient } from '@/lib/supabase/server';
import {
  IdempotencyKeySchema,
  TransactionCreateRequestSchema,
} from '@/lib/transactions/schemas';
import {
  recordTransaction,
  TransactionsServiceError,
} from '@/lib/transactions/service';

const mapTransactionError = (error: unknown) => {
  if (error instanceof TransactionsServiceError) {
    if (error.message === 'BANK_NOT_FOUND') {
      return codedErrorResponse('Bank not found', 'BANK_NOT_FOUND', 404);
    }

    if (error.message === 'INSUFFICIENT_CASH') {
      return codedErrorResponse('Insufficient cash balance', 'INSUFFICIENT_CASH', 400, 'amount');
    }

    if (error.message === 'IDEMPOTENCY_KEY_REUSED') {
      return codedErrorResponse(
        'Idempotency key is already associated with a different request',
        'IDEMPOTENCY_KEY_REUSED',
        409,
        'Idempotency-Key',
      );
    }

    if (error.code === '22023') {
      return codedErrorResponse('Invalid transaction request', 'VALIDATION_ERROR', 400);
    }

    if (error.code === '28000') {
      return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }
  }

  return serverError();
};

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

  const transaction = TransactionCreateRequestSchema.safeParse(body);

  if (!transaction.success) {
    const [firstError] = transaction.error.issues;
    return codedErrorResponse(
      firstError.message,
      'VALIDATION_ERROR',
      400,
      firstError.path.join('.'),
    );
  }

  try {
    const result = await recordTransaction(supabase, transaction.data, idempotencyKey.data);
    return successResponse(
      {
        success: true,
        transactionId: result.transactionId,
        balance: result.balance,
      },
      result.replayed ? 200 : 201,
    );
  }
  catch (error) {
    return mapTransactionError(error);
  }
}
