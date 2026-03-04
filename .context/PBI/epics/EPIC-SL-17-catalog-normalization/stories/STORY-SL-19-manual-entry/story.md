# As a user, I want to enter data manually when it does not exist so that it is marked as unnormalized

**Jira Key:** SL-19
**Epic:** EPIC-SL-17 (Catalog and Normalization)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** introducir datos manuales si no existen
**So that** queden marcados como unnormalized

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Formulario de ingreso manual
- Guardar registro con normalization_status=UNNORMALIZED
- Capturar tipo (team/competition) y pais

### Out of Scope

- Validacion automatica avanzada
- Normalizacion automatica posterior

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Ingreso manual exitoso

- **Given:** un usuario autenticado
- **When:** ingresa datos manuales validos
- **Then:** el sistema crea el registro con estado UNNORMALIZED

### Scenario 2: Texto requerido

- **Given:** un usuario autenticado
- **When:** intenta guardar sin texto requerido
- **Then:** el sistema muestra error y no crea el registro

### Scenario 3: Tipo invalido

- **Given:** un usuario autenticado
- **When:** ingresa un tipo no permitido
- **Then:** el sistema rechaza la operacion con error

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- raw_text requerido
- type permitido: team, competition

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona ingreso manual
2. Completa datos requeridos
3. Sistema guarda registro unnormalized

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario con tipo y pais

### Backend

- Guardar normalization_status=UNNORMALIZED
- Validar campos requeridos

### Database

- Catalog Items
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-18 (autocompletado) para flujo completo

### Blocks

- SL-20 (mantenimiento catalogo)

### Related Stories

- SL-18
- SL-20

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

See: `.context/PBI/epics/EPIC-SL-17-catalog-normalization/stories/STORY-SL-19-manual-entry/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir reglas minimas de ingreso manual

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-015)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
