import { requireAuth } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogEventIdSchema } from '@/lib/catalog/schemas';
import { listActiveCatalogMarkets } from '@/lib/catalog/service';
import { createServerFromRequest } from '@/lib/supabase/server';

export async function GET(request: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
    await requireAuth(request);
    const eventId = CatalogEventIdSchema.safeParse((await context.params).eventId);
    if (!eventId.success) {
      return codedErrorResponse('Event not found', 'EVENT_NOT_FOUND', 404);
    }

    return successResponse(
      await listActiveCatalogMarkets(await createServerFromRequest(request), eventId.data),
    );
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
