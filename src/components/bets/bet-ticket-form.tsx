'use client';

import type { BankData } from '@/lib/banks/schemas';
import type { Goal } from '@/lib/goals/schemas';
import { Plus, Trash2 } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/banks/balance';
import { BankListResponseSchema } from '@/lib/banks/schemas';
import { BetResponseSchema } from '@/lib/bets/schemas';
import { calculateStakeFromLevel, hasValidLevelStakePrecision } from '@/lib/bets/stake';
import { GoalListResponseSchema } from '@/lib/goals/schemas';

type ReferenceType = 'manual' | 'normalized';
type StakeMode = 'amount' | 'level';

interface LegFormValue {
  referenceType: ReferenceType
  eventReference: string
  marketReference: string
  selection: string
  odds: string
}

interface FundingFormValue {
  cash: string
  bonus: string
  freebet: string
}

interface PendingRequest {
  fingerprint: string
  idempotencyKey: string
}

const MAX_LEGS = 20;
const MAX_ODDS = 999999.9999;
const ODDS_PATTERN = /^\d+(?:\.\d{1,4})?$/;
const MONEY_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const LEVEL_PATTERN = /^\d+(?:\.\d)?$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMPTY_LEG: LegFormValue = {
  referenceType: 'manual',
  eventReference: '',
  marketReference: '',
  selection: '',
  odds: '',
};

function toCents(value: string): number | null {
  if (!MONEY_PATTERN.test(value)) {
    return null;
  }

  const [whole, decimal = ''] = value.split('.');
  return Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
}

function getApiError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return fallback;
}

