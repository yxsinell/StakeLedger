import { describe, expect, test } from 'bun:test';

import { AdminRoleUpdateSchema, AdminUsersQuerySchema } from './schemas';

describe('AdminRoleUpdateSchema', () => {
  test('accepts a valid role update with an optimistic version', () => {
    expect(AdminRoleUpdateSchema.safeParse({ role: 'editor', expectedRoleVersion: 1 }).success).toBe(true);
  });

  test('rejects unknown roles and invalid versions', () => {
    expect(AdminRoleUpdateSchema.safeParse({ role: 'owner', expectedRoleVersion: 1 }).success).toBe(false);
    expect(AdminRoleUpdateSchema.safeParse({ role: 'admin', expectedRoleVersion: 0 }).success).toBe(false);
  });
});

describe('AdminUsersQuerySchema', () => {
  test('uses bounded pagination defaults', () => {
    expect(AdminUsersQuerySchema.parse({})).toEqual({ limit: 25, offset: 0 });
    expect(AdminUsersQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});
