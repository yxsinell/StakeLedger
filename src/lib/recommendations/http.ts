import type { ZodError } from 'zod';

import { codedErrorResponse, serverError } from '@/lib/api/responses';
import { RecommendationsServiceError } from './service';

export const recommendationValidationResponse = (error: ZodError) => {
  const issue = error.issues[0];
  return codedErrorResponse(
    issue?.message ?? 'Invalid recommendation request',
    'VALIDATION_ERROR',
    400,
    issue?.path.join('.'),
  );
};

export const recommendationErrorResponse = (error: unknown) => {
  if (error instanceof Response) { return error; }
  if (!(error instanceof RecommendationsServiceError)) { return serverError(); }

  const mappings: Record<string, [string, number, string?]> = {
    AUTHENTICATION_REQUIRED: ['Authentication required', 401],
    RECOMMENDATION_EDITOR_REQUIRED: ['Editor role required', 403],
    RECOMMENDATION_NOT_FOUND: ['Recommendation not found', 404],
    RECOMMENDATION_NOT_PUBLISHED: ['Recommendation is not published', 409],
    RECOMMENDATION_INACTIVE: ['Recommendation is inactive', 409],
    RECOMMENDATION_INACTIVE_TERMINAL: ['Inactive recommendation cannot be changed', 409, 'status'],
    RECOMMENDATION_STATUS_TRANSITION_INVALID: ['Recommendation status transition is invalid', 409, 'status'],
    RECOMMENDATION_PREFILL_INVALID: ['Recommendation prefill is incomplete', 409],
    CATALOG_REFERENCE_NOT_NORMALIZED: ['Event and market must be active normalized references', 400],
    EVENT_NOT_FOUND: ['Event not found', 404, 'eventId'],
    EVENT_NOT_NORMALIZED: ['Event is not normalized', 400, 'eventId'],
    MARKET_NOT_FOUND: ['Market not found', 404, 'marketId'],
    MARKET_EVENT_MISMATCH: ['Market does not belong to event', 400, 'marketId'],
    MARKET_NOT_ACTIVE: ['Market is not active', 400, 'marketId'],
    BANK_NOT_FOUND: ['Bank not found', 404, 'bankId'],
    BANK_OWNERSHIP_REQUIRED: ['Bank is not owned by authenticated user', 403, 'bankId'],
    PROFILE_NOT_FOUND: ['Authenticated profile not found', 404],
    VALIDATION_ERROR: ['Invalid recommendation request', 400],
  };
  const mapping = mappings[error.code];
  return mapping
    ? codedErrorResponse(mapping[0], error.code, mapping[1], mapping[2])
    : serverError();
};
