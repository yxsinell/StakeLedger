import { requireAuth } from '@/lib/api/auth';
import { successResponse } from '@/lib/api/responses';
import { catalogErrorResponse, validationResponse } from '@/lib/catalog/http';
import { CatalogEventListQuerySchema } from '@/lib/catalog/schemas';
import { listCatalogEvents } from '@/lib/catalog/service';
import { createServerFromRequest } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const query = CatalogEventListQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!query.success) {
      return validationResponse(query.error);
    }

    return successResponse(await listCatalogEvents(await createServerFromRequest(request), query.data));
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
