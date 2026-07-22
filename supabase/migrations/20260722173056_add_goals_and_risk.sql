create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  bank_id uuid not null references public.banks (id) on delete restrict,
  base_amount numeric(14, 2) not null,
  target_amount numeric(14, 2) not null,
  deadline date not null,
  stake_preference numeric(5, 2),
  strategy text,
  daily_profit numeric(14, 2) not null default 0,
  suggested_odds numeric(10, 4),
  status text not null default 'active',
  closed_at timestamptz,
  closure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_amounts_non_negative check (base_amount >= 0 and target_amount > base_amount),
  constraint goals_stake_preference_range check (stake_preference is null or stake_preference > 0 and stake_preference <= 100),
  constraint goals_strategy_check check (strategy is null or strategy in ('conservative', 'balanced', 'aggressive')),
  constraint goals_daily_profit_non_negative check (daily_profit >= 0),
  constraint goals_suggested_odds_greater_than_one check (suggested_odds is null or suggested_odds > 1),
  constraint goals_status_check check (status in ('active', 'completed', 'cancelled')),
  constraint goals_closure_consistency check (
    (status = 'active' and closed_at is null and closure_reason is null)
    or (status <> 'active' and closed_at is not null)
  )
);

create table public.goal_history (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  bet_id uuid references public.bets (id) on delete set null,
  mission_date date,
  event_type text not null,
  base_amount numeric(14, 2),
  current_amount numeric(14, 2),
  remaining_amount numeric(14, 2),
  daily_profit numeric(14, 2),
  suggested_odds numeric(10, 4),
  created_at timestamptz not null default now(),
  constraint goal_history_event_type_check check (event_type in ('created', 'daily_snapshot', 'recalculated', 'closed')),
  constraint goal_history_amounts_non_negative check (
    (base_amount is null or base_amount >= 0)
    and (current_amount is null or current_amount >= 0)
    and (remaining_amount is null or remaining_amount >= 0)
    and (daily_profit is null or daily_profit >= 0)
  )
);

create table public.risk_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  max_odds numeric(10, 4),
  max_stake_percentage numeric(5, 2),
  max_daily_loss numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint risk_limits_user_key unique (user_id),
  constraint risk_limits_max_odds_greater_than_one check (max_odds is null or max_odds > 1),
  constraint risk_limits_stake_percentage_range check (
    max_stake_percentage is null or max_stake_percentage > 0 and max_stake_percentage <= 100
  ),
  constraint risk_limits_max_daily_loss_positive check (max_daily_loss is null or max_daily_loss > 0)
);

alter table public.bets
  add column goal_id uuid references public.goals (id) on delete set null;

create index goals_user_status_idx on public.goals (user_id, status);
create index goals_bank_status_idx on public.goals (bank_id, status);
create unique index goal_history_goal_mission_date_idx
  on public.goal_history (goal_id, mission_date)
  where mission_date is not null;
create unique index goal_history_goal_bet_recalculated_idx
  on public.goal_history (goal_id, bet_id)
  where bet_id is not null and event_type = 'recalculated';
create index bets_goal_id_idx on public.bets (goal_id) where goal_id is not null;

alter table public.goals enable row level security;
alter table public.goal_history enable row level security;
alter table public.risk_limits enable row level security;

grant select, insert, update, delete on table public.goals, public.risk_limits to authenticated;
grant select on table public.goal_history to authenticated;

create policy goals_owner_access on public.goals
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.banks
      where banks.id = goals.bank_id
        and banks.user_id = (select auth.uid())
    )
  );

create policy goal_history_owner_select on public.goal_history
  for select to authenticated
  using (
    exists (
      select 1 from public.goals
      where goals.id = goal_history.goal_id
        and goals.user_id = (select auth.uid())
    )
  );

create policy audit_logs_goal_owner_select on public.audit_logs
  for select to authenticated
  using (
    entity_type = 'goal'
    and exists (
      select 1 from public.goals
      where goals.id = audit_logs.entity_id
        and goals.user_id = (select auth.uid())
    )
  );

create policy risk_limits_owner_access on public.risk_limits
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
