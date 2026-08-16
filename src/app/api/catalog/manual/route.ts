import { requireAuth } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { catalogErrorResponse, validationResponse } from '@/lib/catalog/http';
import { CatalogManualRequestSchema } from '@/lib/catalog/schemas';
import { createManualCatalogItem } from '@/lib/catalog/service';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const json = await request.json().catch(() => null);
    if (json === null) {
      return codedErrorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    const body = CatalogManualRequestSchema.safeParse(json);
    if (!body.success) {
      return validationResponse(body.error);
    }

    const result = await createManualCatalogItem(
      createServiceRoleClient(),
      user.id,
      body.data,
    );
    return successResponse(result, 201);
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
