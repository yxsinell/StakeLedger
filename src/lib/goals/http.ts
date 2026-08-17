import { codedErrorResponse, serverError } from '@/lib/api/responses';
import { GoalsServiceError } from './service';

export const mapGoalsError = (error: unknown) => {
  if (error instanceof GoalsServiceError) {
    const mappings: Record<string, [string, number, string?]> = {
      BANK_NOT_FOUND: ['Bank not found', 404],
      GOAL_NOT_FOUND: ['Goal not found', 404],
      GOAL_NOT_ACTIVE: ['Goal is not active', 409],
      GOAL_ACTIVE_EXISTS: ['Bank already has an active goal', 409, 'bankId'],
      GOAL_TARGET_INVALID: ['Target amount must be greater than base amount', 400, 'targetAmount'],
      GOAL_DEADLINE_PAST: ['Deadline must be a future date', 400, 'deadline'],
      GOAL_DAILY_PROFIT_PRECISION: ['Daily profit must be exact to two decimal places', 400],
      GOAL_SUGGESTED_ODDS_PRECISION: ['Suggested odds must be exact to four decimal places', 400],
      GOAL_TARGET_NOT_REACHED: ['Completed goals require current cash to reach target', 409, 'status'],
      GOAL_CLOSE_CONFIRMATION_REQUIRED: ['Goal closure requires explicit confirmation', 400, 'confirmed'],
      RISK_LIMIT_INVALID: ['Risk limit is invalid', 400],
    };
    const mapping = mappings[error.message];
    if (mapping) { return codedErrorResponse(mapping[0], error.message, mapping[1], mapping[2]); }
    if (error.message === 'VALIDATION_ERROR' || error.code === '22023') {
      return codedErrorResponse('Invalid request', 'VALIDATION_ERROR', 400);
    }
    if (error.message === 'AUTHENTICATION_REQUIRED' || error.code === '28000') {
      return codedErrorResponse('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    }
  }
  return serverError();
};
