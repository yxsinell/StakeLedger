# As a user, I want to create a goal with base capital, target, deadline, and stake preference so that I can plan my growth

**Jira Key:** SL-22
**Epic:** EPIC-SL-21 (Goals and Risk Advisor)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** crear una meta con capital base, objetivo, fecha limite y stake habitual
**So that** pueda planificar mi crecimiento

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Crear meta con base_amount, target_amount, deadline, stake_preference y strategy (opcional)
- Validar target > base y deadline futura
- Calcular brecha, beneficio diario y cuota sugerida

### Out of Scope

- Metas compartidas
- Estrategias avanzadas multi-meta

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Creacion de meta exitosa

- **Given:** un usuario autenticado con bank
- **When:** crea una meta con parametros validos
- **Then:** el sistema crea la meta y calcula beneficio diario y cuota sugerida

### Scenario 2: Target menor o igual a base

- **Given:** un usuario autenticado
- **When:** ingresa un target <= base
- **Then:** el sistema rechaza la creacion con error de validacion

### Scenario 3: Deadline pasada

- **Given:** un usuario autenticado
- **When:** ingresa una fecha limite pasada
- **Then:** el sistema rechaza la creacion con error

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- target_amount > base_amount
- deadline debe ser futura
- strategy permitido: conservative, accelerated (si se usa)

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario completa formulario de meta
2. Sistema valida y calcula brecha
3. Meta creada con mision diaria

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de meta con validaciones

### Backend

- Calculo de brecha y dias disponibles
- Guardar parametros de stake habitual y strategy
- Calcular suggested_odds segun stake y brecha

### Database

- Goals, Goal History
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-7 (banks) y SL-12 (tickets) para recalculo

### Blocks

- SL-23 (mision diaria)

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

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-22-create-goal/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir stake_preference permitido

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-017)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
