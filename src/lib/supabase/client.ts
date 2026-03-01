import type { Database } from '@/types/supabase';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseAnonKey, supabaseUrl } from '@/lib/config';

export const createClient = () =>
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
