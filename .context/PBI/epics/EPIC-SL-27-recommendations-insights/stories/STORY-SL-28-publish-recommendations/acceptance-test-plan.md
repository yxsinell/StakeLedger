# Acceptance Test Plan - SL-28

- **Fecha:** 2026-08-17
- **Estado:** Implementado; cobertura automatizada relevante registrada
- **Casos diseñados:** 12
- **Ejecución manual completa:** No ejecutada

## Objetivo

Validar lifecycle editorial, normalización, ICP v1 y separación cookie BFF/service-role/RLS.

## Casos

| ID | Nivel | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| SL28-01 | API/DB | Editor usa `POST` con payload `status=draft` válido | `201`, draft persistido, ICP exacto visible |
| SL28-02 | API/DB | Admin usa `PATCH` para editar draft y published | `200`, mismo id; campos no enviados, normalización e ICP se preservan |
| SL28-03 | API/DB | Usuario común crea/edita | `403`, cero mutaciones |
| SL28-04 | API/DB | Evento manual/no normalizado | `400`, cero mutaciones |
| SL28-05 | API/DB | Mercado no normalizado o de otro evento | `400`, cero mutaciones |
| SL28-06 | Unit/API | ICP boundaries score 0 y 100, factors 1 y 20 | Aceptados con objeto intacto |
| SL28-07 | Unit/API | Score decimal/out of range; factors 0/21/vacío | `400` |
| SL28-08 | API/DB | Publicar draft válido mediante `PATCH` | `200`, published_at fijado una vez |
| SL28-09 | API/DB | Publicar estado no permitido | `409`, estado sin cambios |
| SL28-10 | API/DB | Inactivar draft/publicada mediante `PATCH` | `200`, estado inactive terminal; históricos intactos |
| SL28-11 | API/DB | Editar/reactivar/publicar/delete inactive | Rechazo; no existe delete físico |
| SL28-12 | RLS/grants | `authenticated` intenta DML/EXECUTE directo | Denegado; service_role RPC permitido |

## Datos Límite

- ICP válido mínimo: `{version:1,score:0,factors:["a"]}`.
- ICP válido máximo: score 100 y 20 factors no vacíos.
- Odds: `>1`; type: `pre|live`; IDs UUID normalizados relacionados.

## Cobertura Automatizada Observada

- Unit: ICP boundaries/factors, validaciones y OpenAPI runtime dentro de 84 tests/219 assertions PASS.
- SQL rollback: create, publish, inactive terminal y grants/RLS PASS, sin residuo.
- E2E específico 4J: superficie editorial y rechazo de evento inexistente PASS.
- Migrations remotas/locales, tipos, `bun run repo:check`, `git diff --check` y advisors verificados.

## Gaps

- No se ejecutaron manualmente los 12 casos como suite ATP trazada uno a uno.
- E2E específico no recorre create/edit/publish/inactivate exitosos; esa cobertura queda en unit/SQL/API automatizados.

Fuente de evidencia: `.context/reports/phase-4j-verification.md`.
