# Acceptance Test Plan - SL-30

- **Fecha:** 2026-08-17
- **Estado:** Implementado; cobertura automatizada relevante registrada
- **Casos diseñados:** 10
- **Ejecución manual completa:** No ejecutada

## Objetivo

Validar persistencia idempotente, ownership de bank, prefill normalizada y ausencia total de ticket/ledger automático.

## Casos

| ID | Nivel | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| SL30-01 | API/DB | Follow published con bank propio | `201`, una fila y prefill normalizada |
| SL30-02 | API/DB | Replay con mismo bank y con otro bank propio | Mismo bank: `200` y mismo follow; otro bank: `409`, sin reemplazo/duplicado |
| SL30-03 | DB/concurrency | Dos follows concurrentes | Unique conserva una fila y respuesta equivalente |
| SL30-04 | API | bankId ausente/inválido | `400`, cero follows |
| SL30-05 | API/RLS | bank ajeno o inexistente | `404` genérico, cero follows |
| SL30-06 | API | Recommendation draft | Rechazo, sin prefill/follow |
| SL30-07 | API | Recommendation inactive | Rechazo; follows históricos permanecen |
| SL30-08 | API | Datos normalizados incompletos | Rechazo atómico |
| SL30-09 | API contract | Prefill devuelta | bankId, recommendationId, odds y una leg normalized exacta |
| SL30-10 | DB/E2E | Comparar tablas financieras antes/después | Cero bets/legs/funding/transactions/pocket changes |

## Cobertura Automatizada Observada

- Unit: prefill normalizada sin stake/funding y schema de respuesta dentro de 84 tests/219 assertions PASS.
- SQL rollback: follow inicial con señal `created=true`, replay idempotente con `created=false`, conflicto, inactive y cero creación de bet PASS; residuo cero.
- RLS/grants/RPC: `authenticated` sin DML/EXECUTE y `service_role` permitido.
- E2E específico 4J: selector de bank y conteo de bets sin incremento PASS.

## Gaps

- No se ejecutaron manualmente los 10 casos como suite ATP trazada uno a uno.
- E2E específico no crea un follow real ni recorre feed -> follow -> formulario prefilled; concurrencia y cross-owner no tienen evidencia Playwright.
