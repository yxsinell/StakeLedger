# As a user, I want to settle bets with win/lose/void/half_win/half_loss results so that balances update correctly

**Jira Key:** SL-14
**Epic:** EPIC-SL-11 (Bets Ledger)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** liquidar apuestas con resultados win/lose/void/half_win/half_loss
**So that** los saldos se actualicen correctamente

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Registrar resultado de apuesta (win/lose/void/half_win/half_loss)
- Calcular retorno y beneficio
- Actualizar pockets y ledger

### Out of Scope

- Liquidacion automatica por proveedor externo
- Disputas o reclamos

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Liquidacion win

- **Given:** una apuesta abierta
- **When:** se liquida como win
- **Then:** el sistema calcula retorno y actualiza pockets

### Scenario 2: Liquidacion void

- **Given:** una apuesta abierta
- **When:** se liquida como void
- **Then:** el sistema devuelve el stake al pocket correspondiente

### Scenario 3: Resultado invalido

- **Given:** una apuesta abierta
- **When:** se intenta liquidar con resultado no permitido
- **Then:** el sistema rechaza la operacion con error

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Bet debe estar en estado abierto
- Resultados permitidos: win, lose, void, half_win, half_loss

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona apuesta abierta
2. Ingresa resultado y monto de settlement
3. Sistema calcula retorno y actualiza ledger

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de liquidacion con selector de resultado

### Backend

- Validar estado de bet antes de liquidar
- Calculo de retorno segun reglas de freebet

### Database

- Bets, Ledger, Pockets
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-12 (registro de ticket)
- SL-13 (mix de fondos)

### Blocks

- SL-15 (cashout parcial)
- SL-16 (auditoria inmutable)

### Related Stories

- SL-12
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

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-14-settle-bets/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Documentar reglas de half_win/half_loss

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-11-bets-ledger/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-011)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
