export const USER_ROLES = ['admin', 'editor', 'user'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const isUserRole = (role: string): role is UserRole =>
  USER_ROLES.includes(role as UserRole);
