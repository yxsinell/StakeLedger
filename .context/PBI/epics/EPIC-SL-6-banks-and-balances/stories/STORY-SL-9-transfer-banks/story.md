# As a user, I want to transfer funds between my banks so that I can rebalance my balances

**Jira Key:** SL-9
**Epic:** EPIC-SL-6 (Banks and Balances)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** transferir fondos entre mis banks
**So that** pueda rebalancear saldos

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Transferencia entre banks del mismo usuario
- Seleccion de pocket origen y destino
- Registro de transaccion tipo transfer

### Out of Scope

- Transferencias entre usuarios
- Transferencias a bancos externos

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Transferencia exitosa

- **Given:** un usuario con dos banks y saldo suficiente
- **When:** transfiere un monto valido entre banks
- **Then:** el sistema debita y acredita y registra la transaccion

### Scenario 2: Monto insuficiente

- **Given:** un bank con saldo insuficiente en el pocket seleccionado
- **When:** intenta transferir un monto mayor
- **Then:** el sistema rechaza la operacion con error de saldo

### Scenario 3: Banks de distinto usuario

- **Given:** un usuario autenticado
- **When:** intenta transferir a un bank que no le pertenece
- **Then:** el sistema bloquea la operacion con error de permisos

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Monto > 0
- Banks deben pertenecer al mismo usuario

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona bank origen y destino
2. Ingresa monto y pocket
3. Sistema valida y ejecuta transferencia
4. Ledger registra doble asiento

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de transferencia con selector de banks y pocket

### Backend

- Operacion atomica con doble asiento
- Validar ownership y saldo

### Database

- Banks, Pockets, Ledger
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-7 (crear bank)

### Blocks

- SL-10 (depositos/retiros) depende de ledger consistente

### Related Stories

- SL-8
- SL-10

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

See: `.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-9-transfer-banks/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Asegurar idempotencia en caso de retries

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-6-banks-and-balances/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-007)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
