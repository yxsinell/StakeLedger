alter table public.bank_pockets
  alter column balance type numeric(14, 2),
  add constraint bank_pockets_balance_non_negative check (balance >= 0);

alter table public.banks
  add constraint banks_name_not_blank check (btrim(name) <> ''),
  add constraint banks_currency_iso_code check (currency ~ '^[A-Z]{3}$');

alter table public.transactions
  alter column amount type numeric(14, 2),
  add column transfer_id uuid,
  add column related_transaction_id uuid references public.transactions (id) on delete restrict,
  add column idempotency_key uuid,
  add constraint transactions_type_check check (
    type in (
      'initial_deposit', 'deposit', 'withdraw', 'transfer_debit',
      'transfer_credit', 'bet_reserve', 'bet_return', 'cashout_return', 'adjustment',
      'bonus_credit', 'freebet_credit'
    )
  ),
  add constraint transactions_amount_positive check (amount > 0),
  add constraint transactions_method_not_blank check (method is null or btrim(method) <> ''),
  add constraint transactions_method_length check (method is null or char_length(method) <= 50);

create index transactions_transfer_id_idx
  on public.transactions (transfer_id)
  where transfer_id is not null;
create unique index transactions_bank_idempotency_key_idx
  on public.transactions (bank_id, idempotency_key)
  where idempotency_key is not null;
