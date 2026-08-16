drop policy catalog_teams_editor_insert on public.catalog_teams;
drop policy catalog_teams_manual_insert on public.catalog_teams;
drop policy catalog_competitions_editor_insert on public.catalog_competitions;
drop policy catalog_competitions_manual_insert on public.catalog_competitions;

create policy catalog_teams_insert on public.catalog_teams
  for insert to authenticated
  with check (
    public.is_catalog_editor()
    or (
      created_by = (select auth.uid())
      and normalization_status = 'manual'
      and provider is null
      and external_id is null
    )
  );

create policy catalog_competitions_insert on public.catalog_competitions
  for insert to authenticated
  with check (
    public.is_catalog_editor()
    or (
      created_by = (select auth.uid())
      and normalization_status = 'manual'
      and provider is null
      and external_id is null
      and sport is null
    )
  );
