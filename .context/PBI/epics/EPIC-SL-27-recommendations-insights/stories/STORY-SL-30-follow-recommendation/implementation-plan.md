# Implementation Plan: STORY-SL-30 - Seguir recomendacion

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-024
- API contract: `.context/SRS/api-contracts.yaml` `/api/recommendations/{recommendationId}/follow`

## Estado Actual Verificado

- No existe endpoint follow.
- Dashboard tiene boton `Seguir` hardcodeado sin accion real.
- No existe `recommendation_follows` ni tabla equivalente.
- No existe bet prefill state ni flujo real desde recommendation hacia create bet.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de Banks SL-7/SL-8 para seleccionar bank; usuario sin bank debe bloquear.
- Depende de Bets SL-12 para formulario de ticket/prefill.
- Depende de SL-28/SL-29 para recommendation activa publicada.
- Depende de Catalog para datos normalizados completos.

## Alcance

- Permitir que usuario siga recommendation activa.
- Devolver payload de prefill para formulario de bet con evento, mercado y odds.
- Exigir bank existente o solicitar crear uno.
- No registrar bet automaticamente sin confirmacion.

## Archivos a Tocar

- `src/app/api/recommendations/[recommendationId]/follow/route.ts` - follow/prefill endpoint.
- `src/lib/recommendations/follow-service.ts` - validation y prefill mapping.
- `src/lib/recommendations/schemas.ts` - follow request/response.
- `src/components/recommendations/follow-button.tsx` - CTA.
- `src/components/bets/bet-ticket-form.tsx` - aceptar prefill.
- `src/app/dashboard/recommendations/[recommendationId]/follow/page.tsx` o route state - flujo UI.
- `src/lib/openapi/schemas/recommendations.ts` - prefill response.

## DB/RLS Necesarios

- Migration-first: requiere `recommendation_follows` si se registra adhesion/trazabilidad.
- Requiere `recommendations.status`, normalized event fields y FK a event/market.
- Requiere asociar follow a `user_id`, `recommendation_id`, `bank_id?`, `created_at`.
- RLS: usuario solo lee/crea follows propios; recommendations inactivas no se pueden seguir.
- Si follow solo devuelve prefill sin persistir, documentar decision y no crear tabla.

## API Necesaria

- `POST /api/recommendations/{recommendationId}/follow` con `{ bankId? }` segun OpenAPI.
- Success: `200` con `PrefillBetResponse` y datos para SL-12.
- Errors: `400` datos incompletos/bank invalido, `403` bank ajeno, `404`, `409/422` recommendation inactiva o usuario sin bank.

## UI Necesaria

- Follow button en feed/card.
- Si usuario tiene multiples banks, selector antes de prefill o dentro del bet form.
- Si usuario no tiene banks, CTA a crear bank.
- `data-testid`: `followRecommendationButton`, `follow_bank_select`, `recommendation_inactive_message`, `create_bank_required_message`, `prefilledBetForm`.

## Validaciones Zod

- `recommendationId`: UUID.
- `bankId`: optional UUID; requerido si no hay default bank.
- Recommendation status debe ser `published/active`.
- Prefill requiere event, market, odds y normalized data completos.

## Tests Minimos

- Unit: recommendation active/inactive y data completeness.
- API: follow activo devuelve prefill correcto.
- API: recommendation inactiva no prefill.
- API: usuario sin bank recibe bloqueo accionable.
- API/RLS: bank ajeno no permitido.
- E2E: feed -> follow -> bet form prefilled, sin auto-create.

## Criterios de Cierre

- AC SL-30 cubiertos: prefill exitoso, inactiva, usuario sin bank.
- No se crea bet sin confirmacion explicita del usuario.
- Follow queda trazable o decision no-persist queda documentada.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Campos exactos de prefill.
- Default bank vs selector obligatorio para multiples banks.
- Persistir follow o solo generar prefill.
- Mensajes/codigos para recommendation inactiva.
