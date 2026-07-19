# Phase 2A Gap Analysis

Fase 2A inventaria el estado SDD real de StakeLedger contra PBI, SRS, OpenAPI, codigo y schema Supabase. Este reporte no implementa features; separa lo existente, lo parcial, lo faltante y los bloqueos que deben resolverse antes de codear.

## Scope

| Area | Resultado |
| --- | --- |
| Git baseline | `HEAD == origin/main == 385deb275eb0871120f2ac15ffc63e9793431050` |
| Ultimo commit | `385deb2 chore(tooling): add agentic workflow overlay` |
| Jira | No usado; no confirmado como source of truth |
| Supabase project | `ziqbjajprkoukezhgidr` desde `.agents/project.yaml` |
| Migracion remota | `20260301120426 init_core_ledger` |
| Archivos de codigo modificados | Ninguno |

## Source Documents

- `AGENTS.md`
- `.agents/project.yaml`
- `.context/business-data-map.md`
- `.context/PBI/epic-tree.md`
- `.context/PBI/epics/**`
- `.context/PRD/mvp-scope.md`
- `.context/SRS/functional-specs.md`
- `.context/SRS/api-contracts.yaml`
- `src/app/api/**`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/quick-actions.tsx`
- `src/types/supabase.ts`
- `middleware.ts`

## Status Legend

| Status | Meaning |
| --- | --- |
| implemented | Story behavior appears complete against SRS and acceptance intent |
| partial | Some schema, UI, or API exists, but story is not end-to-end complete |
| missing | No meaningful implementation found |
| blocked | Spec, data model, formula, or upstream dependency prevents safe implementation |

## Story Gap Matrix

| Story | Epic | Status | Evidence | Primary gap |
| --- | --- | --- | --- | --- |
| SL-2 | Identity and Access | partial | `/signup` and `auth-context.tsx` call Supabase `signUp`; `users` table exists | No `/api/auth/register`, no explicit password-strength policy layer, no API contract match |
| SL-3 | Identity and Access | partial | `/login` and `auth-context.tsx` call Supabase `signInWithPassword` | Dashboard not protected by middleware; no `/api/auth/login`; response shape not SRS |
| SL-4 | Identity and Access | missing | No reset-password route or UI found | Need password reset flow and non-enumerating response |
| SL-5 | Identity and Access | partial | `users.role` exists with `admin/editor/user` check | No admin role management UI/API; no RBAC enforcement map |
| SL-7 | Banks and Balances | partial | `banks` and `bank_pockets` tables exist; `/api/example` creates only `banks` | No `/api/banks`; no atomic pockets plus initial ledger transaction |
| SL-8 | Banks and Balances | partial | Dashboard lists recent banks and pockets | No operative balance calculation or dedicated bank detail endpoint |
| SL-9 | Banks and Balances | missing | No transfer endpoint or service logic | Need double-entry transfer behavior and transaction semantics |
| SL-10 | Banks and Balances | partial | `transactions` table exists | No `/api/transactions`; no deposit/withdraw validation and pocket update logic |
| SL-12 | Bets Ledger | partial | `bets` and `bet_legs` tables exist; dashboard lists bets | No `/api/bets`; no stake cap, leg creation transaction, or fund reservation |
| SL-13 | Bets Ledger | missing | No funding breakdown model or API found | Need cash/bonus/freebet allocation and freebet return rules |
| SL-14 | Bets Ledger | partial | `bets.status` exists | No settlement endpoint, result enum, return calculation, or ledger side effects |
| SL-15 | Bets Ledger | partial | `bet_cashouts` table exists | No cashout endpoint or split-ticket relationship |
| SL-16 | Bets Ledger | partial | `audit_logs` table exists | No append-only enforcement, triggers, or event catalog |
| SL-18 | Catalog and Normalization | missing | No catalog tables or endpoints | Need search/catalog schema and fallback strategy |
| SL-19 | Catalog and Normalization | missing | No manual catalog model | Need `UNNORMALIZED` status and manual entry workflow |
| SL-20 | Catalog and Normalization | blocked | Story asks aliases/upserts/admin maintenance | Provider, external ids, alias uniqueness, and concurrency rules incomplete |
| SL-22 | Goals and Risk Advisor | blocked | No goals schema | Daily profit and suggested odds formulas need confirmation |
| SL-23 | Goals and Risk Advisor | blocked | No goals schema or mission API | Depends on SL-22 formulas |
| SL-24 | Goals and Risk Advisor | missing | No goal recalculation model | Depends on settled bets from SL-14 |
| SL-25 | Goals and Risk Advisor | blocked | No risk limits schema | `cuota suicida` thresholds and defaults not defined |
| SL-26 | Goals and Risk Advisor | missing | No goal status model | Needs goals schema and close rules |
| SL-28 | Recommendations and Insights | blocked | No recommendations schema | ICP, normalized event model, and editor/admin publishing rules incomplete |
| SL-29 | Recommendations and Insights | partial | Dashboard has hardcoded recommendation feed | No `/api/recommendations`, filters, or real data |
| SL-30 | Recommendations and Insights | partial | Dashboard has visual `Seguir` button | No follow endpoint or bet prefill payload |
| SL-31 | Recommendations and Insights | blocked | Dashboard has static yield preview | Yield formulas depend on settlement, ledger, and operative balance definitions |

## Dependency Roadmap

1. SL-2, SL-3, SL-4, SL-5: auth foundation and RBAC.
2. RLS/security hardening: fix exposed grants and policy performance before expanding data surface.
3. SL-7, SL-8, SL-10, SL-9: banks, pockets, ledger movements.
4. SL-18, SL-19, SL-20: catalog before full bet and recommendation flows.
5. SL-12, SL-13, SL-14, SL-15, SL-16: bets ledger and audit.
6. SL-22, SL-23, SL-24, SL-25, SL-26: goals and risk advisor.
7. SL-28, SL-29, SL-30, SL-31: recommendations and insights.

## API Contract Gap

Real endpoints found:

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/api/health` | Health response only; not in SRS OpenAPI |
| GET | `/api/example` | Authenticated example endpoint; lists current user's `banks` |
| POST | `/api/example` | Creates a `banks` row only; not full SL-7 behavior |
| GET | `/api/openapi` | Generates dynamic OpenAPI document from app registry |
| OPTIONS | `/api/openapi` | CORS preflight |

