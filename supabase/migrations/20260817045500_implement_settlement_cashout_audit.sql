alter table public.transactions
  add column bet_id uuid references public.bets (id) on delete restrict,
  add column cashout_id uuid references public.bet_cashouts (id) on delete restrict;

alter table public.transactions drop constraint transactions_type_check;
alter table public.transactions add constraint transactions_type_check check (
  type in (
    'initial_deposit', 'deposit', 'withdraw', 'transfer_debit', 'transfer_credit',
    'bet_reserve', 'bet_return', 'bet_carryover', 'cashout_return', 'adjustment',
    'bonus_credit', 'freebet_credit'
  )
);

alter table public.audit_logs drop constraint audit_logs_action_check;
alter table public.audit_logs add constraint audit_logs_action_check check (
  action in (
    'created', 'updated', 'deleted', 'reserved', 'returned', 'settled',
    'cashout', 'derived', 'closed', 'published', 'followed', 'unfollowed',
    'role_changed'
  )
);

create table public.settlement_idempotencies (
  user_id uuid not null references public.users (id) on delete cascade,
  idempotency_key uuid not null,
  bet_id uuid not null references public.bets (id) on delete restrict,
  request_payload jsonb not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key),
  constraint settlement_idempotencies_request_object check (jsonb_typeof(request_payload) = 'object'),
  constraint settlement_idempotencies_response_object check (jsonb_typeof(response_payload) = 'object')
);

create table public.cashout_idempotencies (
  user_id uuid not null references public.users (id) on delete cascade,
  idempotency_key uuid not null,
  bet_id uuid not null references public.bets (id) on delete restrict,
  request_payload jsonb not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key),
  constraint cashout_idempotencies_request_object check (jsonb_typeof(request_payload) = 'object'),
  constraint cashout_idempotencies_response_object check (jsonb_typeof(response_payload) = 'object')
);

alter table public.settlement_idempotencies enable row level security;
alter table public.cashout_idempotencies enable row level security;

revoke all on table public.settlement_idempotencies, public.cashout_idempotencies
  from public, anon, authenticated;
grant select, insert, update, delete on table public.settlement_idempotencies, public.cashout_idempotencies
  to service_role;

revoke insert, update, delete, truncate, references, trigger on table public.audit_logs
  from authenticated;

create index transactions_bet_id_idx on public.transactions (bet_id, created_at desc, id desc)
  where bet_id is not null;
create index transactions_cashout_id_idx on public.transactions (cashout_id)
  where cashout_id is not null;
create index bet_cashouts_source_bet_id_idx on public.bet_cashouts (source_bet_id)
  where source_bet_id is not null;
create unique index bet_cashouts_source_bet_unique_idx on public.bet_cashouts (source_bet_id)
  where source_bet_id is not null;

