# As a user, I want risk protections that block suicidal odds and suggest reconfiguration so that I avoid ruin

**Jira Key:** SL-25
**Epic:** EPIC-SL-21 (Goals and Risk Advisor)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** protecciones que bloqueen cuotas suicidas y propongan reconfiguracion
**So that** evite riesgo excesivo

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Evaluar cuota sugerida vs limites
- Bloquear cuotas suicidas
- Proponer reconfiguracion de meta o stake

### Out of Scope

- Ajustes automaticos sin confirmacion
- Alertas en tiempo real externas

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Cuota dentro de limites

- **Given:** una meta activa
- **When:** la cuota sugerida esta dentro de limites
- **Then:** el sistema permite continuar sin alertas

### Scenario 2: Cuota suicida

- **Given:** una meta activa
- **When:** la cuota sugerida supera el limite configurado
- **Then:** el sistema bloquea la accion y muestra advertencia

### Scenario 3: Reconfiguracion sugerida

- **Given:** una meta activa con cuota fuera de rango
- **When:** el sistema evalua alternativas
- **Then:** muestra recomendaciones de reconfiguracion

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Limites de cuota configurables por usuario
- Bloqueo obligatorio si se supera el limite

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Sistema calcula cuota sugerida
2. Valida contra limites
3. Bloquea o recomienda ajustes

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de alertas y recomendaciones

### Backend

- Guardar limites de cuota por usuario
- Log de bloqueos por riesgo

### Database

- Goals, Risk Limits
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-23 (mision diaria)

### Blocks

- SL-26 (cierre anticipado)

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

See: `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/stories/STORY-SL-25-risk-protections/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir limites por defecto y overrides

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-21-goals-risk-advisor/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-020)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
