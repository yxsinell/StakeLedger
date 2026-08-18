import { requireRole } from '@/lib/api/auth';
import { successResponse } from '@/lib/api/responses';
import { recommendationErrorResponse, recommendationValidationResponse } from '@/lib/recommendations/http';
import { RecommendationAdminQuerySchema } from '@/lib/recommendations/schemas';
import { listAdminRecommendations } from '@/lib/recommendations/service';
import { createServerFromRequest } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireRole(request, ['editor', 'admin']);
    const query = RecommendationAdminQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!query.success) { return recommendationValidationResponse(query.error); }
    const result = await listAdminRecommendations(await createServerFromRequest(request), query.data);
    return successResponse({ success: true, ...result });
  }
  catch (error) { return recommendationErrorResponse(error); }
}
