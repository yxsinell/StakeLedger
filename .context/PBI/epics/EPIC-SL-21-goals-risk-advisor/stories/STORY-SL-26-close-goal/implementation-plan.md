# Implementation Plan: STORY-SL-26 - Cerrar meta

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-021
- API contract: `.context/SRS/api-contracts.yaml` `/api/goals/{goalId}/close`

## Estado Actual Verificado

- No existe `src/app/api/goals/[goalId]/close/route.ts`.
- No existe `goals.status` real porque no existe tabla goals.
- No hay UI de confirmacion de cierre.
- No hay regla implementada para detener recalculos.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de Banks solo por ownership indirecto del goal.
- Depende de SL-22 para goal existente.
- Depende de SL-24 para asegurar que goals cerradas no recalculan.

## Alcance

- Cerrar goal cuando target alcanzado.
- Permitir o bloquear cierre sin target segun decision; si se permite, requiere confirmacion adicional.
- Marcar `completed`, registrar `closed_at` y detener recalculos.
- Mantener fuera de alcance reapertura automatica.

## Archivos a Tocar

- `src/app/api/goals/[goalId]/close/route.ts` - endpoint close.
- `src/lib/goals/close-service.ts` - validacion target/status/idempotencia.
- `src/lib/goals/schemas.ts` - close request si requiere confirmacion flag.
- `src/lib/goals/recalculation-service.ts` - ignorar completed.
- `src/components/goals/close-goal-dialog.tsx` - confirmacion UI.
- `src/components/goals/goal-card.tsx` - CTA cierre y estado final.
- `src/lib/openapi/schemas/goals.ts` - close response.

## DB/RLS Necesarios

- Migration-first: requiere `goals.status`, `closed_at`, `closure_reason` o campo equivalente.
- Constraint status `active|completed|cancelled` si aplica.
- `goal_history` o audit debe registrar closure event.
- RLS: owner solo cierra goals propios.
- Recalculation services deben filtrar `status = active`.

## API Necesaria

- `POST /api/goals/{goalId}/close`.
- Request opcional `{ confirmBelowTarget?: boolean }` si se permite cierre sin objetivo.
- Success: `200` con `{ success: true }` o goal cerrado si se extiende contrato.
- Errors: `403`, `404`, `409/422` goal ya cerrada o target no alcanzado sin confirmacion.

## UI Necesaria

- Dialog de confirmacion; warning adicional si target no alcanzado y se permite.
- Estado final para goal completed y CTA deshabilitado.
- `data-testid`: `closeGoalDialog`, `close_goal_button`, `confirm_close_goal_button`, `below_target_warning`, `closed_goal_message`.

## Validaciones Zod

- `goalId`: UUID.
- `confirmBelowTarget`: boolean opcional.
- Status debe ser `active` para cierre inicial.
- Target reached: progress >= 100% segun formula aprobada.

## Tests Minimos

- Unit: target alcanzado, exacto y no alcanzado.
- API: cierre exitoso setea `completed` y `closed_at`.
- API: cierre doble idempotente o error segun decision, sin cambiar `closed_at`.
- API/RLS: goal ajena bloqueada.
- Integration: goal cerrada no recalcula tras settlement.
- E2E: usuario confirma cierre y ve estado final.

## Criterios de Cierre

- AC SL-26 cubiertos: cierre exitoso, sin objetivo, meta ya cerrada.
- Recalculos detenidos para goals completed.
- Cierre queda auditado/snapshotteado.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Cierre sin objetivo: bloquear o permitir con confirmacion adicional.
- Respuesta exacta de `/close`.
- Idempotencia de cierre doble.
- Mensaje/CTA para meta ya cerrada.
