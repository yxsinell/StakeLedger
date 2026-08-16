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
- `src/types/supabase.ts` contiene tablas de catalogo: `catalog_teams`, `catalog_competitions`, `catalog_aliases`, `catalog_events`, `catalog_markets`.
- No existen componentes de autocomplete ni servicios de catalogo.
- `bet_legs` guarda `market` y `selection` como texto, sin FK a catalogo.
- `bet_legs` ya dispone de FKs opcionales `event_id` y `market_id`; falta contrato para manual entries futuras.
- Fase 2A marco catalogo como migration-first y dependencia previa a bets/recommendations.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de SL-5 si busqueda/lectura de catalogo cambia por rol, aunque lectura puede ser para usuarios autenticados.
- Debe implementarse antes de SL-12 si tickets usan entidades normalizadas; la dependency en story hacia SL-12 esta invertida para build order.
- No depende directamente de Banks, pero su salida alimenta Bets y Recommendations.

## Alcance

- Buscar equipos y competiciones con query trimmeada de al menos 2 caracteres en catalogo local.
- Devolver resultados normalizados por tipo.
- Mostrar estados loading, empty y opcion de ingreso manual.
- Mantener fuera de alcance fuzzy avanzado, temporada, sync realtime, cache externa y proveedor externo.

## Archivos a Tocar

- `src/app/api/catalog/teams/route.ts` - search teams.
- `src/app/api/catalog/competitions/route.ts` - search competitions.
- `src/lib/catalog/schemas.ts` - query y response schemas.
- `src/lib/catalog/service.ts` - busqueda local.
- `src/components/catalog/catalog-autocomplete.tsx` - componente dominio.
- `src/lib/openapi/schemas/catalog.ts` - schemas OpenAPI.
- Formularios de bet/recommendation - integrar autocomplete donde corresponda.

## DB/RLS Necesarios

- Las tablas `catalog_teams`, `catalog_competitions` y `catalog_aliases` ya existen.
- Solo se devuelven filas con `normalization_status='normalized'`.
- Indices actuales cubren `normalized_name`; evaluar indice adicional para alias si el plan de consulta lo requiere.
- RLS actual: usuarios autenticados leen catalogo; escritura reservada a editor/admin.
- No hay fallback externo ni cache persistente en MVP.

## API Necesaria

- `GET /api/catalog/teams?q=`.
- `GET /api/catalog/competitions?q=`.
- Success: `200` con `CatalogListResponse`, resultados normalizados y `nextOffset`.
- Errors: `400` query invalida; `401` sin sesion.
- Debe no llamar API si `q.trim().length < 2` desde UI; API debe proteger igual.

## UI Necesaria

- Input autocomplete reusable con debounce, loading, empty y manual CTA.
- Mostrar tipo, nombre normalizado y alias si aplica.
- Mensaje para query corta: `Escribe al menos 2 caracteres para buscar`.
- `data-testid`: `catalogAutocomplete`, `catalog_search_input`, `catalog_suggestions_list`, `catalog_suggestion_item`, `catalog_empty_state`, `manual_entry_button`.

## Validaciones Zod

- `q`: string trim, min 2, max 100.
- `limit`: entero 1..25, default 10.
- `offset`: entero >= 0, default 0.
- `type`: derivado por endpoint (`team|competition`).
- Rechazar query solo espacios y caracteres inutiles segun regla aprobada.

## Tests Minimos

- Unit: query corta/no trimmeada no busca.
- API: devuelve equipos y competiciones normalizados.
- API: sin resultados locales devuelve lista vacia y UI habilita ingreso manual.
- Integration: alias matchea item normalizado.
- E2E: autocomplete muestra sugerencias y manual CTA.

## Criterios de Cierre

- AC SL-18 cubiertos: autocomplete exitoso, query corta, sin resultados.
- Build order corregido: catalogo disponible antes de tickets/recommendations que lo requieran.
- Provider/cache/fallback externo marcados fuera de alcance MVP.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Ninguna bloqueante para MVP.
