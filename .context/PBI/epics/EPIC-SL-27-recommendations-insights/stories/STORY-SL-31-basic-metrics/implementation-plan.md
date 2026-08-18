# Implementation Plan - SL-31

**Estado:** Implementado y verificado en Fase 4J

## Fuentes

- `story.md`, `acceptance-test-plan.md`
- `.context/SRS/functional-specs.md` FR-025
- `.context/SRS/api-contracts.yaml`
- `.context/reports/phase-4h-verification.md`

## Baseline Verificado

- Settlement Fase 4H está implementado y aplicado remotamente; `result`, `profit_amount`, `settled_at` y funding trazable existen.
- Endpoint, RPC y UI de métricas Fase 4J están implementados local/remotamente.

## Implementación Completada

1. RPC `get_metrics_overview` es `SECURITY INVOKER`, `search_path=''`, ejecutable solo por `service_role`; valida bank propio y rango UTC máximo 366 días.
2. Fuente trazable consulta todas las `bets.status='settled'` por rango inclusivo; usa `profit_amount` y stake para rendimiento operativo, y deriva por separado componentes cash desde funding disponible.
3. RPC calcula cash/operative yield y win rate decisivo, excluye cashout/void según contrato y devuelve cero ante denominador cero.
4. Cookie BFF y UI implementan filtros/KPIs sin reescribir ledger.

## Archivos Implementados

- `supabase/migrations/20260817183033_implement_recommendations_and_metrics.sql`
- `supabase/migrations/20260817183135_harden_recommendation_views.sql`
- `supabase/migrations/20260817200805_fix_recommendation_atomicity_and_metrics.sql`
- `supabase/migrations/20260817201754_include_incomplete_settled_metrics.sql`
- `src/lib/metrics/{schemas,service}.ts`
- `src/app/api/metrics/overview/route.ts`
- `src/components/metrics/{metrics-overview,metrics-filters}.tsx`
- OpenAPI runtime schemas.

## Seguridad Y Precisión

- `authenticated` no ejecuta RPC directamente; ownership se valida también dentro de SQL.
- No usar cache en MVP.
- Ratios usan precisión numérica del servidor y contrato consistente; nunca reescriben ledger.

## Verificación Final

- Unit, RPC/grants, advisors, repo checks y E2E específico de un settled cash won pasan.
- Los 12 casos ATP no se ejecutaron manualmente uno a uno; gaps numéricos y de límites constan en `.context/reports/phase-4j-verification.md`.
