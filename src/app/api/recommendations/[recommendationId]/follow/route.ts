import { requireAuth } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { recommendationErrorResponse, recommendationValidationResponse } from '@/lib/recommendations/http';
import { RecommendationFollowRequestSchema, RecommendationIdSchema } from '@/lib/recommendations/schemas';
import { followRecommendation } from '@/lib/recommendations/service';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ recommendationId: string }> }) {
  try {
    const user = await requireAuth(request);
    const params = RecommendationIdSchema.safeParse((await context.params).recommendationId);
    if (!params.success) { return codedErrorResponse('Recommendation not found', 'RECOMMENDATION_NOT_FOUND', 404); }
    const input = RecommendationFollowRequestSchema.safeParse(await request.json().catch(() => null));
    if (!input.success) { return recommendationValidationResponse(input.error); }
    const serviceRole = createServiceRoleClient();
    const follow = await followRecommendation(serviceRole, user.id, params.data, input.data.bankId);
    return successResponse({
      success: true,
      follow: {
        id: follow.followId,
        recommendationId: follow.recommendationId,
        bankId: follow.bankId,
        createdAt: follow.createdAt,
      },
      prefill: follow.prefill,
    }, follow.created ? 201 : 200);
  }
  catch (error) { return recommendationErrorResponse(error); }
}
