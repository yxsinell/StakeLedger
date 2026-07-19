# Master Implementation Plan

StakeLedger implementation should proceed from foundation to ledger integrity to higher-level product flows. This plan exists to avoid coding isolated endpoints without business, schema, RLS, API, UI, and test alignment.

## Guardrails

- Do not implement features without reading the story, acceptance test plan, SRS, OpenAPI, and this roadmap.
- Do not use Jira as source of truth unless explicitly confirmed.
- Do not create endpoints before DB/RLS design is clear for stories that persist domain data.
- Keep API responses aligned with `.context/SRS/api-contracts.yaml`, or update the SRS/OpenAPI through an approved docs change first.
- Use Supabase remote schema as live evidence, but decide migration source of truth before changing DB.

## Current Baseline

| Layer | State |
| --- | --- |
| Product docs | PBI and SRS exist; business data map is placeholder |
| Implementation plans | Story implementation plans absent |
| API | Only health, example, and dynamic OpenAPI routes exist |
| UI | Auth pages and dashboard shell exist; many widgets are visual/demo only |
| DB | Core ledger tables exist remotely and in generated types |
| RLS | Enabled on core tables; security/performance advisor warnings remain |
| Tests | Acceptance test plans exist; automation not mapped per story yet |

## Implementation Sequence

### Phase 1: Auth And Security Foundation

Stories: SL-2, SL-3, SL-4, SL-5.

Goal: make identity, session, dashboard protection, and RBAC predictable before domain data grows.

Required work:

- Align auth UI and/or API with SRS contract.
- Add password recovery flow.
- Define RBAC matrix for admin, editor, user.
- Fix dashboard protection policy in middleware or equivalent route guard.
- Review Supabase Auth leaked password protection.
- Resolve GraphQL exposure and RLS performance advisors.

Exit criteria:

- Auth flows pass UI/API tests.
- Role checks are enforced in API and UI.
- RLS policy style is approved for new migrations.

### Phase 2: Banks And Ledger Foundation

Stories: SL-7, SL-8, SL-10, SL-9.

Goal: establish trustworthy money movement before bets, goals, and metrics depend on balances.

Required work:

- Replace `/api/example` prototype with real `/api/banks` contract.
- Create banks plus pockets plus initial ledger transaction atomically.
- Define transaction types and transfer semantics.
- Implement operative balance calculation.
- Add API, UI, and RLS tests for ownership and insufficient funds.

Exit criteria:

- Every bank balance is explainable from pockets and transactions.
- Transfer/deposit/withdraw operations preserve ownership and ledger consistency.

### Phase 3: Catalog And Normalization

Stories: SL-18, SL-19, SL-20.

Goal: define normalized sports data before full ticket and recommendation flows depend on events.

Required work:

- Define catalog tables for teams, competitions, aliases, providers, and normalization status.
- Decide fallback behavior for external providers.
- Implement manual `UNNORMALIZED` flow.
- Restrict catalog maintenance to admin/editor as appropriate.

Exit criteria:

- Tickets and recommendations can reference normalized or explicitly unnormalized entities.
- Alias uniqueness and provider conflict handling are tested.

### Phase 4: Bets Ledger

Stories: SL-12, SL-13, SL-14, SL-15, SL-16.

Goal: implement tickets as ledger-backed accounting events, not just records.

Required work:

- Add stake-level, funding, result, return, and profit fields or related tables.
- Implement stake cap and fund reservation.
- Implement mixed funding with cash, bonus, and freebet rules.
- Implement settlement and cashout split rules.
- Enforce audit log append-only behavior.

Exit criteria:

- Bet lifecycle is consistent from creation through settlement/cashout.
- Ledger and audit evidence exist for each financial effect.

### Phase 5: Goals And Risk Advisor

Stories: SL-22, SL-23, SL-24, SL-25, SL-26.

Goal: build goals on reliable balances and settled bet outcomes.

Required work:

- Confirm formulas for daily profit, suggested odds, progress, and risk thresholds.
- Add goals, goal history, and risk limits schema.
- Recalculate goals after settled linked bets.
- Define close behavior and confirmation rules.

Exit criteria:

- Goal calculations are deterministic and unit-tested.
- Risk blocking rules are explicit and testable.

### Phase 6: Recommendations And Insights

Stories: SL-28, SL-29, SL-30, SL-31.

Goal: publish recommendations and metrics only after catalog, roles, banks, and bets are stable.

Required work:

- Define recommendation, follow, normalized event, and ICP schema.
- Implement admin/editor publish flow.
- Implement feed filters.
- Implement follow-to-prefill bet payload.
- Implement metrics queries or database views.

Exit criteria:

- Recommendation follow creates a safe prefill path, not hidden bet creation.
- Metrics are traceable to settled bets and ledger entries.

## Migration-First Stories

| Story | Migration need |
| --- | --- |
| SL-5 | Role/RBAC policies and possibly admin support functions |
| SL-7 | Atomic bank/pocket/initial transaction support if not handled in app transaction pattern |
| SL-9 | Transfer transaction semantics and constraints |
| SL-10 | Transaction type constraints and balance update model |
| SL-13 | Funding breakdown model |
| SL-14 | Settlement result/profit/return fields or tables |
| SL-15 | Cashout split relationships |
| SL-16 | Audit immutability, triggers, or permission restrictions |
| SL-18 | Catalog schema |
| SL-19 | Manual entry and normalization status |
| SL-20 | Aliases, provider ids, admin constraints |
| SL-22 to SL-26 | Goals, goal history, risk limits |
| SL-28 to SL-30 | Recommendations, follows, normalized events/markets |
| SL-31 | Metrics views/functions if metrics are DB-backed |

## Definition Of Ready For A Story

- Story and acceptance test plan read.
- Business rules are unambiguous or a blocking question is raised.
- DB/RLS impact is known.
- API contract is confirmed or deliberately updated.
- UI surfaces and `data-testid` needs are listed.
- Unit/API/E2E/RLS test plan is mapped.

## Definition Of Done For A Story

- Implementation satisfies acceptance criteria.
- API contract and runtime behavior match.
- RLS denies cross-user access.
- Relevant UI elements include `data-testid`.
- Tests or documented manual verification cover happy path, validation, auth, and ownership.
- Generated Supabase types are updated after DB changes.

## Open Decisions

| Decision | Why it matters |
| --- | --- |
| Business data map content | Required for entity relationships, flows, and state machines |
| Local vs remote migrations | Required before DB changes are made safely |
| Auth API vs direct Supabase client | SRS declares auth endpoints; current UI uses Supabase client directly |
| Operative balance formula | Blocks SL-8, SL-12 stake cap, goals, and metrics |
| Freebet/bonus return rules | Blocks SL-13 and SL-14 |
| Risk thresholds | Blocks SL-25 |
| ICP definition | Blocks SL-28 and recommendation quality |
