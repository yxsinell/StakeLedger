# As an admin, I want to manage roles (admin, editor, user) so that I can control permissions

**Jira Key:** SL-5
**Epic:** EPIC-SL-1 (Identity and Access)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** admin
**I want to** gestionar roles (admin, editor, user)
**So that** pueda controlar permisos en la plataforma

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Asignar rol a usuario existente
- Listar roles disponibles
- Enforcement de roles en UI y endpoints sensibles

### Out of Scope

- Roles personalizados
- Auditoria avanzada de cambios

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Admin asigna rol a usuario

- **Given:** un admin autenticado y un usuario existente
- **When:** asigna un rol valido (admin/editor/user)
- **Then:** el sistema guarda el rol y actualiza permisos del usuario

### Scenario 2: Usuario sin permisos intenta asignar rol

- **Given:** un usuario no admin autenticado
- **When:** intenta modificar roles
- **Then:** el sistema rechaza la accion con error de permisos

### Scenario 3: Acceso protegido por rol

- **Given:** un usuario con rol limitado
- **When:** intenta acceder a un endpoint protegido
- **Then:** el sistema bloquea el acceso segun su rol

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Solo admin puede asignar roles
- Roles validos: admin, editor, user

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Admin accede a gestion de usuarios
2. Selecciona usuario y rol
3. Sistema guarda cambios
4. Permisos se aplican en UI y API

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de gestion de usuarios con selector de rol
- Estados claros de permisos

### Backend

- RBAC aplicado en endpoints
- Persistencia de rol en perfil de usuario

### Database

- Tabla de roles/permiso o campo role en perfil
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-2 (registro) para usuarios base

### Blocks

- Acceso a funciones administrativas en otras epicas

### Related Stories

- SL-2 (registro)
- SL-3 (login)

---

## Definition of Done

- [ ] Codigo implementado y funcionando
- [ ] Tests unitarios (coverage > 80%)
- [ ] Tests de integracion (API + DB)
- [ ] Tests E2E (Playwright)
- [ ] Code review aprobado (2 reviewers)
- [ ] Documentacion actualizada (README, API docs)
- [ ] Deployed to staging
- [ ] QA testing passed
- [ ] Acceptance criteria validated
- [ ] No critical/high bugs open

---

## Testing Strategy

See: `.context/PBI/epics/EPIC-SL-1-identity-and-access/stories/STORY-SL-5-manage-roles/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir permisos exactos por rol en SRS/arquitectura

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-1-identity-and-access/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-004)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
