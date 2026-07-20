# Phase 3A DB Migration And RLS Plan

Este documento captura la auditoria read-only de la DB real de StakeLedger y el plan de migrations/RLS para Phase 3B. No se crearon migrations, no se modifico la DB live, no se regeneraron types y no se tocaron archivos en `src/`.

## Executive Summary

La DB live contiene solo el baseline minimo de ledger (`init_core_ledger`). Sirve como punto de partida, pero no alcanza para implementar los planes SDD actuales: faltan catalogo, goals, recommendations, risk limits, metrics y varias piezas contables para bets.

La prioridad correcta es endurecer el baseline existente antes de agregar nuevas entidades. El problema no es solo que falten tablas; el problema mas importante es que el modelo actual permite demasiadas operaciones sobre tablas sensibles y todavia no tiene semantica contable suficiente para settlement, cashout, goals y metrics.

## Evidence

| Source | Finding |
| --- | --- |
| Git | `main` estaba limpio y alineado con `origin/main` en `abab5a2 chore(tooling): harden lint and dependency baseline`. |
| Local repo | No existe carpeta `supabase/`. |
| Supabase project | `ziqbjajprkoukezhgidr`, status `ACTIVE_HEALTHY`, Postgres 17. |
| Live migrations | Solo `20260301120426 init_core_ledger`. |
| Generated types | `src/types/supabase.ts` contiene solo tablas core de ledger y no contiene enums publicos. |
| Business map | `.context/business-data-map.md` es placeholder; no puede usarse como fuente real de relaciones de negocio. |
| SDD plans | Los implementation plans marcan catalogo, bets accounting, goals, recommendations y metrics como migration-first. |

## Live Schema Snapshot

| Table | Current state | Gap |
| --- | --- | --- |
| `users` | `id`, `email`, `role`, `created_at`; RLS enabled; role check text. | RBAC admin policy incomplete; broad grants; no trigger profile sync. |
| `banks` | Basic owner bank records. | Currency/uniqueness/soft-delete decisions missing. |
| `bank_pockets` | `cash`, `bonus`, `freebet` check; unique `(bank_id, pocket_type)`. | Balance mutation should be RPC/server-only; no monetary precision policy. |
| `transactions` | Basic movement rows. | No transaction type check, transfer grouping, idempotency, related entity, or signed/double-entry model. |
| `bets` | Basic `bank_id`, `stake_amount`, `status`, `odds`, `created_at`. | Missing stake level, funding, result, return/profit, settlement, goal link, catalog refs, idempotency. |
| `bet_legs` | Text market/selection/odds. | No catalog/event refs or normalization status. |
| `bet_cashouts` | Basic cashout amount and remaining stake. | No split relationship, open/closed bet trace, ledger relation, idempotency. |
| `audit_logs` | Basic actor/entity/action records. | Update/delete allowed by grants/policies; no append-only trigger; no action catalog. |

## Supabase Advisor Findings

| Category | Finding | Phase 3B action |
| --- | --- | --- |
| Security | Core public tables are visible in GraphQL to `anon` because `anon` has `SELECT`. | Revoke table grants from `anon`; expose data through authenticated RLS/API only. |
| Security | Core public tables are visible in GraphQL to `authenticated` because broad grants exist. | Decide Supabase client vs API-only. Then narrow grants to least privilege. |
| Security | Leaked password protection disabled. | Enable in Supabase Auth outside migration SQL, or document as platform config step. |
| Performance | RLS policies call `auth.uid()` directly. | Rewrite policies with `(select auth.uid())`. |
| Performance | Existing indexes reported unused. | Keep for now; zero-row tables make unused-index advisor low signal. Reassess after data/use. |

## Missing Tables

| Table | Required by | Notes |
| --- | --- | --- |
| `catalog_teams` | SL-18, SL-19, SL-20 | Needed if catalog uses separated tables. |
| `catalog_competitions` | SL-18, SL-19, SL-20 | Needed if catalog uses separated tables. |
| `catalog_aliases` | SL-20 | Needs normalization and uniqueness decision. |
| `catalog_events` | SL-28, SL-30, SL-31 | Not explicitly requested, but recommendations need normalized event references. |
| `catalog_markets` | SL-28, SL-30 | Optional if market remains text; stronger if normalized. |
| `bet_funding` | SL-13, SL-14 | Required for cash/bonus/freebet settlement. |
| `goals` | SL-22 to SL-26 | Core goal entity. |
| `goal_history` or `goal_events` | SL-23, SL-24, SL-26 | Plans use `goal_history`; prompt names `goal_events`. Decide one before migration. |
| `risk_limits` | SL-25 | User-level limits and defaults. |
| `recommendations` | SL-28, SL-29 | Published feed and admin/editor publishing. |
| `recommendation_follows` | SL-30 | Required only if follow is persisted. |

