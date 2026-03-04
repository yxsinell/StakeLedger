# As an admin, I want to maintain a catalog with aliases and periodic updates so that data stays consistent

**Jira Key:** SL-20
**Epic:** EPIC-SL-17 (Catalog and Normalization)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** admin
**I want to** mantener un catalogo con alias y actualizaciones periodicas
**So that** los datos se mantengan consistentes

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Crear/editar items de catalogo con provider, external_id, name y season
- Gestionar alias por entidad
- Upsert por proveedor y external_id

### Out of Scope

- Sincronizacion en tiempo real con proveedores
- Workflows de aprobacion complejos

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Actualizacion exitosa

- **Given:** un admin autenticado
- **When:** actualiza un item de catalogo con datos validos
- **Then:** el sistema guarda los cambios y mantiene referencias

### Scenario 2: Alias duplicado

- **Given:** un admin autenticado
- **When:** intenta crear un alias ya existente
- **Then:** el sistema rechaza la accion con error de duplicado

### Scenario 3: Usuario sin permisos

- **Given:** un usuario no admin
- **When:** intenta modificar el catalogo
- **Then:** el sistema bloquea la operacion

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Solo admin puede actualizar catalogo
- Alias deben ser unicos por entidad
- Provider permitido
- External_id requerido

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Admin selecciona item
2. Modifica datos y alias
3. Sistema valida y guarda

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de mantenimiento de catalogo y alias

### Backend

- Upsert por provider/external_id
- Validar integridad referencial

### Database

- Catalog Items, Aliases
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Proveedor externo de datos (si aplica)

---

## Dependencies

### Blocked By

- SL-19 (ingreso manual)

### Blocks

- SL-21+ (recomendaciones y feeds)

### Related Stories

- SL-18
- SL-19

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

See: `.context/PBI/epics/EPIC-SL-17-catalog-normalization/stories/STORY-SL-20-manage-catalog/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir proveedores y frecuencia de updates

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-016)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
