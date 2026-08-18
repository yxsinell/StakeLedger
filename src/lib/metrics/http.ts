import type { ZodError } from 'zod';

import { codedErrorResponse, serverError } from '@/lib/api/responses';
import { MetricsServiceError } from './service';

const errorMappings: Record<string, [string, number, string?]> = {
  BANK_NOT_FOUND: ['Bank not found', 404, 'bankId'],
  METRICS_RANGE_INVALID: ['Metrics date range is invalid', 400, 'to'],
  METRICS_RANGE_MAX: ['Metrics date range cannot exceed 366 inclusive days', 400, 'to'],
};

const mappedErrorResponse = (code: string) => {
  const mapping = errorMappings[code];
  return mapping
    ? codedErrorResponse(mapping[0], code, mapping[1], mapping[2])
    : null;
};

export const mapMetricsValidationError = (error: ZodError) => {
  const issue = error.issues[0];
  const mapped = issue ? mappedErrorResponse(issue.message) : null;
  return mapped ?? codedErrorResponse(
    issue?.message ?? 'Invalid metrics query',
    'VALIDATION_ERROR',
    400,
    issue?.path.join('.'),
  );
};

export const mapMetricsError = (error: unknown) => {
  if (error instanceof MetricsServiceError) {
    const mapped = mappedErrorResponse(error.message);
    if (mapped) {
      return mapped;
    }

    if (error.message === 'VALIDATION_ERROR' || error.code === '22023') {
      return codedErrorResponse('Invalid metrics query', 'VALIDATION_ERROR', 400);
    }
  }

  return serverError();
};
