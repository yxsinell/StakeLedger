# SL-28 - Publicar recomendaciones normalizadas

- **Jira Key:** SL-28
- **Epic:** EPIC-SL-27
- **Estado documental:** Implementado
- **Estado de ejecución:** Cerrado con cobertura automatizada relevante; ATP manual completo no ejecutado

## User Story

Como editor o admin, quiero crear, editar, publicar e inactivar recomendaciones normalizadas con ICP visible para que el usuario reciba picks explicables y controlados.

## Alcance

- Crear recommendations exclusivamente en estado `draft` mediante `POST /api/recommendations`.
- Editar recommendations `draft` o `published` mediante `PATCH /api/recommendations/{recommendationId}`.
- Publicar exclusivamente drafts con evento y mercado normalizados mediante `PATCH`.
- Inactivar drafts o publicadas mediante `PATCH`. `inactive` es terminal, bloquea follows y no admite reactivación.
- Preservar recommendations y follows históricos; no existe borrado físico.
- Exponer ICP exacto `{version:1,score:integer 0..100,factors:string[1..20]}` con cada factor no vacío.

## Acceptance Criteria

### AC1 - Crear y editar draft

Editor/admin autenticado por cookie crea un draft válido mediante `POST` y recibe `201`. `POST` rechaza `published` e `inactive`. Puede editarlo mediante `PATCH`, que devuelve `200`. Usuario común recibe `403` y no hay escritura.

### AC2 - Publicar datos normalizados

Publicar mediante `PATCH` valida evento `normalized`, mercado `normalized`, pertenencia mercado-evento, selection no vacía, odds `>1`, type `pre|live` e ICP exacto. Éxito devuelve `200`, fija `status=published` y `published_at`.

### AC3 - ICP visible sin ranking

Respuesta editorial y feed muestran el objeto ICP completo. Score/factors nunca alteran orden ni ranking.

### AC4 - Inactive terminal

Inactivar draft/publicada mediante `PATCH` fija estado terminal. Nuevos edits, publish, reactivación, follow y delete físico se rechazan; históricos permanecen.

### AC5 - Seguridad

Writes pasan por cookie BFF y RPCs `SECURITY INVOKER` ejecutables solo por `service_role`. `authenticated` conserva lectura RLS y carece de DML/EXECUTE directo.

## Fuera De Alcance

- Provider deportivo, scraping o publicación masiva.
- Ranking/personalización por ICP.
- Recomendaciones manuales/no normalizadas.
- Creación automática de tickets.

## Dependencias

- SL-5 RBAC y SL-18..20 catálogo implementados.
- Bloquea SL-29 y SL-30.

## Evidencia De Cierre

- Migration/RLS/RPC, API y UI implementadas mediante `20260817183033_implement_recommendations_and_metrics` y `20260817183135_harden_recommendation_views`.
- Unit tests cubren validación ICP/OpenAPI; SQL rollback cubre create/publish/inactive y grants; Playwright 4J valida superficie editorial y rechazo de referencia inexistente.
- Cobertura y gaps: `.context/reports/phase-4j-verification.md`.
