import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { mapMetricsError, mapMetricsValidationError } from '@/lib/metrics/http';
import { MetricsOverviewQuerySchema } from '@/lib/metrics/schemas';
import { getMetricsOverview } from '@/lib/metrics/service';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const session = await createServerClient();
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user) {
    return codedErrorResponse(
      'Authentication required',
      'AUTHENTICATION_REQUIRED',
      401,
    );
  }

  const url = new URL(request.url);
  const parsed = MetricsOverviewQuerySchema.safeParse(
    Object.fromEntries(url.searchParams.entries()),
  );
  if (!parsed.success) {
    return mapMetricsValidationError(parsed.error);
  }

  try {
    const metrics = await getMetricsOverview(
      createServiceRoleClient(),
      user.id,
      parsed.data,
    );
    return successResponse({ success: true, metrics });
  }
  catch (caught) {
    return mapMetricsError(caught);
  }
}
