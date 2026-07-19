# Implementation Plan: STORY-SL-28 - Publicar recomendaciones

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-022
- API contract: `.context/SRS/api-contracts.yaml` `/api/recommendations`

## Estado Actual Verificado

- No existe `src/app/api/recommendations/route.ts`.
- `src/types/supabase.ts` no contiene `recommendations` ni normalized events/markets.
- Dashboard muestra recomendaciones hardcodeadas.
- No existe definicion de ICP ni publicacion admin/editor.
- Fase 2A marco SL-28 como blocked por catalogo normalizado e ICP.

## Dependencias

- Depende de Identity y RBAC SL-5 para admin/editor.
- Depende de Catalog SL-18/SL-20 para evento normalizado.
- Depende indirectamente de Banks/Bets para que follow pueda crear prefill seguro en SL-30.
- No debe publicarse con eventos unnormalized.

## Alcance

- Crear recommendation con evento normalizado, market, odds, type `pre|live` e ICP.
- Validar permisos admin/editor.
- Publicar recommendation activa en feed.
- Mantener fuera de alcance publicacion masiva y recomendaciones con datos no normalizados.

## Archivos a Tocar

- `src/app/api/recommendations/route.ts` - `GET` feed base y `POST` publish.
- `src/lib/recommendations/schemas.ts` - create/list schemas.
- `src/lib/recommendations/service.ts` - publish, list y permission checks.
- `src/lib/recommendations/icp.ts` - ICP validation/scoring.
- `src/lib/catalog/service.ts` - validate normalized event.
- `src/components/recommendations/recommendation-form.tsx` - admin publish UI.
- `src/app/dashboard/admin/recommendations/page.tsx` - admin page.
- `src/lib/openapi/schemas/recommendations.ts` - schemas OpenAPI.

## DB/RLS Necesarios

- Migration-first: requiere `recommendations`, normalized `events/markets` o catalog reference fields.
- Requiere ICP columns/schema JSON con validacion aprobada.
- Requiere status (`draft|published|inactive`) y type (`pre|live`).
- Unique/duplicate policy para mismo event/market/type pendiente.
- RLS: lectura de published para usuarios autenticados; insert/update solo admin/editor.

## API Necesaria

- `POST /api/recommendations` con `{ eventId, market, odds, type, icp }`.
- `GET /api/recommendations` para feed base (extendido en SL-29).
- Success create: `201` con `RecommendationResponse`.
- Errors: `400` ICP/event/market/odds invalido, `403` sin rol, `409` duplicado si se aprueba.

## UI Necesaria

- Formulario admin/editor con autocomplete de evento normalizado, market, odds, type e ICP.
- Bloquear eventos unnormalized con mensaje claro.
- `data-testid`: `recommendationForm`, `recommendation_event_select`, `recommendation_market_input`, `recommendation_odds_input`, `recommendation_type_select`, `icp_score_input`, `publish_recommendation_button`, `unnormalized_event_error`.

## Validaciones Zod

- `eventId`: UUID de evento normalizado.
- `market`: string trim, min 1.
- `odds`: number finite, > 1.0.
- `type`: enum `pre|live`.
- `icp`: objeto/campos requeridos pendientes de definicion.

## Tests Minimos

- Unit: ICP completo/incompleto y odds invalidas.
- API: admin/editor publica recommendation normalizada.
- API: evento unnormalized bloqueado sin insert.
- API/RBAC: user comun recibe `403`.
- API: duplicado segun politica aprobada.
- E2E: admin publica y aparece en feed.

## Criterios de Cierre

- AC SL-28 cubiertos: publicacion exitosa, evento no normalizado, usuario sin permisos.
- ICP definido con campos obligatorios y tests.
- Publicacion no acepta datos unnormalized.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Campos ICP requeridos y rangos.
- Duplicado: rechazar, versionar o actualizar.
- Modelo normalized event/market.
- Admin vs editor para publicar y editar.
