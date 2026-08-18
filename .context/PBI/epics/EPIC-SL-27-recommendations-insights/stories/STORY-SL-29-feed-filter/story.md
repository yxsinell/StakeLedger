# SL-29 - Feed filtrable de recomendaciones

- **Jira Key:** SL-29
- **Epic:** EPIC-SL-27
- **Estado documental:** Implementado
- **Estado de ejecución:** Cerrado con cobertura automatizada relevante; ATP manual completo no ejecutado

## User Story

Como usuario autenticado, quiero navegar un feed filtrable y estable para encontrar recomendaciones publicadas sin exposición editorial ni ranking opaco.

## Alcance

- Mostrar exclusivamente recommendations `published`.
- Filtrar opcionalmente por `type=pre|live`, `sport` y `leagueId`.
- Ordenar siempre por `published_at DESC, id DESC`.
- Paginar con cursor opaco, `limit=20` por defecto y máximo `50`.
- Mostrar ICP completo como información visible, nunca como ranking.

## Acceptance Criteria

### AC1 - Published-only

Usuario común nunca recibe `draft` ni `inactive`, aunque conozca IDs o manipule filtros/cursor.

### AC2 - Filtros

Cada filtro y combinación devuelven solo coincidencias. `leagueId` es UUID; type y cursor inválidos responden `400`. Cambiar filtros reinicia cursor.

### AC3 - Orden estable

Resultados usan `published_at DESC,id DESC`; empate de timestamp se resuelve por id descendente. ICP no afecta posición.

### AC4 - Cursor

Primera página usa 20 por defecto. `limit` acepta 1..50. `nextCursor` es opaco, nullable y continúa después del último par `(published_at,id)` sin offset.

### AC5 - Estados UI

Loading, error, empty state y continuación de páginas son verificables; filtros vacíos no inventan contenido.

## Fuera De Alcance

- Feed público anónimo, notificaciones y personalización.
- Provider, scraping, ranking ICP y offset pagination.

## Dependencias

- SL-28 y catálogo normalizado.

## Evidencia De Cierre

- Endpoint, índice, RLS published-only y UI están implementados mediante migrations Fase 4J sincronizadas.
- Unit tests cubren cursor/filtros; Playwright 4J valida filtro y empty state. Cobertura exhaustiva ATP manual no fue ejecutada.
- Cobertura y gaps: `.context/reports/phase-4j-verification.md`.
