create table public.catalog_teams (
  id uuid primary key default gen_random_uuid(),
  provider text,
  external_id text,
  name text not null,
  normalized_name text generated always as (lower(btrim(name))) stored,
  country text,
  normalization_status text not null default 'normalized',
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_teams_name_not_blank check (btrim(name) <> ''),
  constraint catalog_teams_provider_id_pair check (
    (provider is null and external_id is null)
    or (provider is not null and external_id is not null)
  ),
  constraint catalog_teams_status_check check (normalization_status in ('normalized', 'manual', 'pending', 'deprecated'))
);

create table public.catalog_competitions (
  id uuid primary key default gen_random_uuid(),
  provider text,
  external_id text,
  name text not null,
  normalized_name text generated always as (lower(btrim(name))) stored,
  sport text not null,
  country text,
  normalization_status text not null default 'normalized',
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_competitions_name_not_blank check (btrim(name) <> ''),
  constraint catalog_competitions_sport_not_blank check (btrim(sport) <> ''),
  constraint catalog_competitions_provider_id_pair check (
    (provider is null and external_id is null)
    or (provider is not null and external_id is not null)
  ),
  constraint catalog_competitions_status_check check (normalization_status in ('normalized', 'manual', 'pending', 'deprecated'))
);

create table public.catalog_aliases (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.catalog_teams (id) on delete cascade,
  competition_id uuid references public.catalog_competitions (id) on delete cascade,
  alias text not null,
  normalized_alias text generated always as (lower(btrim(alias))) stored,
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint catalog_aliases_target_check check (num_nonnulls(team_id, competition_id) = 1),
  constraint catalog_aliases_alias_not_blank check (btrim(alias) <> '')
);

create table public.catalog_events (
  id uuid primary key default gen_random_uuid(),
  provider text,
  external_id text,
  competition_id uuid not null references public.catalog_competitions (id) on delete restrict,
  home_team_id uuid not null references public.catalog_teams (id) on delete restrict,
  away_team_id uuid not null references public.catalog_teams (id) on delete restrict,
  starts_at timestamptz not null,
  status text not null default 'scheduled',
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_events_provider_id_pair check (
    (provider is null and external_id is null)
    or (provider is not null and external_id is not null)
  ),
  constraint catalog_events_teams_differ check (home_team_id <> away_team_id),
  constraint catalog_events_status_check check (status in ('scheduled', 'live', 'finished', 'cancelled'))
);

create table public.catalog_markets (
  id uuid primary key default gen_random_uuid(),
  provider text,
  external_id text,
  event_id uuid not null references public.catalog_events (id) on delete cascade,
  name text not null,
  normalized_name text generated always as (lower(btrim(name))) stored,
  status text not null default 'active',
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_markets_name_not_blank check (btrim(name) <> ''),
  constraint catalog_markets_provider_id_pair check (
    (provider is null and external_id is null)
    or (provider is not null and external_id is not null)
  ),
  constraint catalog_markets_status_check check (status in ('active', 'settled', 'void'))
);

create unique index catalog_teams_provider_external_id_idx
  on public.catalog_teams (provider, external_id)
  where provider is not null;
create unique index catalog_competitions_provider_external_id_idx
  on public.catalog_competitions (provider, external_id)
  where provider is not null;
create unique index catalog_events_provider_external_id_idx
  on public.catalog_events (provider, external_id)
  where provider is not null;
create unique index catalog_markets_provider_external_id_idx
  on public.catalog_markets (provider, external_id)
  where provider is not null;
create unique index catalog_aliases_team_normalized_alias_idx
  on public.catalog_aliases (team_id, normalized_alias)
  where team_id is not null;
create unique index catalog_aliases_competition_normalized_alias_idx
  on public.catalog_aliases (competition_id, normalized_alias)
  where competition_id is not null;
create index catalog_teams_normalized_name_idx on public.catalog_teams (normalized_name);
create index catalog_competitions_normalized_name_idx on public.catalog_competitions (normalized_name);
create index catalog_events_starts_at_idx on public.catalog_events (starts_at, status);
create index catalog_markets_event_normalized_name_idx on public.catalog_markets (event_id, normalized_name);

alter table public.catalog_teams enable row level security;
alter table public.catalog_competitions enable row level security;
alter table public.catalog_aliases enable row level security;
alter table public.catalog_events enable row level security;
alter table public.catalog_markets enable row level security;

grant select, insert, update, delete on table public.catalog_teams, public.catalog_competitions,
  public.catalog_aliases, public.catalog_events, public.catalog_markets to authenticated;

create policy catalog_teams_authenticated_read on public.catalog_teams
  for select to authenticated using (true);
create policy catalog_teams_editor_write on public.catalog_teams
  for all to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_competitions_authenticated_read on public.catalog_competitions
  for select to authenticated using (true);
create policy catalog_competitions_editor_write on public.catalog_competitions
  for all to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_aliases_authenticated_read on public.catalog_aliases
  for select to authenticated using (true);
create policy catalog_aliases_editor_write on public.catalog_aliases
  for all to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_events_authenticated_read on public.catalog_events
  for select to authenticated using (true);
create policy catalog_events_editor_write on public.catalog_events
  for all to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_markets_authenticated_read on public.catalog_markets
  for select to authenticated using (true);
create policy catalog_markets_editor_write on public.catalog_markets
  for all to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
