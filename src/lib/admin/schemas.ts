import { z } from '@/lib/openapi/registry';

export const AdminRoleUpdateSchema = z.object({
  role: z.enum(['admin', 'editor', 'user']),
  expectedRoleVersion: z.number().int().positive(),
});

export const AdminUsersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});
