# As a user, I want my goal to recalculate after each settled bet so that my daily mission stays accurate

**Jira Key:** SL-24
**Epic:** EPIC-SL-21 (Goals and Risk Advisor)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** que la meta se recalcule despues de cada apuesta finalizada
**So that** la mision diaria se mantenga actualizada

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Detectar apuestas finalizadas vinculadas a la meta
- Recalcular brecha y dias restantes
- Actualizar mision diaria

### Out of Scope

- Recalculo por movimientos no relacionados
- Simulaciones hipoteticas

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Recalculo tras apuesta win

- **Given:** una meta activa y una apuesta vinculada
- **When:** la apuesta se liquida como win
- **Then:** el sistema recalcula brecha y mision diaria

### Scenario 2: Recalculo tras apuesta lose

- **Given:** una meta activa y una apuesta vinculada
- **When:** la apuesta se liquida como lose
- **Then:** el sistema recalcula la brecha y ajusta la mision

### Scenario 3: Apuesta no vinculada

- **Given:** una meta activa
- **When:** se liquida una apuesta no vinculada
- **Then:** el sistema no recalcula la meta

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Solo apuestas vinculadas disparan recalculo
- Meta debe estar activa

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Apuesta finaliza
2. Sistema verifica vinculacion a meta
3. Sistema recalcula y actualiza mision

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Estado actualizado de mision diaria

### Backend

- Escuchar eventos de settlement
- Guardar historial de recalculos

### Database

- Goals, Goal History
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-22 (crear meta)
- SL-14 (liquidacion de apuestas)

### Blocks

- SL-25 (protecciones de riesgo)

### Related Stories

- SL-22
- SL-23

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

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-24-goal-recalculation/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir vinculo entre meta y apuestas

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-019)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
