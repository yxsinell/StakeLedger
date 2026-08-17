# Implementation Plan: STORY-SL-16 - Historial inmutable

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-013
- API contract: `.context/SRS/api-contracts.yaml` no declara endpoint audit dedicado

## Estado Actual Verificado

- `audit_logs` existe con `action`, `actor_id`, `entity_type`, `entity_id`, `created_at`.
- `audit_logs.Update` permite campos en generated types; no hay evidencia local de trigger append-only.
- No existe endpoint de consulta audit ni UI de historial.
- No existe catalogo de acciones permitidas.
- Fase 2A marco audit immutability como migration-first.

## Dependencias

- Depende de Identity para actor y permisos.
- Depende de Banks/Bets para operaciones que generan eventos.
- Depende de SL-12/SL-14/SL-15 para eventos de bet lifecycle.
- Usa RBAC SL-5 para definir acceso admin a historiales ajenos.

## Alcance

- Registrar eventos de bank/bet/goal/recommendation con timestamp y actor.
- Prohibir update/delete de eventos.
- Consultar historial por entidad propia con orden estable.
- Mantener fuera de alcance exportaciones avanzadas y integraciones externas.

## Archivos a Tocar

- `src/lib/audit/actions.ts` - catalogo de eventos permitidos.
- `src/lib/audit/service.ts` - append y query autorizada.
- `src/app/api/audit/route.ts` - consulta por `entityType`/`entityId` si se aprueba nuevo contrato.
- `src/lib/api/auth.ts` - permisos owner/admin para audit.
- `src/components/audit/audit-history.tsx` - vista de historial.
- Servicios de banks/bets/goals/recommendations - insertar eventos al cerrar operaciones.
- `.context/SRS/api-contracts.yaml` - solo si se aprueba documentar endpoint audit.

## DB/RLS Necesarios

- Migration-first: requiere trigger/policy que bloquee `UPDATE` y `DELETE` en `audit_logs`.
- Requiere constraint/catalogo para `entity_type` y `action` permitidos.
- Requiere indices por `(entity_type, entity_id, created_at, id)` para consulta estable.
- Definir si admin puede leer historiales ajenos; owner siempre solo propios.
- RLS: insert solo desde server/RPC aprobado; select por owner/admin.

## API Necesaria

- `GET /api/audit?entityType=&entityId=&limit=&cursor=` si se aprueba endpoint.
- No exponer `PATCH`/`DELETE`; responder `405` si existen handlers defensivos.
- Success: eventos ordenados por `created_at DESC, id DESC`.
- Errors: `400` filtros invalidos, `403` entidad ajena, `404` entidad inexistente.

## UI Necesaria

- Panel de historial en detalle de bank/bet con filtros minimos.
- Estados empty/loading/error y paginacion simple.
- `data-testid`: `auditHistory`, `audit_event_item`, `audit_empty_state`, `audit_load_more_button`, `audit_permission_error`.

## Validaciones Zod

- `entityType`: enum aprobado (`bank|bet|transaction|goal|recommendation`).
- `entityId`: UUID.
- `limit`: integer 1..100.
- `cursor`: string/ISO+id si se usa paginacion cursor.

## Tests Minimos

- Unit: action catalog rechaza acciones desconocidas.
- API: consulta entidad propia ordenada.
- API/RLS: entidad ajena devuelve `403`.
- DB/RLS: update/delete de audit log falla y registro queda intacto.
- Integration: operacion bank/bet crea audit event.
- E2E: usuario ve historial de una entidad propia.

## Criterios de Cierre

- AC SL-16 cubiertos: registro, inmutabilidad, consulta por entidad.
- No existe ruta ni policy que permita editar/borrar eventos.
- Orden estable definido y probado.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Endpoint y parametros definitivos para consulta audit.
- Permisos admin sobre historiales ajenos.
- Politica de retencion.
- Criterio de orden estable con timestamps iguales.

## Implementación Fase 4H — 2026-08-17

Decisiones abiertas cerradas. Trigger, catálogo e índice base ya existían; Fase 4H refuerza grants, agrega acciones `returned|derived`, enlaza transactions con bet/cashout y expone consulta cookie-BFF y panel de auditoría en detalle ticket.
