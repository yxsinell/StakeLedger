# Implementation Plan: STORY-SL-5 - Gestion de roles

## Fuentes

- Story: `story.md`
- Acceptance test plan: `acceptance-test-plan.md`
- Roadmap Fase 2A: `.context/dev-roadmap.md`
- Gap analysis Fase 2A: `.context/reports/phase-2a-gap-analysis.md`
- SRS: `.context/SRS/functional-specs.md` FR-004
- API contract: `.context/SRS/api-contracts.yaml`

## Estado Actual Verificado

- `src/types/supabase.ts` contiene `users.role` con check `admin|editor|user` y default `user`.
- `auth-context.tsx` carga `profile`, pero UI no usa rol para permisos.
- No hay endpoints admin de usuarios/roles.
- No hay matriz RBAC documentada por endpoint/pantalla.
- Supabase advisors reportan descubrimiento GraphQL por grants autenticados; RLS sigue limitando filas. Ver postura en `.context/supabase-security-posture.md`.

## Alcance

- Permitir que admin asigne roles validos a usuarios existentes.
- Listar roles validos y usuarios/perfiles administrables.
- Aplicar RBAC en UI y endpoints sensibles.
- Mantener fuera de alcance: roles personalizados y auditoria avanzada.

## Archivos a Tocar

- `src/lib/auth/roles.ts` - crear catalogo `admin|editor|user` y helpers RBAC.
- `src/lib/api/auth.ts` - agregar `requireRole()` / `requireAdmin()`.
- `src/app/api/admin/users/route.ts` - listar usuarios si se define endpoint.
- `src/app/api/admin/users/[userId]/role/route.ts` - actualizar rol.
- `src/app/dashboard/admin/users/page.tsx` - UI de gestion admin.
- `src/components/layout/app-sidebar.tsx` - ocultar/mostrar navegacion admin por rol.
- `src/lib/openapi/schemas/admin.ts` - schemas de usuarios/roles.
- `middleware.ts` - proteger rutas admin si se agregan.

## DB/RLS Necesarios

- Mantener `users.role` como source of truth inicial; no crear tabla roles salvo necesidad concreta.
- Crear/ajustar policies para que solo admin pueda actualizar roles ajenos.
- Evitar que usuarios no admin escalen su propio `role`.
- Considerar funcion SQL segura `is_admin()` o RPC con `security definer` solo si RLS no puede expresar la regla con claridad.
- Corregir policies `auth.uid()` directo -> `(select auth.uid())` si se toca RLS.
- No revocar grants autenticados durante SL-5: el BFF actual depende de cliente Supabase autenticado. GraphQL se trata en fase de seguridad separada.

## API Necesaria

- Endpoint para listar roles: puede ser constante client-side o `GET /api/admin/roles` si se requiere contrato.
- `GET /api/admin/users` para admins.
- `PATCH /api/admin/users/{userId}/role` con `{ role }`.
- Errors: `401` sin sesion, `403` no admin, `400` rol invalido, `404` usuario inexistente.

## UI Necesaria

- Vista admin con tabla/listado de usuarios, selector de rol y confirmacion.
- Estados: loading, error permisos, rol actualizado.
- `data-testid`: `adminUsersPage`, `user_role_select`, `save_role_button`, `permission_error`.
- Ocultar link admin a no-admin, pero enforcement real debe estar en API/RLS.

## Validaciones Zod

- `role`: enum `admin|editor|user`.
- `userId`: UUID.
- Rechazar rol invalido como `owner`.

## Tests Minimos

- Unit: matriz RBAC y schema de rol.
- API: admin actualiza rol valido.
- API: usuario no admin recibe `403` y no hay cambio.
- API/RLS: usuario no puede asignarse `admin` directo.
- E2E: admin ve UI; user no ve ni accede ruta admin.

## Criterios de Cierre

- AC de SL-5 cubiertos: admin asigna rol, no-admin rechazado, endpoint protegido bloquea acceso.
- Matriz RBAC minima documentada antes de implementar endpoints dependientes.
- RLS impide escalamiento de privilegios.
- UI refleja permisos sin ser unica barrera de seguridad.
- `bun run repo:check` pasa.

## Decisiones cerradas

- Matriz: `user` recursos propios; `editor` catálogo y recomendaciones; `admin` roles más capacidades de editor.
- Cambio de rol: efectivo en siguiente autorización tras recarga del perfil; no se confía en ocultar UI.
- Errores: `401` sin sesión, `403` con sesión sin permiso, `400` rol inválido, `404` usuario inexistente.

## Implementación realizada

- Migration `20260816170000_add_admin_role_management.sql`: `role_version`, auditoría `user/role_changed`, revocación de update directo y RPC exclusiva service-role.
- Rutas BFF administrativas, pantalla `/dashboard/admin/users` y navegación admin implementadas.
- Tipos Supabase regenerados. Bootstrap de primer admin queda manual y fuera de esta story ejecutable.
