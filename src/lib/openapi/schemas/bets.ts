import {
  BetCreateRequestSchema,
  BetResponseSchema,
  IdempotencyKeySchema,
} from '@/lib/bets/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': { schema: ErrorResponseSchema },
  },
};

registry.registerPath({
  method: 'post',
  path: '/bets',
  tags: ['Bets'],
  summary: 'Create an atomic bet ticket with funding reservations',
  security: [{ cookieAuth: [] }],
  request: {
    headers: z.object({
      'Idempotency-Key': IdempotencyKeySchema,
    }),
    body: {
      required: true,
      content: {
        'application/json': { schema: BetCreateRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Existing result for an equivalent idempotent request',
      content: {
        'application/json': { schema: BetResponseSchema },
      },
    },
    201: {
      description: 'Bet created',
      content: {
        'application/json': { schema: BetResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    409: errorResponse,
    500: errorResponse,
  },
});
