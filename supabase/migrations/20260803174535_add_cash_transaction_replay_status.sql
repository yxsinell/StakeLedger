create or replace function public.record_cash_transaction(
  p_bank_id uuid,
  p_type text,
  p_amount numeric,
  p_method text,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_transaction_id uuid := gen_random_uuid();
  v_payload jsonb;
  v_existing public.transaction_idempotencies%rowtype;
  v_balance numeric(14, 2);
  v_response jsonb;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_bank_id is null
    or p_idempotency_key is null
    or p_type is null
    or p_type not in ('deposit', 'withdraw')
    or p_amount is null
    or p_amount <= 0
    or p_amount <> trunc(p_amount, 2)
    or p_amount > 999999999999.99
    or p_method is null
    or p_method not in ('bank_transfer', 'card', 'cash') then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_payload := jsonb_build_object(
    'bankId', p_bank_id,
    'type', p_type,
    'amount', p_amount,
    'method', p_method
  );

  insert into public.transaction_idempotencies (
    user_id,
    idempotency_key,
    request_payload,
    transaction_id,
    response_payload
  )
  values (
    v_user_id,
    p_idempotency_key,
    v_payload,
    v_transaction_id,
    '{}'::jsonb
  )
  on conflict (user_id, idempotency_key) do nothing;

  if not found then
    select *
    into v_existing
    from public.transaction_idempotencies
    where user_id = v_user_id
      and idempotency_key = p_idempotency_key;

    if v_existing.request_payload is distinct from v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;

    return v_existing.response_payload || jsonb_build_object('replayed', true);
  end if;

  perform 1
  from public.banks
  where id = p_bank_id
    and user_id = v_user_id;

  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
  end if;

  select balance
  into v_balance
  from public.bank_pockets
  where bank_id = p_bank_id
    and pocket_type = 'cash'
  for update;

  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_type = 'withdraw' and v_balance < p_amount then
    raise exception 'INSUFFICIENT_CASH' using errcode = 'P0001';
  end if;

  update public.bank_pockets
  set balance = case
    when p_type = 'deposit' then balance + p_amount
    else balance - p_amount
  end
  where bank_id = p_bank_id
    and pocket_type = 'cash'
  returning balance into v_balance;

  insert into public.transactions (
    id,
    bank_id,
    pocket_type,
    type,
    amount,
    method,
    idempotency_key
  )
  values (
    v_transaction_id,
    p_bank_id,
    'cash',
    p_type,
    p_amount,
    p_method,
    p_idempotency_key
  );

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values ('transaction', v_transaction_id, 'created', v_user_id);

  v_response := jsonb_build_object(
    'transactionId', v_transaction_id,
    'balance', v_balance
  );

  update public.transaction_idempotencies
  set response_payload = v_response
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key;

  return v_response || jsonb_build_object('replayed', false);
end;
$$;
