# Implementation Plan: STORY-SL-25 - Protecciones de riesgo

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-020
- API contract: `.context/SRS/api-contracts.yaml` usa goals response; no declara endpoint especifico de risk limits

## Estado Actual Verificado

- No existe `risk_limits` en generated types.
- No existe servicio de risk advisor.
- Dashboard muestra alertas hardcodeadas de riesgo.
- No hay limites por usuario ni defaults globales documentados.

## Dependencias

- Depende de Identity para preferencias por usuario.
- Depende de Banks y Goals SL-22/SL-23 para mission/suggested odds.
- Depende de SL-24 si el riesgo se reevalua tras recalculos.
- No depende directamente de Recommendations.

## Alcance

- Evaluar suggested odds contra limite maximo configurable.
- Bloquear cuotas suicidas.
- Mostrar recomendaciones de reconfiguracion de target, deadline o stake.
- Mantener fuera de alcance ajustes automaticos sin confirmacion y alertas externas.

## Archivos a Tocar

- `src/lib/goals/risk-service.ts` - evaluacion de limites y recomendaciones.
- `src/lib/goals/risk-rules.ts` - defaults y thresholds.
- `src/lib/goals/calculations.ts` - integrar risk evaluation.
- `src/app/api/goals/[goalId]/route.ts` - incluir risk status en detail.
- `src/app/api/risk-limits/route.ts` o `src/app/api/goals/risk-limits/route.ts` si se aprueba config por usuario.
- `src/components/goals/risk-alert.tsx` - alertas y bloqueo.
- `src/components/goals/reconfiguration-suggestions.tsx` - alternativas.

## DB/RLS Necesarios

- Migration-first: requiere `risk_limits` y/o columnas en `users/goals` para limites.
- Definir default global y override por usuario.
- Registrar risk blocks en `goal_history` o `audit_logs` si son eventos relevantes.
- RLS: usuario solo lee/escribe sus limites; admin no necesita intervenir salvo soporte.
- Constraint: max odds > 1.0 y dentro de rango aprobado.

## API Necesaria

- Incluir risk evaluation en `GET /api/goals/{goalId}`.
- Opcional: `GET/PATCH /api/risk-limits` para configurar limites por usuario.
- Success: risk status `ok|blocked`, threshold aplicado y suggestions.
- Errors: `400` limite invalido, `401`, `403` goal ajena.

## UI Necesaria

- Alertas visibles cuando suggested odds supera limite.
- Bloqueo de accion asociada a mission si `blocked`.
- Sugerencias accionables de reconfiguracion.
- `data-testid`: `riskAlert`, `risk_blocked_message`, `risk_threshold_value`, `reconfiguration_suggestions`, `risk_limit_input`, `save_risk_limit_button`.

## Validaciones Zod

- `maxOdds`: number finite, > 1.0, max pendiente.
- `suggestedOdds`: number finite, > 1.0.
- Permitir suggested odds exactamente igual al limite.
- Limites no configurados deben usar default global.

## Tests Minimos

- Unit: odds dentro, igual y mayor al limite.
- Unit: defaults cuando usuario no tiene override.
- Unit: suggestions para target/deadline/stake.
- API: goal detail devuelve risk status.
- API/RLS: usuario no modifica limites ajenos.
- E2E: UI bloquea cuota suicida y muestra alternativas.

## Criterios de Cierre

- AC SL-25 cubiertos: dentro de limite, cuota suicida, reconfiguracion sugerida.
- Default y override de limites definidos.
- Bloqueo no depende solo de UI.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Resueltas Fase 4I: sin max odds default; `GET/PATCH /api/risk-limits`; alternativas aumentar stake, ampliar deadline o reducir target; bloqueos no mutan goal ni settlement.
