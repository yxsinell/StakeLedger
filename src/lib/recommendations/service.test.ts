import type { Recommendation } from './schemas';
import { describe, expect, test } from 'bun:test';
import { RecommendationFollowResponseSchema } from './schemas';
import { buildRecommendationPrefill } from './service';

const recommendation: Recommendation = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  event: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Home vs Away',
    startsAt: '2026-08-18T20:00:00Z',
    status: 'scheduled',
    homeTeam: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Home' },
    awayTeam: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Away' },
    sport: 'Football',
    league: { id: '550e8400-e29b-41d4-a716-446655440004', name: 'League' },
  },
  market: { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Match winner' },
  selection: 'Home',
  odds: 2.2,
  type: 'pre',
  rationale: 'Model edge.',
  icp: { version: 1, score: 80, factors: ['Model edge'] },
  status: 'published',
  publishedAt: '2026-08-17T10:00:00Z',
  createdAt: '2026-08-17T09:00:00Z',
  updatedAt: '2026-08-17T10:00:00Z',
};

describe('recommendation follow prefill', () => {
  test('builds one normalized leg without bet, stake, or funding data', () => {
    const bankId = '550e8400-e29b-41d4-a716-446655440006';
    const prefill = buildRecommendationPrefill(recommendation, bankId);
    expect(prefill).toEqual({
      recommendationId: recommendation.id,
      bankId,
      odds: 2.2,
      legs: [{
        referenceType: 'normalized',
        eventId: recommendation.event.id,
        marketId: recommendation.market.id,
        selection: 'Home',
        odds: 2.2,
      }],
    });
    expect(prefill).not.toHaveProperty('stake');
    expect(prefill).not.toHaveProperty('funding');
  });

  test('matches follow response schema', () => {
    const bankId = '550e8400-e29b-41d4-a716-446655440006';
    expect(RecommendationFollowResponseSchema.safeParse({
      success: true,
      follow: {
        id: '550e8400-e29b-41d4-a716-446655440007',
        recommendationId: recommendation.id,
        bankId,
        createdAt: '2026-08-17T11:00:00Z',
      },
      prefill: buildRecommendationPrefill(recommendation, bankId),
    }).success).toBe(true);
  });
});
