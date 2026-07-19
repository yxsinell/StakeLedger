# Implementation Plan: STORY-SL-18 - Autocompletado de catalogo

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-014
- API contract: `.context/SRS/api-contracts.yaml` `/api/catalog/teams`, `/api/catalog/competitions`

## Estado Actual Verificado

- No existen rutas `src/app/api/catalog/*`.
- `src/types/supabase.ts` no contiene tablas de catalogo.
- No existen componentes de autocomplete ni servicios de catalogo.
- `bet_legs` guarda `market` y `selection` como texto, sin FK a catalogo.
- Fase 2A marco catalogo como migration-first y dependencia previa a bets/recommendations.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de SL-5 si busqueda/lectura de catalogo cambia por rol, aunque lectura puede ser para usuarios autenticados.
- Debe implementarse antes de SL-12 si tickets usan entidades normalizadas; la dependency en story hacia SL-12 esta invertida para build order.
- No depende directamente de Banks, pero su salida alimenta Bets y Recommendations.

## Alcance

- Buscar equipos y competiciones con query trimmeada de al menos 2 caracteres.
- Devolver resultados normalizados por tipo.
- Mostrar estados loading, empty y opcion de ingreso manual.
- Mantener fuera de alcance fuzzy avanzado, temporada y sync realtime.

## Archivos a Tocar

- `src/app/api/catalog/teams/route.ts` - search teams.
- `src/app/api/catalog/competitions/route.ts` - search competitions.
- `src/lib/catalog/schemas.ts` - query y response schemas.
- `src/lib/catalog/service.ts` - busqueda local y fallback externo si se aprueba.
- `src/lib/catalog/cache.ts` - cache por query si se implementa.
- `src/components/catalog/catalog-autocomplete.tsx` - componente dominio.
- `src/lib/openapi/schemas/catalog.ts` - schemas OpenAPI.
- Formularios de bet/recommendation - integrar autocomplete donde corresponda.

## DB/RLS Necesarios

- Migration-first: requiere tablas aun inexistentes local/remoto para `catalog_teams`, `catalog_competitions`, `catalog_aliases` o modelo unificado `catalog_items`.
- Definir `normalization_status` (`NORMALIZED|UNNORMALIZED`) y `entity_type`.
- Indices por nombre normalizado, alias y provider ids.
- RLS: usuarios autenticados pueden leer catalogo; writes reservados a admin/editor o server flow aprobado.
- Si hay fallback externo/cache persistente, definir TTL, provider y stale policy.

## API Necesaria

- `GET /api/catalog/teams?q=`.
- `GET /api/catalog/competitions?q=`.
- Success: `200` con `CatalogListResponse` y resultados normalizados.
- Errors: `400` query invalida si se decide validar server-side; `401`; `503` fallback externo falla si no hay resultados locales.
- Debe no llamar API si `q.trim().length < 2` desde UI; API debe proteger igual.

## UI Necesaria

- Input autocomplete reusable con debounce, loading, empty y manual CTA.
- Mostrar tipo, nombre normalizado y alias si aplica.
- `data-testid`: `catalogAutocomplete`, `catalog_search_input`, `catalog_suggestions_list`, `catalog_suggestion_item`, `catalog_empty_state`, `manual_entry_button`.

## Validaciones Zod

- `q`: string trim, min 2, max 100.
- `type`: derivado por endpoint (`team|competition`).
- Rechazar query solo espacios y caracteres inutiles segun regla aprobada.

## Tests Minimos

- Unit: query corta/no trimmeada no busca.
- API: devuelve equipos y competiciones normalizados.
- API: sin resultados locales habilita empty/fallback segun estrategia.
- Integration: alias matchea item normalizado.
- E2E: autocomplete muestra sugerencias y manual CTA.

## Criterios de Cierre

- AC SL-18 cubiertos: autocomplete exitoso, query corta, sin resultados.
- Build order corregido: catalogo disponible antes de tickets/recommendations que lo requieran.
- Provider/cache definidos o fallback marcado como no implementado en MVP.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Proveedor externo, timeout y fallback exacto.
- TTL/cache keys para busquedas.
- Mensaje UI de query corta.
- Modelo unificado vs tablas separadas para teams/competitions.
