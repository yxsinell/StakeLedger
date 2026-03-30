'use client';

import { Database, Server } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ApiDocSelectorProps {
  currentApi: string
}

export function ApiDocSelector({ currentApi }: ApiDocSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleApiChange = (api: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('api', api);
    router.push(`/api-docu?${params.toString()}`);
  };

  return (
    <div
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur"
      data-testid="apiDocSelector"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            StakeLedger
          </p>
          <h1 className="text-lg font-semibold">API Documentation</h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleApiChange('nextjs')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
              currentApi === 'nextjs'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
            data-testid="nextjs_api_button"
          >
            <Server className="h-4 w-4" />
            Next.js API
          </button>

          <button
            type="button"
            onClick={() => handleApiChange('supabase')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
              currentApi === 'supabase'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
            data-testid="supabase_api_button"
          >
            <Database className="h-4 w-4" />
            Supabase REST
          </button>
        </div>
      </div>
    </div>
  );
}
