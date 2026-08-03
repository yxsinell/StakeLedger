import { NextResponse } from 'next/server';

export const successResponse = <T>(data: T, status = 200) =>
  NextResponse.json(data, { status });

export const errorResponse = (message: string, status = 400, details?: string) =>
  NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status },
  );

export const validationError = (field: string, message: string) =>
  NextResponse.json({ error: message, field }, { status: 400 });

export const codedErrorResponse = (
  error: string,
  code: string,
  status: number,
  field?: string,
) =>
  NextResponse.json(
    {
      error,
      code,
      ...(field ? { field } : {}),
    },
    { status },
  );

export const unauthorizedError = (message = 'Unauthorized') =>
  NextResponse.json({ error: message }, { status: 401 });

export const forbiddenError = (message = 'Forbidden') =>
  NextResponse.json({ error: message }, { status: 403 });

export const notFoundError = (resource = 'Resource') =>
  NextResponse.json({ error: `${resource} not found` }, { status: 404 });

export const serverError = (message = 'Internal server error') =>
  NextResponse.json({ error: message }, { status: 500 });
