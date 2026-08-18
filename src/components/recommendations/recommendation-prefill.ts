import { RecommendationPrefillSchema } from '@/lib/recommendations/schemas';

export const RECOMMENDATION_PREFILL_STORAGE_KEY = 'stakeledger:recommendation-prefill';

export function readRecommendationPrefill() {
  const stored = sessionStorage.getItem(RECOMMENDATION_PREFILL_STORAGE_KEY);
  sessionStorage.removeItem(RECOMMENDATION_PREFILL_STORAGE_KEY);

  if (!stored) { return null; }

  try {
    const parsed: unknown = JSON.parse(stored);
    const result = RecommendationPrefillSchema.safeParse(parsed);
    return result.success ? result.data : null;
  }
  catch {
    return null;
  }
}
