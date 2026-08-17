import { hasAtMostDecimalPlaces } from './stake';

export type SettlementResult = 'won' | 'lost' | 'void' | 'half_won' | 'half_lost';
export type FundingPocket = 'cash' | 'bonus' | 'freebet';

export interface SettlementCredit {
  pocketType: FundingPocket
  amount: number
}

export interface FundingSettlement {
  credits: SettlementCredit[]
  profit: number
}

const scale = (value: number, places: number) => {
  if (!hasAtMostDecimalPlaces(value, places)) { return null; }
  const [whole, fraction = ''] = String(value).split('.');
  return BigInt(`${whole}${fraction.padEnd(places, '0')}`);
};

const exactDivide = (numerator: bigint, denominator: bigint) => {
  if (numerator % denominator !== 0n) { return null; }
  return numerator / denominator;
};

const toAmount = (cents: bigint) => Number(cents) / 100;

export const calculateFundingSettlement = (
  pocketType: FundingPocket,
  amount: number,
  odds: number,
  result: SettlementResult,
): FundingSettlement | null => {
  const amountCents = scale(amount, 2);
  const oddsUnits = scale(odds, 4);
  if (amountCents === null || oddsUnits === null || amountCents <= 0n || oddsUnits <= 10_000n) {
    return null;
  }

  const profitNumerator = amountCents * (oddsUnits - 10_000n);
  const fullProfit = exactDivide(profitNumerator, 10_000n);
  const halfProfit = exactDivide(profitNumerator, 20_000n);
  const halfStake = exactDivide(amountCents, 2n);
  const fullReturn = exactDivide(amountCents * oddsUnits, 10_000n);
  const halfWonReturn = exactDivide(amountCents * (oddsUnits + 10_000n), 20_000n);

  if (pocketType === 'freebet') {
    if (result === 'lost') { return { credits: [], profit: 0 }; }
    if (result === 'void') { return { credits: [{ pocketType, amount }], profit: 0 }; }
    if (result === 'won') {
      return fullProfit === null
        ? null
        : { credits: [{ pocketType: 'cash', amount: toAmount(fullProfit) }], profit: toAmount(fullProfit) };
    }
    if (halfStake === null) { return null; }
    if (result === 'half_lost') {
      return { credits: [{ pocketType, amount: toAmount(halfStake) }], profit: 0 };
    }
    return halfProfit === null
      ? null
      : {
          credits: [
            { pocketType, amount: toAmount(halfStake) },
            { pocketType: 'cash', amount: toAmount(halfProfit) },
          ],
          profit: toAmount(halfProfit),
        };
  }

  if (result === 'lost') { return { credits: [], profit: -amount }; }
  if (result === 'void') { return { credits: [{ pocketType, amount }], profit: 0 }; }
  if (result === 'won') {
    return fullReturn === null || fullProfit === null
      ? null
      : { credits: [{ pocketType, amount: toAmount(fullReturn) }], profit: toAmount(fullProfit) };
  }
  if (halfStake === null) { return null; }
  if (result === 'half_lost') {
    return { credits: [{ pocketType, amount: toAmount(halfStake) }], profit: -toAmount(halfStake) };
  }
  return halfWonReturn === null || halfProfit === null
    ? null
    : { credits: [{ pocketType, amount: toAmount(halfWonReturn) }], profit: toAmount(halfProfit) };
};
