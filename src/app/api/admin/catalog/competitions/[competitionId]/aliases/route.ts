import { requireRole } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { catalogErrorResponse, validationResponse } from '@/lib/catalog/http';
import { CatalogAliasRequestSchema, CatalogItemIdSchema } from '@/lib/catalog/schemas';
import { createCatalogAlias } from '@/lib/catalog/service';
import { createServiceRoleClient } from '@/lib/supabase/server';

const roles = ['admin', 'editor'] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  try {
    const { profile } = await requireRole(request, roles);
    const itemId = CatalogItemIdSchema.safeParse((await params).competitionId);
    const json = await request.json().catch(() => null);
    if (json === null) {
      return codedErrorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    const body = CatalogAliasRequestSchema.safeParse(json);
    if (!itemId.success) {
      return validationResponse(itemId.error);
    }
    if (!body.success) {
      return validationResponse(body.error);
    }

    const result = await createCatalogAlias(
      createServiceRoleClient(),
      profile.id,
      'competition',
      itemId.data,
      body.data,
    );
    return successResponse(result, 201);
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
