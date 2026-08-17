# Implementation Plan: STORY-SL-23 - Ver mision diaria

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-018
- API contract: `.context/SRS/api-contracts.yaml` `/api/goals/{goalId}`

## Estado Actual Verificado

- No existe `src/app/api/goals/[goalId]/route.ts`.
- No existe schema `goals` ni `goal_history`.
- Dashboard muestra goals demo con progress y suggested odds hardcodeados.
- No existe cache diario ni calculo por fecha.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de Banks por goal ligado a bank.
- Depende de SL-22 para goal activo con parametros suficientes.
- Depende de formula cerrada de daily profit/suggested odds.

## Alcance

- Mostrar daily profit, suggested odds y progress percent para goals activos.
- Mostrar estado de parametros faltantes si falta stake preference.
- Mostrar estado final para goals cerrados sin mision activa.
- Mantener fuera de alcance notificaciones push y consejos avanzados.

## Archivos a Tocar

- `src/app/api/goals/[goalId]/route.ts` - detail endpoint.
- `src/lib/goals/calculations.ts` - mission derivation.
- `src/lib/goals/service.ts` - detail, ownership, history/cache.
- `src/components/goals/daily-mission-card.tsx` - mission UI.
- `src/components/goals/goal-progress.tsx` - progress UI.
- `src/app/dashboard/page.tsx` o `src/app/dashboard/goals/[goalId]/page.tsx` - integrar vista.
- `src/lib/openapi/schemas/goals.ts` - detail response.

## DB/RLS Necesarios

- Migration-first: requiere `goals` y opcional `goal_history`/daily snapshot.
- Definir si daily mission se calcula on read o se cachea por `mission_date`.
- Si cachea: unique `(goal_id, mission_date)` y invalidacion por settlement/recalculation.
- RLS: owner solo puede leer goals propios; closed goals tambien respetan ownership.

## API Necesaria

- `GET /api/goals/{goalId}`.
- Success: `200` con goal, mission fields y `missingParameters` si aplica.
- Errors: `401`, `403` goal ajena, `404` goal inexistente.
- Para goal cerrada, retornar estado final sin mission activa.

## UI Necesaria

- Card de mission diaria con daily profit, suggested odds, progress y estado.
- Prompt para completar parametros faltantes.
- Estado final para completed.
- `data-testid`: `dailyMissionCard`, `daily_profit_value`, `suggested_odds_value`, `goal_progress_value`, `missing_goal_params_message`, `closed_goal_state`.

## Validaciones Zod

- `goalId`: UUID.
- Query opcional `date` solo si se aprueba testing/cache por fecha.
- Validar status `active|completed` antes de mostrar mission.

## Tests Minimos

- Unit: formula mission con deadline futuro y deadline hoy.
- Unit: status completed no devuelve mission activa.
- API: goal activa devuelve daily profit, suggested odds y progress.
- API/RLS: goal ajena bloqueada.
- Integration: cache diario recalcula al cambiar dia si se implementa.
- E2E: vista muestra mission y estado final.

## Criterios de Cierre

- AC SL-23 cubiertos: mission diaria, datos insuficientes, goal cerrada.
- Formula/cache definidos o cache omitido explicitamente en MVP.
- UI no muestra consejos activos para goals cerrados.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Resueltas Fase 4I: snapshot único por `mission_date`, `current_date` PostgreSQL, mínimo un día, parámetros obligatorios para filas nuevas y fórmulas exactas compartidas con SL-22.
