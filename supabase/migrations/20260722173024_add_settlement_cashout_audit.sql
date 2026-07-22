alter table public.bets
  add column settled_at timestamptz,
  add column settlement_amount numeric(14, 2),
  add constraint bets_settlement_amount_non_negative check (settlement_amount is null or settlement_amount >= 0);

alter table public.bet_cashouts
  alter column cashout_amount type numeric(14, 2),
  alter column remaining_stake type numeric(14, 2),
  add column source_bet_id uuid references public.bets (id) on delete restrict,
  add column split_group_id uuid,
  add column idempotency_key uuid,
  add constraint bet_cashouts_amount_positive check (cashout_amount > 0),
  add constraint bet_cashouts_remaining_stake_positive check (remaining_stake > 0);

alter table public.audit_logs
  add constraint audit_logs_entity_type_check check (entity_type in ('bank', 'transaction', 'bet', 'goal', 'recommendation', 'catalog')),
  add constraint audit_logs_action_check check (action in ('created', 'updated', 'deleted', 'reserved', 'settled', 'cashout', 'closed', 'published', 'followed', 'unfollowed'));

create index bets_bank_settled_at_idx
  on public.bets (bank_id, settled_at desc, id desc)
  where settled_at is not null;
create index bet_cashouts_bet_created_at_idx on public.bet_cashouts (bet_id, created_at desc, id desc);
create unique index bet_cashouts_bet_idempotency_key_idx
  on public.bet_cashouts (bet_id, idempotency_key)
  where idempotency_key is not null;
create index audit_logs_entity_created_at_idx
  on public.audit_logs (entity_type, entity_id, created_at desc, id desc);

-- Enforces immutable audit evidence even for privileged write paths.
create function public.reject_audit_log_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

create trigger audit_logs_reject_mutation
before update or delete on public.audit_logs
for each row execute function public.reject_audit_log_mutation();
