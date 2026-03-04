# As a user, I want to close my goal early when I reach the target so that I can stop recalculations

**Jira Key:** SL-26
**Epic:** EPIC-SL-21 (Goals and Risk Advisor)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** cerrar la meta anticipadamente al alcanzar el objetivo
**So that** detenga recalculos

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Cerrar meta cuando se alcanza objetivo
- Confirmacion explicita de cierre
- Detener recalculos y misiones diarias

### Out of Scope

- Reapertura automatica de metas cerradas
- Cierre parcial de meta

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Cierre exitoso al alcanzar objetivo

- **Given:** una meta activa con objetivo alcanzado
- **When:** el usuario confirma cierre anticipado
- **Then:** el sistema marca la meta como completed

### Scenario 2: Intento de cierre sin objetivo

- **Given:** una meta activa sin objetivo alcanzado
- **When:** el usuario intenta cerrar
- **Then:** el sistema solicita confirmacion adicional o bloquea segun regla

### Scenario 3: Meta ya cerrada

- **Given:** una meta cerrada
- **When:** el usuario intenta cerrar nuevamente
- **Then:** el sistema mantiene el estado y muestra mensaje

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Cierre permitido si objetivo alcanzado o confirmacion explicita
- Meta cerrada no se recalcula

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre meta
2. Solicita cierre
3. Sistema confirma y cierra meta

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de cierre con confirmacion

### Backend

- Cambiar status a completed
- Registrar fecha de cierre

### Database

- Goals
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-22 (crear meta)

### Blocks

- Ninguna

### Related Stories

- SL-23
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

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-26-close-goal/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir confirmacion de cierre en UI

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-021)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
