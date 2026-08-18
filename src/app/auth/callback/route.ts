import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createAuthRouteClient } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/reset-password', request.url);
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    redirectUrl.searchParams.set('error', 'recovery_link_invalid');
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);
  const supabase = createAuthRouteClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.searchParams.set('error', 'recovery_session_invalid');
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
