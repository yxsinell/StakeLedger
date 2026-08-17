alter table public.goals drop constraint goals_suggested_odds_greater_than_one;
alter table public.goals add constraint goals_suggested_odds_at_least_one
  check (suggested_odds is null or suggested_odds >= 1) not valid;
alter table public.goals add constraint goals_required_configuration
  check (stake_preference is not null and strategy is not null) not valid;
alter table public.goals add constraint goals_money_precision
  check (
    base_amount = trunc(base_amount, 2)
    and target_amount = trunc(target_amount, 2)
    and (stake_preference is null or stake_preference = trunc(stake_preference, 2))
    and daily_profit = trunc(daily_profit, 2)
    and (suggested_odds is null or suggested_odds = trunc(suggested_odds, 4))
  ) not valid;

alter table public.risk_limits alter column max_stake_percentage set default 40;
alter table public.risk_limits add constraint risk_limits_fixed_stake_cap
  check (max_stake_percentage is null or max_stake_percentage = 40) not valid;
alter table public.risk_limits add constraint risk_limits_precision
  check (
    (max_odds is null or max_odds = trunc(max_odds, 4))
    and (max_daily_loss is null or max_daily_loss = trunc(max_daily_loss, 2))
  ) not valid;

create unique index goals_one_active_per_bank_idx
  on public.goals (bank_id) where status = 'active';
create index goal_history_bet_id_idx
  on public.goal_history (bet_id) where bet_id is not null;

revoke insert, update, delete, truncate, references, trigger
  on table public.goals, public.risk_limits from authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.goal_history from authenticated;
grant select on table public.goals, public.goal_history, public.risk_limits to authenticated;
grant select, insert, update on table public.goals, public.goal_history, public.risk_limits to service_role;

