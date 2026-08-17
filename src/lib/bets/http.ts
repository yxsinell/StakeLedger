import { codedErrorResponse, serverError } from '@/lib/api/responses';
import { BetsServiceError } from './service';

export const mapBetsError = (error: unknown) => {
  if (error instanceof BetsServiceError) {
    if (error.message === 'BET_NOT_FOUND') {
      return codedErrorResponse('Bet not found', 'BET_NOT_FOUND', 404);
    }
    if (error.message === 'BET_NOT_OPEN') {
      return codedErrorResponse('Bet is not open', 'BET_NOT_OPEN', 409);
    }
    if (error.message === 'BET_NOT_SETTLEABLE') {
      return codedErrorResponse('Bet cannot be settled', 'BET_NOT_SETTLEABLE', 409);
    }
    if (error.message === 'BET_NOT_CASHOUT_ELIGIBLE') {
      return codedErrorResponse('Bet is not eligible for partial cashout', 'BET_NOT_CASHOUT_ELIGIBLE', 409);
    }
    if (error.message === 'INVALID_REMAINING_STAKE') {
      return codedErrorResponse('Remaining stake must be lower than original stake', 'INVALID_REMAINING_STAKE', 400, 'remainingStake');
    }
    if (error.message === 'RETURN_PRECISION_INVALID') {
      return codedErrorResponse('Calculated return has more than two decimal places', 'RETURN_PRECISION_INVALID', 409);
    }
    if (error.message === 'GOAL_DAILY_PROFIT_PRECISION') {
      return codedErrorResponse('Goal daily profit is not exact to two decimal places; settlement was reverted', 'GOAL_DAILY_PROFIT_PRECISION', 409);
    }
    if (error.message === 'GOAL_SUGGESTED_ODDS_PRECISION') {
      return codedErrorResponse('Goal suggested odds is not exact to four decimal places; settlement was reverted', 'GOAL_SUGGESTED_ODDS_PRECISION', 409);
    }
    if (error.message === 'IDEMPOTENCY_KEY_REUSED') {
      return codedErrorResponse('Idempotency key is already associated with a different request', 'IDEMPOTENCY_KEY_REUSED', 409, 'Idempotency-Key');
    }
    if (error.message === 'VALIDATION_ERROR' || error.code === '22023') {
      return codedErrorResponse('Invalid bet request', 'VALIDATION_ERROR', 400);
    }
  }
  return serverError();
};
