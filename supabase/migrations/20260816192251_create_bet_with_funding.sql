do $$
begin
  if exists (select 1 from public.bets where stake_level is not null) then
    raise exception 'Cannot migrate non-null legacy stake levels';
  end if;

  if exists (select 1 from public.bets where reserved_transaction_id is not null) then
    raise exception 'Cannot remove populated legacy bet reservation links';
  end if;
end;
$$;

alter table public.bets
  drop constraint bets_stake_level_check,
  alter column stake_level type numeric(3, 1) using null::numeric(3, 1),
  add constraint bets_stake_level_check check (
    stake_level is null
    or (stake_level >= 0.1 and stake_level <= 20 and stake_level = trunc(stake_level, 1))
  ),
  drop column reserved_transaction_id;

alter table public.bet_legs
  add column reference_type text,
  add column event_name text,
  add constraint bet_legs_reference_type_check check (
    reference_type is null or reference_type in ('normalized', 'manual')
  ),
  add constraint bet_legs_event_name_not_blank check (
    event_name is null or btrim(event_name) <> ''
  ),
  add constraint bet_legs_reference_shape_check check (
    (
      reference_type = 'normalized'
      and event_name is not null
      and event_id is not null
      and market_id is not null
    )
    or (
      reference_type = 'manual'
      and event_name is not null
      and event_id is null
      and market_id is null
    )
  ) not valid;

alter table public.bet_funding
  drop constraint bet_funding_amount_non_negative,
  add constraint bet_funding_amount_positive check (amount > 0),
  alter column reserved_transaction_id set not null;

create unique index bet_funding_reserved_transaction_id_key
  on public.bet_funding (reserved_transaction_id);
create index bet_legs_market_id_idx
  on public.bet_legs (market_id)
  where market_id is not null;

create table public.bet_idempotencies (
  user_id uuid not null references public.users (id) on delete cascade,
  idempotency_key uuid not null,
  request_payload jsonb not null,
  response_payload jsonb not null,
  bet_id uuid not null references public.bets (id) on delete restrict deferrable initially deferred,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key),
  constraint bet_idempotencies_request_payload_object check (jsonb_typeof(request_payload) = 'object'),
  constraint bet_idempotencies_response_payload_object check (jsonb_typeof(response_payload) = 'object')
);

alter table public.bet_idempotencies enable row level security;

revoke all on table public.bet_idempotencies from public, anon, authenticated;
grant select, insert, update, delete on table public.bet_idempotencies to service_role;

revoke insert, update, delete, truncate, references, trigger
  on table public.bets, public.bet_legs, public.bet_funding
  from authenticated;
grant select on table public.bets, public.bet_legs, public.bet_funding to authenticated;