create function public.compute_goal_mission(
  p_target_amount numeric,
  p_current_cash numeric,
  p_deadline date,
  p_stake_preference numeric
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_remaining numeric;
  v_days integer;
  v_daily_profit numeric;
  v_suggested_odds numeric;
begin
  if p_target_amount is null or p_current_cash is null or p_deadline is null
    or p_stake_preference is null or p_stake_preference <= 0
    or p_target_amount <> trunc(p_target_amount, 2)
    or p_current_cash <> trunc(p_current_cash, 2)
    or p_stake_preference <> trunc(p_stake_preference, 2) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_remaining := greatest(p_target_amount - p_current_cash, 0);
  v_days := greatest(p_deadline - current_date, 1);
  v_daily_profit := v_remaining / v_days;
  if v_daily_profit <> trunc(v_daily_profit, 2) then
    raise exception 'GOAL_DAILY_PROFIT_PRECISION' using errcode = 'P0001';
  end if;

  if v_daily_profit = 0 then
    v_suggested_odds := 1;
  else
    v_suggested_odds := 1 + v_daily_profit / p_stake_preference;
    if v_suggested_odds <> trunc(v_suggested_odds, 4) then
      raise exception 'GOAL_SUGGESTED_ODDS_PRECISION' using errcode = 'P0001';
    end if;
  end if;

  return jsonb_build_object(
    'remainingAmount', v_remaining,
    'calendarDays', v_days,
    'dailyProfit', v_daily_profit,
    'suggestedOdds', v_suggested_odds
  );
end;
$$;

revoke all on function public.compute_goal_mission(numeric, numeric, date, numeric)
  from public, anon, authenticated;
grant execute on function public.compute_goal_mission(numeric, numeric, date, numeric)
  to service_role;

create function public.create_goal(
  p_actor_user_id uuid,
  p_bank_id uuid,
  p_base_amount numeric,
  p_target_amount numeric,
  p_deadline date,
  p_stake_preference numeric,
  p_strategy text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_goal_id uuid := gen_random_uuid();
  v_cash numeric(14, 2);
  v_mission jsonb;
begin
  if p_actor_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000'; end if;
  if p_base_amount is null or p_base_amount < 0 or p_base_amount <> trunc(p_base_amount, 2)
    or p_target_amount is null or p_target_amount <= p_base_amount or p_target_amount <> trunc(p_target_amount, 2)
    or p_stake_preference is null or p_stake_preference <= 0 or p_stake_preference <> trunc(p_stake_preference, 2)
    or p_strategy not in ('conservative', 'balanced', 'aggressive') then
    raise exception 'GOAL_TARGET_INVALID' using errcode = 'P0001';
  end if;
  if p_deadline is null or p_deadline <= current_date then
    raise exception 'GOAL_DEADLINE_PAST' using errcode = 'P0001';
  end if;

  perform 1 from public.banks where id = p_bank_id and user_id = p_actor_user_id for key share;
  if not found then raise exception 'BANK_NOT_FOUND' using errcode = 'P0001'; end if;
  select balance into v_cash from public.bank_pockets
    where bank_id = p_bank_id and pocket_type = 'cash' for update;
  if v_cash is null then raise exception 'BANK_NOT_FOUND' using errcode = 'P0001'; end if;
  if exists (select 1 from public.goals where bank_id = p_bank_id and status = 'active') then
    raise exception 'GOAL_ACTIVE_EXISTS' using errcode = 'P0001';
  end if;

  v_mission := public.compute_goal_mission(p_target_amount, v_cash, p_deadline, p_stake_preference);
  insert into public.goals (
    id, user_id, bank_id, base_amount, target_amount, deadline, stake_preference,
    strategy, daily_profit, suggested_odds
  ) values (
    v_goal_id, p_actor_user_id, p_bank_id, p_base_amount, p_target_amount, p_deadline,
    p_stake_preference, p_strategy, (v_mission ->> 'dailyProfit')::numeric,
    (v_mission ->> 'suggestedOdds')::numeric
  );

  insert into public.goal_history (
    goal_id, event_type, base_amount, current_amount, remaining_amount, daily_profit, suggested_odds
  ) values (
    v_goal_id, 'created', p_base_amount, v_cash, (v_mission ->> 'remainingAmount')::numeric,
    (v_mission ->> 'dailyProfit')::numeric, (v_mission ->> 'suggestedOdds')::numeric
  );
  insert into public.goal_history (
    goal_id, mission_date, event_type, base_amount, current_amount, remaining_amount, daily_profit, suggested_odds
  ) values (
    v_goal_id, current_date, 'daily_snapshot', p_base_amount, v_cash,
    (v_mission ->> 'remainingAmount')::numeric, (v_mission ->> 'dailyProfit')::numeric,
    (v_mission ->> 'suggestedOdds')::numeric
  );
  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('goal', v_goal_id, 'created', p_actor_user_id);
  return jsonb_build_object('goalId', v_goal_id);
exception when unique_violation then
  raise exception 'GOAL_ACTIVE_EXISTS' using errcode = 'P0001';
end;
$$;

create function public.update_goal(
  p_actor_user_id uuid,
  p_goal_id uuid,
  p_target_amount numeric,
  p_deadline date,
  p_stake_preference numeric,
  p_strategy text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_goal public.goals%rowtype;
  v_bank_id uuid;
  v_cash numeric(14, 2);
  v_target numeric;
  v_deadline date;
  v_stake numeric;
  v_strategy text;
  v_mission jsonb;
begin
  if p_actor_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000'; end if;
  select bank_id into v_bank_id from public.goals where id = p_goal_id and user_id = p_actor_user_id;
  if v_bank_id is null then raise exception 'GOAL_NOT_FOUND' using errcode = 'P0001'; end if;
  select balance into v_cash from public.bank_pockets
    where bank_id = v_bank_id and pocket_type = 'cash' for update;
  select * into v_goal from public.goals
    where id = p_goal_id and user_id = p_actor_user_id for update;
  if v_goal.status <> 'active' then raise exception 'GOAL_NOT_ACTIVE' using errcode = 'P0001'; end if;

  v_target := coalesce(p_target_amount, v_goal.target_amount);
  v_deadline := coalesce(p_deadline, v_goal.deadline);
  v_stake := coalesce(p_stake_preference, v_goal.stake_preference);
  v_strategy := coalesce(p_strategy, v_goal.strategy);
  if v_target <= v_goal.base_amount or v_target <> trunc(v_target, 2) then
    raise exception 'GOAL_TARGET_INVALID' using errcode = 'P0001';
  end if;
  if v_deadline <= current_date then raise exception 'GOAL_DEADLINE_PAST' using errcode = 'P0001'; end if;
  if v_stake <= 0 or v_stake <> trunc(v_stake, 2)
    or v_strategy not in ('conservative', 'balanced', 'aggressive') then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_mission := public.compute_goal_mission(v_target, v_cash, v_deadline, v_stake);
  update public.goals set
    target_amount = v_target, deadline = v_deadline, stake_preference = v_stake,
    strategy = v_strategy, daily_profit = (v_mission ->> 'dailyProfit')::numeric,
    suggested_odds = (v_mission ->> 'suggestedOdds')::numeric, updated_at = now()
  where id = p_goal_id;

  insert into public.goal_history (
    goal_id, mission_date, event_type, base_amount, current_amount, remaining_amount, daily_profit, suggested_odds
  ) values (
    p_goal_id, current_date, 'daily_snapshot', v_goal.base_amount, v_cash,
    (v_mission ->> 'remainingAmount')::numeric, (v_mission ->> 'dailyProfit')::numeric,
    (v_mission ->> 'suggestedOdds')::numeric
  ) on conflict (goal_id, mission_date) where mission_date is not null do update set
    current_amount = excluded.current_amount,
    remaining_amount = excluded.remaining_amount,
    daily_profit = excluded.daily_profit,
    suggested_odds = excluded.suggested_odds,
    created_at = now();
  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('goal', p_goal_id, 'updated', p_actor_user_id);
  return jsonb_build_object('goalId', p_goal_id);
end;
$$;

create function public.close_goal(
  p_actor_user_id uuid,
  p_goal_id uuid,
  p_status text,
  p_confirmed boolean,
  p_reason text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_goal public.goals%rowtype;
  v_bank_id uuid;
  v_cash numeric(14, 2);
begin
  if p_actor_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000'; end if;
  if p_confirmed is distinct from true then
    raise exception 'GOAL_CLOSE_CONFIRMATION_REQUIRED' using errcode = 'P0001';
  end if;
  if p_status not in ('completed', 'cancelled') or (p_reason is not null and char_length(btrim(p_reason)) > 500) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select bank_id into v_bank_id from public.goals where id = p_goal_id and user_id = p_actor_user_id;
  if v_bank_id is null then raise exception 'GOAL_NOT_FOUND' using errcode = 'P0001'; end if;
  select balance into v_cash from public.bank_pockets
    where bank_id = v_bank_id and pocket_type = 'cash' for update;
  select * into v_goal from public.goals
    where id = p_goal_id and user_id = p_actor_user_id for update;
  if v_goal.status <> 'active' then
    return jsonb_build_object('goalId', p_goal_id, 'status', v_goal.status, 'replayed', true);
  end if;
  if p_status = 'completed' and v_cash < v_goal.target_amount then
    raise exception 'GOAL_TARGET_NOT_REACHED' using errcode = 'P0001';
  end if;

  update public.goals set status = p_status, closed_at = now(), closure_reason = nullif(btrim(p_reason), ''),
    daily_profit = case when v_cash >= target_amount then 0 else daily_profit end,
    suggested_odds = case when v_cash >= target_amount then 1 else suggested_odds end,
    updated_at = now()
  where id = p_goal_id;
  insert into public.goal_history (
    goal_id, event_type, base_amount, current_amount, remaining_amount, daily_profit, suggested_odds
  ) values (
    p_goal_id, 'closed', v_goal.base_amount, v_cash, greatest(v_goal.target_amount - v_cash, 0),
    case when v_cash >= v_goal.target_amount then 0 else v_goal.daily_profit end,
    case when v_cash >= v_goal.target_amount then 1 else v_goal.suggested_odds end
  );
  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('goal', p_goal_id, 'closed', p_actor_user_id);
  return jsonb_build_object('goalId', p_goal_id, 'status', p_status, 'replayed', false);
end;
$$;

create function public.configure_risk_limits(
  p_actor_user_id uuid,
  p_set_max_odds boolean,
  p_max_odds numeric,
  p_set_max_daily_loss boolean,
  p_max_daily_loss numeric
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_limits public.risk_limits%rowtype;
begin
  if p_actor_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor_user_id::text, 0));
  if not coalesce(p_set_max_odds, false) and not coalesce(p_set_max_daily_loss, false) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  if (p_set_max_odds and p_max_odds is not null and (p_max_odds <= 1 or p_max_odds <> trunc(p_max_odds, 4)))
    or (p_set_max_daily_loss and p_max_daily_loss is not null and (p_max_daily_loss <= 0 or p_max_daily_loss <> trunc(p_max_daily_loss, 2))) then
    raise exception 'RISK_LIMIT_INVALID' using errcode = 'P0001';
  end if;

  insert into public.risk_limits (user_id, max_odds, max_stake_percentage, max_daily_loss)
  values (
    p_actor_user_id,
    case when p_set_max_odds then p_max_odds else null end,
    40,
    case when p_set_max_daily_loss then p_max_daily_loss else null end
  ) on conflict (user_id) do update set
    max_odds = case when p_set_max_odds then excluded.max_odds else public.risk_limits.max_odds end,
    max_daily_loss = case when p_set_max_daily_loss then excluded.max_daily_loss else public.risk_limits.max_daily_loss end,
    max_stake_percentage = 40,
    updated_at = now()
  returning * into v_limits;
  return jsonb_build_object(
    'maxOdds', v_limits.max_odds,
    'maxStakePercentage', 40,
    'maxDailyLoss', v_limits.max_daily_loss
  );
end;
$$;

alter function public.create_bet_with_funding(uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid)
  rename to create_bet_with_funding_core;

create function public.create_bet_with_funding(
  p_actor_user_id uuid,
  p_bank_id uuid,
  p_goal_id uuid,
  p_odds numeric,
  p_stake_type text,
  p_stake_amount numeric,
  p_stake_level numeric,
  p_legs jsonb,
  p_funding jsonb,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing public.bet_idempotencies%rowtype;
  v_goal public.goals%rowtype;
  v_limits public.risk_limits%rowtype;
  v_cash numeric(14, 2);
  v_stake numeric;
  v_daily_loss numeric;
  v_response jsonb;
  v_bet_id uuid;
begin
  if p_actor_user_id is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_actor_user_id::text, 0));
  select * into v_existing from public.bet_idempotencies
    where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;
  if found then
    if (v_existing.response_payload -> 'bet' ->> 'goalId')::uuid is distinct from p_goal_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;
    return public.create_bet_with_funding_core(
      p_actor_user_id, p_bank_id, p_odds, p_stake_type, p_stake_amount, p_stake_level,
      p_legs, p_funding, p_idempotency_key
    );
  end if;

  perform 1 from public.banks where id = p_bank_id and user_id = p_actor_user_id for key share;
  if not found then raise exception 'BANK_NOT_FOUND' using errcode = 'P0001'; end if;
  select * into v_limits from public.risk_limits where user_id = p_actor_user_id for update;
  select balance into v_cash from public.bank_pockets
    where bank_id = p_bank_id and pocket_type = 'cash' for update;

  if p_goal_id is not null then
    select * into v_goal from public.goals
      where id = p_goal_id and user_id = p_actor_user_id and bank_id = p_bank_id for key share;
    if not found then raise exception 'GOAL_NOT_FOUND' using errcode = 'P0001'; end if;
    if v_goal.status <> 'active' then raise exception 'GOAL_NOT_ACTIVE' using errcode = 'P0001'; end if;
  end if;

  if p_stake_type = 'amount' then v_stake := p_stake_amount;
  elsif p_stake_type = 'level' then v_stake := v_cash * p_stake_level / 50;
  else raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  if v_stake is null or v_stake <= 0 or v_stake <> trunc(v_stake, 2) then
    raise exception 'STAKE_PRECISION_INVALID' using errcode = 'P0001';
  end if;
  if v_stake > v_cash * 0.40 then raise exception 'STAKE_CAP_EXCEEDED' using errcode = 'P0001'; end if;
  if v_limits.max_odds is not null and p_odds > v_limits.max_odds then
    raise exception 'RISK_MAX_ODDS_EXCEEDED' using errcode = 'P0001';
  end if;
  if v_limits.max_daily_loss is not null then
    select coalesce(sum(abs(profit_amount)), 0) into v_daily_loss
    from public.bets
    where bank_id = p_bank_id and status in ('settled', 'cashout')
      and settled_at::date = current_date and profit_amount < 0;
    if v_daily_loss + v_stake > v_limits.max_daily_loss then
      raise exception 'RISK_DAILY_LOSS_EXCEEDED' using errcode = 'P0001';
    end if;
  end if;

  v_response := public.create_bet_with_funding_core(
    p_actor_user_id, p_bank_id, p_odds, p_stake_type, p_stake_amount, p_stake_level,
    p_legs, p_funding, p_idempotency_key
  );
  if coalesce((v_response ->> 'replayed')::boolean, false) then
    if (v_response -> 'bet' ->> 'goalId')::uuid is distinct from p_goal_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;
    return v_response;
  end if;
  v_bet_id := (v_response -> 'bet' ->> 'id')::uuid;
  update public.bets set goal_id = p_goal_id where id = v_bet_id;
  v_response := jsonb_set(v_response, '{bet,goalId}', coalesce(to_jsonb(p_goal_id), 'null'::jsonb), true);
  update public.bet_idempotencies set response_payload = response_payload || jsonb_build_object(
    'bet', (response_payload -> 'bet') || jsonb_build_object('goalId', p_goal_id)
  ) where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;
  return v_response;
end;
$$;

alter function public.settle_bet(uuid, uuid, text, uuid) rename to settle_bet_core;

create function public.settle_bet(
  p_actor_user_id uuid,
  p_bet_id uuid,
  p_result text,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_response jsonb;
  v_bet public.bets%rowtype;
  v_goal public.goals%rowtype;
  v_cash numeric(14, 2);
  v_mission jsonb;
begin
  v_response := public.settle_bet_core(p_actor_user_id, p_bet_id, p_result, p_idempotency_key);
  if coalesce((v_response ->> 'replayed')::boolean, false) then return v_response; end if;
  select * into v_bet from public.bets where id = p_bet_id;
  if v_bet.goal_id is null then return v_response || jsonb_build_object('goalRecalculated', false); end if;
  select * into v_goal from public.goals
    where id = v_bet.goal_id and user_id = p_actor_user_id and bank_id = v_bet.bank_id
      and status = 'active' for update;
  if not found then return v_response || jsonb_build_object('goalRecalculated', false); end if;
  select balance into v_cash from public.bank_pockets
    where bank_id = v_bet.bank_id and pocket_type = 'cash';
  v_mission := public.compute_goal_mission(v_goal.target_amount, v_cash, v_goal.deadline, v_goal.stake_preference);
  update public.goals set daily_profit = (v_mission ->> 'dailyProfit')::numeric,
    suggested_odds = (v_mission ->> 'suggestedOdds')::numeric, updated_at = now()
  where id = v_goal.id;
  insert into public.goal_history (
    goal_id, bet_id, event_type, base_amount, current_amount, remaining_amount, daily_profit, suggested_odds
  ) values (
    v_goal.id, p_bet_id, 'recalculated', v_goal.base_amount, v_cash,
    (v_mission ->> 'remainingAmount')::numeric, (v_mission ->> 'dailyProfit')::numeric,
    (v_mission ->> 'suggestedOdds')::numeric
  ) on conflict (goal_id, bet_id) where bet_id is not null and event_type = 'recalculated' do nothing;
  v_response := v_response || jsonb_build_object('goalRecalculated', true, 'goalId', v_goal.id);
  update public.settlement_idempotencies set response_payload = v_response - 'replayed'
    where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;
  return v_response;
end;
$$;

revoke all on function public.create_goal(uuid, uuid, numeric, numeric, date, numeric, text)
  from public, anon, authenticated;
revoke all on function public.update_goal(uuid, uuid, numeric, date, numeric, text)
  from public, anon, authenticated;
revoke all on function public.close_goal(uuid, uuid, text, boolean, text)
  from public, anon, authenticated;
revoke all on function public.configure_risk_limits(uuid, boolean, numeric, boolean, numeric)
  from public, anon, authenticated;
revoke all on function public.create_bet_with_funding_core(uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid)
  from public, anon, authenticated;
revoke all on function public.create_bet_with_funding(uuid, uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid)
  from public, anon, authenticated;
revoke all on function public.settle_bet_core(uuid, uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.settle_bet(uuid, uuid, text, uuid)
  from public, anon, authenticated;

grant execute on function public.create_goal(uuid, uuid, numeric, numeric, date, numeric, text) to service_role;
grant execute on function public.update_goal(uuid, uuid, numeric, date, numeric, text) to service_role;
grant execute on function public.close_goal(uuid, uuid, text, boolean, text) to service_role;
grant execute on function public.configure_risk_limits(uuid, boolean, numeric, boolean, numeric) to service_role;
grant execute on function public.create_bet_with_funding_core(uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid) to service_role;
grant execute on function public.create_bet_with_funding(uuid, uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid) to service_role;
grant execute on function public.settle_bet_core(uuid, uuid, text, uuid) to service_role;
grant execute on function public.settle_bet(uuid, uuid, text, uuid) to service_role;
