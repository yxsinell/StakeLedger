import { describe, expect, test } from 'bun:test';

import { generateOpenAPIDocument } from '@/lib/openapi';

describe('catalog OpenAPI runtime', () => {
  test('registers all public and admin catalog paths', () => {
    const document = generateOpenAPIDocument();
    const catalogPaths = [
      '/catalog/teams',
      '/catalog/competitions',
      '/catalog/manual',
      '/admin/catalog/teams',
      '/admin/catalog/teams/{teamId}',
      '/admin/catalog/teams/{teamId}/aliases',
      '/admin/catalog/competitions',
      '/admin/catalog/competitions/{competitionId}',
      '/admin/catalog/competitions/{competitionId}/aliases',
    ];

    for (const path of catalogPaths) {
      expect(document.paths?.[path]).toBeDefined();
    }
  });

  test('publishes catalog response schemas used by routes', () => {
    const schemas = generateOpenAPIDocument().components?.schemas;

    expect(schemas?.CatalogListResponse).toBeDefined();
    expect(schemas?.CatalogItemResponse).toBeDefined();
    expect(schemas?.CatalogAdminListResponse).toBeDefined();
    expect(schemas?.CatalogAdminMutationResponse).toBeDefined();
    expect(schemas?.CatalogAliasResponse).toBeDefined();
  });

  test('documents upsert and patch status codes accurately', () => {
    const paths = generateOpenAPIDocument().paths;
    const teamPost = paths?.['/admin/catalog/teams']?.post?.responses;
    const teamPatch = paths?.['/admin/catalog/teams/{teamId}']?.patch?.responses;

    expect(teamPost?.[200]).toBeDefined();
    expect(teamPost?.[201]).toBeDefined();
    expect(teamPatch?.[200]).toBeDefined();
    expect(teamPatch?.[201]).toBeUndefined();
  });
});
