# As a user, I want to fund a bet with a mix of cash/bonus/freebet so that I can optimize my pockets

**Jira Key:** SL-13
**Epic:** EPIC-SL-11 (Bets Ledger)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** financiar una apuesta con mix cash/bonus/freebet
**So that** pueda optimizar mis pockets

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Definir montos por pocket (cash/bonus/freebet)
- Validar sumatoria = stake amount
- Aplicar reglas de freebet en retorno

### Out of Scope

- Conversion automatica entre pockets
- Reglas avanzadas por casa de apuestas

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Mix de fondos valido

- **Given:** un ticket con stake amount definido
- **When:** asigna montos por pocket que suman el stake
- **Then:** el sistema acepta la financiacion y registra el desglose

### Scenario 2: Sumatoria incorrecta

- **Given:** un ticket con stake amount definido
- **When:** ingresa montos cuya suma no coincide
- **Then:** el sistema rechaza la accion con error de validacion

### Scenario 3: Freebet sin reglas

- **Given:** un ticket con freebet asignado
- **When:** no hay reglas configuradas para retorno
- **Then:** el sistema bloquea la operacion y muestra mensaje

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Sumatoria de montos = stake amount
- Montos >= 0
- Reglas de freebet deben estar configuradas

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona pockets a usar
2. Ingresa montos por pocket
3. Sistema valida y confirma financiacion

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de mix de fondos con validacion de sumas

### Backend

- Validar reglas de freebet
- Guardar desglose de financiacion

### Database

- Detalle de financiacion por ticket
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-12 (registro de ticket)

### Blocks

- SL-14 (liquidacion)

### Related Stories

- SL-12
- SL-14

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

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-13-fund-bet-mix/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Documentar reglas de retorno de freebet

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-11-bets-ledger/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-010)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
