-- Mirrors the only remote migration present before Phase 3B.
create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  constraint users_role_check check (role in ('admin', 'editor', 'user'))
);

create table public.banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  currency text not null,
  created_at timestamptz not null default now()
);

create table public.bank_pockets (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.banks (id) on delete cascade,
  pocket_type text not null,
  balance numeric not null default 0,
  constraint bank_pockets_pocket_type_check check (pocket_type in ('cash', 'bonus', 'freebet'))
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.banks (id) on delete cascade,
  pocket_type text not null,
  type text not null,
  amount numeric not null,
  method text,
  created_at timestamptz not null default now(),
  constraint transactions_pocket_type_check check (pocket_type in ('cash', 'bonus', 'freebet'))
);

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.banks (id) on delete cascade,
  stake_amount numeric not null,
  status text not null,
  odds numeric not null,
  created_at timestamptz not null default now()
);

create table public.bet_legs (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets (id) on delete cascade,
  market text not null,
  selection text not null,
  odds numeric not null
);

create table public.bet_cashouts (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets (id) on delete cascade,
  cashout_amount numeric not null,
  remaining_stake numeric not null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index banks_user_id_idx on public.banks (user_id);
create index bank_pockets_bank_id_idx on public.bank_pockets (bank_id);
create unique index bank_pockets_bank_id_pocket_type_key
  on public.bank_pockets (bank_id, pocket_type);
create index transactions_bank_id_created_at_idx on public.transactions (bank_id, created_at desc);
create index bets_bank_id_created_at_idx on public.bets (bank_id, created_at desc);
create index bet_legs_bet_id_idx on public.bet_legs (bet_id);
create index bet_cashouts_bet_id_idx on public.bet_cashouts (bet_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);

alter table public.users enable row level security;
alter table public.banks enable row level security;
alter table public.bank_pockets enable row level security;
alter table public.transactions enable row level security;
alter table public.bets enable row level security;
alter table public.bet_legs enable row level security;
alter table public.bet_cashouts enable row level security;
alter table public.audit_logs enable row level security;
