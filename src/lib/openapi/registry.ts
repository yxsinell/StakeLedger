import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { appUrl, supabaseUrl } from '@/lib/config';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const projectName = 'StakeLedger';

const getSupabaseProjectId = () => {
  try {
    const { hostname } = new URL(supabaseUrl);
    return hostname.split('.')[0] ?? 'unknown';
  }
  catch {
    return 'unknown';
  }
};

const supabaseProjectId = getSupabaseProjectId();
const apiBaseUrl = `${appUrl.replace(/\/$/, '')}/api`;

registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: `sb-${supabaseProjectId}-auth-token`,
  description:
    'Supabase session cookie. Obtained automatically after login via the web app.',
});

registry.registerComponent('securitySchemes', 'apiKeyAuth', {
  type: 'apiKey',
  in: 'header',
  name: 'X-API-Key',
  description: 'API key for testing endpoints. Use environment variable in testing.',
});

registry.registerComponent('securitySchemes', 'cronAuth', {
  type: 'http',
  scheme: 'bearer',
  description: 'CRON_SECRET token for scheduled job endpoints.',
});

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: `${projectName} API`,
      version: '1.0.0',
      description: `
## Custom API Endpoints

This documentation covers the custom Next.js API endpoints.

---

## Authentication Methods

### 1. Cookie Auth (Most Endpoints)
The primary authentication method uses Supabase session cookies.

Cookie name: sb-${supabaseProjectId}-auth-token

### 2. API Key Auth (Testing)
Some endpoints accept an API key header for testing.

Header: X-API-Key: [your-api-key]

### 3. Cron Auth (Scheduled Jobs)
Cron endpoints require Bearer token authorization.

Header: Authorization: Bearer CRON_SECRET

---

## Base URL

${apiBaseUrl}
      `.trim(),
      contact: {
        name: 'Development Team',
      },
    },
    servers: [
      {
        url: apiBaseUrl,
        description: 'Primary server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'BFF authentication endpoints backed by Supabase Auth',
      },
      {
        name: 'Banks',
        description: 'Owner-scoped bank creation and balance endpoints',
      },
      {
        name: 'Bets',
        description: 'Atomic bet ticket creation and funding reservations',
      },
      {
        name: 'Catalog',
        description: 'Local catalog search, manual entry, and maintenance',
      },
      {
        name: 'Goals',
        description: 'Owned capital goals, daily missions, closure, and risk limits',
      },
      {
        name: 'System',
        description: 'System endpoints (health, openapi)',
      },
    ],
  });
}

export { z };
