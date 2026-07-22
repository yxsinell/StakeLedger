create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.catalog_events (id) on delete restrict,
  market_id uuid not null references public.catalog_markets (id) on delete restrict,
  selection text not null,
  odds numeric(10, 4) not null,
  type text not null,
  status text not null default 'draft',
  rationale text,
  icp jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid not null references public.users (id) on delete restrict,
  updated_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recommendations_selection_not_blank check (btrim(selection) <> ''),
  constraint recommendations_odds_greater_than_one check (odds > 1),
  constraint recommendations_type_check check (type in ('pre', 'live')),
  constraint recommendations_status_check check (status in ('draft', 'published', 'inactive')),
  constraint recommendations_publish_consistency check (
    (status = 'published' and published_at is not null)
    or (status <> 'published' and published_at is null)
  )
);

create table public.recommendation_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  bank_id uuid references public.banks (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint recommendation_follows_user_recommendation_key unique (user_id, recommendation_id)
);

create index recommendations_feed_idx
  on public.recommendations (status, type, published_at desc, id desc);
create index recommendation_follows_user_id_idx on public.recommendation_follows (user_id, created_at desc);

alter table public.recommendations enable row level security;
alter table public.recommendation_follows enable row level security;

grant select, insert, update, delete on table public.recommendations, public.recommendation_follows to authenticated;

create policy recommendations_published_or_editor_select on public.recommendations
  for select to authenticated
  using (status = 'published' or public.is_catalog_editor());

create policy recommendations_editor_insert on public.recommendations
  for insert to authenticated
  with check (
    public.is_catalog_editor()
    and created_by = (select auth.uid())
    and updated_by = (select auth.uid())
  );

create policy recommendations_editor_update on public.recommendations
  for update to authenticated
  using (public.is_catalog_editor())
  with check (
    public.is_catalog_editor()
    and updated_by = (select auth.uid())
  );

create policy recommendations_editor_delete on public.recommendations
  for delete to authenticated
  using (public.is_catalog_editor());

create policy recommendation_follows_owner_select on public.recommendation_follows
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy recommendation_follows_owner_insert on public.recommendation_follows
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.recommendations
      where recommendations.id = recommendation_follows.recommendation_id
        and recommendations.status = 'published'
    )
    and (
      bank_id is null
      or exists (
        select 1 from public.banks
        where banks.id = recommendation_follows.bank_id
          and banks.user_id = (select auth.uid())
      )
    )
  );

create policy recommendation_follows_owner_delete on public.recommendation_follows
  for delete to authenticated
  using (user_id = (select auth.uid()));
