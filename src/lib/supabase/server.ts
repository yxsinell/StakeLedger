import type { Database } from '@/types/supabase';
import { createServerClient as createSsrServerClient } from '@supabase/ssr';

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
