import type { User } from '@supabase/supabase-js';

import type { UserRole } from '@/lib/auth/roles';
import { isUserRole } from '@/lib/auth/roles';
import { createServerFromRequest } from '@/lib/supabase/server';
import { forbiddenError, unauthorizedError } from './responses';

export interface AuthenticatedProfile {
  id: string
  email: string
  role: UserRole
}

export const getAuthenticatedUser = async (request: Request) => {
  const supabase = await createServerFromRequest(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: unauthorizedError() };
  }

  return { user, error: null };
};

export const requireAuth = async (request: Request) => {
  const { user, error } = await getAuthenticatedUser(request);

  if (error) {
    throw error;
  }

  return user;
};

export const getAuthenticatedProfile = async (request: Request, user: User) => {
  const supabase = await createServerFromRequest(request);
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (error || !data || !isUserRole(data.role)) {
    return { profile: null, error: unauthorizedError('Authenticated profile required') };
  }

  return { profile: data as AuthenticatedProfile, error: null };
};

export const requireRole = async (
  request: Request,
  roles: readonly UserRole[],
) => {
  const user = await requireAuth(request);
  const { profile, error } = await getAuthenticatedProfile(request, user);

  if (error || !profile) {
    throw error ?? unauthorizedError('Authenticated profile required');
  }

  if (!roles.includes(profile.role)) {
    throw forbiddenError();
  }

  return { user, profile };
};

export const requireAdmin = async (request: Request) =>
  requireRole(request, ['admin']);