export function BetTicketForm() {
  const [banks, setBanks] = useState<BankData[]>([]);
  const [bankId, setBankId] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalId, setGoalId] = useState('');
  const [legs, setLegs] = useState<LegFormValue[]>([{ ...EMPTY_LEG }]);
  const [ticketOdds, setTicketOdds] = useState('');
  const [stakeMode, setStakeMode] = useState<StakeMode>('amount');
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeLevel, setStakeLevel] = useState('');
  const [funding, setFunding] = useState<FundingFormValue>({ cash: '', bonus: '', freebet: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingRequest = useRef<PendingRequest | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadBanks = async () => {
      try {
        const [response, goalsResponse] = await Promise.all([
          fetch('/api/banks', { credentials: 'same-origin' }),
          fetch('/api/goals', { credentials: 'same-origin' }),
        ]);
        const [payload, goalsPayload]: unknown[] = await Promise.all([
          response.json().catch(() => null),
          goalsResponse.json().catch(() => null),
        ]);
        const parsed = BankListResponseSchema.safeParse(payload);
        const parsedGoals = GoalListResponseSchema.safeParse(goalsPayload);

        if (!response.ok || !parsed.success || !goalsResponse.ok || !parsedGoals.success) {
          throw new Error(getApiError(payload, 'No se pudieron cargar los banks.'));
        }

        if (isCurrent) {
          setBanks(parsed.data.banks);
          setBankId(parsed.data.banks[0]?.id ?? '');
          setGoals(parsedGoals.data.goals.filter(goal => goal.status === 'active'));
        }
      }
      catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los banks.');
        }
      }
      finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadBanks();

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedBank = banks.find(bank => bank.id === bankId) ?? null;
  const availableGoals = goals.filter(goal => goal.bank.id === bankId);
  const cashCents = selectedBank ? toCents(String(selectedBank.balances.cash)) ?? 0 : 0;
  const capCents = cashCents * 2 / 5;
  const explicitStakeCents = toCents(stakeAmount);
  const levelTenths = LEVEL_PATTERN.test(stakeLevel) ? Number(stakeLevel) * 10 : null;
  const levelValue = levelTenths === null ? null : Number(stakeLevel);
  const levelStake = selectedBank && levelValue !== null
    ? calculateStakeFromLevel(selectedBank.balances.cash, levelValue)
    : null;
  const levelStakeCents = selectedBank
    && levelValue !== null
    && hasValidLevelStakePrecision(selectedBank.balances.cash, levelValue)
    && levelStake !== null
    ? toCents(String(levelStake))
    : null;
  const stakeCents = stakeMode === 'amount' ? explicitStakeCents : levelStakeCents;
  const hasValidLevel = levelTenths !== null
    && Number.isInteger(levelTenths)
    && levelTenths >= 1
    && levelTenths <= 200
    && levelStakeCents !== null
    && Number.isInteger(levelStakeCents);
  const hasValidStake = stakeCents !== null
    && Number.isInteger(stakeCents)
    && stakeCents > 0
    && stakeCents <= capCents
    && (stakeMode === 'amount' || hasValidLevel);
  const fundingCents = {
    cash: toCents(funding.cash || '0'),
    bonus: toCents(funding.bonus || '0'),
    freebet: toCents(funding.freebet || '0'),
  };
  const fundingTotalCents = fundingCents.cash !== null
    && fundingCents.bonus !== null
    && fundingCents.freebet !== null
    ? fundingCents.cash + fundingCents.bonus + fundingCents.freebet
    : null;
  const fundingMatchesStake = fundingTotalCents !== null
    && fundingTotalCents > 0
    && stakeCents !== null
    && fundingTotalCents === stakeCents;
  const fundingWithinBalances = selectedBank !== null
    && fundingCents.cash !== null
    && fundingCents.bonus !== null
    && fundingCents.freebet !== null
    && fundingCents.cash <= (toCents(String(selectedBank.balances.cash)) ?? 0)
    && fundingCents.bonus <= (toCents(String(selectedBank.balances.bonus)) ?? 0)
    && fundingCents.freebet <= (toCents(String(selectedBank.balances.freebet)) ?? 0);
  const legsAreValid = legs.every((leg) => {
    const validReference = leg.referenceType === 'manual'
      ? leg.eventReference.trim().length > 0
      && leg.eventReference.trim().length <= 100
      && leg.marketReference.trim().length > 0
      && leg.marketReference.trim().length <= 100
      : UUID_PATTERN.test(leg.eventReference) && UUID_PATTERN.test(leg.marketReference);

    return validReference
      && leg.selection.trim().length > 0
      && leg.selection.trim().length <= 100
      && ODDS_PATTERN.test(leg.odds)
      && Number(leg.odds) > 1
      && Number(leg.odds) <= MAX_ODDS;
  });
  const ticketOddsAreValid = ODDS_PATTERN.test(ticketOdds)
    && Number(ticketOdds) > 1
    && Number(ticketOdds) <= MAX_ODDS;
  const canSubmit = Boolean(selectedBank)
    && legsAreValid
    && ticketOddsAreValid
    && hasValidStake
    && fundingMatchesStake
    && fundingWithinBalances
    && !isSubmitting;

  const updateLeg = (index: number, patch: Partial<LegFormValue>) => {
    setLegs(current => current.map((leg, legIndex) => legIndex === index ? { ...leg, ...patch } : leg));
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit || !selectedBank || stakeCents === null || fundingTotalCents === null) {
      setError('Revisa los datos del ticket antes de continuar.');
      return;
    }

    const payload = {
      bankId: selectedBank.id,
      ...(goalId ? { goalId } : {}),
      legs: legs.map(leg => leg.referenceType === 'manual'
        ? {
            referenceType: 'manual' as const,
            eventName: leg.eventReference.trim(),
            marketName: leg.marketReference.trim(),
            selection: leg.selection.trim(),
            odds: Number(leg.odds),
          }
        : {
            referenceType: 'normalized' as const,
            eventId: leg.eventReference,
            marketId: leg.marketReference,
            selection: leg.selection.trim(),
            odds: Number(leg.odds),
          }),
      odds: Number(ticketOdds),
      stake: stakeMode === 'amount'
        ? { type: 'amount' as const, amount: stakeCents / 100 }
        : { type: 'level' as const, level: Number(stakeLevel) },
      funding: {
        cash: (fundingCents.cash ?? 0) / 100,
        bonus: (fundingCents.bonus ?? 0) / 100,
        freebet: (fundingCents.freebet ?? 0) / 100,
      },
    };
    const fingerprint = JSON.stringify(payload);
    const idempotencyKey = pendingRequest.current?.fingerprint === fingerprint
      ? pendingRequest.current.idempotencyKey
      : crypto.randomUUID();

    pendingRequest.current = { fingerprint, idempotencyKey };
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      const responsePayload: unknown = await response.json().catch(() => null);
      const parsed = BetResponseSchema.safeParse(responsePayload);

      if (!response.ok || !parsed.success) {
        setError(getApiError(responsePayload, 'No se pudo crear el ticket. Revisa los datos e inténtalo de nuevo.'));
        return;
      }

      pendingRequest.current = null;
      const banksResponse = await fetch('/api/banks', { credentials: 'same-origin' });
      const banksPayload: unknown = await banksResponse.json().catch(() => null);
      const parsedBanks = BankListResponseSchema.safeParse(banksPayload);

      if (banksResponse.ok && parsedBanks.success) {
        setBanks(parsedBanks.data.banks);
      }
      else {
        setBanks(current => current.map(bank => bank.id === selectedBank.id
          ? {
              ...bank,
              balances: {
                ...parsed.data.balances,
                operative: parsed.data.balances.cash,
              },
            }
          : bank));
      }

      setLegs([{ ...EMPTY_LEG }]);
      setTicketOdds('');
      setStakeAmount('');
      setStakeLevel('');
      setFunding({ cash: '', bonus: '', freebet: '' });
      setGoalId('');
      setSuccess(`Ticket ${parsed.data.bet.id} creado correctamente.`);
    }
    catch {
      setError('No se pudo crear el ticket. Reinténtalo para reutilizar la misma operación segura.');
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-4" data-testid="betTicketForm">
        <Skeleton className="h-28" />
        <Skeleton className="h-96" />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <header>
        <p className="text-sm font-medium text-primary">Tickets</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Registrar ticket</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Define las selecciones, controla el stake y distribuye la financiación antes de confirmar.
        </p>
      </header>

      <form
        className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]"
        data-testid="betTicketForm"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank y cuota</CardTitle>
              <CardDescription>Los saldos se comprueban de nuevo al confirmar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bet-bank">Bank</Label>
                <select
                  id="bet-bank"
                  className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  value={bankId}
                  data-testid="bank_select"
                  disabled={banks.length === 0}
                  onChange={(event) => {
                    setBankId(event.target.value);
                    setGoalId('');
                    setSuccess(null);
                  }}
                >
                  {banks.length === 0 ? <option value="">Sin banks disponibles</option> : null}
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                      {' · '}
                      {bank.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="bet-goal">Meta (opcional)</Label>
                <select
                  id="bet-goal"
                  className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  value={goalId}
                  data-testid="goal_id_select"
                  onChange={event => setGoalId(event.target.value)}
                >
                  <option value="">Sin meta vinculada</option>
                  {availableGoals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.targetAmount.toFixed(2)}
                      {' '}
                      {goal.bank.currency}
                      {' · '}
                      {goal.deadline}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ticket-odds">Cuota total</Label>
                <Input
                  id="ticket-odds"
                  type="number"
                  inputMode="decimal"
                  min="1.0001"
                  max={MAX_ODDS}
                  step="0.0001"
                  value={ticketOdds}
                  data-testid="ticket_odds_input"
                  onChange={event => setTicketOdds(event.target.value)}
                />
              </div>
              {selectedBank
                ? (
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-xs sm:col-span-2">
                      <span>
                        Cash
                        <br />
                        <strong>{formatMoney(selectedBank.balances.cash, selectedBank.currency)}</strong>
                      </span>
                      <span>
                        Bonus
                        <br />
                        <strong>{formatMoney(selectedBank.balances.bonus, selectedBank.currency)}</strong>
                      </span>
                      <span>
                        Freebet
                        <br />
                        <strong>{formatMoney(selectedBank.balances.freebet, selectedBank.currency)}</strong>
                      </span>
                    </div>
                  )
                : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Legs</CardTitle>
                <CardDescription>Entre 1 y 20 selecciones por ticket.</CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={legs.length >= MAX_LEGS}
                data-testid="add_leg_button"
                onClick={() => setLegs(current => [...current, { ...EMPTY_LEG }])}
              >
                <Plus className="h-4 w-4" />
                Añadir leg
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {legs.map((leg, index) => (
                <fieldset
                  key={index}
                  className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2"
                  data-testid="bet_leg_item"
                >
                  <legend className="px-2 text-sm font-semibold">
                    Leg
                    {' '}
                    {index + 1}
                  </legend>
                  <div className="grid gap-2">
                    <Label>Tipo de referencia</Label>
                    <select
                      className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                      value={leg.referenceType}
                      data-testid="leg_reference_type_select"
                      onChange={event => updateLeg(index, {
                        referenceType: event.target.value as ReferenceType,
                        eventReference: '',
                        marketReference: '',
                      })}
                    >
                      <option value="manual">Manual</option>
                      <option value="normalized">Normalizada</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={legs.length === 1}
                      data-testid="remove_leg_button"
                      onClick={() => setLegs(current => current.filter((_, legIndex) => legIndex !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    <Label>{leg.referenceType === 'manual' ? 'Evento' : 'UUID del evento'}</Label>
                    <Input
                      value={leg.eventReference}
                      maxLength={100}
                      placeholder={leg.referenceType === 'manual' ? 'Equipo A vs. Equipo B' : 'UUID del evento'}
                      data-testid={leg.referenceType === 'manual' ? 'manual_event_input' : 'leg_event_select'}
                      onChange={event => updateLeg(index, { eventReference: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{leg.referenceType === 'manual' ? 'Mercado' : 'UUID del mercado'}</Label>
                    <Input
                      value={leg.marketReference}
                      maxLength={100}
                      placeholder={leg.referenceType === 'manual' ? 'Ganador del partido' : 'UUID del mercado'}
                      data-testid={leg.referenceType === 'manual' ? 'manual_market_input' : 'leg_market_select'}
                      onChange={event => updateLeg(index, { marketReference: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Selección</Label>
                    <Input
                      value={leg.selection}
                      maxLength={100}
                      placeholder="Equipo A"
                      data-testid="leg_selection_input"
                      onChange={event => updateLeg(index, { selection: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cuota</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="1.0001"
                      max={MAX_ODDS}
                      step="0.0001"
                      value={leg.odds}
                      data-testid="leg_odds_input"
                      onChange={event => updateLeg(index, { odds: event.target.value })}
                    />
                  </div>
                </fieldset>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Stake</CardTitle>
              <CardDescription>El límite es el 40% del cash previo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="stake-mode">Modo</Label>
                <select
                  id="stake-mode"
                  className="h-11 rounded-xl border border-input bg-background px-4 text-sm"
                  value={stakeMode}
                  data-testid="stake_mode_select"
                  onChange={(event) => {
                    setStakeMode(event.target.value as StakeMode);
                    setSuccess(null);
                  }}
                >
                  <option value="amount">Importe</option>
                  <option value="level">Nivel</option>
                </select>
              </div>
              {stakeMode === 'amount'
                ? (
                    <div className="grid gap-2">
                      <Label htmlFor="stake-amount">Importe</Label>
                      <Input
                        id="stake-amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={stakeAmount}
                        data-testid="stake_amount_input"
                        onChange={event => setStakeAmount(event.target.value)}
                      />
                    </div>
                  )
                : (
                    <div className="grid gap-2">
                      <Label htmlFor="stake-level">Nivel (0,1 a 20,0)</Label>
                      <Input
                        id="stake-level"
                        type="number"
                        inputMode="decimal"
                        min="0.1"
                        max="20"
                        step="0.1"
                        value={stakeLevel}
                        data-testid="stake_level_input"
                        onChange={event => setStakeLevel(event.target.value)}
                      />
                    </div>
                  )}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm" data-testid="stake_cap_warning">
                <p>
                  Cap disponible:
                  {' '}
                  <strong>
                    {selectedBank ? formatMoney(capCents / 100, selectedBank.currency) : '—'}
                  </strong>
                </p>
                {stakeMode === 'level' && levelStakeCents !== null
                  ? (
                      <p className="mt-1">
                        Stake calculado:
                        {' '}
                        <strong>
                          {Number.isInteger(levelStakeCents) && selectedBank
                            ? formatMoney(levelStakeCents / 100, selectedBank.currency)
                            : 'Precisión no válida'}
                        </strong>
                      </p>
                    )
                  : null}
                {stakeCents !== null && stakeCents > capCents ? <p className="mt-1 text-destructive">El stake supera el cap permitido.</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="fundingMixForm">
            <CardHeader>
              <CardTitle>Financiación</CardTitle>
              <CardDescription>La suma debe coincidir exactamente con el stake.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="funding-cash" className="flex justify-between gap-3">
                  <span>Cash</span>
                  <span className="font-normal text-muted-foreground">
                    {selectedBank ? formatMoney(selectedBank.balances.cash, selectedBank.currency) : '—'}
                  </span>
                </Label>
                <Input
                  id="funding-cash"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={funding.cash}
                  data-testid="cash_amount_input"
                  onChange={event => setFunding(current => ({ ...current, cash: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="funding-bonus" className="flex justify-between gap-3">
                  <span>Bonus</span>
                  <span className="font-normal text-muted-foreground">
                    {selectedBank ? formatMoney(selectedBank.balances.bonus, selectedBank.currency) : '—'}
                  </span>
                </Label>
                <Input
                  id="funding-bonus"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={funding.bonus}
                  data-testid="bonus_amount_input"
                  onChange={event => setFunding(current => ({ ...current, bonus: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="funding-freebet" className="flex justify-between gap-3">
                  <span>Freebet</span>
                  <span className="font-normal text-muted-foreground">
                    {selectedBank ? formatMoney(selectedBank.balances.freebet, selectedBank.currency) : '—'}
                  </span>
                </Label>
                <Input
                  id="funding-freebet"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={funding.freebet}
                  data-testid="freebet_amount_input"
                  onChange={event => setFunding(current => ({ ...current, freebet: event.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm" data-testid="funding_total_label">
                <span>Total financiado</span>
                <strong>
                  {fundingTotalCents !== null && selectedBank
                    ? formatMoney(fundingTotalCents / 100, selectedBank.currency)
                    : 'Importe no válido'}
                </strong>
              </div>
              {!fundingMatchesStake && fundingTotalCents !== null && fundingTotalCents > 0
                ? (
                    <p className="text-sm text-destructive" data-testid="funding_sum_error">
                      La financiación debe sumar exactamente el stake.
                    </p>
                  )
                : null}
              {!fundingWithinBalances && fundingTotalCents !== null && fundingTotalCents > 0
                ? <p className="text-sm text-destructive">Algún importe supera el saldo disponible.</p>
                : null}
            </CardContent>
          </Card>

          {error ? <p className="text-sm text-destructive" role="alert" data-testid="bet_error">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600" role="status" data-testid="bet_success">{success}</p> : null}

          <Button className="h-12 w-full" type="submit" disabled={!canSubmit} data-testid="submit_bet_button">
            {isSubmitting ? 'Creando ticket...' : 'Crear ticket'}
          </Button>
        </div>
      </form>
    </main>
  );
}
