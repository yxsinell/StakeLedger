# As a user, I want to view basic metrics (cash yield, operational yield, win rate) so that I can track performance

**Jira Key:** SL-31
**Epic:** EPIC-SL-27 (Recommendations and Insights)
**Priority:** Medium
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** ver metricas basicas (yield cash, yield operativo, win rate)
**So that** pueda seguir mi rendimiento

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Calculo de yield cash y yield operativo
- Calculo de win rate
- Vista de metricas por bank y rango de fechas

### Out of Scope

- Metricas avanzadas (ROI por mercado)
- Exportaciones

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Ver metricas

- **Given:** un usuario con apuestas registradas
- **When:** accede a la vista de metricas
- **Then:** el sistema muestra yield cash, yield operativo y win rate

### Scenario 2: Sin apuestas

- **Given:** un usuario sin apuestas
- **When:** accede a metricas
- **Then:** el sistema muestra ceros o estado vacio

### Scenario 3: Rango invalido

- **Given:** un usuario en la vista de metricas
- **When:** selecciona un rango invalido
- **Then:** el sistema muestra error de validacion

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- date_range valido
- Metricas calculadas sobre apuestas liquidadas

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona bank y rango
2. Sistema calcula metricas
3. Sistema muestra resultados

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Vista de metricas con filtros de rango

### Backend

- Calcular yield sobre ledger y settlement
- Cache por rango de fechas

### Database

- Ledger y Bets
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-14 (liquidacion)

### Blocks

- Ninguna

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

See: `.context/PBI/epics/EPIC-SL-27-recommendations-insights/stories/STORY-SL-31-basic-metrics/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir formulas exactas de yield

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-27-recommendations-insights/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-025)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