## Migration Order

| Order | Migration | Scope | Why now |
| --- | --- | --- | --- |
| 0 | `baseline_remote_schema_locally` | Create local `supabase/` source of truth from live schema. | Cannot safely evolve DB without local migration history. |
| 1 | `harden_existing_rls_and_grants` | Revoke broad grants, rewrite RLS with `(select auth.uid())`, block unsafe audit writes. | Fixes security/performance baseline before adding more tables. |
| 2 | `ledger_constraints_and_rpc_foundation` | Transaction types, amount/balance checks, transfer grouping, idempotency, RPC strategy. | Banks, bets, goals and metrics depend on reliable money movement. |
| 3 | `catalog_core` | Catalog tables, aliases, normalization status, provider ids, search indexes. | Bets and recommendations need normalized or explicitly unnormalized references. |
| 4 | `bets_accounting_core` | Bets columns, bet funding, status/result model, catalog refs, reservation linkage. | Enables ticket creation and funding without ambiguous accounting. |
| 5 | `settlement_cashout_audit` | Settlement fields, cashout split refs, audit append-only trigger, action catalog. | Metrics and goals need settled/profit data and immutable evidence. |
| 6 | `goals_and_risk` | Goals, goal history/events, risk limits, goal-bet linkage. | Goals depend on banks and settled bet semantics. |
| 7 | `recommendations` | Recommendations, follows, published/draft state, RBAC policies. | Recommendations depend on catalog and roles. |
| 8 | `metrics_views` | Metrics views/functions/indexes. | Metrics should be last because formulas depend on settlement and ledger decisions. |

## RLS Matrix

| Table group | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| `users` | Own profile; admin read if SL-5 approves. | Own profile or auth trigger only. | Own non-role fields; admin only for role. | Prefer disabled. |
| `banks` | Owner only. | Owner only. | Owner only. | Owner only or soft-delete. |
| `bank_pockets` | Owner through bank. | Server/RPC or owner during bank create. | Server/RPC only. | Disabled. |
| `transactions` | Owner through bank. | Server/RPC only. | Disabled except correction workflow approved later. | Disabled. |
| `bets` | Owner through bank. | Owner through bank, preferably RPC. | Controlled by lifecycle services. | Disabled. |
| `bet_legs` | Owner through bet. | With bet create/update service. | Controlled by bet lifecycle. | Disabled. |
| `bet_cashouts` | Owner through bet. | Cashout service only. | Disabled. | Disabled. |
| `audit_logs` | Owner by entity; admin optional. | Server/RPC only. | Disabled by policy and trigger. | Disabled by policy and trigger. |
| `catalog_*` | Authenticated read. | Admin/editor only. | Admin/editor only. | Admin/editor only or soft-delete. |
| `goals` | Owner only. | Owner only, bank must be own. | Owner lifecycle changes. | Prefer close/cancel, not delete. |
| `goal_history` or `goal_events` | Owner through goal. | Server/RPC only. | Disabled. | Disabled. |
| `risk_limits` | Owner only. | Owner only. | Owner only. | Owner reset/delete optional. |
| `recommendations` | Published rows to authenticated; drafts to admin/editor. | Admin/editor only. | Admin/editor only. | Prefer status change. |
| `recommendation_follows` | Owner only. | Owner only, recommendation must be active. | Disabled or limited metadata only. | Owner optional. |
| Metrics views | Owner-scoped through underlying banks/bets. | Not applicable. | Not applicable. | Not applicable. |

## Constraints, Indexes, And Enums

