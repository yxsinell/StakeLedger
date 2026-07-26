---
name: stakeledger-sprint-development
description: 'Trigger: implement story, work on SL ticket, fix StakeLedger bug. Run the StakeLedger story workflow from evidence to verified change.'
license: MIT
compatibility: opencode
metadata:
  author: StakeLedger
  version: '1.0'
---

# StakeLedger Sprint Development

## Activation Contract

Use for implementation of a StakeLedger story or bug. Do not use for backlog creation, Jira administration, deployment, or standalone unit-test guidance.

## Read First

1. Read `.agents/project.yaml`, `package.json`, relevant DEV guidelines, and the target story's `story.md`, `acceptance-test-plan.md`, and `implementation-plan.md`.
2. Read `.context/dev-roadmap.md` and `.context/master-implementation-plan.md` for ordering and blockers.
3. Query Jira project `SL` with `acli` when ticket state or sprint membership matters. Jira is live evidence; local PBI status is not live state.

## Execution Steps

1. Stop when requirements, acceptance tests, plan, or a blocking business decision are missing.
2. State scope, acceptance evidence, DB/RLS/API/UI impact, and verification before editing.
3. Follow existing project patterns. For DB work, inspect live schema first; regenerate Supabase types after approved schema changes.
4. Add `data-testid` values for new interactive UI elements.
5. Run relevant focused checks, then `bun run repo:check`.
6. Show the diff and test results before any commit. Respect `solo-main`; require explicit confirmation before push.

## Jira Safety

Use `acli` for read operations. Require explicit user confirmation before creating, editing, transitioning, or assigning Jira issues or sprints, including `bun run jira:sprint:add`.

## Boundaries

`.agents/project.yaml` overrides legacy workflow docs. Do not assume `staging`, a pull request, automatic deployment, Jira catalogs, or Jira sync scripts.
