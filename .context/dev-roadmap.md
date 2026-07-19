# Development Roadmap

This roadmap turns the Phase 2A inventory into build order. It is intentionally dependency-first: each slice should leave the product safer to extend than before.

## Next Slice

Start with auth and security hardening, then banks ledger. Do not jump to recommendations, goals, or metrics until balance and settlement semantics are stable.

## Roadmap

| Order | Slice | Stories | Why now | Main outputs |
| --- | --- | --- | --- | --- |
| 1 | Auth baseline | SL-2, SL-3, SL-4 | Users and ownership gate every later feature | Register/login/reset behavior, protected dashboard, auth tests |
| 2 | RBAC and RLS hardening | SL-5 | Admin/editor/user permissions affect catalog and recommendations | RBAC matrix, role enforcement, RLS advisor cleanup |
| 3 | Bank creation and balances | SL-7, SL-8 | Ledger foundation for every money flow | `/api/banks`, pockets, operative balance, UI integration |
| 4 | Ledger movements | SL-10, SL-9 | Deposits, withdrawals, transfers precede betting | `/api/transactions`, transfer logic, insufficient funds tests |
| 5 | Catalog foundation | SL-18, SL-19, SL-20 | Tickets and recommendations need normalized or marked data | Catalog schema, search, manual fallback, admin maintenance |
| 6 | Bet creation and funding | SL-12, SL-13 | Core MVP ticket capture needs reliable balances | `/api/bets`, legs, stake cap, funding mix |
| 7 | Settlement, cashout, audit | SL-14, SL-15, SL-16 | Metrics and goals depend on final outcomes | Settle/cashout endpoints, immutable audit behavior |
| 8 | Goals | SL-22, SL-23, SL-24, SL-25, SL-26 | Goals depend on bank and bet lifecycle | Goals schema, formulas, recalculation, risk rules |
| 9 | Recommendations | SL-28, SL-29, SL-30 | Recommendations depend on RBAC, catalog, banks, bets | Publish/feed/follow flows |
| 10 | Metrics | SL-31 | Metrics depend on settled data | Metrics endpoint, views/functions, dashboard real values |

## Work Package Template

Each implementation package should include:

- Story keys covered.
- DB migration impact.
- API routes changed or added.
- UI surfaces changed or added.
- Test plan: unit, API, E2E, RLS/manual.
- Supabase types update requirement.
- Acceptance criteria traceability.

## DB/API/UI/Test/RLS Map

| Stories | DB | API | UI | Tests | RLS |
| --- | --- | --- | --- | --- | --- |
| SL-2, SL-3 | Existing `users`; maybe auth config | SRS auth endpoints or explicit contract update | Login/signup | Auth unit and E2E | User profile access |
| SL-4 | Maybe none | Reset endpoint or client flow | Reset password UI | Auth API/E2E | N/A or users |
| SL-5 | Role policies/functions | Role management endpoints | Admin role UI | RBAC API/E2E | Admin/editor/user checks |
| SL-7, SL-8 | Banks/pockets hardening | Banks list/create/detail | Dashboard/forms | Unit/API/E2E | Own banks/pockets only |
| SL-9, SL-10 | Transaction constraints | Transactions/transfer | Movement forms/history | Unit/API/E2E/RLS | Own banks/transactions only |
| SL-18, SL-19, SL-20 | Catalog tables/aliases | Catalog search/manual/admin | Autocomplete/admin catalog | Unit/API/E2E/RLS | Read/write by role |
| SL-12, SL-13 | Bet/funding schema | Bets create/list/detail | Ticket form | Unit/API/E2E/RLS | Own bets only |
| SL-14, SL-15, SL-16 | Settlement/cashout/audit schema | Settle/cashout | Ticket lifecycle UI | Unit/API/E2E/RLS | Own bets; audit immutability |
| SL-22 to SL-26 | Goals/risk schema | Goals/recalculate/close | Goal dashboard | Formula unit/API/E2E/RLS | Own goals only |
| SL-28 to SL-30 | Recommendations/follows schema | Recommendations/follow | Feed/publish/follow | Unit/API/E2E/RLS | Publish by role; follow by owner |
| SL-31 | Metrics views/functions | Metrics overview | KPI dashboard | Formula/API/E2E | Own metrics only |

## Blocked Before Code

| Blocker | Blocks | Needed decision |
| --- | --- | --- |
| Placeholder business data map | All cross-entity flows | Replace with real StakeLedger entity/flow/state map |
| Missing local migrations | All DB changes | Decide migration source of truth |
| SRS auth endpoints vs direct Supabase client | SL-2 to SL-4 | Keep API endpoints or update SRS to client-auth architecture |
| Operative balance formula | SL-8, SL-12, SL-22, SL-31 | Define exact formula for cash/bonus/freebet |
| Freebet and bonus return rules | SL-13, SL-14 | Define settlement effects by funding type |
| Half win/loss and cashout split rules | SL-14, SL-15 | Define accounting model |
| Risk thresholds | SL-25 | Define defaults and user-configurable limits |
| Catalog provider strategy | SL-18 to SL-20 | Decide provider, cache, alias policy, conflict handling |
| ICP and normalized event model | SL-28 | Define fields and scoring semantics |

## Verification Path

For each slice:

1. Run story-level tests or manual acceptance checks.
2. Run `bun run repo:check`.
3. If DB changed, run `bun run db:types` and verify `src/types/supabase.ts` diff.
4. Check Supabase advisors after migrations.
5. Commit one reviewable work unit.

## Out Of Scope For Phase 2A

- No feature code.
- No endpoint creation.
- No migrations.
- No story edits.
- No Jira sync.
- No push.
