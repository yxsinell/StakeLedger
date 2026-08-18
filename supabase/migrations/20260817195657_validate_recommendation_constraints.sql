-- Preserve upgradeability when the legacy table contains rows that predate ICP v1.
alter table public.recommendations disable trigger recommendations_enforce_integrity;

update public.recommendations
set status = 'inactive', updated_at = now()
where status <> 'inactive'
  and (
    not public.is_valid_recommendation_icp(icp)
    or pg_catalog.char_length(pg_catalog.btrim(selection)) not between 1 and 100
    or (rationale is not null and pg_catalog.char_length(pg_catalog.btrim(rationale)) not between 1 and 2000)
    or odds <> pg_catalog.trunc(odds, 4)
  );

alter table public.recommendations enable trigger recommendations_enforce_integrity;

alter table public.recommendations
  validate constraint recommendations_icp_v1_check,
  validate constraint recommendations_odds_precision_check,
  validate constraint recommendations_publish_consistency,
  validate constraint recommendations_rationale_length_check,
  validate constraint recommendations_selection_length_check;
