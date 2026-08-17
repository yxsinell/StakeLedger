# Phase 4I Verification — SL-22 to SL-26

> Estado: implementación y migration remota verificadas. Fecha: 2026-08-17.

## Alcance implementado

- Goal create/list/detail/update/close mediante cookie BFF.
- RPC writes atómicas `SECURITY INVOKER` exclusivas de `service_role`.
- Misión exacta, history, risk assessment y una active por bank.
- Risk limits opt-in y cap fijo 40% aplicado al crear tickets.
- `goalId` opcional en tickets y recálculo dentro de settlement.
- UI `/dashboard/goals`, formulario, detalle, risk settings, history y cierre en dos pasos.
- Playwright aislado para UI/API/RLS/concurrencia; teardown preserva audit mediante soft-delete del actor.

## Evidencia ejecutada

| Comando | Resultado |
| --- | --- |
| `bun test src/lib/goals src/lib/bets/schemas.test.ts` | PASS: fórmulas, schemas y metadata de recálculo |
| `bun test` | PASS: 68 tests, 0 failures, 169 assertions |
| `bun run repo:check` | PASS: ESLint, Next production build y TypeScript |
| `git diff --check` | PASS; solo avisos de normalización LF/CRLF |
| `bunx supabase migration list` | PASS: local/remoto sincronizados hasta `20260817160357_implement_goals_and_risk` |
| `bun run db:types` | PASS: `src/types/supabase.ts` regenerado desde schema remoto |
| `bun run test:e2e` | PASS: 1 journey aislado; settlement/cashout, goal CRUD, riesgo, recálculo, cierre, API cross-owner y concurrencia |
| SQL de precisión | PASS: misión exacta reproducible y rechazo `GOAL_DAILY_PROFIT_PRECISION` sin redondeo |
| SQL de RLS/grants | PASS: cross-owner devuelve 0 filas; authenticated solo tiene SELECT; RPCs nuevas solo ejecutables por service_role |
| Advisors Supabase | PASS de alcance: sin nuevas alertas críticas/high; avisos GraphQL/Auth e índices legacy permanecen documentados |
| Parse de OpenAPI estático/runtime | PASS: goals/risk presentes y recalculate manual ausente |

## Observaciones de verificación

- `bunx supabase db lint --linked --level warning` no pudo abrir el rol temporal porque el entorno no expone `SUPABASE_DB_PASSWORD`; schema se revisó mediante advisors y consultas SQL MCP equivalentes.
- Playwright necesitó un único login/journey porque Supabase Auth limita ráfagas de autenticación. El journey mantiene datos aislados y teardown completo.
- Teardown confirmado: cero banks de prueba, goals o risk limits persistentes.

## Casos automatizados preparados

- SL-22: creación, validación exacta, una active por bank y ownership cruzado.
- SL-23: daily profit, suggested odds, target alcanzado y progress clamp.
- SL-24: ticket vinculado, settlement, history único y ausencia de endpoint manual.
- SL-25: límites null/exactos, boundary de max odds, pérdida diaria y bloqueo con alternativas.
- SL-26: completed/cancelled, confirmación, estado final y cierre estable.

## Límites deliberados

- No se tocaron recomendaciones, métricas ni catálogo.
- No se hizo backfill ni transformación de datos legacy.
- Leaked password protection y exposición GraphQL autenticada siguen como postura previa, fuera de Fase 4I.
