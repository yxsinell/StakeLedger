import { requireRole } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { recommendationErrorResponse, recommendationValidationResponse } from '@/lib/recommendations/http';
import { RecommendationIdSchema, RecommendationUpdateRequestSchema } from '@/lib/recommendations/schemas';
import { getRecommendation, updateRecommendation } from '@/lib/recommendations/service';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, context: { params: Promise<{ recommendationId: string }> }) {
  try {
    const { user } = await requireRole(request, ['editor', 'admin']);
    const params = RecommendationIdSchema.safeParse((await context.params).recommendationId);
    if (!params.success) { return codedErrorResponse('Recommendation not found', 'RECOMMENDATION_NOT_FOUND', 404); }
    const input = RecommendationUpdateRequestSchema.safeParse(await request.json().catch(() => null));
    if (!input.success) { return recommendationValidationResponse(input.error); }
    const serviceRole = createServiceRoleClient();
    await updateRecommendation(serviceRole, user.id, params.data, input.data);
    const recommendation = await getRecommendation(serviceRole, params.data);
    return recommendation
      ? successResponse({ success: true, recommendation })
      : codedErrorResponse('Recommendation not found', 'RECOMMENDATION_NOT_FOUND', 404);
  }
  catch (error) { return recommendationErrorResponse(error); }
}
