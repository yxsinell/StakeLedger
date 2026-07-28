import {
  errorResponse,
  serverError,
  successResponse,
  unauthorizedError,
  validationError,
} from '@/lib/api/responses';
import { BankCreateRequestSchema } from '@/lib/banks/schemas';
import { BanksServiceError, createBank, listBanks } from '@/lib/banks/service';
import { createServerClient } from '@/lib/supabase/server';

const getSessionClient = async () => {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user, error };
};

const createFailureResponse = (error: unknown) => {
  if (error instanceof BanksServiceError && error.code === '23505') {
    return errorResponse('A bank with that name already exists');
  }

  return serverError();
};

export async function GET() {
  const { supabase, user, error } = await getSessionClient();

  if (error || !user) {
    return unauthorizedError();
  }

  try {
    const banks = await listBanks(supabase);
    return successResponse({ success: true, banks });
  }
  catch (error) {
    return createFailureResponse(error);
  }
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getSessionClient();

  if (error || !user) {
    return unauthorizedError();
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return errorResponse('Invalid JSON body');
  }

  const validation = BankCreateRequestSchema.safeParse(body);

  if (!validation.success) {
    const [firstError] = validation.error.issues;
    return validationError(firstError.path.join('.'), firstError.message);
  }

  try {
    const bank = await createBank(supabase, validation.data);
    return successResponse({ success: true, bank }, 201);
  }
  catch (error) {
    return createFailureResponse(error);
  }
}
