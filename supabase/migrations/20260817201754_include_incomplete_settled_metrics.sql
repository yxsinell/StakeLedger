-- Settled rows remain part of operational aggregates even when legacy data lacks result details.

create or replace view public.settled_bet_metric_trace
with (security_invoker = true)
as
select
  bet.id as bet_id,
  bet.bank_id,
  bank.user_id as bank_owner_user_id,
  bank.currency,
  bet.settled_at,
  bet.result,
  bet.odds,
  bet.stake_amount as total_stake,
  funding.cash_stake,
  case bet.result
    when 'won' then funding.cash_stake * (bet.odds - 1)
    when 'lost' then -funding.cash_stake
    when 'half_won' then funding.cash_stake * (bet.odds - 1) / 2
    when 'half_lost' then -funding.cash_stake / 2
    else 0::numeric
  end as cash_component_profit,
  coalesce(bet.profit_amount, 0::numeric(14, 2))::numeric(14, 2) as total_profit
from public.bets as bet
join public.banks as bank on bank.id = bet.bank_id
join lateral (
  select coalesce(pg_catalog.sum(bet_funding.amount) filter (
    where bet_funding.pocket_type = 'cash'
  ), 0::numeric) as cash_stake
  from public.bet_funding
  where bet_funding.bet_id = bet.id
) as funding on true
where bet.status = 'settled'
  and bet.settled_at is not null;

revoke all on table public.settled_bet_metric_trace from public, anon, authenticated;
grant select on table public.settled_bet_metric_trace to service_role;

comment on view public.settled_bet_metric_trace is
  'Metrics source: every settled bet contributes operational results; missing legacy result details are non-decisive and use zero profit.';
