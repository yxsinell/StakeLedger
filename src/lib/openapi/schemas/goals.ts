import {
  GoalCloseRequestSchema,
  GoalCreateRequestSchema,
  GoalIdSchema,
  GoalListResponseSchema,
  GoalResponseSchema,
  GoalUpdateRequestSchema,
  RiskLimitsPatchSchema,
  RiskLimitsResponseSchema,
} from '@/lib/goals/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const error = { description: 'Request failed', content: { 'application/json': { schema: ErrorResponseSchema } } };
const goalParams = z.object({ goalId: GoalIdSchema });

registry.registerPath({
  method: 'get',
  path: '/goals',
  tags: ['Goals'],
  summary: 'List owned goals',
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'Goal list', content: { 'application/json': { schema: GoalListResponseSchema } } }, 401: error, 500: error },
});
registry.registerPath({
  method: 'post',
  path: '/goals',
  tags: ['Goals'],
  summary: 'Create an active goal atomically',
  security: [{ cookieAuth: [] }],
  request: { body: { required: true, content: { 'application/json': { schema: GoalCreateRequestSchema } } } },
  responses: { 201: { description: 'Goal created', content: { 'application/json': { schema: GoalResponseSchema } } }, 400: error, 401: error, 404: error, 409: error, 500: error },
});
registry.registerPath({
  method: 'get',
  path: '/goals/{goalId}',
  tags: ['Goals'],
  summary: 'Get owned goal, mission, history and risk assessment',
  security: [{ cookieAuth: [] }],
  request: { params: goalParams },
  responses: { 200: { description: 'Goal detail', content: { 'application/json': { schema: GoalResponseSchema } } }, 401: error, 404: error, 500: error },
});
registry.registerPath({
  method: 'patch',
  path: '/goals/{goalId}',
  tags: ['Goals'],
  summary: 'Update mutable active-goal parameters atomically',
  security: [{ cookieAuth: [] }],
  request: { params: goalParams, body: { required: true, content: { 'application/json': { schema: GoalUpdateRequestSchema } } } },
  responses: { 200: { description: 'Goal updated', content: { 'application/json': { schema: GoalResponseSchema } } }, 400: error, 401: error, 404: error, 409: error, 500: error },
});
registry.registerPath({
  method: 'post',
  path: '/goals/{goalId}/close',
  tags: ['Goals'],
  summary: 'Complete or cancel an active goal atomically',
  security: [{ cookieAuth: [] }],
  request: { params: goalParams, body: { required: true, content: { 'application/json': { schema: GoalCloseRequestSchema } } } },
  responses: { 200: { description: 'Goal closed or stable repeated-close result', content: { 'application/json': { schema: GoalResponseSchema } } }, 400: error, 401: error, 404: error, 409: error, 500: error },
});
registry.registerPath({
  method: 'get',
  path: '/risk-limits',
  tags: ['Goals'],
  summary: 'Get owned risk-limit configuration',
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'Risk limits', content: { 'application/json': { schema: RiskLimitsResponseSchema } } }, 401: error, 500: error },
});
registry.registerPath({
  method: 'patch',
  path: '/risk-limits',
  tags: ['Goals'],
  summary: 'Configure opt-in maximum odds and daily loss',
  security: [{ cookieAuth: [] }],
  request: { body: { required: true, content: { 'application/json': { schema: RiskLimitsPatchSchema } } } },
  responses: { 200: { description: 'Risk limits updated', content: { 'application/json': { schema: RiskLimitsResponseSchema } } }, 400: error, 401: error, 500: error },
});
