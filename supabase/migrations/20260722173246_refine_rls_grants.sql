revoke all on table public.users, public.banks, public.bank_pockets,
  public.transactions, public.bets, public.bet_legs, public.bet_cashouts,
  public.audit_logs, public.catalog_teams, public.catalog_competitions,
  public.catalog_aliases, public.catalog_events, public.catalog_markets,
  public.bet_funding, public.goals, public.goal_history, public.risk_limits,
  public.recommendations, public.recommendation_follows from anon;

alter default privileges in schema public revoke all on tables from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_catalog_editor() from anon;

drop policy users_insert_own_profile on public.users;
drop policy users_update_own_profile on public.users;
drop policy users_admin_update on public.users;

create policy users_insert_own_profile on public.users
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'user'
    and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
  );

create policy users_update_own_or_admin on public.users
  for update to authenticated
  using ((id = (select auth.uid()) and role = 'user') or public.is_admin())
  with check (
    (
      id = (select auth.uid())
      and role = 'user'
      and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
    )
    or public.is_admin()
  );

drop policy audit_logs_owner_or_admin_select on public.audit_logs;
drop policy audit_logs_goal_owner_select on public.audit_logs;

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
    or (entity_type = 'goal' and exists (
      select 1 from public.goals
      where goals.id = audit_logs.entity_id
        and goals.user_id = (select auth.uid())
    ))
  );

drop policy catalog_teams_editor_write on public.catalog_teams;
drop policy catalog_competitions_editor_write on public.catalog_competitions;
drop policy catalog_aliases_editor_write on public.catalog_aliases;
drop policy catalog_events_editor_write on public.catalog_events;
drop policy catalog_markets_editor_write on public.catalog_markets;

create policy catalog_teams_editor_insert on public.catalog_teams
  for insert to authenticated with check (public.is_catalog_editor());
create policy catalog_teams_editor_update on public.catalog_teams
  for update to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_teams_editor_delete on public.catalog_teams
  for delete to authenticated using (public.is_catalog_editor());
create policy catalog_competitions_editor_insert on public.catalog_competitions
  for insert to authenticated with check (public.is_catalog_editor());
create policy catalog_competitions_editor_update on public.catalog_competitions
  for update to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_competitions_editor_delete on public.catalog_competitions
  for delete to authenticated using (public.is_catalog_editor());
create policy catalog_aliases_editor_insert on public.catalog_aliases
  for insert to authenticated with check (public.is_catalog_editor());
create policy catalog_aliases_editor_update on public.catalog_aliases
  for update to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_aliases_editor_delete on public.catalog_aliases
  for delete to authenticated using (public.is_catalog_editor());
create policy catalog_events_editor_insert on public.catalog_events
  for insert to authenticated with check (public.is_catalog_editor());
create policy catalog_events_editor_update on public.catalog_events
  for update to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_events_editor_delete on public.catalog_events
  for delete to authenticated using (public.is_catalog_editor());
create policy catalog_markets_editor_insert on public.catalog_markets
  for insert to authenticated with check (public.is_catalog_editor());
create policy catalog_markets_editor_update on public.catalog_markets
  for update to authenticated using (public.is_catalog_editor()) with check (public.is_catalog_editor());
create policy catalog_markets_editor_delete on public.catalog_markets
  for delete to authenticated using (public.is_catalog_editor());
