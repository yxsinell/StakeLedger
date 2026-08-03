create function public.record_cash_transfer(
  p_source_bank_id uuid,
  p_destination_bank_id uuid,
  p_amount numeric,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_debit_transaction_id uuid := gen_random_uuid();
  v_credit_transaction_id uuid := gen_random_uuid();
  v_transfer_id uuid := gen_random_uuid();
  v_payload jsonb;
  v_existing public.transaction_idempotencies%rowtype;
  v_source_user_id uuid;
  v_destination_user_id uuid;
  v_source_currency text;
  v_destination_currency text;
  v_source_balance numeric(14, 2);
  v_destination_balance numeric(14, 2);
  v_first_balance numeric(14, 2);
  v_response jsonb;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '28000';
  end if;

  if p_source_bank_id is null
    or p_destination_bank_id is null
    or p_source_bank_id = p_destination_bank_id
    or p_idempotency_key is null
    or p_amount is null
    or p_amount <= 0
    or p_amount <> trunc(p_amount, 2)
    or p_amount > 999999999999.99 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  v_payload := jsonb_build_object(
    'fromBankId', p_source_bank_id,
    'toBankId', p_destination_bank_id,
    'amount', p_amount
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
    v_debit_transaction_id,
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

  select user_id, currency
  into v_source_user_id, v_source_currency
  from public.banks
  where id = p_source_bank_id;

  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_source_user_id <> v_user_id then
    raise exception 'BANK_FORBIDDEN' using errcode = 'P0001';
  end if;

  select user_id, currency
  into v_destination_user_id, v_destination_currency
  from public.banks
  where id = p_destination_bank_id;

  if not found then
    raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_destination_user_id <> v_user_id then
    raise exception 'BANK_FORBIDDEN' using errcode = 'P0001';
  end if;

  if v_source_currency <> v_destination_currency then
    raise exception 'CURRENCY_MISMATCH' using errcode = '22023';
  end if;

  if p_source_bank_id < p_destination_bank_id then
    select balance
    into v_first_balance
    from public.bank_pockets
    where bank_id = p_source_bank_id
      and pocket_type = 'cash'
    for update;

    if not found then
      raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
    end if;

    v_source_balance := v_first_balance;

    select balance
    into v_destination_balance
    from public.bank_pockets
    where bank_id = p_destination_bank_id
      and pocket_type = 'cash'
    for update;

    if not found then
      raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
    end if;
  else
    select balance
    into v_first_balance
    from public.bank_pockets
    where bank_id = p_destination_bank_id
      and pocket_type = 'cash'
    for update;

    if not found then
      raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
    end if;

    v_destination_balance := v_first_balance;

    select balance
    into v_source_balance
    from public.bank_pockets
    where bank_id = p_source_bank_id
      and pocket_type = 'cash'
    for update;

    if not found then
      raise exception 'BANK_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  if v_source_balance < p_amount then
    raise exception 'INSUFFICIENT_CASH' using errcode = 'P0001';
  end if;

  update public.bank_pockets
  set balance = balance - p_amount
  where bank_id = p_source_bank_id
    and pocket_type = 'cash'
  returning balance into v_source_balance;

  update public.bank_pockets
  set balance = balance + p_amount
  where bank_id = p_destination_bank_id
    and pocket_type = 'cash'
  returning balance into v_destination_balance;

  insert into public.transactions (
    id,
    bank_id,
    pocket_type,
    type,
    amount,
    transfer_id,
    idempotency_key
  )
  values (
    v_debit_transaction_id,
    p_source_bank_id,
    'cash',
    'transfer_debit',
    p_amount,
    v_transfer_id,
    p_idempotency_key
  );

  insert into public.transactions (
    id,
    bank_id,
    pocket_type,
    type,
    amount,
    transfer_id,
    related_transaction_id
  )
  values (
    v_credit_transaction_id,
    p_destination_bank_id,
    'cash',
    'transfer_credit',
    p_amount,
    v_transfer_id,
    v_debit_transaction_id
  );

  update public.transactions
  set related_transaction_id = v_credit_transaction_id
  where id = v_debit_transaction_id;

  insert into public.audit_logs (entity_type, entity_id, action, actor_id)
  values
    ('transaction', v_debit_transaction_id, 'created', v_user_id),
    ('transaction', v_credit_transaction_id, 'created', v_user_id);

  v_response := jsonb_build_object(
    'transferId', v_transfer_id,
    'sourceBalance', v_source_balance,
    'destinationBalance', v_destination_balance
  );

  update public.transaction_idempotencies
  set response_payload = v_response
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key;

  return v_response || jsonb_build_object('replayed', false);
end;
$$;

revoke all on function public.record_cash_transfer(uuid, uuid, numeric, uuid)
  from public, anon, service_role;
grant execute on function public.record_cash_transfer(uuid, uuid, numeric, uuid)
  to authenticated;
