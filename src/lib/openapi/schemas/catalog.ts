import {
  CatalogAdminListQuerySchema,
  CatalogAdminListResponseSchema,
  CatalogAdminMutationResponseSchema,
  CatalogAliasRequestSchema,
  CatalogAliasResponseSchema,
  CatalogCompetitionAdminRequestSchema,
  CatalogItemIdSchema,
  CatalogItemResponseSchema,
  CatalogListResponseSchema,
  CatalogManualRequestSchema,
  CatalogSearchQuerySchema,
  CatalogTeamAdminRequestSchema,
} from '@/lib/catalog/schemas';
import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': { schema: ErrorResponseSchema },
  },
};

const searchResponses = {
  200: {
    description: 'Normalized catalog results',
    content: {
      'application/json': { schema: CatalogListResponseSchema },
    },
  },
  400: errorResponse,
  401: errorResponse,
  500: errorResponse,
};

registry.registerPath({
  method: 'get',
  path: '/catalog/teams',
  tags: ['Catalog'],
  summary: 'Search normalized teams',
  security: [{ cookieAuth: [] }],
  request: { query: CatalogSearchQuerySchema },
  responses: searchResponses,
});

registry.registerPath({
  method: 'get',
  path: '/catalog/competitions',
  tags: ['Catalog'],
  summary: 'Search normalized competitions',
  security: [{ cookieAuth: [] }],
  request: { query: CatalogSearchQuerySchema },
  responses: searchResponses,
});

registry.registerPath({
  method: 'post',
  path: '/catalog/manual',
  tags: ['Catalog'],
  summary: 'Create a manual catalog item',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogManualRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Manual catalog item created',
      content: {
        'application/json': { schema: CatalogItemResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    500: errorResponse,
  },
});

const adminListResponses = {
  200: {
    description: 'Catalog maintenance page',
    content: {
      'application/json': { schema: CatalogAdminListResponseSchema },
    },
  },
  400: errorResponse,
  401: errorResponse,
  403: errorResponse,
  500: errorResponse,
};

const adminCreateResponses = {
  200: {
    description: 'Existing provider catalog item updated',
    content: {
      'application/json': { schema: CatalogAdminMutationResponseSchema },
    },
  },
  201: {
    description: 'Catalog item created',
    content: {
      'application/json': { schema: CatalogAdminMutationResponseSchema },
    },
  },
  400: errorResponse,
  401: errorResponse,
  403: errorResponse,
  409: errorResponse,
  500: errorResponse,
};

const adminUpdateResponses = {
  200: {
    description: 'Catalog item updated',
    content: {
      'application/json': { schema: CatalogAdminMutationResponseSchema },
    },
  },
  400: errorResponse,
  401: errorResponse,
  403: errorResponse,
  404: errorResponse,
  409: errorResponse,
  500: errorResponse,
};

registry.registerPath({
  method: 'get',
  path: '/admin/catalog/teams',
  tags: ['Catalog'],
  summary: 'List teams for catalog maintenance',
  security: [{ cookieAuth: [] }],
  request: { query: CatalogAdminListQuerySchema },
  responses: adminListResponses,
});

registry.registerPath({
  method: 'post',
  path: '/admin/catalog/teams',
  tags: ['Catalog'],
  summary: 'Create or upsert a normalized team',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogTeamAdminRequestSchema },
      },
    },
  },
  responses: adminCreateResponses,
});

registry.registerPath({
  method: 'patch',
  path: '/admin/catalog/teams/{teamId}',
  tags: ['Catalog'],
  summary: 'Update a normalized team',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ teamId: CatalogItemIdSchema }),
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogTeamAdminRequestSchema },
      },
    },
  },
  responses: adminUpdateResponses,
});

registry.registerPath({
  method: 'post',
  path: '/admin/catalog/teams/{teamId}/aliases',
  tags: ['Catalog'],
  summary: 'Create a team alias',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ teamId: CatalogItemIdSchema }),
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogAliasRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Alias created',
      content: {
        'application/json': { schema: CatalogAliasResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/catalog/competitions',
  tags: ['Catalog'],
  summary: 'List competitions for catalog maintenance',
  security: [{ cookieAuth: [] }],
  request: { query: CatalogAdminListQuerySchema },
  responses: adminListResponses,
});

registry.registerPath({
  method: 'post',
  path: '/admin/catalog/competitions',
  tags: ['Catalog'],
  summary: 'Create or upsert a normalized competition',
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogCompetitionAdminRequestSchema },
      },
    },
  },
  responses: adminCreateResponses,
});

registry.registerPath({
  method: 'patch',
  path: '/admin/catalog/competitions/{competitionId}',
  tags: ['Catalog'],
  summary: 'Update a normalized competition',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ competitionId: CatalogItemIdSchema }),
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogCompetitionAdminRequestSchema },
      },
    },
  },
  responses: adminUpdateResponses,
});

registry.registerPath({
  method: 'post',
  path: '/admin/catalog/competitions/{competitionId}/aliases',
  tags: ['Catalog'],
  summary: 'Create a competition alias',
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ competitionId: CatalogItemIdSchema }),
    body: {
      required: true,
      content: {
        'application/json': { schema: CatalogAliasRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Alias created',
      content: {
        'application/json': { schema: CatalogAliasResponseSchema },
      },
    },
    400: errorResponse,
    401: errorResponse,
    403: errorResponse,
    404: errorResponse,
    409: errorResponse,
    500: errorResponse,
  },
});
