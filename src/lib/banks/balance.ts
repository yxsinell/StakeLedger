import type { BankCurrency } from './schemas';

interface PocketBalance {
  pocket_type: string
  balance: number
}

export interface BankBalances {
  cash: number
  bonus: number
  freebet: number
  operative: number
}

export const calculateBankBalances = (pockets: readonly PocketBalance[]): BankBalances => {
  const balances = {
    cash: 0,
    bonus: 0,
    freebet: 0,
  };

  for (const pocket of pockets) {
    if (pocket.pocket_type === 'cash') {
      balances.cash = pocket.balance;
    }
    else if (pocket.pocket_type === 'bonus') {
      balances.bonus = pocket.balance;
    }
    else if (pocket.pocket_type === 'freebet') {
      balances.freebet = pocket.balance;
    }
  }

  return { ...balances, operative: balances.cash };
};

export const formatMoney = (amount: number, currency: BankCurrency) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
