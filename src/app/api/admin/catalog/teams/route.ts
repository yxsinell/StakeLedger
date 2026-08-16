import { requireRole } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { catalogErrorResponse, validationResponse } from '@/lib/catalog/http';
import {
  CatalogAdminListQuerySchema,
  CatalogTeamAdminRequestSchema,
} from '@/lib/catalog/schemas';
import { listAdminCatalog, upsertCatalogItem } from '@/lib/catalog/service';
import { createServerFromRequest, createServiceRoleClient } from '@/lib/supabase/server';

const roles = ['admin', 'editor'] as const;

export async function GET(request: Request) {
  try {
    await requireRole(request, roles);
    const query = CatalogAdminListQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!query.success) {
      return validationResponse(query.error);
    }

    const result = await listAdminCatalog(
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

export async function POST(request: Request) {
  try {
    const { profile } = await requireRole(request, roles);
    const json = await request.json().catch(() => null);
    if (json === null) {
      return codedErrorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400);
    }

    const body = CatalogTeamAdminRequestSchema.safeParse(json);
    if (!body.success) {
      return validationResponse(body.error);
    }

    const result = await upsertCatalogItem(
      createServiceRoleClient(),
      profile.id,
      'team',
      null,
      body.data,
    );
    return successResponse(result, result.created ? 201 : 200);
  }
  catch (error) {
    return catalogErrorResponse(error);
  }
}
