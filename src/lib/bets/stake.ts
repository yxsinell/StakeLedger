const decimalPattern = /^-?(?:0|[1-9]\d*)(?:\.(\d+))?$/;

export const hasAtMostDecimalPlaces = (value: number, places: number) => {
  if (!Number.isFinite(value) || !Number.isInteger(places) || places < 0) {
    return false;
  }

  const match = decimalPattern.exec(String(value));
  return Boolean(match && (match[1]?.length ?? 0) <= places);
};

const toScaledInteger = (value: number, places: number) => {
  if (!hasAtMostDecimalPlaces(value, places)) {
    return null;
  }

  const sign = value < 0 ? -1 : 1;
  const [integerPart, decimalPart = ''] = String(Math.abs(value)).split('.');
  return sign * Number(`${integerPart}${decimalPart.padEnd(places, '0')}`);
};

export const calculateStakeFromLevel = (cash: number, level: number) => {
  const cashCents = toScaledInteger(cash, 2);
  const levelTenths = toScaledInteger(level, 1);

  if (cashCents === null || levelTenths === null) {
    return null;
  }

  const product = BigInt(cashCents) * BigInt(levelTenths);
  return Number(product / 50_000n) + Number(product % 50_000n) / 50_000;
};

export const hasValidLevelStakePrecision = (cash: number, level: number) => {
  const cashCents = toScaledInteger(cash, 2);
  const levelTenths = toScaledInteger(level, 1);

  if (cashCents === null || levelTenths === null) {
    return false;
  }

  return BigInt(cashCents) * BigInt(levelTenths) % 500n === 0n;
};

export const fundingEqualsStake = (
  funding: { cash: number, bonus: number, freebet: number },
  stake: number,
) => {
  const cash = toScaledInteger(funding.cash, 2);
  const bonus = toScaledInteger(funding.bonus, 2);
  const freebet = toScaledInteger(funding.freebet, 2);
  const stakeAmount = toScaledInteger(stake, 2);

  return cash !== null
    && bonus !== null
    && freebet !== null
    && stakeAmount !== null
    && cash + bonus + freebet === stakeAmount;
};
