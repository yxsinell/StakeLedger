import { z } from '@/lib/openapi/registry';

const DAY_IN_MILLISECONDS = 86_400_000;
const MAX_RANGE_DAYS = 366;

const IsoDateSchema = z.iso.date();

export const MetricsOverviewQuerySchema = z.object({
  bankId: z.string().uuid('Bank not found'),
  from: IsoDateSchema,
  to: IsoDateSchema,
}).strict().superRefine((value, context) => {
  const from = Date.parse(`${value.from}T00:00:00Z`);
  const to = Date.parse(`${value.to}T00:00:00Z`);

  if (from > to) {
    context.addIssue({
      code: 'custom',
      path: ['to'],
      message: 'METRICS_RANGE_INVALID',
    });
    return;
  }

  const inclusiveDays = ((to - from) / DAY_IN_MILLISECONDS) + 1;
  if (inclusiveDays > MAX_RANGE_DAYS) {
    context.addIssue({
      code: 'custom',
      path: ['to'],
      message: 'METRICS_RANGE_MAX',
    });
  }
});

const finiteNumber = z.number().finite();

export const MetricsOverviewSchema = z.object({
  bankId: z.string().uuid(),
  currency: z.string().min(1),
  from: IsoDateSchema,
  to: IsoDateSchema,
  yieldCash: finiteNumber,
  yieldOperative: finiteNumber,
  winRate: finiteNumber.min(0).max(1),
  settledCount: finiteNumber.int().nonnegative(),
  decisiveCount: finiteNumber.int().nonnegative(),
  totalStake: finiteNumber,
  cashStake: finiteNumber,
  totalProfit: finiteNumber,
}).strict().openapi('MetricsOverview');

export const MetricsOverviewResponseSchema = z.object({
  success: z.literal(true),
  metrics: MetricsOverviewSchema,
}).strict().openapi('MetricsOverviewResponse');

export type MetricsOverviewQuery = z.infer<typeof MetricsOverviewQuerySchema>;
export type MetricsOverview = z.infer<typeof MetricsOverviewSchema>;
