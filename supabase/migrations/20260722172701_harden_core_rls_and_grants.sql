-- Supabase client remains the approved access path for profile and owner-scoped reads.
-- Sensitive monetary and lifecycle writes intentionally have no direct client policy.
-- SECURITY DEFINER avoids recursive RLS when policies evaluate staff roles.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create function public.is_catalog_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_catalog_editor() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_catalog_editor() to authenticated;

revoke all on table public.users, public.banks, public.bank_pockets,
  public.transactions, public.bets, public.bet_legs, public.bet_cashouts,
  public.audit_logs from anon, authenticated;

grant select, insert, update on table public.users to authenticated;
grant select, insert, update, delete on table public.banks to authenticated;
grant select on table public.bank_pockets to authenticated;
grant select on table public.transactions, public.bet_cashouts, public.audit_logs to authenticated;
grant select on table public.bets, public.bet_legs to authenticated;

drop policy if exists users_delete_own on public.users;
drop policy if exists users_insert_own on public.users;
drop policy if exists users_select_own on public.users;
drop policy if exists users_update_own on public.users;
drop policy if exists banks_delete_own on public.banks;
drop policy if exists banks_insert_own on public.banks;
drop policy if exists banks_select_own on public.banks;
drop policy if exists banks_update_own on public.banks;
drop policy if exists bank_pockets_delete_own on public.bank_pockets;
drop policy if exists bank_pockets_insert_own on public.bank_pockets;
drop policy if exists bank_pockets_select_own on public.bank_pockets;
drop policy if exists bank_pockets_update_own on public.bank_pockets;
drop policy if exists transactions_delete_own on public.transactions;
drop policy if exists transactions_insert_own on public.transactions;
drop policy if exists transactions_select_own on public.transactions;
drop policy if exists transactions_update_own on public.transactions;
drop policy if exists bets_delete_own on public.bets;
drop policy if exists bets_insert_own on public.bets;
drop policy if exists bets_select_own on public.bets;
drop policy if exists bets_update_own on public.bets;
drop policy if exists bet_legs_delete_own on public.bet_legs;
drop policy if exists bet_legs_insert_own on public.bet_legs;
drop policy if exists bet_legs_select_own on public.bet_legs;
drop policy if exists bet_legs_update_own on public.bet_legs;
drop policy if exists bet_cashouts_delete_own on public.bet_cashouts;
drop policy if exists bet_cashouts_insert_own on public.bet_cashouts;
drop policy if exists bet_cashouts_select_own on public.bet_cashouts;
drop policy if exists bet_cashouts_update_own on public.bet_cashouts;
drop policy if exists audit_logs_delete_own on public.audit_logs;
drop policy if exists audit_logs_insert_own on public.audit_logs;
drop policy if exists audit_logs_select_own on public.audit_logs;
drop policy if exists audit_logs_update_own on public.audit_logs;

create policy users_select_own_or_admin on public.users
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy users_insert_own_profile on public.users
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'user'
    and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );

create policy users_update_own_profile on public.users
  for update to authenticated
  using (id = (select auth.uid()) and role = 'user')
  with check (
    id = (select auth.uid())
    and role = 'user'
    and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );

create policy users_admin_update on public.users
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy banks_owner_access on public.banks
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy bank_pockets_owner_select on public.bank_pockets
  for select to authenticated
  using (
    exists (
      select 1 from public.banks
      where banks.id = bank_pockets.bank_id
        and banks.user_id = (select auth.uid())
    )
  );

create policy transactions_owner_select on public.transactions
  for select to authenticated
  using (
    exists (
      select 1 from public.banks
      where banks.id = transactions.bank_id
        and banks.user_id = (select auth.uid())
    )
  );

create policy bets_owner_select on public.bets
  for select to authenticated
  using (
    exists (
      select 1 from public.banks
      where banks.id = bets.bank_id
        and banks.user_id = (select auth.uid())
    )
  );

create policy bet_legs_owner_select on public.bet_legs
  for select to authenticated
  using (
    exists (
      select 1
      from public.bets
      join public.banks on banks.id = bets.bank_id
      where bets.id = bet_legs.bet_id
        and banks.user_id = (select auth.uid())
    )
  );

create policy bet_cashouts_owner_select on public.bet_cashouts
  for select to authenticated
  using (
    exists (
      select 1
      from public.bets
      join public.banks on banks.id = bets.bank_id
      where bets.id = bet_cashouts.bet_id
        and banks.user_id = (select auth.uid())
    )
  );

create policy audit_logs_owner_or_admin_select on public.audit_logs
  for select to authenticated
  using (
    actor_id = (select auth.uid())
    or public.is_admin()
    or (entity_type = 'bank' and exists (
      select 1 from public.banks
      where banks.id = audit_logs.entity_id
        and banks.user_id = (select auth.uid())
    ))
    or (entity_type = 'transaction' and exists (
      select 1
      from public.transactions
      join public.banks on banks.id = transactions.bank_id
      where transactions.id = audit_logs.entity_id
        and banks.user_id = (select auth.uid())
    ))
    or (entity_type = 'bet' and exists (
      select 1
      from public.bets
      join public.banks on banks.id = bets.bank_id
      where bets.id = audit_logs.entity_id
        and banks.user_id = (select auth.uid())
    ))
  );
