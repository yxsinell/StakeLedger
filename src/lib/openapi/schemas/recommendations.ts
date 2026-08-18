import {
  RecommendationAdminListResponseSchema,
  RecommendationAdminQuerySchema,
  RecommendationCreateRequestSchema,
  RecommendationFeedQuerySchema,
  RecommendationFollowRequestSchema,
  RecommendationFollowResponseSchema,
  RecommendationIdSchema,
  RecommendationListResponseSchema,
  RecommendationResponseSchema,
  RecommendationUpdateRequestSchema,
} from '@/lib/recommendations/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const error = { description: 'Request failed', content: { 'application/json': { schema: ErrorResponseSchema } } };
const params = z.object({ recommendationId: RecommendationIdSchema });

registry.registerPath({
  method: 'get',
  path: '/recommendations',
  tags: ['Recommendations'],
  summary: 'List published recommendations using stable cursor pagination',
  security: [{ cookieAuth: [] }],
  request: { query: RecommendationFeedQuerySchema },
  responses: { 200: { description: 'Published recommendation feed', content: { 'application/json': { schema: RecommendationListResponseSchema } } }, 400: error, 401: error, 500: error },
});

registry.registerPath({
  method: 'post',
  path: '/recommendations',
  tags: ['Recommendations'],
  summary: 'Create a normalized recommendation draft',
  security: [{ cookieAuth: [] }],
  request: { body: { required: true, content: { 'application/json': { schema: RecommendationCreateRequestSchema } } } },
  responses: { 201: { description: 'Recommendation created', content: { 'application/json': { schema: RecommendationResponseSchema } } }, 400: error, 401: error, 403: error, 404: error, 409: error, 500: error },
});

registry.registerPath({
  method: 'patch',
  path: '/recommendations/{recommendationId}',
  tags: ['Recommendations'],
  summary: 'Edit a mutable recommendation',
  security: [{ cookieAuth: [] }],
  request: { params, body: { required: true, content: { 'application/json': { schema: RecommendationUpdateRequestSchema } } } },
  responses: { 200: { description: 'Recommendation updated', content: { 'application/json': { schema: RecommendationResponseSchema } } }, 400: error, 401: error, 403: error, 404: error, 409: error, 500: error },
});

registry.registerPath({
  method: 'post',
  path: '/recommendations/{recommendationId}/follow',
  tags: ['Recommendations'],
  summary: 'Follow a published recommendation and return bet prefill only',
  security: [{ cookieAuth: [] }],
  request: { params, body: { required: true, content: { 'application/json': { schema: RecommendationFollowRequestSchema } } } },
  responses: { 200: { description: 'Existing follow and normalized bet prefill', content: { 'application/json': { schema: RecommendationFollowResponseSchema } } }, 201: { description: 'Follow created and normalized bet prefill', content: { 'application/json': { schema: RecommendationFollowResponseSchema } } }, 400: error, 401: error, 403: error, 404: error, 409: error, 500: error },
});

registry.registerPath({
  method: 'get',
  path: '/admin/recommendations',
  tags: ['Recommendations'],
  summary: 'List recommendations for editor and admin management',
  security: [{ cookieAuth: [] }],
  request: { query: RecommendationAdminQuerySchema },
  responses: { 200: { description: 'Recommendation management list', content: { 'application/json': { schema: RecommendationAdminListResponseSchema } } }, 400: error, 401: error, 403: error, 500: error },
});
