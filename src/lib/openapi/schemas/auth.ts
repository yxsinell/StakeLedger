import { registry, z } from '../registry';
import { ErrorResponseSchema } from './common';

const NormalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email must be valid')
  .max(254, 'Email must not exceed 254 characters')
  .openapi({ example: 'user@example.com' });

const PasswordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .openapi({ format: 'password' });

export const RegisterRequestSchema = z
  .object({
    email: NormalizedEmailSchema,
    password: PasswordSchema,
  })
  .openapi('RegisterRequest');

export const LoginRequestSchema = z
  .object({
    email: NormalizedEmailSchema,
    password: z.string().min(8, 'Password must contain at least 8 characters').openapi({
      format: 'password',
    }),
  })
  .openapi('LoginRequest');

export const ResetPasswordRequestSchema = z
  .object({
    email: NormalizedEmailSchema,
  })
  .openapi('ResetPasswordRequest');

export const AuthSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
  })
  .openapi('AuthSuccessResponse');

const jsonRequest = (schema: z.ZodType) => ({
  required: true,
  content: {
    'application/json': { schema },
  },
});

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': { schema: ErrorResponseSchema },
  },
};

const successResponse = (description: string) => ({
  description,
  content: {
    'application/json': { schema: AuthSuccessResponseSchema },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Authentication'],
  summary: 'Register an email-password user',
  request: { body: jsonRequest(RegisterRequestSchema) },
  responses: {
    201: successResponse('Registration accepted'),
    400: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Authentication'],
  summary: 'Start a cookie-backed web session',
  request: { body: jsonRequest(LoginRequestSchema) },
  responses: {
    200: successResponse('Session started'),
    400: errorResponse,
    401: errorResponse,
    500: errorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Authentication'],
  summary: 'End current web session',
  security: [{ cookieAuth: [] }],
  responses: {
    200: successResponse('Session ended'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/reset-password',
  tags: ['Authentication'],
  summary: 'Request a password reset email',
  request: { body: jsonRequest(ResetPasswordRequestSchema) },
  responses: {
    200: successResponse('Reset request accepted'),
    400: errorResponse,
    500: errorResponse,
  },
});
