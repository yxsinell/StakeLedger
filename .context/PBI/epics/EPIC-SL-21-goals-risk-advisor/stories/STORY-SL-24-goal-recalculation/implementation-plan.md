# Implementation Plan: STORY-SL-24 - Recalcular meta tras apuesta finalizada

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-019
- API contract: `.context/SRS/api-contracts.yaml` `/api/goals/{goalId}/recalculate`

## Estado Actual Verificado

- No existe `src/app/api/goals/[goalId]/recalculate/route.ts`.
- No existe `goals`, `goal_history` ni vinculo bet-goal.
- `bets` no tiene `goal_id`, result ni profit fields.
- No existe settlement service SL-14 ni hook/evento de recalculo.

## Dependencias

- Depende de Identity y ownership.
- Depende de Banks para saldo/capital actual.
- Depende de SL-14 settlement y SL-22/SL-23 goals.
- Depende de decision de vinculo bet-goal.

## Alcance

- Recalcular goal activo cuando una bet vinculada se liquida.
- Ignorar bets no vinculadas.
- Guardar snapshot en goal history.
- Mantener fuera de alcance simulaciones y movimientos no relacionados.

## Archivos a Tocar

- `src/app/api/goals/[goalId]/recalculate/route.ts` - endpoint explicito.
- `src/lib/goals/recalculation-service.ts` - recalc idempotente.
- `src/lib/goals/calculations.ts` - formulas reutilizadas.
- `src/lib/bets/settlement-service.ts` - disparar recalculo post-settlement o en transaccion.
- `src/lib/goals/schemas.ts` - recalculate params/response.
- `src/components/goals/goal-history-list.tsx` - historial si se expone.
- `src/lib/openapi/schemas/goals.ts` - schemas recalculate.

## DB/RLS Necesarios

- Migration-first: requiere `goals`, `goal_history` y un vinculo `bets.goal_id` o tabla `goal_bets`.
- Requiere idempotency: unique sobre `goal_id + bet_id + settlement_event_id` o equivalente.
- `goal_history` debe guardar previous/current gap, daily profit, suggested odds y trigger source.
- RLS: owner de goal y bet debe coincidir; no recalcular goals ajenos.
- Transaccion recomendada junto a settlement para evitar goal stale.

## API Necesaria

- `POST /api/goals/{goalId}/recalculate` para recalculo manual/controlado.
- Settlement SL-14 puede invocar servicio interno sin request externo.
- Success: `200` con `GoalResponse` actualizado.
- Errors: `403`, `404`, `409/422` goal cerrada o bet no vinculada si endpoint recibe bet context.

## UI Necesaria

- Vista de goal debe refrescar mission despues de settlement.
- Mostrar ultimo recalculo y fuente si se expone history.
- `data-testid`: `goalRecalculationStatus`, `last_recalculation_label`, `goal_history_list`, `recalculate_goal_button`.

## Validaciones Zod

- `goalId`: UUID.
- Optional `betId`: UUID si endpoint permite recalculo por bet.
- Recalcular solo status `active`.
- Resultados `void|half_win|half_loss` dependen de SL-14 rules.

## Tests Minimos

- Unit: recalculo win/lose con fixtures.
- Integration: settlement de bet vinculada crea un history snapshot.
- API: bet no vinculada no cambia goal.
- Integration: settlement duplicado no duplica recalculo.
- API/RLS: goal ajena bloqueada.
- E2E: liquidar bet actualiza mission diaria.

## Criterios de Cierre

- AC SL-24 cubiertos: win, lose, bet no vinculada.
- Recalculo idempotente probado.
- Goals cerradas no recalculan.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Resueltas Fase 4I: vínculo `bets.goal_id`; idempotencia por unique `(goal_id,bet_id)`; todos los resultados canónicos recalculan desde cash final; no se permite recálculo sin settlement.
