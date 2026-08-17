import { codedErrorResponse, successResponse } from '@/lib/api/responses';
import { AuditEventSchema, BetIdSchema } from '@/lib/bets/schemas';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) { return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401); }

  const params = new URL(request.url).searchParams;
  const entityType = params.get('entityType');
  const entityId = params.get('entityId');
  const limit = Number(params.get('limit') ?? 50);
  if (entityType !== 'bet' || !BetIdSchema.safeParse(entityId).success || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return codedErrorResponse('Invalid audit query', 'VALIDATION_ERROR', 400);
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, entity_type, entity_id, action, actor_id, created_at')
      .eq('entity_type', 'bet')
      .eq('entity_id', entityId as string)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);
    if (error) { throw error; }
    const events = data.map(event => AuditEventSchema.parse({
      id: event.id,
      entityType: event.entity_type,
      entityId: event.entity_id,
      action: event.action,
      actorId: event.actor_id,
      createdAt: event.created_at,
    }));
    return successResponse({ success: true, events });
  }
  catch {
    return codedErrorResponse('Audit history unavailable', 'AUDIT_UNAVAILABLE', 500);
  }
}
