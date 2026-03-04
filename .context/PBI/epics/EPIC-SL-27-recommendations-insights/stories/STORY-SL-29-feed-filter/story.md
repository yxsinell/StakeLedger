# As a user, I want a feed filterable by pre-match and live so that I can browse recommendations

**Jira Key:** SL-29
**Epic:** EPIC-SL-27 (Recommendations and Insights)
**Priority:** Medium
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** ver un feed filtrable por pre-match y live
**So that** pueda navegar recomendaciones

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Lista de recomendaciones en feed
- Filtro por tipo (pre/live)
- Filtros opcionales por sport y league
- Orden por fecha

### Out of Scope

- Notificaciones push
- Personalizacion avanzada por usuario

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Filtrar por pre-match

- **Given:** un usuario en el feed
- **When:** aplica filtro pre-match
- **Then:** el sistema muestra solo recomendaciones pre-match

### Scenario 2: Filtrar por live

- **Given:** un usuario en el feed
- **When:** aplica filtro live
- **Then:** el sistema muestra solo recomendaciones live

### Scenario 3: Filtrar por deporte o liga

- **Given:** un usuario en el feed
- **When:** aplica filtro por sport y/o league
- **Then:** el sistema muestra recomendaciones del filtro seleccionado

### Scenario 4: Sin resultados

- **Given:** un usuario aplica un filtro
- **When:** no hay recomendaciones
- **Then:** el sistema muestra estado vacio

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Filtros validos: pre, live
- Filtros sport/league opcionales
- Orden por fecha desc

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre feed
2. Aplica filtro
3. Sistema muestra resultados

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Filtros y estados vacio/loading

### Backend

- Paginacion del feed
- Indices por tipo y fecha

### Database

- Recommendations
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-28 (publicacion de recomendaciones)

### Blocks

- SL-30 (seguir recomendacion)

### Related Stories

- SL-28
- SL-30

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

See: `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-29-feed-filter/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir paginacion por defecto

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-27-recommendations-insights/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-023)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
