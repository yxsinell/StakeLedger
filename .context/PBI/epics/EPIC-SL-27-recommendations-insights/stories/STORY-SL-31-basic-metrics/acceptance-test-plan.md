# Acceptance Test Plan - SL-31

- **Fecha:** 2026-08-17
- **Estado:** Implementado; cobertura automatizada relevante registrada
- **Casos diseñados:** 12
- **Ejecución manual completa:** No ejecutada

## Objetivo

Probar dataset settled-only, límites UTC, fórmulas por funding y aislamiento por bank con resultados numéricos reproducibles.

## Casos

| ID | Nivel | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| SL31-01 | Unit/DB | 100% cash won/lost | Cash y operative yield según beneficio/stake |
| SL31-02 | Unit/DB | Mix cash/bonus/freebet | Cash yield usa solo componente cash; operative usa total |
| SL31-03 | Unit/DB | won,lost,half_won,half_lost | Win rate ponderado exacto |
| SL31-04 | Unit/DB | void dentro del rango | Incluye settledCount; excluye decisiveCount/win rate |
| SL31-05 | Unit/DB | cashout dentro del rango | Excluido de todos los agregados |
| SL31-06 | API/DB | open y settled fuera del rango | Excluidos |
| SL31-07 | API/DB | settled exactamente en límites UTC | Ambos límites inclusivos |
| SL31-08 | API | Rango sin settled | Todos los agregados y ratios en cero |
| SL31-09 | API | from > to o rango 367 días | `400` |
| SL31-10 | API | Rango exacto 366 días | Aceptado |
| SL31-11 | API/RLS | bank ajeno/inexistente | `404` genérico y sin fuga cross-owner |
| SL31-12 | RLS/grants | RPC directa authenticated | Denegada; service_role desde BFF permitido |

## Fixture Numérico Mínimo

Para cuatro resultados decisivos `won,lost,half_won,half_lost`, win rate esperado es `(1 + 0.5) / 4 = 0.375`. Agregar void no cambia numerador ni denominador decisivo.

## Cobertura Automatizada Observada

- Unit: llamada RPC, parse estricto y mapeo de errores dentro de 84 tests/219 assertions PASS.
- DB/security: RPC remota `SECURITY INVOKER` exclusiva de `service_role`, ownership y fuente de métricas con privilegios estrictos verificados.
- E2E específico 4J: un settled cash won produce counts, stakes, profit y ratios esperados; UI de resultados PASS.
- Migrations, tipos, OpenAPI, repo checks y advisors verificados.

## Gaps

- No se ejecutaron manualmente los 12 casos como suite ATP trazada uno a uno.
- Sin evidencia E2E específica para mix bonus/freebet, half/void/cashout, denominador cero, límites UTC, 366/367 días y cross-owner; requieren cobertura futura o ejecución manual dirigida.
