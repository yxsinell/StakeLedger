import { z } from '@/lib/openapi/registry';

export const TRANSACTION_METHODS = ['bank_transfer', 'card', 'cash'] as const;

const MonetaryAmountSchema = z
  .number()
  .finite('Amount must be a finite number')
  .positive('Amount must be greater than zero')
  .max(999999999999.99, 'Amount is too large')
  .refine(
    value => /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value)),
    'Amount must have at most two decimal places',
  );

export const TransactionCreateRequestSchema = z
  .object({
    bankId: z.string().uuid('Bank not found'),
    type: z.enum(['deposit', 'withdraw']),
    amount: MonetaryAmountSchema,
    method: z.enum(TRANSACTION_METHODS),
  })
  .strict()
  .openapi('TransactionCreateRequest');

export const IdempotencyKeySchema = z.string().uuid('Idempotency-Key must be a UUID');

export const TransactionResultSchema = z.object({
  transactionId: z.string().uuid(),
  balance: z.number().nonnegative(),
  replayed: z.boolean(),
});

export const TransactionResponseSchema = z
  .object({
    success: z.literal(true),
    transactionId: z.string().uuid(),
    balance: z.number().nonnegative(),
  })
  .openapi('TransactionResponse');

export type TransactionCreateInput = z.infer<typeof TransactionCreateRequestSchema>;
