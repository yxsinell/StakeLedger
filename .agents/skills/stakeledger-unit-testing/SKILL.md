---
name: stakeledger-unit-testing
description: 'Trigger: unit test, TDD, mock, test coverage. Design and implement focused StakeLedger unit tests without inventing test infrastructure.'
license: MIT
compatibility: opencode
metadata:
  author: StakeLedger
  version: '1.0'
---

# StakeLedger Unit Testing

## Activation Contract

Use for unit-test design, TDD, mocks, and coverage decisions. Use alongside `stakeledger-sprint-development` for story implementation.

## Read First

1. Read `package.json`, the unit's public contract, existing sibling tests, callers, and test configuration.
2. Read the relevant acceptance test plan when the test supports a story.

## Decision Gates

| Condition                                 | Action                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Established test runner and command exist | Reuse the existing conventions and run focused tests.                                               |
| No runner or test command exists          | Report the blocker. Do not install packages, add a runner, or create tests that cannot be executed. |
| External boundary exists                  | Mock HTTP, database, filesystem, time, randomness, or third-party SDKs only.                        |

## Execution Steps

1. Test observable behavior, validation, failure paths, and boundaries; do not test private implementation details.
2. For TDD, prove the test fails for the intended reason before production changes, then make it pass and refactor.
3. Keep test state isolated and assertions specific.
4. Run the focused test command, then the story's required verification. Report files, result, and remaining coverage risk.

## Boundaries

Coverage guides risk reduction; it is not a 100 percent target. Do not add E2E, integration, or test-runner infrastructure unless the user explicitly requests that separate scope.
