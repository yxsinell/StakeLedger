import { requireRole } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { catalogErrorResponse, validationResponse } from '@/lib/catalog/http';
import {
  CatalogItemIdSchema,
  CatalogTeamAdminRequestSchema,
} from '@/lib/catalog/schemas';
import { upsertCatalogItem } from '@/lib/catalog/service';
import { createServiceRoleClient } from '@/lib/supabase/server';

const roles = ['admin', 'editor'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { profile } = await requireRole(request, roles);
    const itemId = CatalogItemIdSchema.safeParse((await params).teamId);
    const json = await request.json().catch(() => null);
    if (json === null) {
      return codedErrorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    const body = CatalogTeamAdminRequestSchema.safeParse(json);
    if (!itemId.success) {
      return validationResponse(itemId.error);
    }
    if (!body.success) {
      return validationResponse(body.error);
    }

    const result = await upsertCatalogItem(
      createServiceRoleClient(),
      profile.id,
      'team',
      itemId.data,
      body.data,
    );
    return successResponse(result);
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
