# `.agents/` - Agent Project Config

Tool-agnostic source of truth for values AI agents need before operating on StakeLedger.

## Files

| File           | Purpose                                                                 | Edited by                 |
| -------------- | ----------------------------------------------------------------------- | ------------------------- |
| `project.yaml` | Project identity, stack, env URLs, database reference, and git strategy | Humans or workflow agents |
| `README.md`    | This guide                                                              | Humans                    |

## Rules

- Keep secrets out of `.agents/`; use `.env` for credentials.
- Keep this directory compatible with OpenCode and Claude Code; do not assume Claude-only commands.
- Add generated Jira catalogs only when their sync scripts and manifests are adopted in a future phase.
- Do not add `vars:check` or `skills:check` scripts unless their required sources are imported too.

## Git Strategy

StakeLedger currently uses `solo-main`: direct commits to `main` are acceptable for the solo-collaborator workflow, but pushes to `main` require explicit user confirmation.
