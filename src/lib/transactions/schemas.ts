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

const TransactionCursorSchema = z.object({
  createdAt: z.string().datetime({ offset: true }),
  id: z.string().uuid(),
}).strict();

export type TransactionCursor = z.infer<typeof TransactionCursorSchema>;

export const encodeTransactionCursor = (cursor: TransactionCursor) =>
  Buffer.from(JSON.stringify(TransactionCursorSchema.parse(cursor))).toString('base64url');

export const decodeTransactionCursor = (cursor: string): TransactionCursor => {
  try {
    const parsed = TransactionCursorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')));
    if (encodeTransactionCursor(parsed) !== cursor) { throw new Error('Non-canonical cursor'); }
    return parsed;
  }
  catch {
    throw new Error('Invalid transaction cursor');
  }
};

export const TransactionListQuerySchema = z.object({
  bankId: z.string().uuid('Bank not found'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).max(1000).optional().refine(
    (value) => {
      if (!value) { return true; }
      try { decodeTransactionCursor(value); return true; }
      catch { return false; }
    },
    'Invalid transaction cursor',
  ),
}).strict();

export const LedgerTransactionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'initial_deposit',
    'deposit',
    'withdraw',
    'transfer_debit',
    'transfer_credit',
    'bet_reserve',
    'bet_return',
    'bet_carryover',
    'cashout_return',
    'adjustment',
  ]),
  pocketType: z.enum(['cash', 'bonus', 'freebet']),
  amount: z.number().positive(),
  method: z.string().nullable(),
  createdAt: z.string(),
  betId: z.string().uuid().nullable(),
  cashoutId: z.string().uuid().nullable(),
  transferId: z.string().uuid().nullable(),
  relatedTransactionId: z.string().uuid().nullable(),
}).strict().openapi('LedgerTransaction');

export const TransactionListResponseSchema = z.object({
  success: z.literal(true),
  transactions: z.array(LedgerTransactionSchema),
  nextCursor: z.string().nullable(),
}).strict().openapi('TransactionListResponse');

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
export type TransactionListQuery = z.infer<typeof TransactionListQuerySchema>;
export type LedgerTransaction = z.infer<typeof LedgerTransactionSchema>;
