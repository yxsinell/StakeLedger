import { z } from '@/lib/openapi/registry';

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    value => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().max(max).optional(),
  );

export const CatalogEntityTypeSchema = z.enum(['team', 'competition']);
export const CatalogItemIdSchema = z.string().uuid();
export const CatalogNormalizationStatusSchema = z.enum([
  'normalized',
  'manual',
  'pending',
  'deprecated',
]);
export const CatalogMatchedBySchema = z.enum(['name', 'alias', 'manual']);

export const CatalogSearchQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(100),
    limit: z.coerce.number().int().min(1).max(25).default(10),
    offset: z.coerce.number().int().min(0).max(10000).default(0),
  })
  .strict();

export const CatalogAdminListQuerySchema = z
  .object({
    q: optionalTrimmedString(100).refine(
      value => value === undefined || value.length >= 2,
      'Search query must contain at least 2 characters',
    ),
    limit: z.coerce.number().int().min(1).max(50).default(25),
    offset: z.coerce.number().int().min(0).max(10000).default(0),
  })
  .strict();

export const CatalogAliasSchema = z
  .object({
    id: z.string().uuid(),
    alias: z.string(),
    normalizedAlias: z.string(),
  })
  .strict()
  .openapi('CatalogAlias');

export const CatalogItemSchema = z
  .object({
    id: z.string().uuid(),
    type: CatalogEntityTypeSchema,
    name: z.string(),
    country: z.string().nullable(),
    sport: z.string().nullable(),
    normalizationStatus: CatalogNormalizationStatusSchema,
    isNormalized: z.boolean(),
    matchedBy: CatalogMatchedBySchema.optional(),
    provider: z.string().nullable().optional(),
    externalId: z.string().nullable().optional(),
  })
  .strict()
  .openapi('CatalogItem');

export const CatalogListResponseSchema = z
  .object({
    success: z.literal(true),
    items: z.array(CatalogItemSchema),
    nextOffset: z.number().int().nonnegative().nullable(),
  })
  .strict()
  .openapi('CatalogListResponse');

export const CatalogManualRequestSchema = z
  .object({
    type: CatalogEntityTypeSchema,
    rawText: z.string().trim().min(1).max(100),
    country: optionalTrimmedString(100),
  })
  .strict()
  .openapi('CatalogManualRequest');

export const CatalogItemResponseSchema = z
  .object({
    success: z.literal(true),
    item: CatalogItemSchema,
  })
  .strict()
  .openapi('CatalogItemResponse');

const CatalogAdminBaseRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    country: optionalTrimmedString(100),
    provider: optionalTrimmedString(50),
    externalId: optionalTrimmedString(100),
    alias: optionalTrimmedString(100),
  })
  .strict();

const hasProviderPair = (value: { provider?: string, externalId?: string }) =>
  Boolean(value.provider) === Boolean(value.externalId);

export const CatalogTeamAdminRequestSchema = CatalogAdminBaseRequestSchema
  .refine(hasProviderPair, {
    message: 'Provider and externalId must be provided together',
    path: ['externalId'],
  })
  .openapi({ description: 'provider and externalId must both be present or both be absent.' })
  .openapi('CatalogTeamAdminRequest');

export const CatalogCompetitionAdminRequestSchema = CatalogAdminBaseRequestSchema
  .extend({
    sport: z.string().trim().min(1).max(50),
  })
  .refine(hasProviderPair, {
    message: 'Provider and externalId must be provided together',
    path: ['externalId'],
  })
  .openapi({ description: 'provider and externalId must both be present or both be absent.' })
  .openapi('CatalogCompetitionAdminRequest');

export const CatalogAdminItemSchema = CatalogItemSchema
  .omit({ matchedBy: true })
  .extend({ aliases: z.array(CatalogAliasSchema) })
  .strict()
  .openapi('CatalogAdminItem');

export const CatalogAdminMutationResponseSchema = z
  .object({
    success: z.literal(true),
    created: z.boolean(),
    item: CatalogItemSchema.omit({ matchedBy: true }).strict(),
  })
  .strict()
  .openapi('CatalogAdminMutationResponse');

export const CatalogAdminListResponseSchema = z
  .object({
    success: z.literal(true),
    items: z.array(CatalogAdminItemSchema),
    nextOffset: z.number().int().nonnegative().nullable(),
  })
  .strict()
  .openapi('CatalogAdminListResponse');

export const CatalogAliasRequestSchema = z
  .object({ alias: z.string().trim().min(1).max(100) })
  .strict()
  .openapi('CatalogAliasRequest');

export const CatalogAliasResponseSchema = z
  .object({
    success: z.literal(true),
    alias: CatalogAliasSchema,
  })
  .strict()
  .openapi('CatalogAliasResponse');

export type CatalogEntityType = z.infer<typeof CatalogEntityTypeSchema>;
export type CatalogSearchQuery = z.infer<typeof CatalogSearchQuerySchema>;
export type CatalogAdminListQuery = z.infer<typeof CatalogAdminListQuerySchema>;
export type CatalogManualInput = z.infer<typeof CatalogManualRequestSchema>;
export type CatalogTeamAdminInput = z.infer<typeof CatalogTeamAdminRequestSchema>;
export type CatalogCompetitionAdminInput = z.infer<typeof CatalogCompetitionAdminRequestSchema>;
export type CatalogAdminInput = CatalogTeamAdminInput | CatalogCompetitionAdminInput;
export type CatalogAliasInput = z.infer<typeof CatalogAliasRequestSchema>;
