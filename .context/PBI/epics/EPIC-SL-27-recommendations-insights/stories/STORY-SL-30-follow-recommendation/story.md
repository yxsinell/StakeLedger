# As a user, I want to follow a recommendation and prefill the bet entry so that I can register it quickly

**Jira Key:** SL-30
**Epic:** EPIC-SL-27 (Recommendations and Insights)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** seguir una recomendacion y precargar el registro de apuesta
**So that** pueda registrarla rapidamente

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Accion de seguir recomendacion
- Precarga de formulario con evento, mercado y odds
- Seleccion de bank para registrar apuesta

### Out of Scope

- Registro automatico sin confirmacion
- Seguimiento automatico de resultados

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Precarga exitosa

- **Given:** una recomendacion activa
- **When:** el usuario selecciona seguir recomendacion
- **Then:** el formulario de apuesta se precarga con datos del evento

### Scenario 2: Recomendacion inactiva

- **Given:** una recomendacion inactiva
- **When:** el usuario intenta seguirla
- **Then:** el sistema muestra mensaje y no precarga

### Scenario 3: Usuario sin bank

- **Given:** un usuario sin banks
- **When:** intenta seguir una recomendacion
- **Then:** el sistema solicita crear un bank primero

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Solo recomendaciones activas pueden seguirse
- Precarga debe incluir datos normalizados

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona recomendacion
2. Sistema precarga formulario
3. Usuario confirma registro

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- CTA para seguir recomendacion

### Backend

- Reutilizar flujo de registro de tickets
- Validar estado de recomendacion

### Database

- Recommendations
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-28 (publicacion de recomendaciones)
- SL-29 (feed filtrable)

### Blocks

- SL-31 (metricas basicas)

### Related Stories

- SL-28
- SL-29

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

See: `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-30-follow-recommendation/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir parametros a precargar en apuesta

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-27-recommendations-insights/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-024)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
