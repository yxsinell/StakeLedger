# As a user, I want to record deposits and withdrawals so that my ledger stays complete

**Jira Key:** SL-10
**Epic:** EPIC-SL-6 (Banks and Balances)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** registrar depositos y retiros
**So that** mi ledger se mantenga completo

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Registrar deposito con metodo y monto
- Registrar retiro con validacion de cash disponible
- Actualizar pockets y ledger

### Out of Scope

- Integraciones con pasarelas de pago
- Conciliacion automatica

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Deposito exitoso

- **Given:** un usuario autenticado con un bank
- **When:** registra un deposito con monto valido
- **Then:** el sistema actualiza el pocket y registra la transaccion

### Scenario 2: Retiro con saldo insuficiente

- **Given:** un bank con cash insuficiente
- **When:** intenta registrar un retiro mayor al cash disponible
- **Then:** el sistema rechaza la operacion con error de saldo

### Scenario 3: Retiro exitoso

- **Given:** un bank con cash suficiente
- **When:** registra un retiro valido
- **Then:** el sistema actualiza el saldo y registra la transaccion

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Monto > 0
- Retiro no supera cash disponible

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona deposito o retiro
2. Ingresa monto y metodo
3. Sistema valida y registra transaccion
4. Saldos actualizados

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de deposito/retiro con validaciones

### Backend

- Registrar transacciones con tipo deposit/withdraw
- Validaciones de monto y pocket

### Database

- Ledger con transacciones de deposito/retiro
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-7 (crear bank)

### Blocks

- SL-11+ (apuestas y metas dependen de ledger)

### Related Stories

- SL-8
- SL-9

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

See: `.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-10-deposits-withdrawals/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir metodos permitidos para depositos y retiros

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-6-banks-and-balances/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-008)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
