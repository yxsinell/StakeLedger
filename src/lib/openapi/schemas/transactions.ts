import {
  IdempotencyKeySchema,
  TransactionCreateRequestSchema,
  TransactionResponseSchema,
} from '@/lib/transactions/schemas';
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
  path: '/transactions',
  tags: ['Banks'],
  summary: 'Record a cash-only deposit or withdrawal',
  security: [{ cookieAuth: [] }],
  request: {
    headers: z.object({
      'Idempotency-Key': IdempotencyKeySchema,
    }),
    body: {
      required: true,
      content: {
        'application/json': { schema: TransactionCreateRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Existing idempotent transaction result',
      content: {
        'application/json': { schema: TransactionResponseSchema },
      },
    },
    201: {
      description: 'Transaction applied',
      content: {
        'application/json': { schema: TransactionResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    409: errorResponse,
    500: errorResponse,
  },
});
