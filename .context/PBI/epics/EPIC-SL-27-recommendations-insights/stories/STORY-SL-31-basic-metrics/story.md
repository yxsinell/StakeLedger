# SL-31 - Métricas básicas de rendimiento

- **Jira Key:** SL-31
- **Epic:** EPIC-SL-27
- **Estado documental:** Implementado
- **Estado de ejecución:** Cerrado con cobertura automatizada relevante; ATP manual completo no ejecutado

## User Story

Como usuario, quiero consultar métricas reproducibles por bank y rango UTC para evaluar rendimiento liquidado sin mezclar cashout ni resultados no decisivos.

## Alcance

- Exigir bank propio y fechas `from|to` UTC inclusivas.
- Aceptar máximo 366 días y rechazar `from > to`.
- Incluir únicamente bets `status=settled` por `settled_at` dentro del rango.
- Excluir cashout; `void` cuenta en settledCount pero no en decisivos/win rate.
- Devolver cero cuando cualquier denominador sea cero.

## Fórmulas

- `cashYield = sum(cash funding component profit) / sum(cash-funded stake)`.
- `operativeYield = sum(profit_amount) / sum(stake_amount)`.
- `winRate = (count(won) + 0.5 * count(half_won)) / count(won|lost|half_won|half_lost)`.

## Acceptance Criteria

### AC1 - Dataset exacto

Solo bets propias del bank con `status=settled` y `settled_at` dentro de `[from 00:00:00Z, to+1day 00:00:00Z)` participan.

### AC2 - Yield cash

Numerador usa beneficio atribuible al componente cash y denominador stake financiado con cash; bonus/freebet no contaminan ambos componentes.

### AC3 - Yield operativo

Usa `profit_amount` y stake total de todas las bets settled incluidas.

### AC4 - Win rate ponderado

Won pesa 1, half_won 0.5, lost/half_lost 0; void y cashout quedan fuera del denominador decisivo.

### AC5 - Validación y ownership

Rango inválido responde `400`; bank ajeno/inexistente `404` genérico. Rango sin settled devuelve métricas y agregados en cero.

### AC6 - Seguridad

Cookie BFF invoca RPC de métricas `SECURITY INVOKER` exclusiva de `service_role`; no existe lectura agregada cross-owner.

## Fuera De Alcance

- Caché, exportación, ranking, ROI por mercado y métricas de cashout.

## Dependencias

- Fase 4H settlement implementada remotamente.

## Evidencia De Cierre

- RPC, endpoint y UI implementados mediante migrations Fase 4J sincronizadas.
- Unit tests cubren servicio/schema; Playwright 4J valida un settled cash won trazable y sus ratios exactos.
- Cobertura y gaps: `.context/reports/phase-4j-verification.md`.
