alter table public.banks
  drop constraint banks_currency_iso_code,
  add constraint banks_currency_allowed check (currency in ('EUR', 'USD', 'ARS'));

create unique index banks_user_normalized_name_key
  on public.banks (user_id, lower(btrim(name)));

revoke insert, update, delete on table public.banks from authenticated;

drop policy if exists banks_owner_access on public.banks;

create policy banks_owner_select on public.banks
  for select to authenticated
  using (user_id = (select auth.uid()));

create function public.create_bank_with_pockets(
  p_name text,
  p_currency text,
  p_initial_cash numeric,
  p_initial_bonus numeric,
  p_initial_freebet numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(p_name);
  v_currency text := upper(btrim(p_currency));
  v_bank public.banks%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if v_name is null or v_name = '' or char_length(v_name) > 100 then
    raise exception 'Bank name is invalid' using errcode = '22023';
  end if;

  if v_currency not in ('EUR', 'USD', 'ARS') then
    raise exception 'Bank currency is invalid' using errcode = '22023';
  end if;

  if p_initial_cash is null
    or p_initial_bonus is null
    or p_initial_freebet is null
    or p_initial_cash <= 0
    or p_initial_bonus <= 0
    or p_initial_freebet <= 0
    or p_initial_cash <> trunc(p_initial_cash, 2)
    or p_initial_bonus <> trunc(p_initial_bonus, 2)
    or p_initial_freebet <> trunc(p_initial_freebet, 2)
    or p_initial_cash > 999999999999.99
    or p_initial_bonus > 999999999999.99
    or p_initial_freebet > 999999999999.99 then
    raise exception 'Initial pocket amounts must be positive values with at most two decimals'
      using errcode = '22023';
  end if;

  insert into public.banks (user_id, name, currency)
  values (v_user_id, v_name, v_currency)
  returning * into v_bank;

  insert into public.bank_pockets (bank_id, pocket_type, balance)
  values
    (v_bank.id, 'cash', p_initial_cash),
    (v_bank.id, 'bonus', p_initial_bonus),
    (v_bank.id, 'freebet', p_initial_freebet);

  insert into public.transactions (bank_id, pocket_type, type, amount)
  values
    (v_bank.id, 'cash', 'initial_deposit', p_initial_cash),
    (v_bank.id, 'bonus', 'initial_deposit', p_initial_bonus),
    (v_bank.id, 'freebet', 'initial_deposit', p_initial_freebet);

  return jsonb_build_object(
    'id', v_bank.id,
    'name', v_bank.name,
    'currency', v_bank.currency,
    'balances', jsonb_build_object(
      'cash', p_initial_cash,
      'bonus', p_initial_bonus,
      'freebet', p_initial_freebet,
      'operative', p_initial_cash
    )
  );
end;
$$;

revoke all on function public.create_bank_with_pockets(text, text, numeric, numeric, numeric)
  from public, anon;
grant execute on function public.create_bank_with_pockets(text, text, numeric, numeric, numeric)
  to authenticated;
