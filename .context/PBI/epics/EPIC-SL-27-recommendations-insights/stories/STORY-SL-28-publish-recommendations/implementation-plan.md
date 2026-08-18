# Implementation Plan - SL-28

**Estado:** Implementado y verificado en Fase 4J

## Fuentes

- `story.md`, `acceptance-test-plan.md`
- `.context/business-data-map.md`
- `.context/SRS/functional-specs.md` FR-022
- `.context/SRS/api-contracts.yaml`

## Baseline Verificado

- Tabla remota `recommendations` endurecida con RLS, lifecycle y RPCs de aplicación.
- RBAC y catálogo normalizado ya están implementados.
- 36 migrations locales/remotas están sincronizadas hasta `20260817201754_include_incomplete_settled_metrics`.

## Implementación Completada

1. Migrations Fase 4J ajustan recommendations para referencias normalizadas, ICP JSONB validado, lifecycle y timestamps sin delete/backfill destructivo.
2. RPCs `SECURITY INVOKER`, `search_path=''`, implementan create/update/publish/inactivate con `EXECUTE` solo para `service_role`.
3. `authenticated` carece de DML directo; RLS y views separan lectura published y editorial.
4. Schemas Zod, servicio, cookie BFF y UI editorial restringen `POST` a creación `draft` con `201`; `PATCH` concentra edit/publish/inactivate con `200`, transiciones terminales y errores verificables.
5. OpenAPI runtime/estático y tipos Supabase quedaron sincronizados.

## Archivos Implementados

- `supabase/migrations/20260817183033_implement_recommendations_and_metrics.sql`
- `supabase/migrations/20260817183135_harden_recommendation_views.sql`
- `supabase/migrations/20260817195657_validate_recommendation_constraints.sql`
- `supabase/migrations/20260817200805_fix_recommendation_atomicity_and_metrics.sql`
- `supabase/migrations/20260817201754_include_incomplete_settled_metrics.sql`
- `src/lib/recommendations/{schemas,service}.ts`
- `src/app/api/recommendations/**/route.ts`
- `src/components/recommendations/*`
- `src/lib/openapi/schemas/recommendations.ts`

## Reglas Cerradas

- ICP exacto visible; nunca scoring/ranking.
- Draft editable, published editable, inactive terminal.
- Sin delete físico, provider, scraping ni ticket automático.

## Verificación Final

- RLS/grants/advisors, OpenAPI, unit tests, SQL rollback, repo checks y E2E específico 4J pasan.
- Los 12 casos ATP no se ejecutaron manualmente uno a uno; cobertura y gaps están en `.context/reports/phase-4j-verification.md`.
