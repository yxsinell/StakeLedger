import type { CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { createServerClient } from '@supabase/ssr';

import { supabaseAnonKey, supabaseUrl } from '@/lib/config';

interface CookieToSet {
  name: string
  value: string
  options: CookieOptions
}

// Route handlers need a writable response so Supabase can persist auth cookies.
export const createAuthRouteClient = (
  request: NextRequest,
  response: NextResponse,
) =>
  createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