alter table public.bet_cashouts
  add constraint bet_cashouts_distinct_bets check (source_bet_id is null or source_bet_id <> bet_id) not valid;

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
  v_bet public.bets%rowtype;
  v_existing public.settlement_idempotencies%rowtype;
  v_funding public.bet_funding%rowtype;
  v_payload jsonb;
  v_response jsonb;
  v_transactions jsonb := '[]'::jsonb;
  v_total_funding numeric := 0;
  v_total_return numeric := 0;
  v_profit numeric := 0;
  v_primary_credit numeric;
  v_freebet_credit numeric;
  v_cash_credit numeric;
  v_transaction_id uuid;
  v_cash_balance numeric(14, 2);
  v_bonus_balance numeric(14, 2);
  v_freebet_balance numeric(14, 2);
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_bet_id is null or p_idempotency_key is null
    or p_result not in ('won', 'lost', 'void', 'half_won', 'half_lost') then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_payload := jsonb_build_object('betId', p_bet_id, 'result', p_result);

  insert into public.settlement_idempotencies (
    user_id, idempotency_key, bet_id, request_payload, response_payload
  ) values (
    p_actor_user_id, p_idempotency_key, p_bet_id, v_payload, '{}'::jsonb
  ) on conflict (user_id, idempotency_key) do nothing;

  if not found then
    select * into v_existing
    from public.settlement_idempotencies
    where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;

    if v_existing.request_payload is distinct from v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;

    return v_existing.response_payload || jsonb_build_object('replayed', true);
  end if;

  select b.* into v_bet
  from public.bets b
  join public.banks bank on bank.id = b.bank_id
  where b.id = p_bet_id and bank.user_id = p_actor_user_id
  for update of b;

  if not found then
    raise exception 'BET_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_bet.status <> 'open' then
    raise exception 'BET_NOT_OPEN' using errcode = 'P0001';
  end if;

  if v_bet.funding_status <> 'reserved' or v_bet.idempotency_key is null then
    raise exception 'BET_NOT_SETTLEABLE' using errcode = 'P0001';
  end if;

  perform 1 from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'cash' for update;
  perform 1 from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'bonus' for update;
  perform 1 from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'freebet' for update;

  for v_funding in
    select * from public.bet_funding
    where bet_id = p_bet_id
    order by case pocket_type when 'cash' then 1 when 'bonus' then 2 else 3 end
  loop
    if v_funding.reserved_transaction_id is null then
      raise exception 'BET_NOT_SETTLEABLE' using errcode = 'P0001';
    end if;

    v_total_funding := v_total_funding + v_funding.amount;
    v_primary_credit := 0;
    v_freebet_credit := 0;
    v_cash_credit := 0;

    if v_funding.pocket_type in ('cash', 'bonus') then
      case p_result
        when 'won' then
          v_primary_credit := v_funding.amount * v_bet.odds;
          v_profit := v_profit + v_funding.amount * (v_bet.odds - 1);
        when 'lost' then
          v_profit := v_profit - v_funding.amount;
        when 'void' then
          v_primary_credit := v_funding.amount;
        when 'half_won' then
          v_primary_credit := v_funding.amount * (v_bet.odds + 1) / 2;
          v_profit := v_profit + v_funding.amount * (v_bet.odds - 1) / 2;
        when 'half_lost' then
          v_primary_credit := v_funding.amount / 2;
          v_profit := v_profit - v_funding.amount / 2;
      end case;
    else
      case p_result
        when 'won' then
          v_cash_credit := v_funding.amount * (v_bet.odds - 1);
          v_profit := v_profit + v_cash_credit;
        when 'void' then
          v_freebet_credit := v_funding.amount;
        when 'half_won' then
          v_freebet_credit := v_funding.amount / 2;
          v_cash_credit := v_funding.amount * (v_bet.odds - 1) / 2;
          v_profit := v_profit + v_cash_credit;
        when 'half_lost' then
          v_freebet_credit := v_funding.amount / 2;
        else null;
      end case;
    end if;

    if v_primary_credit <> trunc(v_primary_credit, 2)
      or v_freebet_credit <> trunc(v_freebet_credit, 2)
      or v_cash_credit <> trunc(v_cash_credit, 2)
      or v_profit <> trunc(v_profit, 2) then
      raise exception 'RETURN_PRECISION_INVALID' using errcode = 'P0001';
    end if;

    if v_primary_credit > 0 then
      update public.bank_pockets set balance = balance + v_primary_credit
      where bank_id = v_bet.bank_id and pocket_type = v_funding.pocket_type;
      v_transaction_id := gen_random_uuid();
      insert into public.transactions (id, bank_id, pocket_type, type, amount, bet_id, related_transaction_id)
      values (v_transaction_id, v_bet.bank_id, v_funding.pocket_type, 'bet_return', v_primary_credit, p_bet_id, v_funding.reserved_transaction_id);
      insert into public.audit_logs (entity_type, entity_id, action, actor_id)
      values ('transaction', v_transaction_id, 'returned', p_actor_user_id);
      v_transactions := v_transactions || jsonb_build_array(jsonb_build_object(
        'id', v_transaction_id, 'pocketType', v_funding.pocket_type, 'amount', v_primary_credit, 'type', 'bet_return'
      ));
      v_total_return := v_total_return + v_primary_credit;
    end if;

    if v_freebet_credit > 0 then
      update public.bank_pockets set balance = balance + v_freebet_credit
      where bank_id = v_bet.bank_id and pocket_type = 'freebet';
      v_transaction_id := gen_random_uuid();
      insert into public.transactions (id, bank_id, pocket_type, type, amount, bet_id, related_transaction_id)
      values (v_transaction_id, v_bet.bank_id, 'freebet', 'bet_return', v_freebet_credit, p_bet_id, v_funding.reserved_transaction_id);
      insert into public.audit_logs (entity_type, entity_id, action, actor_id)
      values ('transaction', v_transaction_id, 'returned', p_actor_user_id);
      v_transactions := v_transactions || jsonb_build_array(jsonb_build_object(
        'id', v_transaction_id, 'pocketType', 'freebet', 'amount', v_freebet_credit, 'type', 'bet_return'
      ));
      v_total_return := v_total_return + v_freebet_credit;
    end if;

    if v_cash_credit > 0 then
      update public.bank_pockets set balance = balance + v_cash_credit
      where bank_id = v_bet.bank_id and pocket_type = 'cash';
      v_transaction_id := gen_random_uuid();
      insert into public.transactions (id, bank_id, pocket_type, type, amount, bet_id, related_transaction_id)
      values (v_transaction_id, v_bet.bank_id, 'cash', 'bet_return', v_cash_credit, p_bet_id, v_funding.reserved_transaction_id);
      insert into public.audit_logs (entity_type, entity_id, action, actor_id)
      values ('transaction', v_transaction_id, 'returned', p_actor_user_id);
      v_transactions := v_transactions || jsonb_build_array(jsonb_build_object(
        'id', v_transaction_id, 'pocketType', 'cash', 'amount', v_cash_credit, 'type', 'bet_return'
      ));
      v_total_return := v_total_return + v_cash_credit;
    end if;
  end loop;

  if v_total_funding <> v_bet.stake_amount or v_total_return <> trunc(v_total_return, 2) then
    raise exception 'BET_NOT_SETTLEABLE' using errcode = 'P0001';
  end if;

  update public.bets
  set status = 'settled', result = p_result, funding_status = 'returned',
      return_amount = v_total_return, settlement_amount = v_total_return,
      profit_amount = v_profit, settled_at = now()
  where id = p_bet_id;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('bet', p_bet_id, 'settled', p_actor_user_id);

  select balance into v_cash_balance from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'cash';
  select balance into v_bonus_balance from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'bonus';
  select balance into v_freebet_balance from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'freebet';

  v_response := jsonb_build_object(
    'bet', jsonb_build_object(
      'id', p_bet_id, 'status', 'settled', 'result', p_result,
      'returnAmount', v_total_return, 'profitAmount', v_profit
    ),
    'balances', jsonb_build_object('cash', v_cash_balance, 'bonus', v_bonus_balance, 'freebet', v_freebet_balance),
    'transactions', v_transactions
  );

  update public.settlement_idempotencies set response_payload = v_response
  where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;

  return v_response || jsonb_build_object('replayed', false);
