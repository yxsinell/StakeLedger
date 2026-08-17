import {
  BetCashoutRequestSchema,
  BetCashoutResponseSchema,
  BetCreateRequestSchema,
  BetDetailResponseSchema,
  BetListResponseSchema,
  BetResponseSchema,
  BetSettlementResponseSchema,
  BetSettleRequestSchema,
  IdempotencyKeySchema,
} from '@/lib/bets/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const errorResponse = { description: 'Request failed', content: { 'application/json': { schema: ErrorResponseSchema } } };
const betIdParams = z.object({ betId: z.string().uuid() });
const idempotencyHeaders = z.object({ 'Idempotency-Key': IdempotencyKeySchema });

registry.registerPath({
  method: 'get',
  path: '/bets',
  tags: ['Bets'],
  summary: 'List owned bets',
  security: [{ cookieAuth: [] }],
  request: { query: z.object({ bankId: z.string().uuid().optional() }) },
  responses: { 200: { description: 'Bet list', content: { 'application/json': { schema: BetListResponseSchema } } }, 401: errorResponse, 500: errorResponse },
});

registry.registerPath({
  method: 'post',
  path: '/bets',
  tags: ['Bets'],
  summary: 'Create an atomic bet ticket with funding reservations',
  security: [{ cookieAuth: [] }],
  request: { headers: idempotencyHeaders, body: { required: true, content: { 'application/json': { schema: BetCreateRequestSchema } } } },
  responses: {
    200: { description: 'Existing result for an equivalent idempotent request', content: { 'application/json': { schema: BetResponseSchema } } },
    201: { description: 'Bet created', content: { 'application/json': { schema: BetResponseSchema } } },
    400: errorResponse,
    401: errorResponse,
    404: errorResponse,
    409: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/bets/{betId}',
  tags: ['Bets'],
  summary: 'Get an owned bet',
  security: [{ cookieAuth: [] }],
  request: { params: betIdParams },
  responses: { 200: { description: 'Bet detail', content: { 'application/json': { schema: BetDetailResponseSchema } } }, 401: errorResponse, 404: errorResponse, 500: errorResponse },
});

registry.registerPath({
  method: 'post',
  path: '/bets/{betId}/settle',
  tags: ['Bets'],
  summary: 'Settle an owned open bet atomically',
  security: [{ cookieAuth: [] }],
  request: { params: betIdParams, headers: idempotencyHeaders, body: { required: true, content: { 'application/json': { schema: BetSettleRequestSchema } } } },
  responses: { 200: { description: 'Bet settled or replayed', content: { 'application/json': { schema: BetSettlementResponseSchema } } }, 400: errorResponse, 401: errorResponse, 404: errorResponse, 409: errorResponse, 500: errorResponse },
});

registry.registerPath({
  method: 'post',
  path: '/bets/{betId}/cashout',
  tags: ['Bets'],
  summary: 'Apply partial cashout atomically',
  security: [{ cookieAuth: [] }],
  request: { params: betIdParams, headers: idempotencyHeaders, body: { required: true, content: { 'application/json': { schema: BetCashoutRequestSchema } } } },
  responses: { 200: { description: 'Cashout applied or replayed', content: { 'application/json': { schema: BetCashoutResponseSchema } } }, 400: errorResponse, 401: errorResponse, 404: errorResponse, 409: errorResponse, 500: errorResponse },
});
