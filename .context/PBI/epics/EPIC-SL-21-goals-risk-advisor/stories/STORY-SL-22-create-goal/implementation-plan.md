# Implementation Plan: STORY-SL-22 - Crear meta

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-017
- API contract: `.context/SRS/api-contracts.yaml` `/api/goals`

## Estado Actual Verificado

- No existe `src/app/api/goals/route.ts`.
- `src/types/supabase.ts` no contiene `goals` ni `goal_history`.
- `src/app/dashboard/page.tsx` muestra goals hardcodeados.
- No hay servicios de calculo de daily profit o suggested odds.
- Fase 2A marco SL-22..SL-26 como migration-first.

## Dependencias

- Depende de Identity para usuario autenticado y ownership.
- Depende de Banks SL-7/SL-8 para bank y base capital confiable.
- Depende indirectamente de Bets SL-12/SL-14 para recalculos posteriores, pero creacion puede implementarse antes si solo guarda parametros.

## Alcance

- Crear goal con bank, base amount, target amount, deadline, stake preference y strategy opcional.
- Validar target > base y deadline futura.
- Calcular gap, daily profit y suggested odds inicial.
- Mantener fuera de alcance metas compartidas y estrategias multi-meta.

## Archivos a Tocar

- `src/app/api/goals/route.ts` - `GET` list y `POST` create.
- `src/lib/goals/schemas.ts` - create/list schemas.
- `src/lib/goals/calculations.ts` - gap, daily profit, suggested odds.
- `src/lib/goals/service.ts` - ownership, persistence y history.
- `src/components/goals/goal-form.tsx` - formulario.
- `src/components/goals/goal-card.tsx` - resumen reutilizable.
- `src/app/dashboard/page.tsx` o `src/app/dashboard/goals/page.tsx` - integrar datos reales.
- `src/lib/openapi/schemas/goals.ts` - schemas OpenAPI.

## DB/RLS Necesarios

- Migration-first: requiere tablas `goals` y `goal_history` aun no existentes.
- `goals`: `user_id`, `bank_id`, `base_amount`, `target_amount`, `deadline`, `stake_preference`, `strategy`, `status`, `daily_profit`, `suggested_odds`, `closed_at`.
- `goal_history`: snapshots de calculo para auditoria/recalculo.
- Constraints: target > base, amounts >= 0, status enum, strategy enum.
- RLS: owner solo lee/escribe goals propios y bank asociado propio.

## API Necesaria

- `POST /api/goals` con `{ bankId, baseAmount, targetAmount, deadline, stakePreference, strategy? }`.
- `GET /api/goals` para goals del usuario.
- Success create: `201` con `GoalResponse`.
- Errors: `400` target/deadline/stake invalido, `403` bank ajeno, `401`.

## UI Necesaria

- Formulario con bank select, base, target, deadline, stake preference y strategy.
- Preview de daily profit y suggested odds si se puede calcular client-side con misma regla o desde API.
- `data-testid`: `goalForm`, `goal_bank_select`, `base_amount_input`, `target_amount_input`, `goal_deadline_input`, `stake_preference_input`, `strategy_select`, `submit_goal_button`, `goal_validation_error`.

## Validaciones Zod

- `bankId`: UUID.
- `baseAmount`: number finite, >= 0, precision aprobada.
- `targetAmount`: number finite, > base.
- `deadline`: date futura; timezone definida.
- `stakePreference`: rango pendiente de decision.
- `strategy`: `conservative|accelerated` si se usa.

## Tests Minimos

- Unit: target <= base, deadline pasada, stake fuera de rango.
- Unit: formula daily profit/suggested odds con fixtures aprobados.
- API: create exitoso persiste goal activo y snapshot inicial.
- API/RLS: bank ajeno devuelve `403` sin crear goal.
- E2E: formulario crea goal y muestra mision/progreso.

## Criterios de Cierre

- AC SL-22 cubiertos: creacion exitosa, target invalido, deadline pasada.
- Formula y precision documentadas antes de implementar tests exactos.
- Goal queda ligado a bank propio.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Formula exacta y redondeo de `daily_profit` y `suggested_odds`.
- Rango y default de `stakePreference`.
- Timezone para deadline.
- Strategy requerida/opcional y valores definitivos.
