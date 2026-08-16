import {
  codedErrorResponse,
  serverError,
  successResponse,
} from '@/lib/api/responses';
import {
  BankIdSchema,
  TransferCreateRequestSchema,
} from '@/lib/banks/schemas';
import { transferCash, TransferServiceError } from '@/lib/banks/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { IdempotencyKeySchema } from '@/lib/transactions/schemas';

interface RouteContext {
  params: Promise<{ bankId: string }>
}

const mapTransferError = (error: unknown) => {
  if (error instanceof TransferServiceError) {
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
      return codedErrorResponse('Invalid transfer request', 'VALIDATION_ERROR', 400);
    }

    if (error.code === '28000') {
      return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }
  }

  return serverError();
};

export async function POST(request: Request, { params }: RouteContext) {
  const { bankId } = await params;
  const sourceBankId = BankIdSchema.safeParse(bankId);

  if (!sourceBankId.success) {
    return codedErrorResponse('Bank not found', 'BANK_NOT_FOUND', 404);
  }

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

  const transfer = TransferCreateRequestSchema.safeParse(body);

  if (!transfer.success) {
    const [firstError] = transfer.error.issues;
    return codedErrorResponse(
      firstError.message,
      'VALIDATION_ERROR',
      400,
      firstError.path.join('.'),
    );
  }

  if (sourceBankId.data === transfer.data.toBankId) {
    return codedErrorResponse(
      'Source and destination banks must be different',
      'VALIDATION_ERROR',
      400,
      'toBankId',
    );
  }

  try {
    const result = await transferCash(
      createServiceRoleClient(),
      user.id,
      sourceBankId.data,
      transfer.data,
      idempotencyKey.data,
    );
    return successResponse(
      {
        success: true,
        transferId: result.transferId,
        sourceBalance: result.sourceBalance,
        destinationBalance: result.destinationBalance,
      },
      result.replayed ? 200 : 201,
    );
  }
  catch (error) {
    return mapTransferError(error);
  }
}
