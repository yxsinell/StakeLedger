import { describe, expect, test } from 'bun:test';

import {
  decodeRecommendationCursor,
  encodeRecommendationCursor,
  RecommendationCreateRequestSchema,
  RecommendationFeedQuerySchema,
  RecommendationFollowRequestSchema,
  RecommendationIcpSchema,
  RecommendationUpdateRequestSchema,
} from './schemas';

const validRecommendation = {
  eventId: '550e8400-e29b-41d4-a716-446655440000',
  marketId: '550e8400-e29b-41d4-a716-446655440001',
  selection: 'Home team',
  odds: 2.15,
  type: 'pre',
  rationale: 'Strong price against projected probability.',
  icp: { version: 1, score: 82, factors: ['Model edge', 'Stable lineup'] },
  status: 'draft',
};

describe('recommendation validation', () => {
  test('accepts ICP v1 and enforces score and bounded nonblank factors', () => {
    expect(RecommendationIcpSchema.safeParse(validRecommendation.icp).success).toBe(true);
    expect(RecommendationIcpSchema.safeParse({ version: 2, score: 82, factors: [] }).success).toBe(false);
    expect(RecommendationIcpSchema.safeParse({ version: 1, score: 101, factors: [] }).success).toBe(false);
    expect(RecommendationIcpSchema.safeParse({ version: 1, score: 82, factors: [] }).success).toBe(false);
    expect(RecommendationIcpSchema.safeParse({ version: 1, score: 82, factors: ['  '] }).success).toBe(false);
    expect(RecommendationIcpSchema.safeParse({ version: 1, score: 82, factors: Array.from({ length: 21 }, () => 'factor') }).success).toBe(false);
  });

  test('validates create and non-empty edit contracts with terminal inactivation', () => {
    expect(RecommendationCreateRequestSchema.safeParse(validRecommendation).success).toBe(true);
    expect(RecommendationCreateRequestSchema.safeParse({ ...validRecommendation, odds: 1 }).success).toBe(false);
    expect(RecommendationCreateRequestSchema.safeParse({ ...validRecommendation, status: 'inactive' }).success).toBe(false);
    expect(RecommendationCreateRequestSchema.safeParse({ ...validRecommendation, status: 'published' }).success).toBe(false);
    expect(RecommendationUpdateRequestSchema.safeParse({ rationale: 'Updated rationale' }).success).toBe(true);
    expect(RecommendationUpdateRequestSchema.safeParse({}).success).toBe(false);
    expect(RecommendationUpdateRequestSchema.safeParse({ status: 'inactive' }).success).toBe(true);
  });

  test('trims feed sport, applies pagination defaults, and requires follow bank', () => {
    expect(RecommendationFeedQuerySchema.parse({ sport: '  Football  ' })).toEqual({ sport: 'Football', limit: 20 });
    expect(RecommendationFeedQuerySchema.safeParse({ limit: 51 }).success).toBe(false);
    expect(RecommendationFeedQuerySchema.safeParse({ leagueId: 'invalid' }).success).toBe(false);
    expect(RecommendationFollowRequestSchema.safeParse({}).success).toBe(false);
    expect(RecommendationFollowRequestSchema.safeParse({ bankId: validRecommendation.eventId }).success).toBe(true);
  });
});

describe('recommendation cursor', () => {
  test('round-trips canonical publishedAt and id cursor data', () => {
    const payload = { publishedAt: '2026-08-17T10:30:00.000Z', id: validRecommendation.eventId };
    const encoded = encodeRecommendationCursor(payload);
    expect(encoded).not.toContain('=');
    expect(decodeRecommendationCursor(encoded)).toEqual(payload);
    expect(RecommendationFeedQuerySchema.safeParse({ cursor: encoded }).success).toBe(true);
  });

  test('rejects malformed and non-canonical cursors', () => {
    expect(() => decodeRecommendationCursor('not-a-cursor')).toThrow('Invalid recommendation cursor');
    expect(RecommendationFeedQuerySchema.safeParse({ cursor: 'not-a-cursor' }).success).toBe(false);
  });
});
