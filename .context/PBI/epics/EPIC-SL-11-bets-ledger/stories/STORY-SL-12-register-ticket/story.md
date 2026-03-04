# As a user, I want to register a ticket with legs so that the system can calculate the recommended stake

**Jira Key:** SL-12
**Epic:** EPIC-SL-11 (Bets Ledger)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** registrar un ticket con legs
**So that** el sistema calcule el stake recomendado

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Crear ticket con legs, odds y stake level
- Calcular stake recomendado con cap 40% sobre cash
- Reservar fondos del pocket seleccionado

### Out of Scope

- OCR de tickets
- Importacion automatica de apuestas

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Registro de ticket exitoso

- **Given:** un usuario con bank y cash disponible
- **When:** registra un ticket con legs validos y odds > 1.0
- **Then:** el sistema crea el ticket y calcula el stake recomendado

### Scenario 2: Odds invalidas

- **Given:** un usuario autenticado
- **When:** registra un ticket con odds <= 1.0
- **Then:** el sistema rechaza el registro con error de validacion

### Scenario 3: Stake supera cap

- **Given:** un usuario con cash limitado
- **When:** intenta registrar un ticket con stake recomendado mayor al cap
- **Then:** el sistema ajusta o bloquea segun regla y muestra mensaje

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Odds > 1.0
- Cap de stake: 40% del cash disponible

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario crea ticket con legs y odds
2. Sistema calcula stake recomendado
3. Usuario confirma y se reserva fondos

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de ticket con legs y odds
- Visualizacion de stake recomendado

### Backend

- Calculo de stake con cap 40%
- Validar legs >= 1 y odds > 1.0

### Database

- Tickets, Legs, Ledger
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-7 (crear bank)

### Blocks

- SL-13 (mix de fondos)
- SL-14 (liquidacion)

### Related Stories

- SL-7
- SL-13

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

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-12-register-ticket/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Alinear stake level con reglas de riesgo

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-11-bets-ledger/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-009)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
