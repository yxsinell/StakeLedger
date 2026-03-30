import type { Database } from '@/types/supabase';
import { createServerClient as createSsrServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

import { cookies } from 'next/headers';
import { supabaseAnonKey, supabaseUrl } from '@/lib/config';

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

export const createServerFromRequest = async (request: Request) => {
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice('Bearer '.length);

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createServerClient();
};
