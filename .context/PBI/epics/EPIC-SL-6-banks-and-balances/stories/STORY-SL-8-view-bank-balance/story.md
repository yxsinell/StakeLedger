# As a user, I want to view operational balance and pocket breakdown so that I understand my bank status

**Jira Key:** SL-8
**Epic:** EPIC-SL-6 (Banks and Balances)
**Priority:** High
**Story Points:** 2
**Status:** To Do
**Assignee:** null

---

## User Story

**As a** usuario
**I want to** ver saldo operativo y desglose por bolsillo
**So that** entienda el estado de mi bank

---

## Scope

<!-- Jira Field: customfield_10401 (⛳SCOPE) -->

### In Scope

- Mostrar saldo operativo
- Mostrar desglose por pocket (cash/bonus/freebet)
- Validar acceso solo del owner

### Out of Scope

- Reportes historicos avanzados
- Exportaciones CSV/PDF

---

## Acceptance Criteria (Gherkin format)

<!-- Jira Field: customfield_10201 (✅ Acceptance Criteria) -->

### Scenario 1: Ver saldo y desglose exitoso

- **Given:** un usuario con un bank existente
- **When:** accede al detalle del bank
- **Then:** el sistema muestra saldo operativo y desglose por bolsillo

### Scenario 2: Bank de otro usuario

- **Given:** un usuario autenticado
- **When:** intenta ver un bank que no le pertenece
- **Then:** el sistema bloquea el acceso con error de permisos

### Scenario 3: Bank sin movimientos

- **Given:** un bank recien creado sin movimientos adicionales
- **When:** el usuario visualiza el detalle
- **Then:** el sistema muestra saldos iniciales correctos

---

## Business Rules

<!-- Jira Field: customfield_10202 (🚩BUSINESS RULES SPEC) - Opcional -->

- Saldo operativo calculado segun regla definida
- Acceso restringido al owner

---

## Workflow

<!-- Jira Field: customfield_10500 (🧬WORKFLOW) - Opcional -->

1. Usuario abre detalle del bank
2. Sistema calcula saldo operativo
3. Sistema muestra desglose por bolsillo

---

## Mockups/Wireframes

<!-- Jira Field: customfield_10400 (🎴MOCKUP) - Opcional -->

- No definido

---

## Technical Notes

### Frontend

- Vista de bank con cards por pocket
- Indicador de saldo operativo

### Backend

- Calculo de saldos en una sola consulta
- Validar ownership del bank

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

- SL-9 (transferencias)
- SL-10 (depositos/retiros)

### Related Stories

- SL-7

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

See: `.context/PBI/epics/EPIC-SL-6-banks-and-balances/stories/STORY-SL-8-view-bank-balance/acceptance-test-plan.md`

**Test Cases Expected:** 6+ detailed test cases covering:

- Happy path
- Error scenarios
- Edge cases
- Security validations

---

## Notes

- Alinear regla de saldo operativo con SRS

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SL-6-banks-and-balances/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-006)
- **API Contracts:** `.context/SRS/api-contracts.yaml`
