import { hasAtMostDecimalPlaces } from '@/lib/bets/stake';
import { z } from '@/lib/openapi/registry';

const MAX_ODDS = 999999.9999;

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    value => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().max(max).optional(),
  );

export const RecommendationIdSchema = z.string().uuid('Recommendation not found');
export const RecommendationTypeSchema = z.enum(['pre', 'live']);
export const RecommendationStatusSchema = z.enum(['draft', 'published', 'inactive']);
export const RecommendationCreateStatusSchema = z.literal('draft');

export const RecommendationIcpSchema = z.object({
  version: z.literal(1),
  score: z.number().int().min(0).max(100),
  factors: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
}).strict().openapi('RecommendationIcp');

const OddsSchema = z.number()
  .finite('Odds must be a finite number')
  .gt(1, 'Odds must be greater than one')
  .max(MAX_ODDS, 'Odds are too large')
  .refine(value => hasAtMostDecimalPlaces(value, 4), 'Odds must have at most four decimal places')
  .openapi({ minimum: 1, exclusiveMinimum: true, maximum: MAX_ODDS, multipleOf: 0.0001 });

const RecommendationFieldsSchema = z.object({
  eventId: z.string().uuid('Event not found'),
  marketId: z.string().uuid('Market not found'),
  selection: z.string().trim().min(1).max(100),
  odds: OddsSchema,
  type: RecommendationTypeSchema,
  rationale: z.string().trim().min(1).max(2000),
  icp: RecommendationIcpSchema,
  status: RecommendationCreateStatusSchema,
});

export const RecommendationCreateRequestSchema = RecommendationFieldsSchema
  .strict()
  .openapi('RecommendationCreateRequest');

export const RecommendationUpdateRequestSchema = RecommendationFieldsSchema
  .omit({ status: true })
  .extend({ status: RecommendationStatusSchema })
  .partial()
  .strict()
  .refine(value => Object.keys(value).length > 0, 'At least one field is required')
  .openapi('RecommendationUpdateRequest');

const CursorPayloadSchema = z.object({
  publishedAt: z.string().datetime({ offset: true }),
  id: z.string().uuid(),
}).strict();

export type RecommendationCursor = z.infer<typeof CursorPayloadSchema>;

export const encodeRecommendationCursor = (cursor: RecommendationCursor) =>
  Buffer.from(JSON.stringify(CursorPayloadSchema.parse(cursor))).toString('base64url');

export const decodeRecommendationCursor = (cursor: string): RecommendationCursor => {
  try {
    const parsed = CursorPayloadSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')));
    if (encodeRecommendationCursor(parsed) !== cursor) { throw new Error('Non-canonical cursor'); }
    return parsed;
  }
  catch {
    throw new Error('Invalid recommendation cursor');
  }
};

export const RecommendationFeedQuerySchema = z.object({
  type: RecommendationTypeSchema.optional(),
  sport: optionalTrimmedString(100),
  leagueId: z.string().uuid('League not found').optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).max(1000).optional().refine(
    (value) => {
      if (!value) { return true; }
      try { decodeRecommendationCursor(value); return true; }
      catch { return false; }
    },
    'Invalid recommendation cursor',
  ),
}).strict();

export const RecommendationAdminQuerySchema = z.object({
  status: RecommendationStatusSchema.optional(),
  type: RecommendationTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(25),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
}).strict();

export const RecommendationFollowRequestSchema = z.object({
  bankId: z.string().uuid('Bank not found'),
}).strict().openapi('RecommendationFollowRequest');

const RecommendationEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  startsAt: z.string(),
  status: z.enum(['scheduled', 'live', 'finished', 'cancelled']),
  homeTeam: z.object({ id: z.string().uuid(), name: z.string() }).strict(),
  awayTeam: z.object({ id: z.string().uuid(), name: z.string() }).strict(),
  sport: z.string(),
  league: z.object({ id: z.string().uuid(), name: z.string() }).strict(),
}).strict().openapi('RecommendationEvent');

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  event: RecommendationEventSchema,
  market: z.object({ id: z.string().uuid(), name: z.string() }).strict(),
  selection: z.string(),
  odds: OddsSchema,
  type: RecommendationTypeSchema,
  rationale: z.string(),
  icp: RecommendationIcpSchema,
  status: RecommendationStatusSchema,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).strict().openapi('Recommendation');

export const RecommendationResponseSchema = z.object({
  success: z.literal(true),
  recommendation: RecommendationSchema,
}).strict().openapi('RecommendationResponse');

export const RecommendationListResponseSchema = z.object({
  success: z.literal(true),
  recommendations: z.array(RecommendationSchema),
  nextCursor: z.string().nullable(),
}).strict().openapi('RecommendationListResponse');

export const RecommendationAdminListResponseSchema = z.object({
  success: z.literal(true),
  recommendations: z.array(RecommendationSchema),
  nextOffset: z.number().int().nonnegative().nullable(),
}).strict().openapi('RecommendationAdminListResponse');

export const RecommendationFollowSchema = z.object({
  id: z.string().uuid(),
  recommendationId: z.string().uuid(),
  bankId: z.string().uuid(),
  createdAt: z.string(),
}).strict().openapi('RecommendationFollow');

export const RecommendationPrefillSchema = z.object({
  recommendationId: z.string().uuid(),
  bankId: z.string().uuid(),
  odds: OddsSchema,
  legs: z.array(z.object({
    referenceType: z.literal('normalized'),
    eventId: z.string().uuid(),
    marketId: z.string().uuid(),
    selection: z.string().trim().min(1).max(100),
    odds: OddsSchema,
  }).strict()).length(1),
}).strict().openapi('RecommendationPrefill');

export const RecommendationFollowResponseSchema = z.object({
  success: z.literal(true),
  follow: RecommendationFollowSchema,
  prefill: RecommendationPrefillSchema,
}).strict().openapi('RecommendationFollowResponse');

export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendationCreateInput = z.infer<typeof RecommendationCreateRequestSchema>;
export type RecommendationUpdateInput = z.infer<typeof RecommendationUpdateRequestSchema>;
export type RecommendationFeedQuery = z.infer<typeof RecommendationFeedQuerySchema>;
export type RecommendationAdminQuery = z.infer<typeof RecommendationAdminQuerySchema>;
