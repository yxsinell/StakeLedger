import { requireAuth, requireRole } from '@/lib/api/auth';
import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { recommendationErrorResponse, recommendationValidationResponse } from '@/lib/recommendations/http';
import { RecommendationCreateRequestSchema, RecommendationFeedQuerySchema } from '@/lib/recommendations/schemas';
import { createRecommendation, getRecommendation, listRecommendations } from '@/lib/recommendations/service';
import { createServerFromRequest, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const query = RecommendationFeedQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
    if (!query.success) { return recommendationValidationResponse(query.error); }
    const result = await listRecommendations(await createServerFromRequest(request), query.data);
    return successResponse({ success: true, ...result });
  }
  catch (error) { return recommendationErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireRole(request, ['editor', 'admin']);
    const input = RecommendationCreateRequestSchema.safeParse(await request.json().catch(() => null));
    if (!input.success) { return recommendationValidationResponse(input.error); }
    const result = await createRecommendation(createServiceRoleClient(), user.id, input.data) as { recommendationId?: string };
    if (!result.recommendationId) { return codedErrorResponse('Recommendation not found', 'RECOMMENDATION_NOT_FOUND', 404); }
    const recommendation = await getRecommendation(await createServerFromRequest(request), result.recommendationId);
    if (!recommendation) { return codedErrorResponse('Recommendation not found', 'RECOMMENDATION_NOT_FOUND', 404); }
    return successResponse({ success: true, recommendation }, 201);
  }
  catch (error) { return recommendationErrorResponse(error); }
}
