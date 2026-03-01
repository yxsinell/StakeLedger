const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!appUrl) {
  throw new Error('Missing NEXT_PUBLIC_APP_URL');
}

export { appUrl, supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl };
