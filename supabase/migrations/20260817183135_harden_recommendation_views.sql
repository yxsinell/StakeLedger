-- Remove Supabase default view privileges and cover Phase 4J foreign keys.

revoke all on table public.recommendation_feed
  from public, anon, authenticated, service_role;
grant select on table public.recommendation_feed to authenticated, service_role;

revoke all on table public.settled_bet_metric_trace
  from public, anon, authenticated, service_role;
grant select on table public.settled_bet_metric_trace to service_role;

create index recommendation_follows_bank_id_idx
  on public.recommendation_follows (bank_id);
create index recommendations_market_id_idx
  on public.recommendations (market_id);

comment on view public.recommendation_feed is
  'Published-only security-invoker feed. Authenticated roles have SELECT only.';
comment on view public.settled_bet_metric_trace is
  'Service-role-only security-invoker trace for settled-bet metrics.';
