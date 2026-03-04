# As a user, I want to perform partial cashout so that the ticket splits into two

**Jira Key:** SL-15
**Epic:** EPIC-SL-11 (Bets Ledger)
**Priority:** High
**Story Points:** 5
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** ejecutar cashout parcial
**So that** el ticket se divida en dos

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Registrar cashout parcial sobre un ticket abierto
- Crear ticket A cerrado y ticket B con stake restante
- Registrar movimientos en ledger

### Out of Scope

- Cashout total automatico
- Integraciones con casas de apuestas

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Cashout parcial exitoso

- **Given:** un ticket abierto con stake disponible
- **When:** ejecuta un cashout parcial valido
- **Then:** el sistema cierra el ticket A y crea el ticket B con stake restante

### Scenario 2: Cashout con monto invalido

- **Given:** un ticket abierto
- **When:** intenta cashout con monto <= 0 o mayor al stake
- **Then:** el sistema rechaza la operacion con error de validacion

### Scenario 3: Ticket ya cerrado

- **Given:** un ticket cerrado
- **When:** intenta cashout parcial
- **Then:** el sistema rechaza la operacion por estado invalido

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- cashout_amount > 0
- remaining_stake > 0
- Ticket debe estar abierto

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario selecciona ticket abierto
2. Ingresa monto de cashout
3. Sistema cierra ticket A y crea ticket B
4. Ledger registra movimientos

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- UI de cashout parcial con validaciones de monto

### Backend

- Dividir ticket manteniendo trazabilidad
- Validar estados y montos

### Database

- Tickets y ledger con referencias cruzadas
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-14 (liquidacion)

### Blocks

- SL-16 (auditoria inmutable)

### Related Stories

- SL-14
- SL-16

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

See: `.context/PBI/epics/EPIC-SL-11-bets-ledger/stories/STORY-SL-15-partial-cashout/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Definir reglas de division en SRS

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-11-bets-ledger/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-012)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
