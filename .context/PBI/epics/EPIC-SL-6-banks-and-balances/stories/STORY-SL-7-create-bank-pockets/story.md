# As a user, I want to create banks with cash/bonus/freebet pockets so that I can separate balances

**Jira Key:** SL-7
**Epic:** EPIC-SL-6 (Banks and Balances)
**Priority:** High
**Story Points:** 3
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** crear banks con bolsillos cash/bonus/freebet
**So that** pueda separar saldos de forma clara

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Crear bank con nombre y moneda
- Inicializar pockets cash/bonus/freebet con montos iniciales
- Registrar transaccion inicial en ledger

### Out of Scope

- Bancos compartidos
- Importacion desde proveedores externos

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Creacion exitosa de bank

- **Given:** un usuario autenticado
- **When:** crea un bank con nombre y montos iniciales validos
- **Then:** el sistema crea el bank y los pockets correspondientes

### Scenario 2: Monto inicial negativo

- **Given:** un usuario autenticado
- **When:** intenta crear un bank con monto inicial negativo
- **Then:** el sistema rechaza la creacion con error de validacion

### Scenario 3: Nombre de bank requerido

- **Given:** un usuario autenticado
- **When:** intenta crear un bank sin nombre
- **Then:** el sistema muestra error y no crea el bank

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Montos iniciales >= 0
- Nombre de bank es requerido

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre crear bank
2. Ingresa nombre, moneda y montos iniciales
3. Sistema valida y crea bank
4. Sistema registra transaccion inicial

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Formulario de creacion de bank con validaciones

### Backend

- Crear bank y pockets en transaccion atomica
- Registrar ledger inicial

### Database

- Tablas Banks, Pockets, Ledger
- **IMPORTANTE:** No hardcodear SQL. Usar Supabase MCP

### External Services

- Ninguno

---

## Dependencies

### Blocked By

- SL-2 (registro) y SL-3 (login)

### Blocks

- SL-8 (ver saldo)
- SL-9 (transferencias)
- SL-10 (depositos/retiros)

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

See: `.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-7-create-bank-pockets/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Validar consistencia de moneda por bank

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-6-banks-and-balances/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-005)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
