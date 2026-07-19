# Implementation Plan: STORY-SL-31 - Metricas basicas

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-025
- API contract: `.context/SRS/api-contracts.yaml` `/api/metrics/overview`

## Estado Actual Verificado

- No existe `src/app/api/metrics/overview/route.ts`.
- Dashboard muestra `Yield operativo` hardcodeado.
- `bets` no tiene result/profit/return fields suficientes para metrics.
- No hay views/functions de metrics ni formulas cerradas.
- Fase 2A marco SL-31 blocked por settlement, ledger y operative balance.

## Dependencias

- Depende de Identity para usuario autenticado.
- Depende de Banks SL-7/SL-8 para bank y operative balance.
- Depende de Bets SL-14 para apuestas liquidadas con profit/return.
- Depende de SL-16 audit/ledger para trazabilidad.
- No depende de recommendations salvo reporting futuro.

## Alcance

- Calcular yield cash, yield operativo y win rate por bank y rango de fechas.
- Mostrar ceros o empty state cuando no hay apuestas liquidadas.
- Validar rango de fechas.
- Mantener fuera de alcance ROI avanzado/exportaciones.

## Archivos a Tocar

- `src/app/api/metrics/overview/route.ts` - endpoint metrics.
- `src/lib/metrics/schemas.ts` - query/response schemas.
- `src/lib/metrics/calculations.ts` - formulas de yield y win rate.
- `src/lib/metrics/service.ts` - query de bets/ledger/views.
- `src/components/metrics/metrics-overview.tsx` - UI de KPIs.
- `src/components/metrics/metrics-filters.tsx` - bank/range filters.
- `src/app/dashboard/page.tsx` o `src/app/dashboard/metrics/page.tsx` - integrar metrics reales.
- `src/lib/openapi/schemas/metrics.ts` - schemas OpenAPI.

## DB/RLS Necesarios

- Migration-first: requiere settlement fields/views/functions aun no existentes para metrics confiables, salvo que se calcule todo en service sobre schema ampliado.
- Requiere settlement fields (`result`, `profit_amount`, `return_amount`, `settled_at`) de SL-14.
- Requiere operative balance formula de SL-8.
- Indices por `bank_id`, `settled_at`, `status/result`.
- RLS: metrics solo sobre banks/bets propios; views deben respetar ownership.

## API Necesaria

- `GET /api/metrics/overview?bankId=&from=&to=`.
- OpenAPI actual solo declara `bankId`; requiere contrato update si se agregan fechas.
- Success: `200` con `yieldCash`, `yieldOperative`, `winRate`, counts y range.
- Errors: `400` date range invalido, `403` bank ajeno, `401`.

## UI Necesaria

- KPI cards para cash yield, operative yield y win rate.
- Filtros bank y date range.
- Empty state para sin apuestas liquidadas.
- `data-testid`: `metricsOverview`, `bank_metrics_select`, `date_range_filter`, `yield_cash_value`, `yield_operative_value`, `win_rate_value`, `metrics_empty_state`, `metrics_range_error`.

## Validaciones Zod

- `bankId`: UUID.
- `from`, `to`: ISO date opcionales si se agrega rango.
- `to >= from`.
- Definir max rango y timezone.

## Tests Minimos

- Unit: yield cash, yield operativo y win rate con fixtures.
- Unit: date range invalido.
- API: metrics con apuestas liquidadas conocidas.
- API: sin apuestas devuelve ceros/empty model.
- API/RLS: bank ajeno bloqueado.
- E2E: usuario filtra bank/rango y ve KPIs.

## Criterios de Cierre

- AC SL-31 cubiertos: ver metrics, sin apuestas, rango invalido.
- Formulas exactas documentadas con ejemplos.
- Metrics solo incluyen apuestas liquidadas dentro del rango.
- Supabase types actualizados si cambia schema/view.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Formulas exactas de yield cash/yield operativo/win rate.
- Estados que cuentan como liquidados.
- Rango maximo, timezone y cache TTL.
- Calculo en DB view/function vs service TypeScript.
