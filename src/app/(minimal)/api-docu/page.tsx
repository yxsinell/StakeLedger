import { notFound } from 'next/navigation';

import { supabaseAnonKey, supabaseUrl } from '@/lib/config';
import { ApiDocSelector } from './api-doc-selector';
import { AuthInfoPanel } from './auth-info-panel';
import { RedocViewer } from './redoc-viewer';

const isAllowedEnvironment = () => {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv) {
    return vercelEnv !== 'production';
  }

  return process.env.NODE_ENV === 'development';
};

interface PageProps {
  searchParams?: Promise<{
    api?: string
  }>
}

export default async function ApiDocuPage({ searchParams }: PageProps) {
  if (!isAllowedEnvironment()) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const apiType = resolvedSearchParams?.api ?? 'nextjs';
  const specUrl = apiType === 'supabase'
    ? `${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`
    : '/api/openapi';

  return (
    <div className="min-h-screen bg-background">
      <ApiDocSelector currentApi={apiType} />
      <AuthInfoPanel apiType={apiType} />
      <RedocViewer specUrl={specUrl} />
    </div>
  );
}
