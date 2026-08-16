import { requireAuth } from '@/lib/api/auth';
import { successResponse } from '@/lib/api/responses';
import { catalogErrorResponse, validationResponse } from '@/lib/catalog/http';
import { CatalogSearchQuerySchema } from '@/lib/catalog/schemas';
import { searchCatalog } from '@/lib/catalog/service';
import { createServerFromRequest } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const query = CatalogSearchQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!query.success) {
      return validationResponse(query.error);
    }

    const result = await searchCatalog(
      await createServerFromRequest(request),
      'team',
      query.data,
    );
    return successResponse(result);
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
