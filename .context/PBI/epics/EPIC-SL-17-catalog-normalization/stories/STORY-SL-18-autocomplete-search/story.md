# As a user, I want to search teams and competitions with autocomplete so that I can select normalized data

**Jira Key:** SL-18
**Epic:** EPIC-SL-17 (Catalog and Normalization)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** buscar equipos y competiciones con autocompletado
**So that** seleccione datos normalizados

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Campo de busqueda con autocompletado
- Resultados normalizados por tipo (team/competition)
- Validar query length >= 2

### Out of Scope

- Filtros avanzados por temporada
- Busqueda fuzzy avanzada

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Autocompletado exitoso

- **Given:** un usuario en el campo de busqueda
- **When:** escribe una query valida (>= 2 caracteres)
- **Then:** el sistema muestra sugerencias normalizadas

### Scenario 2: Query muy corta

- **Given:** un usuario en el campo de busqueda
- **When:** escribe una query de 1 caracter
- **Then:** el sistema no busca y muestra mensaje de validacion

### Scenario 3: Sin resultados

- **Given:** un usuario con query valida
- **When:** no hay coincidencias
- **Then:** el sistema muestra estado vacio y opcion de ingreso manual

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Query length >= 2
- Resultados deben estar normalizados

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario escribe en busqueda
2. Sistema consulta catalogo y/o API externa
3. Sistema muestra sugerencias

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Autocomplete con estados loading y empty

### Backend

- Cache de resultados por query
- Fallback a API externa si no hay matches

### Database

- Catalogo y alias
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- API externa de catalogo (si aplica)

---

## Dependencies

### Blocked By

- SL-12 (registro de ticket) para uso en apuestas

### Blocks

- SL-19 (ingreso manual)

### Related Stories

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

See: `.context/PBI/epics/EPIC-SL-17-catalog-normalization/stories/STORY-SL-18-autocomplete-search/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir estrategia de cache por query

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-17-catalog-normalization/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-014)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
