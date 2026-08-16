revoke all
  on table public.catalog_teams, public.catalog_competitions,
  public.catalog_aliases, public.catalog_events, public.catalog_markets
  from authenticated;

grant select
  on table public.catalog_teams, public.catalog_competitions,
  public.catalog_aliases, public.catalog_events, public.catalog_markets
  to authenticated;
