import {
  MetricsOverviewQuerySchema,
  MetricsOverviewResponseSchema,
} from '@/lib/metrics/schemas';
import { registry } from '../registry';
import { ErrorResponseSchema } from './common';

const error = {
  description: 'Request failed',
  content: { 'application/json': { schema: ErrorResponseSchema } },
};

registry.registerPath({
  method: 'get',
  path: '/metrics/overview',
  tags: ['Metrics'],
  summary: 'Get settled-bet metrics for an owned bank and date range',
  security: [{ cookieAuth: [] }],
  request: { query: MetricsOverviewQuerySchema },
  responses: {
    200: {
      description: 'Metrics overview',
      content: { 'application/json': { schema: MetricsOverviewResponseSchema } },
    },
    400: error,
    401: error,
    404: error,
    500: error,
  },
});
