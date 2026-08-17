import { AuditEventSchema } from '@/lib/bets/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const errorResponse = { description: 'Request failed', content: { 'application/json': { schema: ErrorResponseSchema } } };

registry.registerPath({
  method: 'get',
  path: '/audit',
  tags: ['Audit'],
  summary: 'List immutable audit events for an owned bet',
  security: [{ cookieAuth: [] }],
  request: { query: z.object({ entityType: z.literal('bet'), entityId: z.string().uuid(), limit: z.coerce.number().int().min(1).max(100).optional() }) },
  responses: {
    200: { description: 'Audit events ordered by createdAt and id descending', content: { 'application/json': { schema: z.object({ success: z.literal(true), events: z.array(AuditEventSchema) }) } } },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    500: errorResponse,
  },
});
