# Implementation Plan: STORY-SL-20 - Gestion de catalogo y alias

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-016
- API contract: `.context/SRS/api-contracts.yaml` no declara endpoints admin especificos de catalogo

## Estado Actual Verificado

- No existen tablas de catalogo ni alias en generated types.
- No existen endpoints admin de catalogo.
- OpenAPI solo declara busqueda y manual entry, no upsert/admin aliases.
- SL-5 planifico RBAC pero todavia no implementa enforcement admin/editor.
- Fase 2A marco SL-20 como blocked por provider, alias uniqueness y concurrency rules.

## Dependencias

- Depende de Identity/RBAC SL-2/SL-3/SL-5 para admin/editor.
- Depende de SL-18/SL-19 para modelo base de catalogo.
- No depende de Banks.
- Bloquea Recommendations SL-28 y mejora consistencia de Bets SL-12.

## Alcance

- Crear/editar catalog items con `provider`, `external_id`, `name`, `season`.
- Gestionar aliases por entidad.
- Upsert por provider + external_id sin romper referencias.
- Mantener fuera de alcance sync realtime y aprobaciones complejas.

## Archivos a Tocar

- `src/app/api/admin/catalog/route.ts` - list/create/upsert items si se aprueba.
- `src/app/api/admin/catalog/[itemId]/route.ts` - update item.
- `src/app/api/admin/catalog/[itemId]/aliases/route.ts` - manage aliases.
- `src/lib/catalog/admin-service.ts` - upsert, alias y referencias.
- `src/lib/catalog/schemas.ts` - admin schemas.
- `src/lib/auth/roles.ts` - permisos admin/editor reutilizados desde SL-5.
- `src/app/dashboard/admin/catalog/page.tsx` - UI admin.
- `src/components/catalog/catalog-admin-form.tsx` - formulario dominio.
- `.context/SRS/api-contracts.yaml` - actualizar solo con cambio de contrato aprobado.

## DB/RLS Necesarios

- Migration-first: requiere catalog tables, aliases, provider ids, unique constraints y audit integration.
- Unique recomendado: `(provider, external_id, entity_type)` para item; alias normalizado con scope definido.
- Definir si alias es unico por entidad, provider o global; ATP lo marca blocker.
- Requiere concurrency policy: optimistic lock/version o last-write-wins documentado.
- RLS: lectura para usuarios autenticados; writes solo admin/editor segun decision; no-admin bloqueado.

## API Necesaria

- Endpoints admin no existen en OpenAPI; proponer `GET/POST /api/admin/catalog`, `PATCH /api/admin/catalog/{itemId}`, `POST/DELETE /api/admin/catalog/{itemId}/aliases`.
- Success create/upsert: `201/200` con item y aliases.
- Errors: `400` provider/external_id/season invalido, `403` sin permiso, `409` alias duplicado/concurrency.
- Registrar audit log en cada upsert/alias change.

## UI Necesaria

- Vista admin con tabla de items, editor de item y alias list.
- Estados de duplicado, permisos y concurrencia.
- `data-testid`: `catalogAdminPage`, `catalog_item_form`, `provider_select`, `external_id_input`, `season_input`, `alias_input`, `save_catalog_item_button`, `duplicate_alias_error`.

## Validaciones Zod

- `provider`: enum aprobado.
- `externalId`: string trim, min 1, max pendiente.
- `name`: string trim, min 1.
- `season`: formato pendiente (`2024` o `2024/2025`).
- `alias`: trim, min 1; normalizacion/case sensitivity pendiente.

## Tests Minimos

- Unit: provider valido, external_id requerido, alias normalizer.
- API: admin upsert mantiene item id y referencias.
- API: alias duplicado devuelve `409` o error aprobado.
- API/RBAC: user no admin recibe `403` sin cambios DB.
- Integration: upsert no rompe references de bet/recommendation.
- E2E: admin crea item y alias desde UI.

## Criterios de Cierre

- AC SL-20 cubiertos: actualizacion exitosa, alias duplicado, user sin permisos.
- Contrato admin documentado o decision explicita de mantenerlo interno.
- Unique constraints y RBAC aplicados en DB/API, no solo UI.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Providers permitidos.
- Unicidad y normalizacion de alias.
- Admin vs editor para mantenimiento.
- Formato/obligatoriedad de `season`.
- Politica de concurrencia en upsert.
