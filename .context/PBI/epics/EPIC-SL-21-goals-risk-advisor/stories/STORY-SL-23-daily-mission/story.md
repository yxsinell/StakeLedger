# As a user, I want to see the daily mission (profit and suggested odds) so that I can follow my goal

**Jira Key:** SL-23
**Epic:** EPIC-SL-21 (Goals and Risk Advisor)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** ver la mision diaria (beneficio y cuota sugerida)
**So that** pueda seguir mi meta

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Mostrar beneficio diario requerido
- Mostrar cuota sugerida segun stake habitual
- Mostrar progreso de meta

### Out of Scope

- Notificaciones push de mision diaria
- Consejos personalizados avanzados

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Ver mision diaria

- **Given:** una meta activa
- **When:** el usuario abre la vista de meta
- **Then:** el sistema muestra beneficio diario y cuota sugerida

### Scenario 2: Meta sin datos suficientes

- **Given:** una meta activa sin stake_preference
- **When:** el usuario abre la vista
- **Then:** el sistema solicita completar parametros faltantes

### Scenario 3: Meta cerrada

- **Given:** una meta cerrada
- **When:** el usuario intenta ver la mision diaria
- **Then:** el sistema muestra estado final sin mision activa

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Meta debe estar activa para mostrar mision diaria
- Cuota sugerida calculada segun stake habitual

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre meta
2. Sistema calcula mision diaria
3. Sistema muestra beneficio y cuota sugerida

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Vista de meta con mision diaria y progreso

### Backend

- Calculo diario segun brecha y dias restantes
- Cache de calculos por dia

### Database

- Goals, Goal History
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-22 (crear meta)

### Blocks

- SL-24 (recalculo por apuestas)

### Related Stories

- SL-22
- SL-24

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

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-23-daily-mission/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir formula de cuota sugerida

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-018)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
