import { registry, z } from '../registry';
import { ErrorResponseSchema, UUIDSchema } from './common';

const AdminRoleSchema = z.enum(['admin', 'editor', 'user']);

const AdminRoleUpdateRequestSchema = z.object({
  role: AdminRoleSchema,
  expectedRoleVersion: z.number().int().positive(),
});

registry.registerPath({
  method: 'get',
  path: '/admin/users',
  tags: ['Administration'],
  summary: 'List users for role administration',
  security: [{ cookieAuth: [] }],
  request: { query: z.object({ limit: z.coerce.number().int().min(1).max(100).optional(), offset: z.coerce.number().int().min(0).optional() }) },
  responses: { 200: { description: 'User page' }, 401: { description: 'Authentication required', content: { 'application/json': { schema: ErrorResponseSchema } } }, 403: { description: 'Admin required', content: { 'application/json': { schema: ErrorResponseSchema } } } },
});

registry.registerPath({
  method: 'patch',
  path: '/admin/users/{userId}/role',
  tags: ['Administration'],
  summary: 'Change another user role',
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ userId: UUIDSchema }), body: { content: { 'application/json': { schema: AdminRoleUpdateRequestSchema } } } },
  responses: { 200: { description: 'Role updated' }, 400: { description: 'Validation error', content: { 'application/json': { schema: ErrorResponseSchema } } }, 401: { description: 'Authentication required', content: { 'application/json': { schema: ErrorResponseSchema } } }, 403: { description: 'Role change denied', content: { 'application/json': { schema: ErrorResponseSchema } } }, 404: { description: 'User not found', content: { 'application/json': { schema: ErrorResponseSchema } } }, 409: { description: 'Role version conflict', content: { 'application/json': { schema: ErrorResponseSchema } } } },
});
