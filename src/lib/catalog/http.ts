import type { ZodError } from 'zod';

import { codedErrorResponse, serverError } from '@/lib/api/responses';
import { CatalogServiceError } from './service';

export const validationResponse = (error: ZodError) => {
  const issue = error.issues[0];
  return codedErrorResponse(
    issue?.message ?? 'Invalid catalog request',
    'VALIDATION_ERROR',
    400,
    issue?.path.join('.'),
  );
};

export const catalogErrorResponse = (error: unknown) => {
  if (error instanceof Response) {
    return error;
  }

  if (error instanceof CatalogServiceError) {
    if (error.code === 'AUTHENTICATION_REQUIRED') {
      return codedErrorResponse('Unauthorized', 'AUTHENTICATION_REQUIRED', 401);
    }

    if (error.code === 'CATALOG_EDITOR_REQUIRED') {
      return codedErrorResponse('Forbidden', 'CATALOG_EDITOR_REQUIRED', 403);
    }

    if (error.code === 'VALIDATION_ERROR') {
      return codedErrorResponse('Invalid catalog request', 'VALIDATION_ERROR', 400);
    }

    if (error.code === 'CATALOG_ITEM_NOT_FOUND') {
      return codedErrorResponse('Catalog item not found', 'CATALOG_ITEM_NOT_FOUND', 404);
    }

    if (error.code === 'CATALOG_ALIAS_CONFLICT') {
      return codedErrorResponse('Catalog alias already exists', 'CATALOG_ALIAS_CONFLICT', 409);
    }

    if (error.code === 'CATALOG_PROVIDER_CONFLICT') {
      return codedErrorResponse(
        'Provider and external ID already identify another catalog item',
        'CATALOG_PROVIDER_CONFLICT',
        409,
      );
    }
  }

  return serverError();
};
