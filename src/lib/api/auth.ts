import { createServerFromRequest } from '@/lib/supabase/server';
import { unauthorizedError } from './responses';

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
