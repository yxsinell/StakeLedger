import { describe, expect, test } from 'bun:test';

import { generateOpenAPIDocument } from '@/lib/openapi';

describe('recommendations OpenAPI runtime', () => {
  test('registers feed, mutation, follow, and management routes', () => {
    const paths = generateOpenAPIDocument().paths;
    expect(paths?.['/recommendations']?.get).toBeDefined();
    expect(paths?.['/recommendations']?.post).toBeDefined();
    expect(paths?.['/recommendations/{recommendationId}']?.patch).toBeDefined();
    expect(paths?.['/recommendations/{recommendationId}/follow']?.post).toBeDefined();
    expect(paths?.['/admin/recommendations']?.get).toBeDefined();
  });

  test('publishes recommendation and follow response schemas', () => {
    const schemas = generateOpenAPIDocument().components?.schemas;
    expect(schemas?.RecommendationIcp).toBeDefined();
    expect(schemas?.RecommendationListResponse).toBeDefined();
    expect(schemas?.RecommendationFollowResponse).toBeDefined();
    expect(schemas?.RecommendationAdminListResponse).toBeDefined();
  });
});
