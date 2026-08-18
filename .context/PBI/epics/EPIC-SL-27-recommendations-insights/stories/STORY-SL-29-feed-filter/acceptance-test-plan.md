# Acceptance Test Plan - SL-29

- **Fecha:** 2026-08-17
- **Estado:** Implementado; cobertura automatizada relevante registrada
- **Casos diseñados:** 10
- **Ejecución manual completa:** No ejecutada

## Objetivo

Validar feed published-only, filtros y cursor estable sin ranking ICP.

## Casos

| ID | Nivel | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| SL29-01 | API/RLS | Feed con draft/published/inactive | Solo published |
| SL29-02 | API | Sin limit | 20 máximo y nextCursor según continuidad |
| SL29-03 | API | Limit 1, 50, 0 y 51 | 1/50 aceptados; 0/51 `400` |
| SL29-04 | API | Filtro type pre/live | Solo type solicitado |
| SL29-05 | API | Filtros sport y leagueId | Solo coincidencias normalizadas |
| SL29-06 | API | Combinación type/sport/leagueId | Intersección exacta |
| SL29-07 | API | Empate de published_at | Orden id DESC determinista |
| SL29-08 | API | Segunda página con cursor | Sin duplicados ni saltos respecto a clave compuesta |
| SL29-09 | API | Cursor/type/leagueId inválidos | `400`, sin fallback silencioso |
| SL29-10 | API/UI | Scores ICP inversos a fecha | Orden sigue published_at/id; empty state correcto |

## Oracle De Orden

Comparar cada secuencia con `published_at DESC,id DESC`. Cursor representa el último par devuelto y nunca expone ni usa score ICP.

## Cobertura Automatizada Observada

- Unit: defaults/límites de filtros y round-trip/rechazo de cursor dentro de 84 tests/219 assertions PASS.
- DB/RLS: lectura published-only, grants y soporte de índices verificados.
- E2E específico 4J: carga de feed, filtros type/sport y empty state PASS.
- OpenAPI, repo checks y migrations local/remoto verificados.

## Gaps

- No se ejecutaron manualmente los 10 casos como suite ATP trazada uno a uno.
- Quedan sin evidencia E2E específica el empate de timestamp, combinación con `leagueId`, load-more y continuidad entre páginas; unit/DB cubren partes del contrato.
