import type { Database } from '@/types/supabase';

export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];

export type Bank = Database['public']['Tables']['banks']['Row'];
export type BankInsert = Database['public']['Tables']['banks']['Insert'];
export type BankUpdate = Database['public']['Tables']['banks']['Update'];

export type BankPocket = Database['public']['Tables']['bank_pockets']['Row'];
export type BankPocketInsert = Database['public']['Tables']['bank_pockets']['Insert'];
export type BankPocketUpdate = Database['public']['Tables']['bank_pockets']['Update'];

export type Bet = Database['public']['Tables']['bets']['Row'];
export type BetInsert = Database['public']['Tables']['bets']['Insert'];
export type BetUpdate = Database['public']['Tables']['bets']['Update'];

export type BetLeg = Database['public']['Tables']['bet_legs']['Row'];
export type BetLegInsert = Database['public']['Tables']['bet_legs']['Insert'];
export type BetLegUpdate = Database['public']['Tables']['bet_legs']['Update'];

export type BetCashout = Database['public']['Tables']['bet_cashouts']['Row'];
export type BetCashoutInsert = Database['public']['Tables']['bet_cashouts']['Insert'];
export type BetCashoutUpdate = Database['public']['Tables']['bet_cashouts']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type UserProfile = Database['public']['Tables']['users']['Row'];
export type UserProfileInsert = Database['public']['Tables']['users']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['users']['Update'];

export type BankWithPockets = Bank & {
  bank_pockets: Array<Pick<BankPocket, 'pocket_type' | 'balance'>>
};

export type BetSummary = Pick<Bet, 'id' | 'status' | 'odds' | 'stake_amount' | 'created_at'>;
