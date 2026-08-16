import {
  BankCreateRequestSchema,
  BankIdSchema,
  BankListResponseSchema,
  BankResponseSchema,
  TransferCreateRequestSchema,
  TransferResponseSchema,
} from '@/lib/banks/schemas';
import { IdempotencyKeySchema } from '@/lib/transactions/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': { schema: ErrorResponseSchema },
  },
};

registry.registerPath({
  method: 'get',
  path: '/banks',
  tags: ['Banks'],
  summary: 'List current user banks',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Bank list',
      content: {
        'application/json': { schema: BankListResponseSchema },
      },
    },
    401: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/banks/{bankId}/transfer',
  tags: ['Banks'],
  summary: 'Transfer cash to another owned bank in the same currency',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      bankId: BankIdSchema,
    }),
    headers: z.object({
      'Idempotency-Key': IdempotencyKeySchema,
    }),
    body: {
      required: true,
      content: {
        'application/json': { schema: TransferCreateRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Existing idempotent transfer result',
      content: {
        'application/json': { schema: TransferResponseSchema },
      },
    },
    201: {
      description: 'Transfer applied',
      content: {
        'application/json': { schema: TransferResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    409: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/banks',
  tags: ['Banks'],
  summary: 'Create a bank with three initial pockets',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': { schema: BankCreateRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Bank created',
      content: {
        'application/json': { schema: BankResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/banks/{bankId}',
  tags: ['Banks'],
  summary: 'Get current user bank details',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      bankId: BankIdSchema,
    }),
  },
  responses: {
    200: {
      description: 'Bank details',
      content: {
        'application/json': { schema: BankResponseSchema },
      },
    },
    401: errorResponse,
    404: errorResponse,
    500: errorResponse,
  },
});
