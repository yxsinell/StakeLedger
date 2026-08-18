-- Phase 4J: normalized recommendations, safe follows, feed, and traceable metrics.

create function public.is_valid_recommendation_icp(p_icp jsonb)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_factor jsonb;
  v_score numeric;
begin
  if p_icp is null
    or pg_catalog.jsonb_typeof(p_icp) <> 'object'
    or not (p_icp ?& array['version', 'score', 'factors'])
    or p_icp - array['version', 'score', 'factors'] <> '{}'::jsonb
    or pg_catalog.jsonb_typeof(p_icp -> 'version') <> 'number'
    or pg_catalog.jsonb_typeof(p_icp -> 'score') <> 'number'
    or pg_catalog.jsonb_typeof(p_icp -> 'factors') <> 'array'
    or pg_catalog.jsonb_array_length(p_icp -> 'factors') not between 1 and 20 then
    return false;
  end if;

  if (p_icp ->> 'version')::numeric <> 1 then
    return false;
  end if;

  v_score := (p_icp ->> 'score')::numeric;
  if v_score <> pg_catalog.trunc(v_score) or v_score not between 0 and 100 then
    return false;
  end if;

  for v_factor in
    select value from pg_catalog.jsonb_array_elements(p_icp -> 'factors')
  loop
    if pg_catalog.jsonb_typeof(v_factor) <> 'string'
      or pg_catalog.char_length(pg_catalog.btrim(v_factor #>> '{}')) not between 1 and 200 then
      return false;
    end if;
  end loop;

  return true;
exception
  when invalid_text_representation or numeric_value_out_of_range then
    return false;
end;
$$;

revoke all on function public.is_valid_recommendation_icp(jsonb)
  from public, anon, authenticated;
grant execute on function public.is_valid_recommendation_icp(jsonb) to service_role;

alter table public.recommendations
  drop constraint recommendations_publish_consistency;

alter table public.recommendations
  add constraint recommendations_publish_consistency check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
    or status = 'inactive'
  ) not valid,
  add constraint recommendations_icp_v1_check check (
    status = 'inactive' or public.is_valid_recommendation_icp(icp)
  ) not valid,
  add constraint recommendations_selection_length_check check (
    status = 'inactive'
    or pg_catalog.char_length(pg_catalog.btrim(selection)) between 1 and 100
  ) not valid,
  add constraint recommendations_rationale_length_check check (
    status = 'inactive'
    or rationale is null
    or pg_catalog.char_length(pg_catalog.btrim(rationale)) between 1 and 2000
  ) not valid,
  add constraint recommendations_odds_precision_check check (
    status = 'inactive' or odds = pg_catalog.trunc(odds, 4)
  ) not valid;

comment on constraint recommendations_icp_v1_check on public.recommendations is
  'Enforces exact ICP v1 for active editorial rows while allowing invalid legacy rows to be inactivated.';
comment on constraint recommendations_publish_consistency on public.recommendations is
  'Drafts have no publication time, published rows have one, and inactive rows retain their historical value.';

alter table public.recommendation_follows
  drop constraint recommendation_follows_user_id_fkey,
  drop constraint recommendation_follows_recommendation_id_fkey,
  drop constraint recommendation_follows_bank_id_fkey,
  add constraint recommendation_follows_user_id_fkey
    foreign key (user_id) references public.users (id) on delete restrict,
  add constraint recommendation_follows_recommendation_id_fkey
    foreign key (recommendation_id) references public.recommendations (id) on delete restrict,
  add constraint recommendation_follows_bank_id_fkey
    foreign key (bank_id) references public.banks (id) on delete restrict,
  add constraint recommendation_follows_bank_required_check
    check (bank_id is not null) not valid;

comment on constraint recommendation_follows_bank_required_check on public.recommendation_follows is
  'Requires a bank for new follows while preserving historical rows that predate Phase 4J.';

create function public.assert_normalized_recommendation_reference(
  p_event_id uuid,
  p_market_id uuid
)
returns void
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_event_status text;
  v_competition_status text;
  v_sport text;
  v_home_team_status text;
  v_away_team_status text;
  v_market_event_id uuid;
  v_market_status text;
begin
  select
    event.status,
    competition.normalization_status,
    competition.sport,
    home_team.normalization_status,
    away_team.normalization_status
  into
    v_event_status,
    v_competition_status,
    v_sport,
    v_home_team_status,
    v_away_team_status
  from public.catalog_events as event
  join public.catalog_competitions as competition on competition.id = event.competition_id
  join public.catalog_teams as home_team on home_team.id = event.home_team_id
  join public.catalog_teams as away_team on away_team.id = event.away_team_id
  where event.id = p_event_id;

  if not found then
    raise exception 'EVENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_event_status not in ('scheduled', 'live')
    or v_competition_status <> 'normalized'
    or v_sport is null
    or pg_catalog.btrim(v_sport) = ''
    or v_home_team_status <> 'normalized'
    or v_away_team_status <> 'normalized' then
    raise exception 'EVENT_NOT_NORMALIZED' using errcode = 'P0001';
  end if;

  select market.event_id, market.status
  into v_market_event_id, v_market_status
  from public.catalog_markets as market
  where market.id = p_market_id;

  if not found then
    raise exception 'MARKET_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_market_event_id is distinct from p_event_id then
    raise exception 'MARKET_EVENT_MISMATCH' using errcode = 'P0001';
  end if;
  if v_market_status <> 'active' then
    raise exception 'MARKET_NOT_ACTIVE' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.assert_normalized_recommendation_reference(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.assert_normalized_recommendation_reference(uuid, uuid)
  to service_role;

-- Enforce lifecycle and catalog integrity even on privileged direct writes.
create function public.enforce_recommendation_integrity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'RECOMMENDATION_DELETE_FORBIDDEN' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'draft' or new.published_at is not null then
      raise exception 'RECOMMENDATION_MUST_START_DRAFT' using errcode = 'P0001';
    end if;
    if new.created_by is distinct from new.updated_by
      or not exists (
        select 1 from public.users
        where id = new.created_by and role in ('editor', 'admin')
      ) then
      raise exception 'RECOMMENDATION_EDITOR_REQUIRED' using errcode = '42501';
    end if;
  else
    if new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
      or not exists (
        select 1 from public.users
        where id = new.updated_by and role in ('editor', 'admin')
      ) then
      raise exception 'RECOMMENDATION_EDITOR_REQUIRED' using errcode = '42501';
    end if;
    if old.status = 'inactive' then
      raise exception 'RECOMMENDATION_INACTIVE_TERMINAL' using errcode = 'P0001';
    end if;
    if old.status = 'draft' and new.status not in ('draft', 'published', 'inactive') then
      raise exception 'RECOMMENDATION_STATUS_TRANSITION_INVALID' using errcode = 'P0001';
    end if;
    if old.status = 'published' and new.status not in ('published', 'inactive') then
      raise exception 'RECOMMENDATION_STATUS_TRANSITION_INVALID' using errcode = 'P0001';
    end if;
    if old.status = 'published' and new.published_at is distinct from old.published_at then
      raise exception 'RECOMMENDATION_PUBLISHED_AT_IMMUTABLE' using errcode = 'P0001';
    end if;
    if old.status = 'draft' and new.status = 'published' and new.published_at is null then
      raise exception 'RECOMMENDATION_PUBLISHED_AT_INVALID' using errcode = 'P0001';
    end if;
    if old.status = 'draft' and new.status = 'draft' and new.published_at is not null then
      raise exception 'RECOMMENDATION_PUBLISHED_AT_INVALID' using errcode = 'P0001';
    end if;

    -- Closing legacy rows must stay possible without rewriting their historical payload.
    if new.status = 'inactive' then
      if new.event_id is distinct from old.event_id
        or new.market_id is distinct from old.market_id
        or new.selection is distinct from old.selection
        or new.odds is distinct from old.odds
        or new.type is distinct from old.type
        or new.rationale is distinct from old.rationale
        or new.icp is distinct from old.icp
        or new.published_at is distinct from old.published_at then
        raise exception 'RECOMMENDATION_STATUS_TRANSITION_INVALID' using errcode = 'P0001';
      end if;
      return new;
    end if;
  end if;

  if new.selection is null
    or pg_catalog.char_length(pg_catalog.btrim(new.selection)) not between 1 and 100
    or new.odds is null
    or new.odds <= 1
    or new.odds > 999999.9999
    or new.odds <> pg_catalog.trunc(new.odds, 4)
    or new.type not in ('pre', 'live')
    or new.rationale is null
    or pg_catalog.char_length(pg_catalog.btrim(new.rationale)) not between 1 and 2000
    or not public.is_valid_recommendation_icp(new.icp) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  perform public.assert_normalized_recommendation_reference(new.event_id, new.market_id);
  return new;
end;
$$;

revoke all on function public.enforce_recommendation_integrity()
  from public, anon, authenticated, service_role;

create trigger recommendations_enforce_integrity
before insert or update or delete on public.recommendations
for each row execute function public.enforce_recommendation_integrity();

create function public.enforce_recommendation_follow_integrity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_market_id uuid;
begin
  if tg_op <> 'INSERT' then
    raise exception 'RECOMMENDATION_FOLLOW_IMMUTABLE' using errcode = '42501';
  end if;

  if new.bank_id is null then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0002';
  end if;

  perform 1 from public.banks
  where id = new.bank_id and user_id = new.user_id
  for key share;
  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0002';
  end if;

  select event_id, market_id into v_event_id, v_market_id
  from public.recommendations
  where id = new.recommendation_id and status = 'published'
  for share;
  if not found then
    raise exception 'RECOMMENDATION_NOT_PUBLISHED' using errcode = 'P0001';
  end if;

  perform public.assert_normalized_recommendation_reference(v_event_id, v_market_id);
  return new;
end;
$$;

revoke all on function public.enforce_recommendation_follow_integrity()
  from public, anon, authenticated, service_role;

create trigger recommendation_follows_enforce_integrity
before insert or update or delete on public.recommendation_follows
for each row execute function public.enforce_recommendation_follow_integrity();

drop policy if exists recommendations_published_or_editor_select on public.recommendations;
drop policy if exists recommendations_editor_insert on public.recommendations;
drop policy if exists recommendations_editor_update on public.recommendations;
drop policy if exists recommendations_editor_delete on public.recommendations;
drop policy if exists recommendation_follows_owner_insert on public.recommendation_follows;
drop policy if exists recommendation_follows_owner_delete on public.recommendation_follows;

create policy recommendations_published_or_editor_select on public.recommendations
  for select to authenticated
  using (
    public.is_catalog_editor()
    or (
      status = 'published'
      and published_at is not null
      and exists (
        select 1
        from public.catalog_events as event
        join public.catalog_competitions as competition on competition.id = event.competition_id
        join public.catalog_teams as home_team on home_team.id = event.home_team_id
        join public.catalog_teams as away_team on away_team.id = event.away_team_id
        join public.catalog_markets as market
          on market.event_id = event.id and market.id = recommendations.market_id
        where event.id = recommendations.event_id
          and competition.normalization_status = 'normalized'
          and competition.sport is not null
          and pg_catalog.btrim(competition.sport) <> ''
          and home_team.normalization_status = 'normalized'
          and away_team.normalization_status = 'normalized'
      )
    )
  );

revoke insert, update, delete, truncate, references, trigger
  on table public.recommendations, public.recommendation_follows
  from authenticated;
revoke delete, truncate, references, trigger on table public.recommendations
  from service_role;
revoke update, delete, truncate, references, trigger on table public.recommendation_follows
  from service_role;
grant select on table public.recommendations, public.recommendation_follows to authenticated;
grant select, insert, update on table public.recommendations to service_role;
grant select, insert on table public.recommendation_follows to service_role;

create function public.create_recommendation(
  p_actor_user_id uuid,
  p_event_id uuid,
  p_market_id uuid,
  p_selection text,
  p_odds numeric,
  p_type text,
  p_rationale text,
  p_icp jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_recommendation_id uuid := gen_random_uuid();
  v_selection text := pg_catalog.btrim(p_selection);
  v_rationale text := pg_catalog.btrim(p_rationale);
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;
  if not exists (
    select 1 from public.users
    where id = p_actor_user_id and role in ('editor', 'admin')
  ) then
    raise exception 'RECOMMENDATION_EDITOR_REQUIRED' using errcode = '42501';
  end if;

  if p_event_id is null
    or p_market_id is null
    or v_selection is null
    or pg_catalog.char_length(v_selection) not between 1 and 100
    or p_odds is null
    or p_odds <= 1
    or p_odds > 999999.9999
    or p_odds <> pg_catalog.trunc(p_odds, 4)
    or p_type not in ('pre', 'live')
    or v_rationale is null
    or pg_catalog.char_length(v_rationale) not between 1 and 2000
    or not public.is_valid_recommendation_icp(p_icp) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  insert into public.recommendations (
    id, event_id, market_id, selection, odds, type, status, rationale, icp,
    created_by, updated_by
  ) values (
    v_recommendation_id, p_event_id, p_market_id, v_selection, p_odds, p_type,
    'draft', v_rationale, p_icp, p_actor_user_id, p_actor_user_id
  );

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('recommendation', v_recommendation_id, 'created', p_actor_user_id);

  return pg_catalog.jsonb_build_object(
    'recommendationId', v_recommendation_id,
    'status', 'draft'
  );
end;
$$;

create function public.update_recommendation(
  p_actor_user_id uuid,
  p_recommendation_id uuid,
  p_event_id uuid,
  p_market_id uuid,
  p_selection text,
  p_odds numeric,
  p_type text,
  p_rationale text,
  p_icp jsonb,
  p_status text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_recommendation public.recommendations%rowtype;
  v_event_id uuid;
  v_market_id uuid;
  v_selection text;
  v_odds numeric;
  v_type text;
  v_rationale text;
  v_icp jsonb;
  v_status text;
  v_action text := 'updated';
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;
  if not exists (
    select 1 from public.users
    where id = p_actor_user_id and role in ('editor', 'admin')
  ) then
    raise exception 'RECOMMENDATION_EDITOR_REQUIRED' using errcode = '42501';
  end if;

  select * into v_recommendation
  from public.recommendations
  where id = p_recommendation_id
  for update;

  if not found then
    raise exception 'RECOMMENDATION_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_recommendation.status = 'inactive' then
    raise exception 'RECOMMENDATION_INACTIVE_TERMINAL' using errcode = 'P0001';
  end if;

  v_status := coalesce(p_status, v_recommendation.status);
  if v_status = 'inactive' then
    update public.recommendations
    set status = 'inactive', updated_by = p_actor_user_id, updated_at = now()
    where id = p_recommendation_id;

    insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('recommendation', p_recommendation_id, 'updated', p_actor_user_id);

    return pg_catalog.jsonb_build_object(
      'recommendationId', p_recommendation_id,
      'status', 'inactive'
    );
  end if;

  v_event_id := coalesce(p_event_id, v_recommendation.event_id);
  v_market_id := coalesce(p_market_id, v_recommendation.market_id);
  v_selection := coalesce(pg_catalog.btrim(p_selection), v_recommendation.selection);
  v_odds := coalesce(p_odds, v_recommendation.odds);
  v_type := coalesce(p_type, v_recommendation.type);
  v_rationale := coalesce(pg_catalog.btrim(p_rationale), v_recommendation.rationale);
  v_icp := coalesce(p_icp, v_recommendation.icp);

  if v_event_id is null
    or v_market_id is null
    or v_selection is null
    or pg_catalog.char_length(v_selection) not between 1 and 100
    or v_odds is null
    or v_odds <= 1
    or v_odds > 999999.9999
    or v_odds <> pg_catalog.trunc(v_odds, 4)
    or v_type not in ('pre', 'live')
    or v_rationale is null
    or pg_catalog.char_length(v_rationale) not between 1 and 2000
    or v_status not in ('draft', 'published')
    or not public.is_valid_recommendation_icp(v_icp) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if v_recommendation.status = 'published' and v_status <> 'published' then
    raise exception 'RECOMMENDATION_STATUS_TRANSITION_INVALID' using errcode = 'P0001';
  end if;
  if v_recommendation.status = 'draft' and v_status = 'published' then
    v_action := 'published';
  end if;

  update public.recommendations
  set event_id = v_event_id,
      market_id = v_market_id,
      selection = v_selection,
      odds = v_odds,
      type = v_type,
      status = v_status,
      rationale = v_rationale,
      icp = v_icp,
      published_at = case
        when v_recommendation.status = 'draft' and v_status = 'published' then now()
        else v_recommendation.published_at
      end,
      updated_by = p_actor_user_id,
      updated_at = now()
  where id = p_recommendation_id;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('recommendation', p_recommendation_id, v_action, p_actor_user_id);

  return pg_catalog.jsonb_build_object(
    'recommendationId', p_recommendation_id,
    'status', v_status
  );
end;
$$;

create function public.follow_recommendation(
  p_actor_user_id uuid,
  p_recommendation_id uuid,
  p_bank_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_recommendation public.recommendations%rowtype;
  v_follow public.recommendation_follows%rowtype;
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;
  if not exists (select 1 from public.users where id = p_actor_user_id) then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;

  perform 1 from public.banks
  where id = p_bank_id and user_id = p_actor_user_id
  for key share;
  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0002';
  end if;

  select * into v_recommendation
  from public.recommendations
  where id = p_recommendation_id
  for share;
  if not found then
    raise exception 'RECOMMENDATION_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_recommendation.status <> 'published' then
    raise exception 'RECOMMENDATION_NOT_PUBLISHED' using errcode = 'P0001';
  end if;

  perform public.assert_normalized_recommendation_reference(
    v_recommendation.event_id,
    v_recommendation.market_id
  );

  insert into public.recommendation_follows (user_id, recommendation_id, bank_id)
  values (p_actor_user_id, p_recommendation_id, p_bank_id)
  on conflict (user_id, recommendation_id) do nothing
  returning * into v_follow;

  if not found then
    select * into v_follow
    from public.recommendation_follows
    where user_id = p_actor_user_id
      and recommendation_id = p_recommendation_id
    for update;

    if v_follow.bank_id is distinct from p_bank_id then
      -- Current BFF maps this known conflict code to HTTP 409.
      raise exception 'RECOMMENDATION_PREFILL_INVALID' using errcode = 'P0001';
    end if;
  else
    insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('recommendation', p_recommendation_id, 'followed', p_actor_user_id);
  end if;

  -- Following only persists intent. Bet creation remains an explicit separate action.
  return pg_catalog.jsonb_build_object('followId', v_follow.id);
end;
$$;

revoke all on function public.create_recommendation(uuid, uuid, uuid, text, numeric, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.update_recommendation(uuid, uuid, uuid, uuid, text, numeric, text, text, jsonb, text)
  from public, anon, authenticated;
revoke all on function public.follow_recommendation(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.create_recommendation(uuid, uuid, uuid, text, numeric, text, text, jsonb)
  to service_role;
grant execute on function public.update_recommendation(uuid, uuid, uuid, uuid, text, numeric, text, text, jsonb, text)
  to service_role;
grant execute on function public.follow_recommendation(uuid, uuid, uuid)
  to service_role;

create view public.recommendation_feed
with (security_invoker = true)
as
select
  recommendation.id,
  recommendation.type,
  recommendation.status,
  recommendation.selection,
  recommendation.odds,
  recommendation.rationale,
  recommendation.icp,
  recommendation.published_at,
  event.id as event_id,
  event.starts_at,
  event.status as event_status,
  market.id as market_id,
  market.name as market_name,
  competition.id as competition_id,
  competition.name as competition_name,
  competition.sport,
  home_team.id as home_team_id,
  home_team.name as home_team_name,
  away_team.id as away_team_id,
  away_team.name as away_team_name
from public.recommendations as recommendation
join public.catalog_events as event on event.id = recommendation.event_id
join public.catalog_markets as market
  on market.id = recommendation.market_id and market.event_id = event.id
join public.catalog_competitions as competition on competition.id = event.competition_id
join public.catalog_teams as home_team on home_team.id = event.home_team_id
join public.catalog_teams as away_team on away_team.id = event.away_team_id
where recommendation.status = 'published'
  and recommendation.published_at is not null
  and competition.normalization_status = 'normalized'
  and competition.sport is not null
  and pg_catalog.btrim(competition.sport) <> ''
  and home_team.normalization_status = 'normalized'
  and away_team.normalization_status = 'normalized';

revoke all on table public.recommendation_feed from public, anon;
grant select on table public.recommendation_feed to authenticated, service_role;

comment on view public.recommendation_feed is
  'Published-only normalized feed ordered by clients with published_at DESC, id DESC; ICP never affects ordering.';

-- One trace row per modern settled bet with complete reservation lineage.
create view public.settled_bet_metric_trace
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
    when 'void' then 0::numeric
    when 'half_won' then funding.cash_stake * (bet.odds - 1) / 2
    when 'half_lost' then -funding.cash_stake / 2
  end as cash_component_profit,
  bet.profit_amount as total_profit
from public.bets as bet
join public.banks as bank on bank.id = bet.bank_id
join lateral (
  select
    coalesce(pg_catalog.sum(bet_funding.amount) filter (
      where bet_funding.pocket_type = 'cash'
    ), 0::numeric) as cash_stake,
    pg_catalog.sum(bet_funding.amount) as funded_stake,
    pg_catalog.count(*) as funding_count,
    pg_catalog.count(bet_funding.reserved_transaction_id) as reserved_funding_count
  from public.bet_funding
  where bet_funding.bet_id = bet.id
) as funding on true
where bet.status = 'settled'
  and bet.funding_status = 'returned'
  and bet.idempotency_key is not null
  and bet.settled_at is not null
  and bet.profit_amount is not null
  and bet.result in ('won', 'lost', 'void', 'half_won', 'half_lost')
  and funding.funding_count > 0
  and funding.reserved_funding_count = funding.funding_count
  and funding.funded_stake = bet.stake_amount;

revoke all on table public.settled_bet_metric_trace from public, anon, authenticated;
grant select on table public.settled_bet_metric_trace to service_role;

comment on view public.settled_bet_metric_trace is
  'Traceable metrics source: one modern settled bet with exact cash and total profit components.';

create function public.get_metrics_overview(
  p_actor_user_id uuid,
  p_bank_id uuid,
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_currency text;
  v_settled_count bigint;
  v_decisive_count bigint;
  v_total_stake numeric;
  v_cash_stake numeric;
  v_total_profit numeric;
  v_cash_profit numeric;
  v_win_weight numeric;
  v_yield_cash numeric;
  v_yield_operative numeric;
  v_win_rate numeric;
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;
  if p_bank_id is null or p_from is null or p_to is null then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  if p_to < p_from then
    raise exception 'METRICS_RANGE_INVALID' using errcode = '22023';
  end if;
  if (p_to - p_from) > 365 then
    raise exception 'METRICS_RANGE_MAX' using errcode = '22023';
  end if;

  select currency into v_currency
  from public.banks
  where id = p_bank_id and user_id = p_actor_user_id;

  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0002';
  end if;

  select
    pg_catalog.count(*),
    pg_catalog.count(*) filter (where trace.result <> 'void'),
    coalesce(pg_catalog.sum(trace.total_stake), 0::numeric),
    coalesce(pg_catalog.sum(trace.cash_stake), 0::numeric),
    coalesce(pg_catalog.sum(trace.total_profit), 0::numeric),
    coalesce(pg_catalog.sum(trace.cash_component_profit), 0::numeric),
    coalesce(pg_catalog.sum(case trace.result
      when 'won' then 1::numeric
      when 'half_won' then 0.5::numeric
      else 0::numeric
    end) filter (where trace.result <> 'void'), 0::numeric)
  into
    v_settled_count,
    v_decisive_count,
    v_total_stake,
    v_cash_stake,
    v_total_profit,
    v_cash_profit,
    v_win_weight
  from public.settled_bet_metric_trace as trace
  where trace.bank_owner_user_id = p_actor_user_id
    and trace.bank_id = p_bank_id
    and trace.settled_at >= (p_from::timestamp at time zone 'UTC')
    and trace.settled_at < ((p_to + 1)::timestamp at time zone 'UTC');

  -- Contracts use ratios, not percentages. Preserve numeric precision without rounding.
  v_yield_cash := case
    when v_cash_stake = 0 then 0::numeric
    else v_cash_profit / v_cash_stake
  end;
  v_yield_operative := case
    when v_total_stake = 0 then 0::numeric
    else v_total_profit / v_total_stake
  end;
  v_win_rate := case
    when v_decisive_count = 0 then 0::numeric
    else v_win_weight / v_decisive_count
  end;

  return pg_catalog.jsonb_build_object(
    'bankId', p_bank_id,
    'currency', v_currency,
    'from', p_from,
    'to', p_to,
    'yieldCash', v_yield_cash,
    'yieldOperative', v_yield_operative,
    'winRate', v_win_rate,
    'settledCount', v_settled_count,
    'decisiveCount', v_decisive_count,
    'totalStake', v_total_stake,
    'cashStake', v_cash_stake,
    'totalProfit', v_total_profit
  );
end;
$$;

revoke all on function public.get_metrics_overview(uuid, uuid, date, date)
  from public, anon, authenticated;
grant execute on function public.get_metrics_overview(uuid, uuid, date, date)
  to service_role;

create index recommendations_published_order_idx
  on public.recommendations (published_at desc, id desc)
  where status = 'published';
create index recommendations_published_type_order_idx
  on public.recommendations (type, published_at desc, id desc)
  where status = 'published';
create index recommendations_published_event_order_idx
  on public.recommendations (event_id, published_at desc, id desc)
  where status = 'published';
create index recommendation_follows_recommendation_created_at_idx
  on public.recommendation_follows (recommendation_id, created_at desc, id desc);
create index catalog_events_competition_starts_at_idx
  on public.catalog_events (competition_id, starts_at desc, id desc);
create index bets_metrics_settled_idx
  on public.bets (bank_id, settled_at desc, id desc)
  where status = 'settled' and funding_status = 'returned';

comment on function public.create_recommendation(uuid, uuid, uuid, text, numeric, text, text, jsonb) is
  'Creates a normalized ICP v1 recommendation in draft state for an editor or admin actor.';
comment on function public.update_recommendation(uuid, uuid, uuid, uuid, text, numeric, text, text, jsonb, text) is
  'Updates recommendation content and enforces draft or published to terminal inactive lifecycle.';
comment on function public.follow_recommendation(uuid, uuid, uuid) is
  'Idempotently follows a published recommendation without creating a bet or financial movement.';
comment on function public.get_metrics_overview(uuid, uuid, date, date) is
  'Returns owner-scoped settled bet ratios for an inclusive UTC range of at most 366 days.';
