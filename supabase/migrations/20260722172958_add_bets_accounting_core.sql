alter table public.bets
  alter column stake_amount type numeric(14, 2),
  alter column odds type numeric(10, 4),
  add column stake_level text,
  add column result text,
  add column funding_status text not null default 'pending',
  add column return_amount numeric(14, 2),
  add column profit_amount numeric(14, 2),
  add column reserved_transaction_id uuid references public.transactions (id) on delete restrict,
  add column idempotency_key uuid,
  add constraint bets_stake_amount_positive check (stake_amount > 0),
  add constraint bets_odds_greater_than_one check (odds > 1),
  add constraint bets_status_check check (status in ('draft', 'open', 'settled', 'void', 'cashout', 'cashout_partial', 'won', 'lost')),
  add constraint bets_result_check check (result is null or result in ('won', 'lost', 'void', 'half_won', 'half_lost', 'cashout')),
  add constraint bets_stake_level_check check (stake_level is null or stake_level in ('low', 'medium', 'high')),
  add constraint bets_funding_status_check check (funding_status in ('pending', 'reserved', 'returned', 'released')),
  add constraint bets_return_amount_non_negative check (return_amount is null or return_amount >= 0);

alter table public.bet_legs
  alter column odds type numeric(10, 4),
  add column event_id uuid references public.catalog_events (id) on delete restrict,
  add column market_id uuid references public.catalog_markets (id) on delete restrict,
  add constraint bet_legs_market_not_blank check (btrim(market) <> ''),
  add constraint bet_legs_selection_not_blank check (btrim(selection) <> ''),
  add constraint bet_legs_odds_greater_than_one check (odds > 1);

create table public.bet_funding (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets (id) on delete cascade,
  pocket_type text not null,
  amount numeric(14, 2) not null,
  reserved_transaction_id uuid references public.transactions (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint bet_funding_pocket_type_check check (pocket_type in ('cash', 'bonus', 'freebet')),
  constraint bet_funding_amount_non_negative check (amount >= 0),
  constraint bet_funding_bet_pocket_key unique (bet_id, pocket_type)
);

create unique index bets_bank_idempotency_key_idx
  on public.bets (bank_id, idempotency_key)
  where idempotency_key is not null;
create index bet_legs_event_id_idx on public.bet_legs (event_id) where event_id is not null;
create index bet_funding_bet_id_idx on public.bet_funding (bet_id);

alter table public.bet_funding enable row level security;
grant select on table public.bet_funding to authenticated;

create policy bet_funding_owner_select on public.bet_funding
  for select to authenticated
  using (
    exists (
      select 1
      from public.bets
      join public.banks on banks.id = bets.bank_id
      where bets.id = bet_funding.bet_id
        and banks.user_id = (select auth.uid())
    )
  );
