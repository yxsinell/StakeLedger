# Implementation Plan: STORY-SL-29 - Feed filtrable

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-023
- API contract: `.context/SRS/api-contracts.yaml` `/api/recommendations`

## Estado Actual Verificado

- No existe endpoint de recommendations.
- Dashboard muestra feed hardcodeado sin filtros reales.
- No existe schema de recommendations, sport, league o event.
- OpenAPI define query `type` (`pre|live`), pero no sport/league ni paginacion.

## Dependencias

- Depende de Identity para usuario autenticado si feed no es publico.
- Depende de SL-28 para recommendations publicadas.
- Depende de Catalog SL-18/SL-20 para sport/league normalizados.
- No depende directamente de Banks hasta SL-30.

## Alcance

- Listar recommendations publicadas.
- Filtrar por type `pre|live` y opcionalmente por sport/league si se agrega contrato.
- Ordenar por fecha desc.
- Mostrar loading/empty states.

## Archivos a Tocar

- `src/app/api/recommendations/route.ts` - list con filtros.
- `src/lib/recommendations/schemas.ts` - filter query schema.
- `src/lib/recommendations/service.ts` - query, pagination y ordering.
- `src/components/recommendations/recommendation-feed.tsx` - feed UI.
- `src/components/recommendations/recommendation-filters.tsx` - filtros.
- `src/app/dashboard/page.tsx` o `src/app/dashboard/recommendations/page.tsx` - integrar feed real.
- `src/lib/openapi/schemas/recommendations.ts` - actualizar filtros si se aprueba.

## DB/RLS Necesarios

- Migration-first: requiere `recommendations` y referencias a event/sport/league.
- Indices por `status`, `type`, `published_at`, `sport`, `league` si existen.
- Definir tie-breaker de orden (`published_at DESC, id DESC`).
- RLS: usuarios autenticados leen recommendations publicadas; drafts/inactive solo admin/editor.

## API Necesaria

- `GET /api/recommendations?type=&sport=&league=&limit=&cursor=`.
- `type` ya existe en OpenAPI; sport/league/pagination requieren actualizar contrato si se implementan.
- Success: `200` con `RecommendationListResponse` y pagination metadata si se aprueba.
- Errors: `400` filtro invalido, `401` si feed requiere auth.

## UI Necesaria

- Feed con tabs/filter buttons para pre-match/live.
- Selects opcionales sport/league y empty state.
- `data-testid`: `recommendationFeed`, `recommendation_filter_pre`, `recommendation_filter_live`, `sport_filter_select`, `league_filter_select`, `recommendationCard`, `recommendation_empty_state`.

## Validaciones Zod

- `type`: optional enum `pre|live`.
- `sport`, `league`: optional string/slug/UUID segun catalog decision.
- `limit`: integer 1..100.
- `cursor`: string si se usa cursor pagination.

## Tests Minimos

- Unit: query filters validos/invalidos.
- API: filter pre muestra solo pre.
- API: filter live muestra solo live.
- API: orden fecha desc y tie-breaker.
- E2E: usuario cambia filtros y ve empty state.
- Performance/manual: feed cumple NFR p95 si se define dataset.

## Criterios de Cierre

- AC SL-29 cubiertos: filtros pre, live, sport/league, empty.
- Contrato actualizado si sport/league/pagination se agregan.
- Feed no muestra drafts/inactive a usuarios comunes.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Page size default y pagination strategy.
- Campo de orden y tie-breaker.
- Sport/league como texto, slug o FK catalog.
- Copy de empty state.
