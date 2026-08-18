# Implementation Plan - SL-29

**Estado:** Implementado y verificado en Fase 4J

## Fuentes

- `story.md`, `acceptance-test-plan.md`
- `.context/SRS/functional-specs.md` FR-023
- `.context/SRS/api-contracts.yaml`

## Baseline Verificado

- Endpoint/feed real de recommendations, lifecycle e índices Fase 4J están implementados local/remotamente.

## Implementación Completada

1. Índice y view soportan `status='published'`, `published_at DESC,id DESC` y filtros normalizados con privilegios estrictos.
2. Query RLS published-only implementa filtros `type|sport|leagueId` y cursor opaco del último `(published_at,id)` sin offset ni ICP.
3. Cookie BFF valida `limit` 20 por defecto/1..50 y devuelve `nextCursor` nullable.
4. Feed UI implementa filtros, loading/error/empty, load-more y ICP visible sin ordenación por score.

## Archivos Implementados

- `supabase/migrations/20260817183033_implement_recommendations_and_metrics.sql`
- `supabase/migrations/20260817183135_harden_recommendation_views.sql`
- `src/lib/recommendations/{cursor,schemas,service}.ts`
- `src/app/api/recommendations/route.ts`
- `src/components/recommendations/{recommendation-feed,recommendation-filters}.tsx`
- OpenAPI runtime schemas.

## Seguridad

- Feed requiere cookie autenticada.
- RLS garantiza published-only para users; editor/admin accede a estados editoriales por ruta separada, no por bypass de filtros.

## Verificación Final

- Unit, DB/RLS, OpenAPI, repo checks y E2E específico de filtro/empty state pasan.
- Los 10 casos ATP no se ejecutaron manualmente uno a uno; gaps E2E constan en `.context/reports/phase-4j-verification.md`.
