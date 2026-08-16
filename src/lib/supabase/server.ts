import type { Database } from '@/types/supabase';
import { createServerClient as createSsrServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

import { cookies } from 'next/headers';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from '@/lib/config';

export const createServerClient = async () => {
  const cookieStore = await cookies();

  return createSsrServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
};

export const createServerFromRequest = async (_request: Request) => {
  return createServerClient();
};

export const createServiceRoleClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