create function public.create_bet_with_funding(
  p_actor_user_id uuid,
  p_bank_id uuid,
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
  v_bet_id uuid := gen_random_uuid();
  v_payload jsonb;
  v_existing public.bet_idempotencies%rowtype;
  v_cash_balance numeric(14, 2);
  v_bonus_balance numeric(14, 2);
  v_freebet_balance numeric(14, 2);
  v_cash_amount numeric;
  v_bonus_amount numeric;
  v_freebet_amount numeric;
  v_resolved_stake numeric;
  v_leg jsonb;
  v_reference_type text;
  v_event_id uuid;
  v_market_id uuid;
  v_event_name text;
  v_market_name text;
  v_selection text;
  v_leg_odds numeric;
  v_transaction_id uuid;
  v_funding_rows jsonb := '[]'::jsonb;
  v_response jsonb;
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_bank_id is null
    or p_idempotency_key is null
    or p_odds is null
    or p_odds <= 1
    or p_odds <> trunc(p_odds, 4)
    or p_legs is null
    or jsonb_typeof(p_legs) <> 'array'
    or jsonb_array_length(p_legs) < 1
    or jsonb_array_length(p_legs) > 20
    or p_funding is null
    or jsonb_typeof(p_funding) <> 'object' then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_cash_amount := (p_funding ->> 'cash')::numeric;
  v_bonus_amount := (p_funding ->> 'bonus')::numeric;
  v_freebet_amount := (p_funding ->> 'freebet')::numeric;

  if v_cash_amount is null
    or v_bonus_amount is null
    or v_freebet_amount is null
    or v_cash_amount < 0
    or v_bonus_amount < 0
    or v_freebet_amount < 0
    or v_cash_amount <> trunc(v_cash_amount, 2)
    or v_bonus_amount <> trunc(v_bonus_amount, 2)
    or v_freebet_amount <> trunc(v_freebet_amount, 2)
    or v_cash_amount > 999999999999.99
    or v_bonus_amount > 999999999999.99
    or v_freebet_amount > 999999999999.99
    or v_cash_amount + v_bonus_amount + v_freebet_amount <= 0 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_payload := jsonb_build_object(
    'bankId', p_bank_id,
    'odds', p_odds,
    'stake', jsonb_build_object(
      'type', p_stake_type,
      'amount', p_stake_amount,
      'level', p_stake_level
    ),
    'legs', p_legs,
    'funding', jsonb_build_object(
      'cash', v_cash_amount,
      'bonus', v_bonus_amount,
      'freebet', v_freebet_amount
    )
  );

  insert into public.bet_idempotencies (
    user_id, idempotency_key, request_payload, response_payload, bet_id
  ) values (
    p_actor_user_id, p_idempotency_key, v_payload, '{}'::jsonb, v_bet_id
  ) on conflict (user_id, idempotency_key) do nothing;

  if not found then
    select * into v_existing
    from public.bet_idempotencies
    where user_id = p_actor_user_id
      and idempotency_key = p_idempotency_key;

    if v_existing.request_payload is distinct from v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;

    return v_existing.response_payload || jsonb_build_object('replayed', true);
  end if;

  perform 1
  from public.banks
  where id = p_bank_id
    and user_id = p_actor_user_id
  for key share;

  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
  end if;

  select balance into v_cash_balance
  from public.bank_pockets
  where bank_id = p_bank_id and pocket_type = 'cash'
  for update;

  select balance into v_bonus_balance
  from public.bank_pockets
  where bank_id = p_bank_id and pocket_type = 'bonus'
  for update;

  select balance into v_freebet_balance
  from public.bank_pockets
  where bank_id = p_bank_id and pocket_type = 'freebet'
  for update;

  if v_cash_balance is null or v_bonus_balance is null or v_freebet_balance is null then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_stake_type = 'amount' then
    if p_stake_amount is null
      or p_stake_level is not null
      or p_stake_amount <= 0
      or p_stake_amount <> trunc(p_stake_amount, 2)
      or p_stake_amount > 999999999999.99 then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
    v_resolved_stake := p_stake_amount;
  elsif p_stake_type = 'level' then
    if p_stake_amount is not null
      or p_stake_level is null
      or p_stake_level < 0.1
      or p_stake_level > 20
      or p_stake_level <> trunc(p_stake_level, 1) then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
    v_resolved_stake := v_cash_balance * p_stake_level / 50;
    if v_resolved_stake <> trunc(v_resolved_stake, 2) then
      raise exception 'STAKE_PRECISION_INVALID' using errcode = 'P0001';
    end if;
  else
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if v_resolved_stake > v_cash_balance * 0.40 then
    raise exception 'STAKE_CAP_EXCEEDED' using errcode = 'P0001';
  end if;

  if v_cash_amount + v_bonus_amount + v_freebet_amount <> v_resolved_stake then
    raise exception 'FUNDING_SUM_MISMATCH' using errcode = 'P0001';
  end if;

  if v_cash_amount > v_cash_balance
    or v_bonus_amount > v_bonus_balance
    or v_freebet_amount > v_freebet_balance then
    raise exception 'INSUFFICIENT_POCKET_BALANCE' using errcode = 'P0001';
  end if;

  insert into public.bets (
    id, bank_id, stake_amount, status, odds, stake_level,
    funding_status, idempotency_key
  ) values (
    v_bet_id, p_bank_id, v_resolved_stake, 'draft', p_odds,
    p_stake_level, 'pending', p_idempotency_key
  );

  for v_leg in select value from jsonb_array_elements(p_legs)
  loop
    v_reference_type := v_leg ->> 'referenceType';
    v_selection := btrim(v_leg ->> 'selection');
    v_leg_odds := (v_leg ->> 'odds')::numeric;

    if v_selection is null
      or v_selection = ''
      or char_length(v_selection) > 100
      or v_leg_odds is null
      or v_leg_odds <= 1
      or v_leg_odds <> trunc(v_leg_odds, 4) then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;

    if v_reference_type = 'normalized' then
      v_event_id := (v_leg ->> 'eventId')::uuid;
      v_market_id := (v_leg ->> 'marketId')::uuid;

      select
        btrim(home_team.name) || ' vs ' || btrim(away_team.name),
        btrim(catalog_markets.name)
      into v_event_name, v_market_name
      from public.catalog_markets
      join public.catalog_events on catalog_events.id = catalog_markets.event_id
      join public.catalog_teams home_team on home_team.id = catalog_events.home_team_id
      join public.catalog_teams away_team on away_team.id = catalog_events.away_team_id
      where catalog_events.id = v_event_id
        and catalog_markets.id = v_market_id
        and catalog_events.status in ('scheduled', 'live')
        and catalog_markets.status = 'active';

      if not found then
        raise exception 'CATALOG_REFERENCE_NOT_FOUND' using errcode = 'P0001';
      end if;

      insert into public.bet_legs (
        bet_id, market, selection, odds, event_id, market_id,
        reference_type, event_name
      ) values (
        v_bet_id, v_market_name, v_selection, v_leg_odds,
        v_event_id, v_market_id, 'normalized', v_event_name
      );
    elsif v_reference_type = 'manual' then
      v_event_name := btrim(v_leg ->> 'eventName');
      v_market_name := btrim(v_leg ->> 'marketName');

      if v_event_name is null
        or v_event_name = ''
        or char_length(v_event_name) > 100
        or v_market_name is null
        or v_market_name = ''
        or char_length(v_market_name) > 100 then
        raise exception 'VALIDATION_ERROR' using errcode = '22023';
      end if;

      insert into public.bet_legs (
        bet_id, market, selection, odds, reference_type, event_name
      ) values (
        v_bet_id, v_market_name, v_selection, v_leg_odds, 'manual', v_event_name
      );
    else
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
  end loop;

  if v_cash_amount > 0 then
    update public.bank_pockets
    set balance = balance - v_cash_amount
    where bank_id = p_bank_id and pocket_type = 'cash'
    returning balance into v_cash_balance;

    v_transaction_id := gen_random_uuid();
    insert into public.transactions (id, bank_id, pocket_type, type, amount)
    values (v_transaction_id, p_bank_id, 'cash', 'bet_reserve', v_cash_amount);
    insert into public.bet_funding (bet_id, pocket_type, amount, reserved_transaction_id)
    values (v_bet_id, 'cash', v_cash_amount, v_transaction_id);
    insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('transaction', v_transaction_id, 'created', p_actor_user_id);
    v_funding_rows := v_funding_rows || jsonb_build_array(jsonb_build_object(
      'pocketType', 'cash', 'amount', v_cash_amount, 'transactionId', v_transaction_id
    ));
  end if;

  if v_bonus_amount > 0 then
    update public.bank_pockets
    set balance = balance - v_bonus_amount
    where bank_id = p_bank_id and pocket_type = 'bonus'
    returning balance into v_bonus_balance;

    v_transaction_id := gen_random_uuid();
    insert into public.transactions (id, bank_id, pocket_type, type, amount)
    values (v_transaction_id, p_bank_id, 'bonus', 'bet_reserve', v_bonus_amount);
    insert into public.bet_funding (bet_id, pocket_type, amount, reserved_transaction_id)
    values (v_bet_id, 'bonus', v_bonus_amount, v_transaction_id);
    insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('transaction', v_transaction_id, 'created', p_actor_user_id);
    v_funding_rows := v_funding_rows || jsonb_build_array(jsonb_build_object(
      'pocketType', 'bonus', 'amount', v_bonus_amount, 'transactionId', v_transaction_id
    ));
  end if;

  if v_freebet_amount > 0 then
    update public.bank_pockets
    set balance = balance - v_freebet_amount
    where bank_id = p_bank_id and pocket_type = 'freebet'
    returning balance into v_freebet_balance;

    v_transaction_id := gen_random_uuid();
    insert into public.transactions (id, bank_id, pocket_type, type, amount)
    values (v_transaction_id, p_bank_id, 'freebet', 'bet_reserve', v_freebet_amount);
    insert into public.bet_funding (bet_id, pocket_type, amount, reserved_transaction_id)
    values (v_bet_id, 'freebet', v_freebet_amount, v_transaction_id);
    insert into public.audit_logs (entity_type, entity_id, action, actor_id)
    values ('transaction', v_transaction_id, 'created', p_actor_user_id);
    v_funding_rows := v_funding_rows || jsonb_build_array(jsonb_build_object(
      'pocketType', 'freebet', 'amount', v_freebet_amount, 'transactionId', v_transaction_id
    ));
  end if;

  update public.bets
  set status = 'open', funding_status = 'reserved'
  where id = v_bet_id;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('bet', v_bet_id, 'reserved', p_actor_user_id);

  v_response := jsonb_build_object(
    'bet', jsonb_build_object(
      'id', v_bet_id,
      'status', 'open',
      'fundingStatus', 'reserved',
      'stakeAmount', v_resolved_stake,
      'stakeLevel', p_stake_level,
      'odds', p_odds,
      'legs', p_legs,
      'funding', v_funding_rows
    ),
    'balances', jsonb_build_object(
      'cash', v_cash_balance,
      'bonus', v_bonus_balance,
      'freebet', v_freebet_balance
    )
  );

  update public.bet_idempotencies
  set response_payload = v_response
  where user_id = p_actor_user_id
    and idempotency_key = p_idempotency_key;

  return v_response || jsonb_build_object('replayed', false);
end;
$$;

revoke all on function public.create_bet_with_funding(
  uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid
) from public, anon, authenticated;
grant execute on function public.create_bet_with_funding(
  uuid, uuid, numeric, text, numeric, numeric, jsonb, jsonb, uuid
) to service_role;
