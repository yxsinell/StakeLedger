# Implementation Plan - SL-30

**Estado:** Implementado y verificado en Fase 4J

## Fuentes

- `story.md`, `acceptance-test-plan.md`
- `.context/SRS/functional-specs.md` FR-024
- `.context/SRS/api-contracts.yaml`

## Baseline Verificado

- Tabla remota `recommendation_follows`, RPC, endpoint y UI follow están implementados y endurecidos.
- Flujo de creación SL-12 existe y debe permanecer única vía de creación de tickets.

## Implementación Completada

1. Follow exige `bank_id`, FK/ownership y unique `(user_id,recommendation_id)`.
2. RPC `follow_recommendation` es `SECURITY INVOKER`, `search_path=''`, exclusiva de `service_role` e idempotente; devuelve `created=true|false` para que el BFF responda `201` al crear y `200` al repetir.
3. Published/normalización/inactive se validan sin borrar históricos; `authenticated` carece de DML directo y conserva SELECT RLS propio.
4. Cookie BFF, prefill SL-12, CTA, selector de bank y navegación al formulario están implementados sin operación financiera implícita.

## Invariantes

- Follow no llama `create_bet_with_funding`.
- Follow no inserta bets, legs, funding o transactions ni cambia pockets.
- Replay con mismo bank conserva y devuelve el follow; otro bank propio responde `409` y no reemplaza el primero.
- Bank ajeno/inexistente produce `404` genérico.

## Archivos Implementados

- `supabase/migrations/20260817183033_implement_recommendations_and_metrics.sql`
- `supabase/migrations/20260817183135_harden_recommendation_views.sql`
- `supabase/migrations/20260817194604_add_follow_creation_status.sql`
- `src/lib/recommendations/{follow-service,schemas}.ts`
- `src/app/api/recommendations/[recommendationId]/follow/route.ts`
- `src/components/recommendations/follow-button.tsx`
- Adaptación explícita del formulario SL-12 para prefill cliente.

## Verificación Final

- Unit, SQL rollback, DB/RLS, OpenAPI, repo checks y E2E específico 4J pasan; bets no aumentan y residuo 4J queda en cero.
- Los 10 casos ATP no se ejecutaron manualmente uno a uno; gaps de follow E2E real/concurrencia constan en el reporte final.