SRS endpoints missing in code:

| Area | Missing routes |
| --- | --- |
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/reset-password` |
| Banks | `/api/banks`, `/api/banks/{bankId}`, `/api/banks/{bankId}/transfer` |
| Transactions | `/api/transactions` |
| Bets | `/api/bets`, `/api/bets/{betId}`, `/api/bets/{betId}/settle`, `/api/bets/{betId}/cashout` |
| Catalog | `/api/catalog/teams`, `/api/catalog/competitions`, `/api/catalog/manual` |
| Goals | `/api/goals`, `/api/goals/{goalId}`, `/api/goals/{goalId}/recalculate`, `/api/goals/{goalId}/close` |
| Recommendations | `/api/recommendations`, `/api/recommendations/{recommendationId}/follow` |
| Metrics | `/api/metrics/overview` |

Contract divergence:

- `/api/example` is a prototype, not part of SRS.
- Runtime responses do not consistently match SRS `{ success, ... }` shapes.
- `/api/openapi` generated output is not synced with `.context/SRS/api-contracts.yaml`.
- SRS declares bearer auth; runtime code also supports Supabase cookies through SSR helpers.

## DB Gap

Real public tables in Supabase and `src/types/supabase.ts`:

| Table | Covers | Gaps |
| --- | --- | --- |
| `users` | SL-2, SL-3, SL-5 partial | No admin management API; role policy not mapped to routes |
| `banks` | SL-7, SL-8 partial | No primary bank, update fields, or derived balance fields |
| `bank_pockets` | SL-7, SL-8 partial | No atomic seed process documented in API |
| `transactions` | SL-9, SL-10 partial | No strict transaction type enum or double-entry transfer model |
| `bets` | SL-12, SL-14 partial | No stake level, settlement result, profit/return, funding fields |
| `bet_legs` | SL-12 partial | No normalized event relationship |
| `bet_cashouts` | SL-15 partial | No split ticket links |
| `audit_logs` | SL-16 partial | No append-only enforcement or immutable trigger |

Missing model areas:

- Catalog: teams, competitions, aliases, normalization status, external providers.
- Goals: goals, goal history, risk limits, recalculation snapshots.
- Recommendations: recommendations, follows, normalized events/markets, ICP fields.
- Metrics: views or functions for yield cash, yield operative, win rate.

## Business Data Map Gap

`.context/business-data-map.md` is still a placeholder template. It cannot be used as a business source of truth yet.

Impact:

- Entity comparison must rely on PBI, SRS, OpenAPI, and Supabase schema.
- Flow/state-machine decisions for goals, cashout, settlement, and recommendations remain under-specified.
- Before broad implementation, this document should be replaced with real StakeLedger business data map.

## Supabase Findings

| Category | Finding | Impact |
| --- | --- | --- |
| Security | All core tables are visible in GraphQL schema to anon because anon has `SELECT` grants | External discoverability risk; fix grants before expanding API surface |
| Security | All core tables visible in GraphQL schema to authenticated users | Broad discoverability risk; decide intended GraphQL exposure |
| Security | Leaked password protection disabled | Auth hardening gap for SL-2/SL-3 |
| RLS | RLS enabled on all 8 core tables | Good baseline |
| Performance | RLS policies call `auth.uid()` directly | Replace with `(select auth.uid())` in policies to avoid per-row re-evaluation |
| Migrations | Remote has `init_core_ledger`; local `supabase/migrations/*` not found | Migration source-of-truth needs clarification before DB changes |

## DB/API/UI/Test/RLS Map

| Story group | DB migration first | API | UI | Tests | RLS |
| --- | --- | --- | --- | --- | --- |
| SL-2 to SL-4 | Maybe auth config; no public schema for reset | Yes | Yes | Unit, API, E2E | Users policies |
| SL-5 | Yes for role/admin policies | Yes | Yes | Unit, API, E2E, RLS | Strong RBAC required |
| SL-7 to SL-10 | Yes for ledger hardening and transaction semantics | Yes | Yes | Unit, API, E2E, RLS | Banks/pockets/transactions ownership |
| SL-12 to SL-16 | Yes for funding, settlement, audit hardening | Yes | Yes | Unit, API, E2E, RLS | Bets, legs, cashouts, audit ownership |
| SL-18 to SL-20 | Yes for catalog entities and aliases | Yes | Yes | Unit, API, E2E, admin/RLS | Catalog visibility and admin write rules |
| SL-22 to SL-26 | Yes for goals/risk models | Yes | Yes | Unit for formulas, API, E2E, RLS | Goal ownership |
| SL-28 to SL-31 | Yes for recommendations/follows/metrics | Yes | Yes | Unit, API, E2E, RLS | Public/feed vs owner/follow scopes |

## Blockers

- Business data map is placeholder.
- No local migration files found while Supabase remote has one migration.
- Story-level `implementation-plan.md` files are absent.
- Epic docs reference `feature-implementation-plan.md`, but only `feature-test-plan.md` exists.
- Formulas are not closed for operative balance, stake level, daily profit, suggested odds, risk limits, yield cash, yield operative, and win rate.
- Freebet returns, half win/loss settlement, and cashout split rules need explicit business rules.
- RBAC route/action matrix is missing.
- Catalog provider, alias, update cadence, and conflict strategy are not defined.
- Recommendations require normalized event and ICP definitions before implementation.

## Recommended Next Action

Before coding features, create or approve:

1. Real `.context/business-data-map.md` for StakeLedger.
2. DB migration source-of-truth policy: local Supabase migrations vs remote-only MCP migrations.
3. One implementation plan per next story group, starting with auth/RLS and banks ledger.
