# Cierre de Fase 4

> Fecha: 2026-08-18. Alcance: SL-2 a SL-31 implementadas en los slices 4A a 4J.

## Estado de entrega

| Área | Estado | Evidencia canónica |
| --- | --- | --- |
| Auth y RBAC | Implementado local/remoto | `.context/dev-roadmap.md`, commits `d0b2be4`, `ade3a68`, `b8e80e0` |
| Banks y ledger | Implementado local/remoto | `.context/dev-roadmap.md`, commits `525bf95`, `e6991d5`, `00d9f80`, `e321711` |
| Catálogo | Implementado local/remoto | `.context/dev-roadmap.md`, commits `bd13edb`, `1e120d1`, `0e33246` |
| Tickets y funding | Implementado | `.context/master-implementation-plan.md`, commits `65877e4`, `4d7d5e3` |
| Settlement, cashout y auditoría | Implementado y verificado | `.context/reports/phase-4h-verification.md` |
| Metas y riesgo | Implementado y verificado remoto | `.context/reports/phase-4i-verification.md` |
| Recomendaciones y métricas | Implementado y verificado remoto | `.context/reports/phase-4j-verification.md` |

## Contrato y configuración

- `supabase/migrations/` es fuente canónica. Hay 36 migrations locales/remotas sincronizadas hasta `20260817201754_include_incomplete_settled_metrics`.
- `src/types/supabase.ts` se regeneró después de la última migration.
- OpenAPI solo declara `http://localhost:3000`: `.agents/project.yaml` no define dominios de staging ni producción y el contrato no publica servidores ficticios.
- APIs web usan sesión por cookie BFF; no bearer JWT como contrato web interno.

## Evidencia de calidad

- Fase 4H: `bun test`, `bun run repo:check` y Playwright pasaron; evidencia detallada en `phase-4h-verification.md`.
- Fase 4I: unit tests, `bun run repo:check`, migrations/tipos y Playwright pasaron; evidencia detallada en `phase-4i-verification.md`.
- Fase 4J: 84 tests/222 assertions, `bun run repo:check`, `git diff --check` y Playwright 4I/4J 2/2 pasaron; evidencia detallada en `phase-4j-verification.md`.
- Esta sesión vuelve a ejecutar verificaciones de cierre sobre el árbol final. Sus resultados se registran al final de este documento.

## Deuda QA aceptada para seguimiento

No bloquea Fase 5 de UI conectada. Sí bloquea declarar una ejecución ATP manual completa o un release productivo sin aceptación explícita.

| Dominio | Pendiente | Fuente |
| --- | --- | --- |
| SL-12/SL-13 | Journey manual de creación de ticket con mix freebet y concurrencia multisesión | `.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-12-register-ticket/acceptance-test-plan.md`, `STORY-SL-13-fund-bet-mix/acceptance-test-plan.md` |
| SL-28 | E2E exitoso de create, edit, publish e inactivate | `.context/reports/phase-4j-verification.md` |
| SL-29 | E2E de empate de timestamp, `leagueId`, load-more y cursor | `.context/reports/phase-4j-verification.md` |
| SL-30 | E2E feed -> follow -> prefill, concurrencia y cross-owner | `.context/reports/phase-4j-verification.md` |
| SL-31 | E2E de mix promocional, resultados parciales, UTC, límites y cross-owner | `.context/reports/phase-4j-verification.md` |

## Estados PBI y Jira

- Los estados `To Do`, `Draft` o `Execution Pending` de documentos PBI históricos no son evidencia del estado funcional actual. La evidencia de entrega está en roadmap, master plan y reportes de verificación citados arriba.
- Jira se verificó con `acli` autenticado en `yxsinell.atlassian.net`. Con autorización explícita del usuario, el 2026-08-18 se transicionaron a `Done` SL-2 a SL-16, SL-22 a SL-26 y SL-28 a SL-31; SL-18 a SL-20 ya estaban `Done`.
- La consulta posterior `status != Done` no devolvió issues de Fase 4. La deuda QA registrada arriba sigue siendo una limitación de evidencia, no una reapertura de las stories.

## Riesgos de seguridad fuera de alcance

- Activar manualmente leaked password protection antes de siguiente despliegue de Auth.
- Los avisos de metadatos GraphQL y funciones legacy `SECURITY DEFINER` siguen clasificados en `.context/supabase-security-posture.md`; no cambiar grants, RLS ni funciones durante cierre documental.
- Vulnerabilidades Dependabot existentes se mantienen como deuda de dependencias separada; no se modifican sin una fase dedicada.

## Resultado de verificaciones de cierre

| Verificación | Resultado |
| --- | --- |
| `bun test` | PASS: 84 tests, 222 assertions |
| `bun run test:e2e` | PASS: 2/2; Fase 4I y Fase 4J en 52.4 s, sin avisos de origen cruzado |
| `bun run repo:check` | PASS: ESLint, build de producción y typecheck |
| `bunx supabase migration list` | PASS: 36 migrations locales/remotas sincronizadas hasta `20260817201754` |
| `git status --short --branch` antes de cambios | PASS: `main...origin/main` |

`next.config.mjs` declara explícitamente el origen local `127.0.0.1` usado por Playwright. La segunda ejecución confirmó la eliminación del aviso de origen cruzado.