end;
$$;

create function public.partial_cashout_bet(
  p_actor_user_id uuid,
  p_bet_id uuid,
  p_cashout_amount numeric,
  p_remaining_stake numeric,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_bet public.bets%rowtype;
  v_existing public.cashout_idempotencies%rowtype;
  v_funding public.bet_funding%rowtype;
  v_payload jsonb;
  v_response jsonb;
  v_cashout_id uuid := gen_random_uuid();
  v_derived_bet_id uuid := gen_random_uuid();
  v_split_group_id uuid := gen_random_uuid();
  v_return_transaction_id uuid := gen_random_uuid();
  v_carryover_transaction_id uuid := gen_random_uuid();
  v_cash_balance numeric(14, 2);
  v_funding_count integer;
  v_profit numeric;
begin
  if p_actor_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_bet_id is null or p_idempotency_key is null or p_cashout_amount is null
    or p_remaining_stake is null or p_cashout_amount <= 0 or p_remaining_stake <= 0
    or p_cashout_amount <> trunc(p_cashout_amount, 2)
    or p_remaining_stake <> trunc(p_remaining_stake, 2) then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_payload := jsonb_build_object(
    'betId', p_bet_id, 'cashoutAmount', p_cashout_amount, 'remainingStake', p_remaining_stake
  );

  insert into public.cashout_idempotencies (
    user_id, idempotency_key, bet_id, request_payload, response_payload
  ) values (
    p_actor_user_id, p_idempotency_key, p_bet_id, v_payload, '{}'::jsonb
  ) on conflict (user_id, idempotency_key) do nothing;

  if not found then
    select * into v_existing from public.cashout_idempotencies
    where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;
    if v_existing.request_payload is distinct from v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;
    return v_existing.response_payload || jsonb_build_object('replayed', true);
  end if;

  select b.* into v_bet
  from public.bets b
  join public.banks bank on bank.id = b.bank_id
  where b.id = p_bet_id and bank.user_id = p_actor_user_id
  for update of b;

  if not found then raise exception 'BET_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_bet.status <> 'open' then raise exception 'BET_NOT_OPEN' using errcode = 'P0001'; end if;
  if v_bet.funding_status <> 'reserved' or v_bet.idempotency_key is null then
    raise exception 'BET_NOT_CASHOUT_ELIGIBLE' using errcode = 'P0001';
  end if;
  if p_remaining_stake >= v_bet.stake_amount then
    raise exception 'INVALID_REMAINING_STAKE' using errcode = 'P0001';
  end if;

  select count(*) into v_funding_count
  from public.bet_funding where bet_id = p_bet_id;

  select * into v_funding
  from public.bet_funding where bet_id = p_bet_id
  order by id limit 1;

  if v_funding_count <> 1 or v_funding.pocket_type <> 'cash'
    or v_funding.amount <> v_bet.stake_amount or v_funding.reserved_transaction_id is null then
    raise exception 'BET_NOT_CASHOUT_ELIGIBLE' using errcode = 'P0001';
  end if;

  perform 1 from public.bank_pockets where bank_id = v_bet.bank_id and pocket_type = 'cash' for update;
  v_profit := p_cashout_amount - (v_bet.stake_amount - p_remaining_stake);

  insert into public.bets (
    id, bank_id, stake_amount, status, odds, funding_status
  ) values (
    v_derived_bet_id, v_bet.bank_id, p_remaining_stake, 'open', v_bet.odds, 'reserved'
  );

  insert into public.bet_legs (bet_id, market, selection, odds, event_id, market_id, reference_type, event_name)
  select v_derived_bet_id, market, selection, odds, event_id, market_id, reference_type, event_name
  from public.bet_legs where bet_id = p_bet_id;

  insert into public.transactions (
    id, bank_id, pocket_type, type, amount, bet_id, related_transaction_id
  ) values (
    v_carryover_transaction_id, v_bet.bank_id, 'cash', 'bet_carryover',
    p_remaining_stake, v_derived_bet_id, v_funding.reserved_transaction_id
  );

  insert into public.bet_funding (bet_id, pocket_type, amount, reserved_transaction_id)
  values (v_derived_bet_id, 'cash', p_remaining_stake, v_carryover_transaction_id);

  insert into public.bet_cashouts (
    id, bet_id, source_bet_id, cashout_amount, remaining_stake, split_group_id, idempotency_key
  ) values (
    v_cashout_id, v_derived_bet_id, p_bet_id, p_cashout_amount, p_remaining_stake,
    v_split_group_id, p_idempotency_key
  );

  update public.bank_pockets set balance = balance + p_cashout_amount
  where bank_id = v_bet.bank_id and pocket_type = 'cash'
  returning balance into v_cash_balance;

  insert into public.transactions (
    id, bank_id, pocket_type, type, amount, bet_id, cashout_id, related_transaction_id
  ) values (
    v_return_transaction_id, v_bet.bank_id, 'cash', 'cashout_return', p_cashout_amount,
    p_bet_id, v_cashout_id, v_funding.reserved_transaction_id
  );

  update public.bets set
    status = 'cashout', result = 'cashout', funding_status = 'released',
    return_amount = p_cashout_amount, settlement_amount = p_cashout_amount,
    profit_amount = v_profit, settled_at = now()
  where id = p_bet_id;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id) values
    ('transaction', v_carryover_transaction_id, 'created', p_actor_user_id),
    ('transaction', v_return_transaction_id, 'returned', p_actor_user_id),
    ('bet', p_bet_id, 'cashout', p_actor_user_id),
    ('bet', v_derived_bet_id, 'derived', p_actor_user_id);

  v_response := jsonb_build_object(
    'sourceBet', jsonb_build_object('id', p_bet_id, 'status', 'cashout', 'result', 'cashout', 'returnAmount', p_cashout_amount, 'profitAmount', v_profit),
    'derivedBet', jsonb_build_object('id', v_derived_bet_id, 'status', 'open', 'fundingStatus', 'reserved', 'stakeAmount', p_remaining_stake, 'odds', v_bet.odds),
    'cashout', jsonb_build_object('id', v_cashout_id, 'sourceBetId', p_bet_id, 'derivedBetId', v_derived_bet_id, 'cashoutAmount', p_cashout_amount, 'remainingStake', p_remaining_stake, 'splitGroupId', v_split_group_id),
    'balances', jsonb_build_object('cash', v_cash_balance),
    'transactions', jsonb_build_array(
      jsonb_build_object('id', v_carryover_transaction_id, 'type', 'bet_carryover', 'pocketType', 'cash', 'amount', p_remaining_stake),
      jsonb_build_object('id', v_return_transaction_id, 'type', 'cashout_return', 'pocketType', 'cash', 'amount', p_cashout_amount)
    )
  );

  update public.cashout_idempotencies set response_payload = v_response
  where user_id = p_actor_user_id and idempotency_key = p_idempotency_key;

  return v_response || jsonb_build_object('replayed', false);
end;
$$;

revoke all on function public.settle_bet(uuid, uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.settle_bet(uuid, uuid, text, uuid) to service_role;

revoke all on function public.partial_cashout_bet(uuid, uuid, numeric, numeric, uuid)
  from public, anon, authenticated;
grant execute on function public.partial_cashout_bet(uuid, uuid, numeric, numeric, uuid) to service_role;
