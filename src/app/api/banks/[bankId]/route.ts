import {
  notFoundError,
  serverError,
  successResponse,
  unauthorizedError,
} from '@/lib/api/responses';
import { BankIdSchema } from '@/lib/banks/schemas';
import { getBank } from '@/lib/banks/service';
import { createServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ bankId: string }>
}

export async function GET(_: Request, { params }: RouteContext) {
  const { bankId } = await params;
  const parsedBankId = BankIdSchema.safeParse(bankId);

  if (!parsedBankId.success) {
    return notFoundError('Bank');
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorizedError();
  }

  try {
    const bank = await getBank(supabase, parsedBankId.data);

    if (!bank) {
      return notFoundError('Bank');
    }

    return successResponse({ success: true, bank });
  }
  catch {
    return serverError();
  }
}
