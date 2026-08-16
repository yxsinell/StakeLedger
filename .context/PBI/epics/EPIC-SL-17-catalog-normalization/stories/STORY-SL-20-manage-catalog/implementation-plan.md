# Implementation Plan: STORY-SL-20 - Gestion de catalogo y alias

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-016
- API contract: `.context/SRS/api-contracts.yaml` no declara endpoints admin especificos de catalogo

## Estado Actual Verificado

- Existen tablas de catalogo y alias en generated types.
- No existen endpoints admin de catalogo.
- OpenAPI de Fase 4F declara contratos admin para teams, competitions y aliases; falta implementarlos.
- SL-5 ya implemento RBAC administrativo; `is_catalog_editor()` permite `admin|editor` para RLS de catalogo.
- Fase 4F cierra alias uniqueness y deja provider externo fuera de alcance MVP.

## Dependencias

- Depende de Identity/RBAC SL-2/SL-3/SL-5 para admin/editor.
- Depende de SL-18/SL-19 para modelo base de catalogo.
- No depende de Banks.
- Bloquea Recommendations SL-28 y mejora consistencia de Bets SL-12.

## Alcance

- Crear/editar catalog items locales con `provider?`, `external_id?`, `name`, `country?` y `sport` en competitions.
- Gestionar aliases por entidad.
- Upsert por provider + external_id sin romper referencias.
- Mantener fuera de alcance sync realtime y aprobaciones complejas.

## Archivos a Tocar

- `src/app/api/admin/catalog/teams/route.ts` - list/create teams.
- `src/app/api/admin/catalog/teams/[teamId]/route.ts` - update team.
- `src/app/api/admin/catalog/teams/[teamId]/aliases/route.ts` - manage team aliases.
- `src/app/api/admin/catalog/competitions/route.ts` - list/create competitions.
- `src/app/api/admin/catalog/competitions/[competitionId]/route.ts` - update competition.
- `src/app/api/admin/catalog/competitions/[competitionId]/aliases/route.ts` - manage competition aliases.
- `src/lib/catalog/admin-service.ts` - upsert, alias y referencias.
- `src/lib/catalog/schemas.ts` - admin schemas.
- `src/lib/auth/roles.ts` - permisos admin/editor reutilizados desde SL-5.
- `src/app/dashboard/admin/catalog/page.tsx` - UI admin.
- `src/components/catalog/catalog-admin-form.tsx` - formulario dominio.
- `.context/SRS/api-contracts.yaml` - mantener sincronizado si cambia contrato aprobado.

## DB/RLS Necesarios

- Las tablas base de catalogo y alias ya existen; implementar solo migrations incrementales necesarias para constraints o RLS faltante.
- Unique requerido: `(provider, external_id)` por tabla de entidad cuando ambos existan.
- Alias normalizado con `lower(trim(alias))`, unico por entidad destino.
- Concurrencia MVP: last-write-wins documentado; no se añade versionado hasta que haya edición multi-admin real.
- RLS: lectura para usuarios autenticados; writes de mantenimiento solo editor/admin; `user` bloqueado.
- Preflight completado: historial RBAC remoto/local reconciliado como `20260816145742_add_admin_role_management.sql`.

## API Necesaria

- Implementar rutas admin documentadas en OpenAPI: `/api/admin/catalog/teams`, `/api/admin/catalog/competitions` y alias bajo `{teamId|competitionId}/aliases`.
- Success create/upsert: `201/200` con item y aliases.
- Errors: `400` provider/external_id invalido, `403` sin permiso, `409` alias duplicado/concurrency.
- Registrar audit log en cada upsert/alias change.

## UI Necesaria

- Vista admin con tabla de items, editor de item y alias list.
- Estados de duplicado, permisos y concurrencia.
- `data-testid`: `catalogAdminPage`, `catalog_item_form`, `provider_input`, `external_id_input`, `alias_input`, `save_catalog_item_button`, `duplicate_alias_error`.

## Validaciones Zod

- `provider`: string trim opcional, max 50.
- `externalId`: string trim opcional, max 100; requerido si `provider` se informa.
- `name`: string trim, min 1.
- `alias`: trim, min 1, max 100; normalizado con `lower(trim())`.

## Tests Minimos

- Unit: provider valido, external_id requerido, alias normalizer.
- API: admin upsert mantiene item id y referencias.
- API: alias duplicado devuelve `409 CATALOG_ALIAS_CONFLICT`.
- API/RBAC: user no admin recibe `403` sin cambios DB.
- Integration: upsert no rompe references de bet/recommendation.
- E2E: admin crea item y alias desde UI.

## Criterios de Cierre

- AC SL-20 cubiertos: actualizacion exitosa, alias duplicado, user sin permisos.
- Contrato admin documentado.
- Unique constraints y RBAC aplicados en DB/API, no solo UI.
- Supabase types actualizados si cambia schema.
- `bun run repo:check` pasa.

## Decisiones Abiertas

- Ninguna bloqueante para MVP.
