import { z } from '@/lib/openapi/registry';

export const BankCurrencySchema = z.enum(['EUR', 'USD', 'ARS']);

const MonetaryAmountSchema = z
  .number()
  .finite('Amount must be a finite number')
  .positive('Amount must be greater than zero')
  .max(999999999999.99, 'Amount is too large')
  .refine(
    value => /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value)),
    'Amount must have at most two decimal places',
  );

export const BankCreateRequestSchema = z
  .object({
    name: z.string().trim().min(1, 'Bank name is required').max(100),
    currency: BankCurrencySchema,
    initialCash: MonetaryAmountSchema,
    initialBonus: MonetaryAmountSchema,
    initialFreebet: MonetaryAmountSchema,
  })
  .openapi('BankCreateRequest');

export const BankIdSchema = z.string().uuid('Bank not found');

export const TransferCreateRequestSchema = z
  .object({
    toBankId: BankIdSchema,
    amount: MonetaryAmountSchema,
  })
  .strict()
  .openapi('TransferCreateRequest');

export const TransferResultSchema = z.object({
  transferId: z.string().uuid(),
  sourceBalance: z.number().nonnegative(),
  destinationBalance: z.number().nonnegative(),
  replayed: z.boolean(),
});

export const TransferResponseSchema = z
  .object({
    success: z.literal(true),
    transferId: z.string().uuid(),
    sourceBalance: z.number().nonnegative(),
    destinationBalance: z.number().nonnegative(),
  })
  .openapi('TransferResponse');

export const BankBalancesSchema = z
  .object({
    cash: z.number().nonnegative(),
    bonus: z.number().nonnegative(),
    freebet: z.number().nonnegative(),
    operative: z.number().nonnegative(),
  })
  .openapi('BankBalances');

export const BankSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    currency: BankCurrencySchema,
    balances: BankBalancesSchema,
  })
  .openapi('Bank');

export const BankResponseSchema = z
  .object({
    success: z.literal(true),
    bank: BankSchema,
  })
  .openapi('BankResponse');

export const BankListResponseSchema = z
  .object({
    success: z.literal(true),
    banks: z.array(BankSchema),
  })
  .openapi('BankListResponse');

export type BankCreateInput = z.infer<typeof BankCreateRequestSchema>;
export type BankCurrency = z.infer<typeof BankCurrencySchema>;
export type BankData = z.infer<typeof BankSchema>;
export type TransferCreateInput = z.infer<typeof TransferCreateRequestSchema>;
