'use client';

import { ChevronDown, ChevronUp, Cookie, FileText, Key, Shield } from 'lucide-react';
import { useState } from 'react';

interface AuthInfoPanelProps {
  apiType: string
}

export function AuthInfoPanel({ apiType }: AuthInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isNextJs = apiType === 'nextjs';
  const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?? 'https://[project-id].supabase.co';

  return (
    <div className="border-b border-border bg-muted/30" data-testid="authInfoPanel">
      <div className="mx-auto max-w-7xl px-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between py-3 text-sm transition-colors hover:bg-muted/50"
          data-testid="auth_info_toggle"
        >
          <div className="flex items-center gap-2">
            {isNextJs
              ? <Cookie className="h-4 w-4 text-primary" />
              : <Key className="h-4 w-4 text-secondary" />}
            <span className="font-medium">
              {isNextJs
                ? 'Cookie + Bearer Authentication'
                : 'API Key + JWT Authentication'}
            </span>
            <span className="text-muted-foreground">- Click for quick reference</span>
          </div>
          {isExpanded
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <div className="grid gap-4 pb-4 md:grid-cols-2">
            {isNextJs
              ? (
                  <>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Cookie className="h-4 w-4 text-primary" />
                        Browser Sessions
                      </h4>
                      <p className="mb-2 text-xs text-muted-foreground">
                        Supabase session cookies are sent automatically from the browser.
                      </p>
                      <code className="block overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                        Cookie: sb-[project-id]-auth-token=...
                      </code>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Shield className="h-4 w-4 text-secondary" />
                        Bearer Token (External Clients)
                      </h4>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>1. Request token from Supabase Auth:</p>
                        <code className="block rounded bg-muted px-2 py-1">
                          POST
                          {' '}
                          {supabaseBaseUrl}
                          /auth/v1/token?grant_type=password
                        </code>
                        <p>2. Use the access token:</p>
                        <code className="block rounded bg-muted px-2 py-1">
                          Authorization: Bearer &lt;access_token&gt;
                        </code>
                        <p className="text-[11px] text-muted-foreground">
                          Token expires in 1 hour. Use refresh_token to renew.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4 md:col-span-2">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Key className="h-4 w-4 text-amber-400" />
                        Special Endpoints
                      </h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          <strong>Cron jobs:</strong>
                          {' '}
                          Authorization: Bearer CRON_SECRET
                        </p>
                        <p>
                          <strong>Testing:</strong>
                          {' '}
                          X-API-Key: [your-key]
                        </p>
                        <p>
                          <strong>Webhooks:</strong>
                          {' '}
                          Signature header from provider
                        </p>
                      </div>
                    </div>
                  </>
                )
              : (
                  <>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Key className="h-4 w-4 text-secondary" />
                        Required Headers
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="mb-1 text-muted-foreground">Always required:</p>
                          <code className="block rounded bg-muted px-2 py-1">apikey: &lt;SUPABASE_ANON_KEY&gt;</code>
                        </div>
                        <div>
                          <p className="mb-1 text-muted-foreground">For authenticated requests:</p>
                          <code className="block rounded bg-muted px-2 py-1">Authorization: Bearer &lt;JWT_TOKEN&gt;</code>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <FileText className="h-4 w-4 text-primary" />
                        Getting the JWT
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Login via Supabase Auth, then extract the access_token from the session.
                        See
                        {' '}
                        <code className="rounded bg-muted px-1">docs/api-testing/</code>
                        {' '}
                        for guides.
                      </p>
                    </div>
                  </>
                )}
            <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground md:col-span-2">
              <FileText className="h-4 w-4" />
              <span>
                For detailed guides and Postman collections, see
                {' '}
                <code className="rounded bg-muted px-1">docs/api-testing/</code>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