| Area | Design |
| --- | --- |
| Roles | Keep `admin`, `editor`, `user`; consider enum only after RBAC matrix is fixed. |
| Pocket types | `cash`, `bonus`, `freebet`; current check is acceptable. |
| Transaction types | Add approved catalog: `initial_deposit`, `deposit`, `withdraw`, `transfer_debit`, `transfer_credit`, `bet_reserve`, `bet_return`, `cashout_return`, `adjustment`. |
| Money | All amounts finite, non-negative where stored as balance, positive where stored as movement. Define decimal precision before Phase 3B. |
| Banks | Consider unique `(user_id, lower(name))` only if duplicate bank names are disallowed. |
| Transfers | Add `transfer_id`, `direction`, optional `idempotency_key`; index `(bank_id, created_at desc)`. |
| Bets | `odds > 1.0`, `stake_amount > 0`, status/result constraints, one settlement per bet. |
| Funding | Unique `(bet_id, pocket_type)`, amount `>= 0`, at least one positive amount enforced in service or constraint. |
| Cashout | `cashout_amount > 0`, `remaining_stake > 0`, trace split with `source_bet_id` or `split_group_id`. |
| Audit | Append-only trigger, action/entity type catalog, index `(entity_type, entity_id, created_at desc, id desc)`. |
| Catalog | Unique `(provider, external_id, entity_type)` when provider exists; alias uniqueness scope must be approved. |
| Goals | `target_amount > base_amount`, status constraint, indexes `(user_id, status)` and `(bank_id, status)`. |
| Recommendations | Status/type constraints, index `(status, type, published_at desc, id desc)`. |
| Metrics | Add views/functions only after settlement fields exist; index `bets(bank_id, settled_at)` when column exists. |

## Rollback Plan

| Migration type | Rollback approach |
| --- | --- |
| Baseline local files | Revert files only; no DB rollback. |
| Grants/RLS | Store previous grants/policies in migration comments or audit notes; rollback by recreating previous policies/grants. |
| Constraints | Add as `not valid` first where useful; rollback with `drop constraint` if production data blocks rollout. |
| New tables | Drop in reverse dependency order while no production data depends on them. |
| New columns | Add nullable/default-safe first; rollback with `drop column` only before app code depends on them. |
| Enums | Avoid early enums for unstable domains; enum rollback is expensive. Prefer checks until values stabilize. |
| Triggers/functions | Rollback with `drop trigger` and `drop function`; preserve audit rows. |
| Views/functions for metrics | Drop view/function; no data loss. |

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| No local Supabase migration folder | DB changes cannot be reviewed or replayed safely. | Phase 3B must start with local baseline. |
| Business data map is placeholder | Entity relationships may be inferred from incomplete docs. | Replace business map or approve this DB model explicitly. |
| Broad grants to `anon` and `authenticated` | Schema exposure and larger attack surface. | Harden grants before feature tables. |
| API-only vs Supabase client unresolved | RLS/grants may break current or future UI. | Decide architecture before hardening. |
| Ledger semantics incomplete | Balances, goals and metrics can become untrustworthy. | Close transaction/RPC/idempotency model first. |
| Freebet/bonus rules unresolved | Settlement and profit can be wrong. | Define return rules before SL-13/SL-14 migrations. |
| Goal history naming mismatch | API/types/docs drift. | Choose `goal_history` or `goal_events` once. |
| Catalog model unresolved | Bets/recommendations references may need rework. | Decide separated tables vs unified model before catalog migration. |
| ICP undefined | Recommendations cannot validate business quality. | Define ICP fields and ranges before recommendations migration. |

## Blocking Questions

| Question | Blocks |
| --- | --- |
| Should StakeLedger use API-only data access or allow Supabase client direct writes? | Grants and RLS style. |
| Should Phase 3B create local `supabase/` by pulling/baselining live schema? | All migrations. |
| Should goal snapshots be named `goal_history` or `goal_events`? | Goals migration and generated types. |
| What monetary precision and rounding rule is official? | Ledger, bets, goals, metrics. |
| Should money mutations happen through SQL RPCs or server-side app transactions? | Atomicity and RLS for banks/bets. |
| What are exact bonus/freebet return rules? | Funding and settlement. |
| Is catalog separated (`teams`, `competitions`, `aliases`) or unified (`catalog_items` + aliases)? | Catalog migration. |
| Are events and markets normalized tables or text fields in MVP? | Bets and recommendations. |
| What are ICP fields and valid ranges? | Recommendation publish flow. |
| Should metrics be DB views/functions or TypeScript service queries? | Metrics migration. |

## Recommended Phase 3B Entry Checklist

- Confirm DB access architecture: API-only or Supabase client direct.
- Create local `supabase/` baseline from live project before new migrations.
- Approve RLS hardening policy and grants strategy.
- Decide `goal_history` vs `goal_events`.
- Decide monetary precision and ledger transaction model.
- Replace placeholder business data map or explicitly approve this schema plan as interim source.
- Create migrations in the order defined above.
- Regenerate `src/types/supabase.ts` only after DB changes are applied.
- Run Supabase security and performance advisors after every migration batch.
